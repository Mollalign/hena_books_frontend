import nodemailer from "nodemailer";

function getTransporter() {
  const server = process.env.SMTP_SERVER;
  const email = process.env.SMTP_EMAIL;
  const password = process.env.SMTP_PASSWORD;
  const port = parseInt(process.env.SMTP_PORT || "587", 10);

  if (!server || !email) return null;

  return nodemailer.createTransport({
    host: server,
    port,
    secure: false,
    auth: password ? { user: email, pass: password } : undefined,
  });
}

export async function sendEmail(
  recipients: string[],
  subject: string,
  html: string
): Promise<boolean> {
  const transporter = getTransporter();
  if (!transporter) {
    console.log(
      `Mock Email: To=${recipients.join(",")}, Subject=${subject}, Body=${html.slice(0, 50)}...`
    );
    return false;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_EMAIL,
      to: recipients.join(", "),
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error("Failed to send email:", error);
    return false;
  }
}

export async function sendPasswordResetCode(
  email: string,
  code: string,
  expiresInMinutes: number = 15
): Promise<boolean> {
  const subject = "Password Reset Code - Hena Books";

  const html = `
    <html>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2c3e50;">Password Reset Request</h2>
          <p>Hello,</p>
          <p>You have requested to reset your password for your Hena Books account.</p>
          <p>Your password reset code is:</p>
          <div style="background-color: #f4f4f4; border: 2px dashed #3498db; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #3498db; font-size: 32px; letter-spacing: 5px; margin: 0;">${code}</h1>
          </div>
          <p>This code will expire in <strong>${expiresInMinutes} minutes</strong>.</p>
          <p>If you did not request this password reset, please ignore this email. Your account remains secure.</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="color: #7f8c8d; font-size: 12px;">
            This is an automated message. Please do not reply to this email.
          </p>
        </div>
      </body>
    </html>
  `;

  return sendEmail([email], subject, html);
}
