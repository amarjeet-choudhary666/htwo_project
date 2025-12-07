// Simple email test script
// Run with: node test-email.js

require('dotenv').config();
const nodemailer = require('nodemailer');

console.log('=== Email Configuration Test ===\n');

console.log('SMTP Configuration:');
console.log('Host:', process.env.SMTP_HOST);
console.log('Port:', process.env.SMTP_PORT);
console.log('Secure:', process.env.SMTP_SECURE);
console.log('User:', process.env.SMTP_USER);
console.log('Password:', process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-4) : 'NOT SET');
console.log('From Email:', process.env.FROM_EMAIL);
console.log('From Name:', process.env.FROM_NAME);
console.log('\n');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '465'),
  secure: process.env.SMTP_SECURE === 'true' || true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  debug: true, // Enable debug output
  logger: true // Log to console
});

console.log('Testing SMTP connection...\n');

transporter.verify(function(error, success) {
  if (error) {
    console.log('❌ SMTP Connection Failed!');
    console.log('Error:', error.message);
    console.log('\nCommon Issues:');
    console.log('1. Invalid Gmail App Password (not regular password)');
    console.log('2. 2FA not enabled on Gmail account');
    console.log('3. Gmail blocking "less secure apps"');
    console.log('\nHow to fix:');
    console.log('1. Go to https://myaccount.google.com/security');
    console.log('2. Enable 2-Step Verification');
    console.log('3. Go to App Passwords');
    console.log('4. Generate new password for "Mail"');
    console.log('5. Update SMTP_PASS in .env file');
    process.exit(1);
  } else {
    console.log('✅ SMTP Connection Successful!');
    console.log('Server is ready to send emails\n');
    
    // Try sending a test email
    const testEmail = process.env.FROM_EMAIL || process.env.SMTP_USER;
    console.log(`Sending test email to ${testEmail}...\n`);
    
    const mailOptions = {
      from: `"${process.env.FROM_NAME || 'Test'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
      to: testEmail,
      subject: 'Test Email - H2 Technologies',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2 style="color: #667eea;">✅ Email Configuration Test Successful!</h2>
          <p>Your SMTP settings are working correctly.</p>
          <p><strong>Configuration:</strong></p>
          <ul>
            <li>Host: ${process.env.SMTP_HOST}</li>
            <li>Port: ${process.env.SMTP_PORT}</li>
            <li>User: ${process.env.SMTP_USER}</li>
          </ul>
          <p>Time: ${new Date().toLocaleString()}</p>
        </div>
      `
    };
    
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log('❌ Failed to send test email');
        console.log('Error:', error.message);
        process.exit(1);
      } else {
        console.log('✅ Test email sent successfully!');
        console.log('Message ID:', info.messageId);
        console.log('Response:', info.response);
        console.log('\nCheck your inbox (and spam folder) for the test email.');
        process.exit(0);
      }
    });
  }
});
