// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { totp } from 'https://esm.sh/otplib@12.0.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create a Supabase client with the Auth context of the function
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      // Create client with Auth context of the user that called the function.
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    // Get the request body
    const { token, userId, secret, isBackupCode = false } = await req.json()

    // Validate inputs
    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    if (!userId) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Get the user's profile to check 2FA settings
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('two_factor_enabled, two_factor_secret, backup_codes')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      )
    }

    if (!profile.two_factor_enabled) {
      return new Response(
        JSON.stringify({ error: '2FA is not enabled for this user' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    let isValid = false

    if (isBackupCode) {
      // Check if the token matches any backup code
      if (profile.backup_codes && Array.isArray(profile.backup_codes)) {
        const backupCodeIndex = profile.backup_codes.findIndex(code => code === token)
        
        if (backupCodeIndex !== -1) {
          isValid = true
          
          // Remove the used backup code
          const updatedBackupCodes = [...profile.backup_codes]
          updatedBackupCodes.splice(backupCodeIndex, 1)
          
          // Update the user's backup codes
          await supabaseClient
            .from('profiles')
            .update({ backup_codes: updatedBackupCodes })
            .eq('id', userId)
        }
      }
    } else {
      // Verify TOTP token
      const secretToUse = secret || profile.two_factor_secret?.base32
      
      if (!secretToUse) {
        return new Response(
          JSON.stringify({ error: '2FA secret not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
      }
      
      // Configure TOTP
      totp.options = { 
        digits: 6,
        step: 30,
        window: 1 // Allow 1 step before/after for clock drift
      }
      
      // Verify the token
      isValid = totp.verify({ token, secret: secretToUse })
    }

    // Record verification attempt
    await supabaseClient
      .from('two_factor_attempts')
      .insert([{
        user_id: userId,
        successful: isValid,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown'
      }])

    return new Response(
      JSON.stringify({ isValid }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
