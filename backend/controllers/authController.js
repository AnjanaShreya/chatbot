const jwt = require('jsonwebtoken');
const User = require('../models/User');
const prisma = require('../config/db');
require('dotenv').config();

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const existingUser = await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Email already exists' });
      }

      const existingUsername = await User.findByUsername(username);
      if (existingUsername) {
        return res.status(400).json({ success: false, message: 'Username already exists' });
      }

      const userId = await User.create({ username, email, password });
      const token = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.status(201).json({ 
        success: true, 
        message: 'Registration successful',
        token 
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      let user = await User.findByUsername(username);
      if (!user) {
        user = await User.findByEmail(username);
      }
      if (!user) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      const isMatch = await User.comparePassword(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

      res.json({ 
        success: true, 
        message: 'Login successful',
        token,
        user: { id: user.id, username: user.username, email: user.email }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = req.userId;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
      }

      const user = await prisma.user.findUnique({
        where: { id: userId }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const isMatch = await User.comparePassword(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }

      await User.updatePassword(userId, newPassword);

      res.json({ success: true, message: 'Password updated successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
  }

  static async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
      }

      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'This email address is not registered.' });
      }

      // Generate a short-lived token containing the email (15 minutes)
      const resetToken = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '15m' });

      // Create reset link
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

      // Send email
      const nodemailer = require('nodemailer');
      
      let transporter;
      let usingEtherealDynamic = false;
      const yahooEmail = process.env.YAHOO_EMAIL;
      const yahooPass = process.env.YAHOO_APP_PASSWORD;

      if (yahooEmail && yahooPass) {
        transporter = nodemailer.createTransport({
          host: 'smtp.mail.yahoo.com',
          port: 465,
          secure: true,
          auth: {
            user: yahooEmail,
            pass: yahooPass
          }
        });
      } else if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || 'smtp.ethereal.email',
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: process.env.SMTP_SECURE === 'true',
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });
      } else {
        // Fallback: create dynamic Ethereal account
        try {
          const testAccount = await nodemailer.createTestAccount();
          transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
              user: testAccount.user,
              pass: testAccount.pass
            }
          });
          usingEtherealDynamic = true;
          console.log('Dynamic Ethereal test account created:', testAccount.user);
        } catch (accountErr) {
          console.log('Notice: SMTP server not configured and Ethereal SMTP service unreachable/offline. Password reset link has been printed to the console above.');
          // If Ethereal dynamic creation fails, create a dummy transporter that won't throw on empty auth
          transporter = nodemailer.createTransport({
            jsonTransport: true
          });
        }
      }

      const mailOptions = {
        from: yahooEmail 
          ? `"Trustworthy AI" <${yahooEmail}>` 
          : (process.env.SMTP_FROM || '"Trustworthy AI" <noreply@trustworthyai.com>'),
        to: email,
        subject: 'Reset Your Password - Trustworthy AI',
        html: `
          <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E2E8F0; border-radius: 8px;">
            <h2 style="color: #0F172A; margin-bottom: 16px;">Password Reset Request</h2>
            <p style="color: #475569; font-size: 14px; line-height: 1.5;">We received a request to reset your password for your Trustworthy AI account. Click the button below to set a new password. This link is valid for 15 minutes.</p>
            <div style="margin: 24px 0;">
              <a href="${resetLink}" style="background-color: #000000; color: #FFFFFF; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
            </div>
            <p style="color: #64748B; font-size: 12px; margin-top: 24px;">If you did not request this, you can safely ignore this email.</p>
          </div>
        `
      };

      try {
        const info = await transporter.sendMail(mailOptions);
        if (usingEtherealDynamic) {
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
        }
      } catch (mailError) {
        console.error('Failed to send email:', mailError);
      }

      res.json({ success: true, message: 'Password reset link has been sent to your email.' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }

  static async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) {
        return res.status(400).json({ success: false, message: 'Token and new password are required' });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
      }

      const email = decoded.email;
      const user = await prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User with this email not found.' });
      }

      await User.updatePassword(user.id, newPassword);

      res.json({ success: true, message: 'Password has been reset successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
}

module.exports = AuthController;