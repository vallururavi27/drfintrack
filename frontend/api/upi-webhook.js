// This file will be deployed as a serverless function on Vercel
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = 'https://bqurvqysmwsropdaqwot.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJxdXJ2cXlzbXdzcm9wZGFxd290Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4OTYzMjUsImV4cCI6MjA2MDQ3MjMyNX0.RwNNeunXPC7VRmq78DWgqixjbUyw7w2CZMfmRsnQNTw';
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true
  },
  global: {
    headers: {
      'apikey': supabaseAnonKey
    }
  }
});

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { transaction, apiKey } = req.body;

    if (!transaction || !apiKey) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Verify API key
    const { data: keyData, error: keyError } = await supabase
      .from('api_keys')
      .select('user_id')
      .eq('key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      return res.status(401).json({ error: 'Invalid API key' });
    }

    const userId = keyData.user_id;

    // Check for duplicate transaction
    if (transaction.transactionId) {
      const { data: existingTx } = await supabase
        .from('upi_transactions')
        .select('id')
        .eq('transaction_ref_id', transaction.transactionId)
        .eq('user_id', userId)
        .single();

      if (existingTx) {
        return res.status(200).json({ success: false, error: 'Transaction already exists' });
      }
    }

    // Find bank account by UPI ID if provided
    let accountId = null;
    if (transaction.upiId) {
      const { data: account } = await supabase
        .from('bank_accounts')
        .select('id')
        .eq('upi_id', transaction.upiId)
        .eq('user_id', userId)
        .single();

      if (account) {
        accountId = account.id;
      }
    }

    // Insert the transaction
    const { error } = await supabase
      .from('upi_transactions')
      .insert([{
        user_id: userId,
        account_id: accountId,
        transaction_ref_id: transaction.transactionId,
        upi_id: transaction.upiId,
        counterparty_upi_id: transaction.counterpartyUpiId,
        counterparty_name: transaction.counterpartyName,
        amount: transaction.amount,
        transaction_type: transaction.type,
        description: transaction.description,
        transaction_date: transaction.date || new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }]);

    if (error) {
      throw error;
    }

    // Update last_used_at for the API key
    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key', apiKey);

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error processing UPI transaction:', error);
    return res.status(500).json({ error: error.message });
  }
}
