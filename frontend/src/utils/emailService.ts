import nodemailer from 'nodemailer';

export interface EmailData {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(emailData: EmailData): Promise<boolean> {
  try {
    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      console.error('❌ Gmail credentials not configured');
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD
      }
    });

    const mailOptions = {
      from: process.env.FROM_EMAIL || process.env.GMAIL_USER,
      to: emailData.to,
      subject: emailData.subject,
      html: emailData.html,
      text: emailData.text || emailData.html.replace(/<[^>]*>/g, '')
    };

    await transporter.sendMail(mailOptions);
    return true;
    
  } catch (error) {
    console.error('❌ Failed to send email:', error);
    return false;
  }
}

export function generateInvitationEmail(
  tenantEmail: string,
  propertyName: string,
  invitationCode: string,
  landlordName: string
): EmailData {
  const subject = `You're invited to view ${propertyName}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Property Viewing Invitation</h2>
      <p>Hello!</p>
      <p>You've been invited by <strong>${landlordName}</strong> to view the property: <strong>${propertyName}</strong></p>
      
      <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0;">Your Invitation Code</h3>
        <div style="background-color: #ffffff; padding: 15px; border: 2px dashed #2563eb; border-radius: 6px; text-align: center;">
          <span style="font-size: 24px; font-weight: bold; color: #2563eb; letter-spacing: 2px;">${invitationCode}</span>
        </div>
        <p style="font-size: 14px; color: #6b7280; margin-top: 10px;">
          Use this code when signing up to access the property details.
        </p>
      </div>
      
      <p><strong>Important:</strong></p>
      <ul>
        <li>This invitation code is required for tenant registration</li>
        <li>The code expires in 30 days</li>
        <li>Each code can only be used once</li>
      </ul>
      
      <p>Click the link below to sign up:</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/signup" 
         style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
        Sign Up as Tenant
      </a>
      
      <p style="color: #6b7280; font-size: 14px;">
        If you have any questions, please contact the landlord directly.
      </p>
    </div>
  `;
  
  const text = `
Property Viewing Invitation

Hello!

You've been invited by ${landlordName} to view the property: ${propertyName}

Your Invitation Code: ${invitationCode}

Use this code when signing up to access the property details.

Important:
- This invitation code is required for tenant registration
- The code expires in 30 days
- Each code can only be used once

Sign up at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/user/signup

If you have any questions, please contact the landlord directly.
  `;
  
  return {
    to: tenantEmail,
    subject,
    html,
    text
  };
}

export function generateCancellationEmail(
  tenantEmail: string,
  propertyName: string
): EmailData {
  const subject = `Invitation Cancelled for ${propertyName}`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #dc2626;">Invitation Cancelled</h2>
      <p>Hello!</p>
      <p>Your invitation to view <strong>${propertyName}</strong> has been cancelled by the landlord.</p>
      
      <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
        <h3 style="margin-top: 0; color: #dc2626;">What This Means</h3>
        <ul style="color: #6b7280;">
          <li>Your invitation code is no longer valid</li>
          <li>You cannot use this code to sign up</li>
          <li>The property may no longer be available</li>
        </ul>
      </div>

      <p style="color: #6b7280; font-size: 14px;">
        If you have any questions about this cancellation, please contact the landlord directly.
      </p>
    </div>
  `;

  const text = `
Invitation Cancelled

Hello!

Your invitation to view ${propertyName} has been cancelled by the landlord.

What This Means:
- Your invitation code is no longer valid
- You cannot use this code to sign up
- The property may no longer be available

If you have any questions about this cancellation, please contact the landlord directly.
  `;

  return {
    to: tenantEmail,
    subject,
    html,
    text
  };
}
