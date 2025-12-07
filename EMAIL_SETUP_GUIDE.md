# Email Setup Guide - Fix OTP Not Sending

## Problem
OTP emails are not being received when using the forgot password feature.

## Solution Steps

### 1. **Verify Gmail App Password**

Your `.env` file shows you're using Gmail. You need a Gmail **App Password**, not your regular Gmail password.

**Steps to create Gmail App Password:**

1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Enable "2-Step Verification" if not already enabled
4. After enabling 2FA, go back to Security
5. Click on "App passwords" (you'll only see this after enabling 2FA)
6. Select "Mail" and "Other (Custom name)"
7. Name it "H2 Technologies Server"
8. Click "Generate"
9. Copy the 16-character password (no spaces)
10. Update your `.env` file:

```env
SMTP_USER=amarjeetchoudhary109@gmail.com
SMTP_PASS=your-16-character-app-password-here
```

### 2. **Test Email Configuration**

I've added a test endpoint. Use this to verify your email setup:

**Using curl:**
```bash
curl -X POST http://localhost:3000/api/v1/test/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-email@gmail.com"}'
```

**Using Postman or Thunder Client:**
```
POST http://localhost:3000/api/v1/test/test-email
Body (JSON):
{
  "email": "your-email@gmail.com"
}
```

### 3. **Check Server Logs**

When you try to send OTP, check your server console for:

✅ **Success indicators:**
```
📧 Attempting to send email...
✅ SMTP connection verified
Sending email to: user@example.com
✅ Email sent successfully: <message-id>
```

❌ **Error indicators:**
```
❌ Error sending email:
Error details: { message: '...', code: '...' }
```

### 4. **Common Issues & Fixes**

#### Issue: "Invalid login: 535-5.7.8 Username and Password not accepted"
**Fix:** You're using your regular Gmail password instead of an App Password. Follow Step 1 above.

#### Issue: "Connection timeout"
**Fix:** 
- Check if your firewall is blocking port 465
- Try using port 587 with TLS instead:
```env
SMTP_PORT=587
SMTP_SECURE=false
```

#### Issue: "Self-signed certificate"
**Fix:** Add to nodemailer config:
```typescript
tls: {
  rejectUnauthorized: false
}
```

### 5. **Alternative: Use a Different Email Service**

If Gmail continues to have issues, consider using:

**SendGrid (Recommended for production):**
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

**Mailgun:**
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

**AWS SES:**
```env
SMTP_HOST=email-smtp.us-east-1.amazonaws.com
SMTP_PORT=587
SMTP_USER=your-ses-smtp-username
SMTP_PASS=your-ses-smtp-password
```

### 6. **Development Workaround**

For development/testing, the OTP is now included in the API response when email fails:

```json
{
  "success": true,
  "message": "OTP: 123456 (Email sending failed - check console)",
  "data": {
    "email": "user@example.com",
    "otp": "123456"
  }
}
```

You can use this OTP to test the forgot password flow even if email isn't working.

### 7. **Verify Your Changes**

After updating `.env`:

1. **Restart your server** (important!)
```bash
cd server
npm run dev
```

2. **Test the email endpoint:**
```bash
curl -X POST http://localhost:3000/api/v1/test/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"amarjeetchoudhary647@gmail.com"}'
```

3. **Check server console** for detailed logs

4. **Try forgot password** from the frontend

### 8. **Current Configuration Check**

Your current `.env` shows:
```
SMTP_USER=amarjeetchoudhary109@gmail.com
SMTP_PASS=xpvdabkpzgrhubbd
```

**Action Required:**
1. Verify `xpvdabkpzgrhubbd` is a valid Gmail App Password (16 characters)
2. If not, generate a new one following Step 1
3. Make sure 2FA is enabled on `amarjeetchoudhary109@gmail.com`

### 9. **Security Note**

⚠️ **Important:** Never commit your `.env` file to Git. It contains sensitive credentials.

Make sure `.env` is in your `.gitignore`:
```
.env
.env.local
.env.*.local
```

## Quick Checklist

- [ ] Gmail 2FA is enabled
- [ ] Generated Gmail App Password
- [ ] Updated SMTP_PASS in .env with App Password
- [ ] Restarted server
- [ ] Tested with /api/v1/test/test-email endpoint
- [ ] Checked server console logs
- [ ] Tried forgot password flow

## Still Not Working?

If you've tried everything above and it's still not working:

1. **Check the server console** - Look for the detailed error logs I added
2. **Try the test endpoint** - This will show exactly what's failing
3. **Verify email credentials** - Double-check username and app password
4. **Check spam folder** - Sometimes emails go to spam
5. **Try a different email service** - Gmail can be restrictive

## Need Help?

Share the server console output when you try to send an email, and I can help debug further!
