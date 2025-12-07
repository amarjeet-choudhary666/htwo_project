"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getApprovedPartners = exports.verifyEmailAccess = exports.sendEmailVerificationOTP = exports.checkEmailExists = exports.verifyPartnerOTP = exports.registerPartner = void 0;
const prisma_1 = require("../lib/prisma");
const apiResponse_1 = require("../utils/apiResponse");
const apiError_1 = require("../utils/apiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const partnerValidation_1 = require("../validation/partnerValidation");
const nodemailer_1 = require("../utils/nodemailer");
exports.registerPartner = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    console.log('Register partner request body:', JSON.stringify(req.body, null, 2));
    const result = partnerValidation_1.createPartnerSchema.safeParse(req.body);
    if (!result.success) {
        console.error('Validation error:', JSON.stringify(result.error.format(), null, 2));
        const errorMessages = result.error.issues.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
        throw new apiError_1.ApiError(400, 'Validation error: ' + errorMessages);
    }
    const validatedData = result.data;
    console.log('Validation successful, data:', validatedData);
    const existingPartner = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { email: validatedData.email }
    });
    console.log('=== REGISTER PARTNER DEBUG ===');
    console.log('Email:', validatedData.email);
    console.log('Existing partner:', existingPartner ? 'Found' : 'Not found');
    console.log('Existing partner status:', existingPartner?.status);
    if (existingPartner && existingPartner.status === 'approved') {
        throw new apiError_1.ApiError(400, 'A registration request with this email is already approved');
    }
    if (!existingPartner) {
        throw new apiError_1.ApiError(400, 'Email verification required. Please verify your email first.');
    }
    const partner = await prisma_1.prisma.partnerRegistrationForm.upsert({
        where: { email: validatedData.email },
        update: {
            companyName: validatedData.companyName,
            companyAddress: validatedData.companyAddress,
            businessType: validatedData.businessType,
            otherBusinessType: validatedData.otherBusinessType,
            fullName: validatedData.fullName,
            phone: validatedData.phone,
            countryRegion: validatedData.countryRegion,
            estimatedMonthlySales: validatedData.estimatedMonthlySales,
            partnershipReason: validatedData.partnershipReason,
            hasTechnicalSupport: validatedData.hasTechnicalSupport,
            status: 'pending'
        },
        create: {
            companyName: validatedData.companyName,
            companyAddress: validatedData.companyAddress,
            businessType: validatedData.businessType,
            otherBusinessType: validatedData.otherBusinessType,
            fullName: validatedData.fullName,
            email: validatedData.email,
            phone: validatedData.phone,
            countryRegion: validatedData.countryRegion,
            estimatedMonthlySales: validatedData.estimatedMonthlySales,
            partnershipReason: validatedData.partnershipReason,
            hasTechnicalSupport: validatedData.hasTechnicalSupport,
            status: 'pending'
        }
    });
    res.status(201).json(new apiResponse_1.ApiResponse(201, partner, 'Partner registration submitted successfully. Our team will review your application.'));
});
exports.verifyPartnerOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new apiError_1.ApiError(400, 'Email and OTP are required');
    }
    const partner = await prisma_1.prisma.partnerRegistrationForm.findFirst({
        where: {
            email,
            otp: otp,
            otpExpires: {
                gt: new Date()
            }
        }
    });
    if (!partner) {
        throw new apiError_1.ApiError(400, 'Invalid or expired OTP');
    }
    console.log('=== PARTNER OTP VERIFIED ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    await prisma_1.prisma.partnerRegistrationForm.update({
        where: { id: partner.id },
        data: {
            otp: null,
            otpExpires: null,
            status: 'verified'
        }
    });
    res.json({
        success: true,
        statusCode: 200,
        data: {
            email,
            message: 'Email verified successfully. Your partner registration is now pending admin approval.'
        },
        message: 'Partner registration email verified successfully'
    });
});
exports.checkEmailExists = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.query;
    if (!email || typeof email !== 'string') {
        throw new apiError_1.ApiError(400, 'Email is required');
    }
    const existingPartner = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { email }
    });
    res.json({
        success: true,
        exists: !!existingPartner,
        status: existingPartner?.status || null
    });
});
exports.sendEmailVerificationOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new apiError_1.ApiError(400, 'Email is required');
    }
    const existingPartner = await prisma_1.prisma.partnerRegistrationForm.findUnique({
        where: { email }
    });
    if (existingPartner && existingPartner.status === 'approved') {
        throw new apiError_1.ApiError(400, 'This email is already registered and approved');
    }
    const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
    const resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000);
    console.log('=== EMAIL VERIFICATION OTP GENERATED ===');
    console.log('Email:', email);
    console.log('OTP:', resetOTP);
    console.log('Expires at:', resetOTPExpiry);
    await prisma_1.prisma.partnerRegistrationForm.upsert({
        where: { email },
        update: {
            otp: resetOTP,
            otpExpires: resetOTPExpiry,
        },
        create: {
            email,
            companyName: '',
            companyAddress: '',
            businessType: 'OTHER',
            fullName: '',
            phone: '',
            countryRegion: '',
            estimatedMonthlySales: 'LESS_THAN_10',
            hasTechnicalSupport: false,
            otp: resetOTP,
            otpExpires: resetOTPExpiry,
            status: 'pending'
        }
    });
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">H2 Technologies</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Email Verification</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Your Verification Code</h2>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px;">
            ${resetOTP}
          </div>
        </div>
        <p style="color: #666; margin: 20px 0; text-align: center; line-height: 1.6;">
          Use this OTP to verify your email address for partner registration. This code will expire in 10 minutes.
        </p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Note:</strong> This verification is required to access the partner registration form.
          </p>
        </div>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>This is an automated message from H2 Technologies. Please do not reply to this email.</p>
      </div>
    </div>
  `;
    try {
        await (0, nodemailer_1.sendEmail)(email, 'Email Verification - H2 Technologies', html);
        console.log('✅ Email verification OTP sent successfully to:', email);
        res.json({
            success: true,
            statusCode: 200,
            data: {
                email,
                message: 'OTP sent successfully. Please check your email (including spam folder) to verify your email.'
            },
            message: 'OTP sent to your email'
        });
    }
    catch (error) {
        console.error('❌ Failed to send email verification OTP:', error);
        console.error('Error details:', {
            message: error.message,
            code: error.code,
            command: error.command
        });
        res.json({
            success: true,
            statusCode: 200,
            data: {
                email,
                otp: resetOTP,
                message: 'OTP generated but email sending failed. Please contact support or check server logs.'
            },
            message: `OTP: ${resetOTP} (Email sending failed - check console)`
        });
    }
});
exports.verifyEmailAccess = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) {
        throw new apiError_1.ApiError(400, 'Email and OTP are required');
    }
    const partner = await prisma_1.prisma.partnerRegistrationForm.findFirst({
        where: {
            email,
            otp: otp,
            otpExpires: {
                gt: new Date()
            }
        }
    });
    if (!partner) {
        throw new apiError_1.ApiError(400, 'Invalid or expired OTP');
    }
    console.log('=== EMAIL ACCESS VERIFIED ===');
    console.log('Email:', email);
    console.log('OTP:', otp);
    await prisma_1.prisma.partnerRegistrationForm.update({
        where: { id: partner.id },
        data: {
            otp: null,
            otpExpires: null,
        }
    });
    res.json({
        success: true,
        statusCode: 200,
        data: {
            email,
            message: 'Email verified successfully. You can now access the partner registration form.'
        },
        message: 'Email access verified successfully'
    });
});
exports.getApprovedPartners = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const partners = await prisma_1.prisma.partnerRegistrationForm.findMany({
        where: {
            status: 'approved'
        },
        select: {
            id: true,
            companyName: true,
            status: true,
            createdAt: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    res.status(200).json(new apiResponse_1.ApiResponse(200, partners, 'Approved partners retrieved successfully'));
});
