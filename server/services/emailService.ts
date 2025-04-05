import { MailService } from '@sendgrid/mail';
import { User } from '@shared/schema';

// Initialize SendGrid
const mailService = new MailService();
mailService.setApiKey(process.env.SENDGRID_API_KEY!);

// From email should be a verified sender in your SendGrid account
const fromEmail = 'notifications@medical-queue.com';

class EmailService {
  /**
   * Send a verification email to a newly registered user
   * @param {User} user - The user to send the verification email to
   * @param {string} verificationToken - The verification token
   */
  async sendVerificationEmail(user: User, verificationToken: string): Promise<boolean> {
    try {
      // Construct the verification URL for the client-side route
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      const verificationUrl = `${baseUrl}/verify-email/${verificationToken}`;
      
      // Email template with verification code prominently displayed
      const msg = {
        to: user.email,
        from: fromEmail,
        subject: 'Verify your Medical Queue Management System account',
        text: `
Hello ${user.name},

Thank you for registering with the Medical Queue Management System!

Your verification code is: ${verificationToken}

You can enter this code on the verification page or click the following link to verify your email:
${verificationUrl}

If you did not create this account, please ignore this email.

Best regards,
The Medical Queue Management Team
        `,
        html: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <h2 style="color: #3b82f6;">Medical Queue Management System</h2>
  <p>Hello ${user.name},</p>
  <p>Thank you for registering with the Medical Queue Management System!</p>
  
  <div style="background-color: #f3f4f6; padding: 15px; border-radius: 4px; margin: 20px 0; text-align: center;">
    <p style="margin: 0; font-size: 14px;">Your verification code is:</p>
    <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; color: #3b82f6;">${verificationToken}</p>
  </div>
  
  <p>Please verify your email by clicking on the button below or entering the code above on the verification page:</p>
  <a href="${verificationUrl}" style="display: inline-block; background-color: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email</a>
  <p>If the button doesn't work, you can also click on this link: <a href="${verificationUrl}">${verificationUrl}</a></p>
  <p>If you did not create this account, please ignore this email.</p>
  <p>Best regards,<br>The Medical Queue Management Team</p>
</div>
        `,
      };

      // Send the email
      await mailService.send(msg);
      return true;
    } catch (error) {
      console.error('SendGrid error:', error);
      return false;
    }
  }
}

export const emailService = new EmailService();