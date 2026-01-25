import { Request, Response, NextFunction } from "express";
import User from "../../models/user";
import bcrypt from "bcrypt";
import crypto from "crypto";
import * as nodemailer from "nodemailer";

// Create transporter (configure with your SMTP settings)
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

// Request password reset
export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        success: true, 
        message: "If an account with that email exists, a password reset link has been sent" 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    // Save token and expiry (1 hour)
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Create reset URL
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

    // Send email
    try {
      const transporter = createTransporter();
      
      await transporter.sendMail({
        from: process.env.SMTP_FROM || '"Rent & Co" <noreply@rentandco.rs>',
        to: user.email,
        subject: "Resetovanje lozinke - Rent & Co",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #e85d45 0%, #d54d35 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Rent & Co</h1>
            </div>
            <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #eee; border-top: none;">
              <h2 style="color: #333; margin-top: 0;">Resetovanje lozinke</h2>
              <p>Pozdrav ${user.firstName},</p>
              <p>Primili smo zahtev za resetovanje lozinke vašeg naloga. Kliknite na dugme ispod da biste postavili novu lozinku:</p>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" style="background: #e85d45; color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">Resetuj lozinku</a>
              </div>
              <p style="color: #666; font-size: 14px;">Ovaj link ističe za 1 sat.</p>
              <p style="color: #666; font-size: 14px;">Ako niste vi zatražili resetovanje lozinke, možete ignorisati ovaj email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
              <p style="color: #999; font-size: 12px; text-align: center;">© ${new Date().getFullYear()} Rent & Co. Sva prava zadržana.</p>
            </div>
          </body>
          </html>
        `,
      });
    } catch (emailError) {
      console.error("Error sending email:", emailError);
      // Don't expose email sending errors to the user
    }

    res.status(200).json({ 
      success: true, 
      message: "If an account with that email exists, a password reset link has been sent" 
    });
  } catch (error) {
    next(error);
  }
};

// Reset password with token
export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { token, newPassword } = req.body as { token: string; newPassword: string };

    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: "Token and new password are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    // Hash the token to compare with stored hash
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.plainPassword = newPassword;
    user.resetPasswordToken = "";
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    next(error);
  }
};

// Validate reset token (check if token is still valid)
export const validateResetToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.params.token as string;

    if (!token) {
      return res.status(400).json({ success: false, message: "Token is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset token" });
    }

    res.status(200).json({ success: true, message: "Token is valid" });
  } catch (error) {
    next(error);
  }
};
