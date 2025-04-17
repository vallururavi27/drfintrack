# UPI Transaction Sync Setup Guide

This guide will help you set up automatic syncing of your Google Pay UPI transactions to your FinTrack app using email forwarding and Zapier.

## Prerequisites

1. A Zapier account (free tier works for basic usage)
2. Access to your Google Pay transaction emails
3. An API key from your FinTrack app

## Step 1: Generate an API Key

1. Log in to your FinTrack app
2. Go to the API Keys page
3. Enter a name for your key (e.g., "UPI Sync")
4. Click "Generate Key"
5. **Important**: Save the generated API key in a secure location. It will only be shown once.

## Step 2: Set Up Email Forwarding for Google Pay Transactions

### Gmail Setup

1. Open Gmail
2. Click the gear icon (Settings) in the top right
3. Click "See all settings"
4. Go to the "Filters and Blocked Addresses" tab
5. Click "Create a new filter"
6. In the "From" field, enter: `no-reply@google.com`
7. In the "Subject" field, enter: `UPI transaction`
8. Click "Create filter"
9. Check "Forward it to:" and add your Zapier email address (you'll get this in the next step)
10. Click "Create filter"

## Step 3: Create a Zapier Zap

1. Sign in to [Zapier](https://zapier.com/)
2. Click "Create Zap"
3. For the trigger, search for and select "Email by Zapier"
4. Choose "New Inbound Email" as the trigger event
5. Set up the trigger by copying the custom email address Zapier provides
6. Test the trigger by forwarding a Google Pay transaction email to this address
7. For the action, search for and select "Webhooks by Zapier"
8. Choose "POST" as the action event
9. Configure the webhook with the following settings:
   - **URL**: `https://drfintrack.vercel.app/api/upi-webhook`
   - **Payload Type**: `JSON`
   - **Data**:
     ```json
     {
       "transaction": {
         "transactionId": "{{extract_regex_from_email_body 'UPI Ref: ([A-Za-z0-9]+)'}}",
         "amount": "{{extract_number_from_email_body 'Rs\\.([0-9\\.]+)'}}",
         "type": "{{if_contains_in_email_body 'sent to' 'sent' 'received'}}",
         "counterpartyName": "{{extract_regex_from_email_body '(sent to|received from) ([^@]+)'}}",
         "counterpartyUpiId": "{{extract_regex_from_email_body '(sent to|received from) ([^\\s]+@[^\\s]+)'}}",
         "description": "Google Pay Transaction",
         "date": "{{format_date 'now' 'YYYY-MM-DDTHH:mm:ssZ'}}"
       },
       "apiKey": "YOUR_API_KEY_HERE"
     }
     ```
10. Replace `YOUR_API_KEY_HERE` with the API key you generated in Step 1
11. Test the action to make sure it works
12. Turn on your Zap

## Step 4: Add UPI ID to Your Bank Accounts

For automatic account matching, add your UPI ID to your bank accounts in FinTrack:

1. Go to the Banking page
2. Select the bank account you use with Google Pay
3. Click "Edit"
4. Add your UPI ID (e.g., `yourname@okicici` or `yourname@okaxis`)
5. Save the changes

## Step 5: Verify the Integration

1. Make a UPI transaction using Google Pay
2. Wait for the email notification
3. Check your FinTrack app's UPI Transactions page to see if the transaction appears
4. If the transaction doesn't appear, check the Zapier task history for any errors

## Troubleshooting

### Transaction Not Appearing

1. Check if the email was forwarded to Zapier (check Gmail's forwarding settings)
2. Check if Zapier received the email (check Zap history)
3. Check if the webhook request was sent (check Zap task history)
4. Verify your API key is active (check API Keys page)
5. Check if your UPI ID is correctly added to your bank account

### Error in Zapier

1. Make sure the JSON payload format is correct
2. Verify that your API key is entered correctly
3. Check if the webhook URL is correct: `https://drfintrack.vercel.app/api/upi-webhook`

## Support

If you encounter any issues, please contact support with the following information:

1. Screenshots of your Zapier setup
2. The error message from Zapier (if any)
3. The time when you made the transaction
4. The email subject of the Google Pay notification
