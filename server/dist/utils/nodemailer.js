"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailTemplates = exports.sendEmail = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const apiError_1 = require("./apiError");
const createTransporter = () => {
    return nodemailer_1.default.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '465'),
        secure: process.env.SMTP_SECURE === 'true' || true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};
const sendEmail = async (to, subject, html, text) => {
    try {
        console.log('📧 Attempting to send email...');
        console.log('SMTP Config:', {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE,
            user: process.env.SMTP_USER,
            hasPassword: !!process.env.SMTP_PASS
        });
        const transporter = createTransporter();
        await transporter.verify();
        console.log('✅ SMTP connection verified');
        const mailOptions = {
            from: `"${process.env.FROM_NAME || 'Admin'}" <${process.env.FROM_EMAIL || process.env.SMTP_USER}>`,
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, ''),
        };
        console.log('Sending email to:', to);
        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        console.log('Response:', info.response);
    }
    catch (error) {
        console.error('❌ Error sending email:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command,
            response: error.response,
            responseCode: error.responseCode
        });
        throw new apiError_1.ApiError(500, `Failed to send email: ${error.message}`);
    }
};
exports.sendEmail = sendEmail;
exports.emailTemplates = {
    partnerRegistrationAdmin: (data) => ({
        subject: 'New Partner Registration Submitted',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">New Partner Registration</h2>
        <p>A new partner has registered on the platform. Here are the details:</p>

        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">Company Information</h3>
          <p><strong>Company Name:</strong> ${data.companyName}</p>
          <p><strong>Contact Person:</strong> ${data.fullName}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Business Type:</strong> ${data.businessType.replace('_', ' ').toLowerCase()}</p>
          <p><strong>Estimated Monthly Sales:</strong> ${data.estimatedMonthlySales.replace('_', ' ').toLowerCase()}</p>
        </div>

        <p>Please review this registration in the admin panel.</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated notification from the Partner Registration System.</p>
        </div>
      </div>
    `,
    }),
    partnerRegistrationConfirmation: (data) => ({
        subject: 'Partner Registration Received',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #333;">Thank you for your interest in partnering with us!</h2>

        <p>Dear ${data.fullName},</p>

        <p>We have received your partner registration for <strong>${data.companyName}</strong>.</p>

        <p>Our team will review your application and get back to you within 24-48 hours. You will receive an email notification once your registration has been processed.</p>

        <div style="background-color: #e8f4fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #2c3e50;">What happens next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Our partnership team will review your application</li>
            <li>You will receive an approval or additional information request</li>
            <li>Once approved, you'll be contacted to discuss next steps</li>
          </ul>
        </div>

        <p>If you have any questions in the meantime, please don't hesitate to contact us.</p>

        <p>Best regards,<br>The Partnership Team</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated confirmation email. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    }),
    partnerRegistrationApproved: (data) => ({
        subject: 'Partner Registration Approved',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Congratulations! Your Partner Registration is Approved</h2>

        <p>Dear ${data.fullName},</p>

        <p>We're excited to inform you that your partner registration for <strong>${data.companyName}</strong> has been approved!</p>

        <p>You are now officially a partner in our network. Our team will be in touch shortly with the next steps and partnership agreement details.</p>

        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h3 style="margin-top: 0; color: #155724;">What's Next?</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>You will receive a partnership agreement via email</li>
            <li>Our partnership manager will contact you to discuss opportunities</li>
            <li>Access to partner portal and resources will be provided</li>
          </ul>
        </div>

        <p>Welcome to the team!</p>

        <p>Best regards,<br>The Partnership Team</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated notification. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    }),
    partnerRegistrationRejected: (data) => ({
        subject: 'Partner Registration Update',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">Partner Registration Update</h2>

        <p>Dear ${data.fullName},</p>

        <p>Thank you for your interest in partnering with us and for submitting your registration for <strong>${data.companyName}</strong>.</p>

        <p>After careful review, we regret to inform you that we are unable to approve your partnership application at this time.</p>

        ${data.reason ? `<div style="background-color: #f8d7da; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #f5c6cb;">
          <h3 style="margin-top: 0; color: #721c24;">Reason for Decision:</h3>
          <p style="margin: 0;">${data.reason}</p>
        </div>` : ''}

        <p>We appreciate your interest and encourage you to apply again in the future or contact us if you have any questions.</p>

        <p>Best regards,<br>The Partnership Team</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated notification. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    }),
    partnerAccountCreated: (data) => ({
        subject: 'Your Partner Account Has Been Created',
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #28a745;">Welcome to the Partner Portal!</h2>

        <p>Dear ${data.fullName},</p>

        <p>Congratulations! Your partner account for <strong>${data.companyName}</strong> has been successfully created.</p>

        <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
          <h3 style="margin-top: 0; color: #155724;">Your Login Credentials</h3>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Password:</strong> ${data.password}</p>
        </div>

        <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
          <h3 style="margin-top: 0; color: #856404;">Important Security Notice</h3>
          <ul style="margin: 0; padding-left: 20px;">
            <li>Please change your password after first login</li>
            <li>Keep your login credentials secure</li>
            <li>Contact support if you have any login issues</li>
          </ul>
        </div>

        <p>You can now access the partner portal to:</p>
        <ul style="padding-left: 20px;">
          <li>View partnership opportunities</li>
          <li>Access partner resources</li>
          <li>Manage your account settings</li>
          <li>Track partnership performance</li>
        </ul>

        <p>Welcome to the team!</p>

        <p>Best regards,<br>The Partnership Team</p>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
          <p>This is an automated notification. Please do not reply to this message.</p>
        </div>
      </div>
    `,
    }),
};
