# Razorpay Webhook Setup Guide

## How to Get Webhook Secret from Razorpay

### Step-by-Step Instructions

#### 1. Login to Razorpay Dashboard
- Go to [https://dashboard.razorpay.com](https://dashboard.razorpay.com)
- Login with your Razorpay account credentials

#### 2. Navigate to Webhooks Section
- Click on **Settings** in the left sidebar
- Select **Webhooks** from the settings menu
- Or directly go to: [https://dashboard.razorpay.com/app/webhooks](https://dashboard.razorpay.com/app/webhooks)

#### 3. Create a New Webhook
- Click on **"Add New Webhook"** or **"Create Webhook"** button
- Fill in the webhook details:

**Webhook URL:**
```
https://your-domain.com/payment/razorpay/webhook
```
For local testing (using ngrok or similar):
```
https://your-ngrok-url.ngrok.io/payment/razorpay/webhook
```

**Active Events to Subscribe:**
Select the following events:
- ✅ `payment.captured` - When payment is successfully captured
- ✅ `order.paid` - When order is marked as paid
- ✅ `payment.failed` - When payment fails
- ✅ `payment.authorized` (optional) - When payment is authorized
- ✅ `refund.created` (optional) - When refund is created

#### 4. Save the Webhook
- Click **"Create Webhook"** or **"Save"** button
- After creating, you'll see the webhook in the list

#### 5. Get the Webhook Secret
- Find your webhook in the list
- Click on the webhook (or click the **"..."** menu → **"Settings"** or **"View Details"**)
- You'll see a section showing:
  - **Webhook URL**
  - **Webhook Secret** (this is what you need!)
  - **Active Events**
  - **Status** (Active/Inactive)

#### 6. Copy the Webhook Secret
- The webhook secret will look something like:
  ```
  whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
  ```
- Click the **"Show"** or **"Reveal"** button to view the secret
- Click **"Copy"** to copy it to clipboard
- ⚠️ **Important**: Copy this immediately as it may only be shown once!

#### 7. Add to Environment Variables
Add the webhook secret to your environment file:

**For Production (`env.production`):**
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**For Development (`.env` or `env.development`):**
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### 8. Restart Your Server
After adding the webhook secret, restart your Node.js server to load the new environment variable.

---

## Alternative: If You Already Have a Webhook

If you've already created a webhook but don't have the secret:

1. Go to **Settings** → **Webhooks**
2. Find your webhook in the list
3. Click on it to view details
4. Look for **"Webhook Secret"** section
5. If it's not visible, you may need to:
   - Click **"Regenerate Secret"** (this will invalidate the old secret)
   - Or create a new webhook

---

## Testing Webhook Locally

### Using ngrok (Recommended)

1. **Install ngrok:**
   ```bash
   npm install -g ngrok
   # or download from https://ngrok.com/
   ```

2. **Start your local server:**
   ```bash
   node index.js
   # Server running on http://localhost:5000
   ```

3. **Start ngrok tunnel:**
   ```bash
   ngrok http 5000
   ```

4. **Copy the HTTPS URL:**
   ```
   Forwarding: https://abc123.ngrok.io -> http://localhost:5000
   ```

5. **Use this URL in Razorpay webhook:**
   ```
   https://abc123.ngrok.io/payment/razorpay/webhook
   ```

6. **Update webhook secret in your `.env` file**

### Using other tunneling services:
- **LocalTunnel**: `npx localtunnel --port 5000`
- **Cloudflare Tunnel**: For production-like testing
- **Serveo**: `ssh -R 80:localhost:5000 serveo.net`

---

## Verifying Webhook Setup

### Test Webhook from Razorpay Dashboard

1. Go to **Settings** → **Webhooks**
2. Find your webhook
3. Click **"Test Webhook"** or **"Send Test Event"**
4. Select an event type (e.g., `payment.captured`)
5. Click **"Send Test Event"**
6. Check your server logs to see if the webhook was received

### Check Server Logs

When a webhook is received, you should see:
```
🔔 Razorpay Webhook triggered
✅ Webhook signature verified
📦 Processing Razorpay event: payment_captured
```

---

## Troubleshooting

### Issue: "Invalid webhook signature"

**Solutions:**
1. ✅ Verify `RAZORPAY_WEBHOOK_SECRET` matches the secret from dashboard
2. ✅ Ensure there are no extra spaces or quotes in the environment variable
3. ✅ Restart your server after updating the secret
4. ✅ Check if you're using the correct webhook secret (test vs live)

### Issue: "Webhook secret not found"

**Solutions:**
1. ✅ Make sure you've created a webhook in Razorpay dashboard
2. ✅ Copy the secret from the webhook details page
3. ✅ Check that the environment variable name is exactly `RAZORPAY_WEBHOOK_SECRET`

### Issue: "Webhook not receiving events"

**Solutions:**
1. ✅ Verify webhook URL is correct and accessible
2. ✅ Check webhook status is "Active" in dashboard
3. ✅ Ensure correct events are subscribed
4. ✅ Test webhook from dashboard to verify connectivity
5. ✅ Check server logs for any errors

### Issue: "Webhook secret only shown once"

**Solutions:**
1. ✅ If you missed it, you'll need to regenerate the secret
2. ✅ Go to webhook settings → **"Regenerate Secret"**
3. ✅ Update your environment variable with the new secret
4. ✅ Restart your server

---

## Security Best Practices

1. **Never commit webhook secrets to version control**
   - Add `.env` to `.gitignore`
   - Use environment variables or secret management services

2. **Use different secrets for test and production**
   - Test mode webhooks have different secrets
   - Live mode webhooks have different secrets

3. **Regenerate secrets if compromised**
   - If you suspect a secret is leaked, regenerate it immediately
   - Update all environments using that secret

4. **Verify webhook signatures**
   - Always verify signatures in production
   - Don't skip signature verification even in development

---

## Quick Reference

### Dashboard URLs
- **Webhooks**: https://dashboard.razorpay.com/app/webhooks
- **Settings**: https://dashboard.razorpay.com/app/settings
- **API Keys**: https://dashboard.razorpay.com/app/keys

### Environment Variable Format
```env
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Webhook URL Format
```
https://your-domain.com/payment/razorpay/webhook
```

---

## Support

If you're still having issues:
1. Check Razorpay documentation: https://razorpay.com/docs/webhooks/
2. Contact Razorpay support: support@razorpay.com
3. Review server logs for detailed error messages
4. Test webhook connectivity using Razorpay's test feature

