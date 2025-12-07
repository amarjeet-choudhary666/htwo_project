import bcrypt from "bcrypt";
import { sendEmail } from "../utils/nodemailer";
import { ApiError } from "../utils/apiError";
import { ApiResponse } from "../utils/apiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { registerUserSchema, loginUserSchema, registeradminSchema, registerPartnerSchema, RegisterPartnerInput, forgotPasswordSchema, resetPasswordSchema } from "../validation/authValidation";
import prisma from "../lib/prisma";
import { generateAccessToken, generateRefreshToken, verifyAccessToken } from "../utils/jwt";

// Error logging utility
const logError = async (message: string, user?: string, stack?: string) => {
  try {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, { user, stack });
    // In a real application, you might want to save this to a database
  } catch (err) {
    console.error('Failed to log error:', err);
  }
};

export const SignupUser = asyncHandler(async(req, res) => {
  const { firstname, email, password, address, companyName, gstNumber } = req.body;

  if (!firstname || !email || !password) {
    throw new ApiError(400, 'All fields are required');
  }

  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      firstname,
      email,
      password: hashedPassword,
      address,
      companyName,
      gstNumber
    }
  });

  const accessToken = generateAccessToken((user.id).toString());
  const refreshToken = generateRefreshToken((user.id).toString());

  console.log('=== REGISTER BACKEND ===');
  console.log('Generated accessToken:', accessToken.substring(0, 20) + '...');
  console.log('Generated refreshToken:', refreshToken.substring(0, 20) + '...');

  // Save refresh token to database
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });
  console.log('Refresh token saved to database');

  res.cookie('accessToken', accessToken, {
    httpOnly: false, // Allow frontend to read
    secure: false, // Set to true in production with HTTPS
    maxAge: 40 * 60 * 1000, // 40 minutes
    sameSite: 'lax'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true, // Not accessible by frontend
    secure: false, // Set to true in production with HTTPS
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    sameSite: 'lax'
  });

  const responseData = {
    success: true,
    statusCode: 201,
    data: {
      user: { 
        id: user.id, 
        name: user.firstname, 
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        address: user.address,
        companyName: user.companyName,
        gstNumber: user.gstNumber
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
    message: 'User registered successfully'
  };

  console.log('Register response data:', JSON.stringify(responseData, null, 2));
  return res.status(201).json(responseData);
})





export const SigninUser = asyncHandler(async(req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid credentials');
  }

  const accessToken = generateAccessToken((user.id).toString());
  const refreshToken = generateRefreshToken((user.id).toString());

  if(!accessToken){
    throw new ApiError(500, "failed to generate access token")
  }

  if(!refreshToken){
    throw new ApiError(500, "failed to generate refresh token")
  }

  console.log('=== TOKENS GENERATED ===');
  console.log('accessToken:', accessToken);
  console.log('refreshToken:', refreshToken);
  console.log('accessToken type:', typeof accessToken);
  console.log('refreshToken type:', typeof refreshToken);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken }
  });
  console.log('Refresh token saved to database');

  // Set cookies
  res.cookie('accessToken', accessToken, {
    httpOnly: false,
    secure: false,
    maxAge: 40 * 60 * 1000,
    sameSite: 'lax'
  });

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: false,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    sameSite: 'lax'
  });
  console.log('Cookies set');

  const finalResponse = {
    success: true,
    statusCode: 200,
    data: {
      user: { 
        id: user.id, 
        name: user.firstname, 
        email: user.email,
        role: user.role,
        firstname: user.firstname,
        address: user.address,
        companyName: user.companyName,
        gstNumber: user.gstNumber
      },
      accessToken: accessToken,
      refreshToken: refreshToken,
    },
    message: 'Login successful'
  };

  console.log('=== FINAL RESPONSE ===');
  console.log(JSON.stringify(finalResponse, null, 2));
  console.log('Has accessToken in response:', !!finalResponse.data.accessToken);
  console.log('Has refreshToken in response:', !!finalResponse.data.refreshToken);

  return res.status(200).json(finalResponse);
})

// Admin signup
export const SignupAdmin = asyncHandler(async(req, res) => {
  try {
    const result = registeradminSchema.safeParse(req.body)

    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: result.error.issues
      })
    }

    const {email, password} = result.data

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if(existing){
      throw new ApiError(409, "User already exists with this email")
    }

    // Hash password
    const hashPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashPassword,
        role: "ADMIN"
      },
      select: {
        id: true,
        firstname: true,
        email: true,
        role: true
      }
    })

    return res.status(201).json(new ApiResponse(201, user, "Admin registered successfully"))

  } catch (error) {
    console.error("Admin registration error:", error)
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiError(500, "Internal server error during admin registration")
  }
})

// Admin login
export const SigninAdmin = asyncHandler(async(req, res) => {
  try {
    const {email, password} = req.body

    // Find user
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    })

    if(!user){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    // Check if admin
    if(user.role !== "ADMIN"){
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin privileges required."
      })
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if(!isPasswordValid){
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      })
    }

    const accessToken = generateAccessToken(user.id.toString())
    const refreshToken = generateRefreshToken(user.id.toString())

    await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        refreshToken
      }
    })

    // Set cookies
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000 // 15 minutes
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    const userResponse = {
      id: user.id,
      email: user.email,
      role: user.role
    }

    return res.status(200).json({
      success: true,
      message: "Admin login successful",
      data: {
        user: userResponse,
        accessToken,
        refreshToken
      }
    })

  } catch (error) {
    console.error("Admin login error:", error)
    return res.status(500).json({
      success: false,
      message: "Internal server error during admin login"
    })
  }
})

// Render admin login page
export const renderAdminLogin = asyncHandler(async(req, res) => {
  res.render('admin-login', { error: req.query.error || null })
})

// Verify admin authentication
export const verifyAdmin = asyncHandler(async(req, res) => {
  try {
    // Check if access token exists in cookies
    const accessToken = req.cookies.accessToken;

    if (!accessToken) {
      return res.status(401).json({
        success: false,
        message: 'No access token found'
      });
    }

    // Verify token
    const decoded = verifyAccessToken(accessToken) as { userId: string };

    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid access token'
      });
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id: parseInt(decoded.userId) }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Return success if all checks pass
    res.json({
      success: true,
      message: 'Admin verified',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role
        }
      }
    });

  } catch (error) {
    console.error('Admin verification error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
})

// Admin logout
export const logoutAdmin = asyncHandler(async(req, res) => {
  try {
    // Get user ID from request if available
    const userId = (req as any).userId;
    
    // Clear refresh token from database if user is authenticated
    if (userId) {
      try {
        await prisma.user.update({
          where: { id: parseInt(userId) },
          data: { refreshToken: null }
        });
      } catch (dbError) {
        console.error('Error clearing refresh token from database:', dbError);
      }
    }

    // Clear cookies with the same settings as login
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    });

    res.json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
})


export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new ApiError(400, 'Email is required');
  }

  const user = await prisma.user.findUnique({
    where: { email }
  });

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  // Generate 6-digit OTP
  const resetOTP = Math.floor(100000 + Math.random() * 900000).toString();
  const resetOTPExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await prisma.user.update({
    where: { id: user.id },
    data: {
      otp: resetOTP,
      otpExpires: resetOTPExpiry
    }
  });

  console.log('=== OTP GENERATED ===');
  console.log('Email:', email);
  console.log('OTP:', resetOTP);
  console.log('Expires at:', resetOTPExpiry);

  // Send email using the utility function
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 30px;">
        <h1 style="color: white; margin: 0; font-size: 24px;">H2 Cloud</h1>
        <p style="color: white; margin: 10px 0 0 0; opacity: 0.9;">Password Reset Request</p>
      </div>
      <div style="background: #f8f9fa; padding: 30px; border-radius: 10px; margin-bottom: 20px;">
        <h2 style="color: #333; margin: 0 0 20px 0; text-align: center;">Your OTP Code</h2>
        <div style="text-align: center; margin: 30px 0;">
          <div style="display: inline-block; background: #fff; border: 2px solid #667eea; border-radius: 8px; padding: 20px; font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 4px;">
            ${resetOTP}
          </div>
        </div>
        <p style="color: #666; margin: 20px 0; text-align: center; line-height: 1.6;">
          Use this OTP to reset your password. This code will expire in 10 minutes.
        </p>
        <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
          <p style="color: #856404; margin: 0; font-size: 14px;">
            <strong>Security Note:</strong> If you didn't request this password reset, please ignore this email.
          </p>
        </div>
      </div>
      <div style="text-align: center; color: #999; font-size: 12px;">
        <p>This is an automated message from H2 Technologies. Please do not reply to this email.</p>
      </div>
    </div>
  `;

  try {
    await sendEmail(email, 'Password Reset OTP - H2 Technologies', html);
    console.log('✅ OTP email sent successfully to:', email);
    
    res.json({
      success: true,
      statusCode: 200,
      data: { 
        email,
        message: 'OTP sent successfully. Please check your email (including spam folder).'
      },
      message: 'OTP sent to your email'
    });
  } catch (error: any) {
    console.error('❌ Failed to send OTP email:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      command: error.command
    });
    await logError('Failed to send reset email', user.id.toString(), error.stack);
    
    // Still return success but with a warning
    // The OTP is saved in database, so user can still use it if they know it
    res.json({
      success: true,
      statusCode: 200,
      data: { 
        email,
        otp: resetOTP, // Include OTP in response for development/testing
        message: 'OTP generated but email sending failed. Please contact support or check server logs.'
      },
      message: `OTP: ${resetOTP} (Email sending failed - check console)`
    });
  }
});

export const verifyOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    throw new ApiError(400, 'Email and OTP are required');
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      otp: otp,
      otpExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  console.log('=== OTP VERIFIED ===');
  console.log('Email:', email);
  console.log('OTP:', otp);

  res.json({
    success: true,
    statusCode: 200,
    data: { email },
    message: 'OTP verified successfully'
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    throw new ApiError(400, 'Email, OTP and new password are required');
  }

  const user = await prisma.user.findFirst({
    where: {
      email,
      otp: otp,
      otpExpires: {
        gt: new Date()
      }
    }
  });

  if (!user) {
    throw new ApiError(400, 'Invalid or expired OTP');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      otp: null,
      otpExpires: null,
      resetPasswordToken: null,
      resetPasswordExpires: null
    }
  });

  console.log('=== PASSWORD RESET ===');
  console.log('Email:', email);
  console.log('Password reset successfully');

  res.json({
    success: true,
    statusCode: 200,
    data: {},
    message: 'Password reset successfully'
  });
});

export const logout = asyncHandler(async (req, res) => {
  const userId = (req as any).userId;

  if (userId) {
    try {
      // Clear refresh token from database
      await prisma.user.update({
        where: { id: parseInt(userId) },
        data: { refreshToken: null }
      });
    } catch (error) {
      console.error('Error clearing refresh token:', error);
    }
  }

  // Clear cookies with proper settings
  res.clearCookie('accessToken', {
    httpOnly: false,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    path: '/'
  });

  res.json({
    success: true,
    statusCode: 200,
    data: {},
    message: 'Logout successful'
  });
});