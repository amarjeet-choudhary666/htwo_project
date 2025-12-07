import { Router } from 'express';
import { sendEmail } from '../utils/nodemailer';
import { asyncHandler } from '../utils/asyncHandler';

const router = Router();

// Test email endpoint
router.post('/test-email', asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: 'Email is required'
    });
  }

  try {
    const testHTML = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">Test Email from H2 Technologies</h2>
        <p>This is a test email to verify your email configuration is working correctly.</p>
        <p>If you received this email, your SMTP settings are configured properly!</p>
        <div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin: 0;"><strong>Test Details:</strong></p>
          <p style="margin: 5px 0;">Sent to: ${email}</p>
          <p style="margin: 5px 0;">Time: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `;

    await sendEmail(email, 'Test Email - H2 Technologies', testHTML);

    res.json({
      success: true,
      message: 'Test email sent successfully! Check your inbox.',
      data: { email }
    });
  } catch (error: any) {
    console.error('Test email failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send test email',
      error: error.message
    });
  }
}));

export default router;
