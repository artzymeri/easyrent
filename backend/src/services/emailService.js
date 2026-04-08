const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.FROM_EMAIL || "Kindura <noreply@kindura.app>";

/**
 * Send an email via Resend.
 * @param {object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - Email HTML body
 * @param {string} [options.text] - Plain text fallback
 * @param {Array}  [options.attachments] - Array of { filename, content }
 * @param {string} [options.from] - Override sender
 */
async function sendEmail({ to, subject, html, text, attachments, from }) {
  try {
    const payload = {
      from: from || FROM_EMAIL,
      to,
      subject,
      html,
    };

    if (text) payload.text = text;

    if (attachments && attachments.length > 0) {
      payload.attachments = attachments.map((a) => ({
        filename: a.filename,
        content: a.content, // base64 string or Buffer
      }));
    }

    const { data, error } = await resend.emails.send(payload);

    if (error) {
      console.error("Resend error:", error);
      throw new Error(error.message || "Failed to send email");
    }

    console.log("Email sent:", data?.id);
    return data;
  } catch (err) {
    console.error("Email send failed:", err);
    throw err;
  }
}

// ── Email Templates ───────────────────────────────────────────

function wrapInLayout(content, companyName) {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .container { max-width: 560px; margin: 0 auto; padding: 40px 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 40px 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
    .logo { text-align: center; margin-bottom: 32px; }
    .logo-text { font-size: 24px; font-weight: 700; color: #18181b; }
    .logo-badge { display: inline-block; background: #18181b; color: #fff; font-size: 12px; font-weight: 600; padding: 2px 8px; border-radius: 6px; margin-left: 8px; vertical-align: middle; }
    h1 { font-size: 20px; font-weight: 700; color: #18181b; margin: 0 0 8px; }
    p { font-size: 14px; line-height: 1.6; color: #52525b; margin: 0 0 16px; }
    .btn { display: inline-block; background: #18181b; color: #ffffff !important; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-size: 14px; font-weight: 600; margin: 8px 0 24px; }
    .btn:hover { background: #27272a; }
    .code-box { background: #f4f4f5; border-radius: 8px; padding: 16px; text-align: center; margin: 16px 0 24px; }
    .code { font-size: 32px; font-weight: 700; letter-spacing: 4px; color: #18181b; font-family: monospace; }
    .divider { height: 1px; background: #e4e4e7; margin: 24px 0; }
    .footer { text-align: center; margin-top: 24px; }
    .footer p { font-size: 12px; color: #a1a1aa; }
    .info-row { display: flex; padding: 8px 0; border-bottom: 1px solid #f4f4f5; }
    .info-label { font-size: 13px; color: #71717a; min-width: 120px; }
    .info-value { font-size: 13px; color: #18181b; font-weight: 500; }
    .highlight { background: #fefce8; border-left: 3px solid #eab308; padding: 12px 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .highlight p { color: #854d0e; margin: 0; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="logo">
        <span class="logo-text">${companyName || "EasyRent"}</span>
      </div>
      ${content}
    </div>
    <div class="footer">
      <p>Powered by Kindura &mdash; Car Rental Management</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Admin password reset email
 */
function adminPasswordResetEmail(firstName, resetUrl) {
  const html = wrapInLayout(
    `
    <h1>Reset Your Password</h1>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your administrator password. Click the button below to set a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="highlight">
      <p>⏱ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #a1a1aa;">If the button doesn't work, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a></p>
    `,
    "EasyRent Admin"
  );

  return {
    subject: "Reset Your Password — EasyRent Admin",
    html,
    text: `Hi ${firstName}, reset your password here: ${resetUrl} — This link expires in 1 hour.`,
  };
}

/**
 * Staff password reset email
 */
function staffPasswordResetEmail(firstName, resetUrl, companyName) {
  const html = wrapInLayout(
    `
    <h1>Reset Your Password</h1>
    <p>Hi ${firstName},</p>
    <p>We received a request to reset your password for <strong>${companyName}</strong>. Click the button below to set a new password:</p>
    <div style="text-align: center;">
      <a href="${resetUrl}" class="btn">Reset Password</a>
    </div>
    <div class="highlight">
      <p>⏱ This link expires in <strong>1 hour</strong>. If you didn't request this, you can safely ignore this email.</p>
    </div>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #a1a1aa;">If the button doesn't work, copy and paste this URL into your browser:<br/><a href="${resetUrl}" style="color: #3b82f6; word-break: break-all;">${resetUrl}</a></p>
    `,
    companyName
  );

  return {
    subject: `Reset Your Password — ${companyName}`,
    html,
    text: `Hi ${firstName}, reset your password here: ${resetUrl} — This link expires in 1 hour.`,
  };
}

/**
 * Welcome email for new staff member
 */
function staffWelcomeEmail(firstName, email, tempPassword, companyName, subdomain, loginUrl) {
  const html = wrapInLayout(
    `
    <h1>Welcome to ${companyName}! 🎉</h1>
    <p>Hi ${firstName},</p>
    <p>Your account has been created on <strong>${companyName}</strong>'s car rental management platform. Here are your login details:</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 16px 0 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Company</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">${companyName}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Subdomain</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">${subdomain}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Email</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Password</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">${tempPassword}</td>
        </tr>
      </table>
    </div>
    <div style="text-align: center;">
      <a href="${loginUrl}" class="btn">Sign In Now</a>
    </div>
    <div class="highlight">
      <p>🔑 We recommend changing your password after your first login.</p>
    </div>
    `,
    companyName
  );

  return {
    subject: `Welcome to ${companyName} — Your Account is Ready`,
    html,
    text: `Hi ${firstName}, welcome to ${companyName}! Login at ${loginUrl} with email: ${email} and password: ${tempPassword}. Please change your password after your first login.`,
  };
}

/**
 * Booking rental report email with PDF attachment
 */
function bookingReportEmail(customerFirstName, customerLastName, bookingId, companyName, carInfo) {
  const html = wrapInLayout(
    `
    <h1>Your Rental Agreement</h1>
    <p>Dear ${customerFirstName} ${customerLastName},</p>
    <p>Thank you for choosing <strong>${companyName}</strong>. Please find your rental agreement attached to this email.</p>
    <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin: 16px 0 24px;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Booking ID</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">#${bookingId}</td>
        </tr>
        <tr>
          <td style="padding: 6px 0; font-size: 13px; color: #71717a;">Vehicle</td>
          <td style="padding: 6px 0; font-size: 13px; color: #18181b; font-weight: 600; text-align: right;">${carInfo}</td>
        </tr>
      </table>
    </div>
    <p>If you have any questions, please don't hesitate to contact us.</p>
    <p>We wish you a pleasant ride! 🚗</p>
    <div class="divider"></div>
    <p style="font-size: 12px; color: #a1a1aa;">This is an automated email. The rental agreement PDF is attached to this message.</p>
    `,
    companyName
  );

  return {
    subject: `Rental Agreement #${bookingId} — ${companyName}`,
    html,
    text: `Dear ${customerFirstName} ${customerLastName}, please find your rental agreement #${bookingId} from ${companyName} attached. Vehicle: ${carInfo}. We wish you a pleasant ride!`,
  };
}

module.exports = {
  sendEmail,
  adminPasswordResetEmail,
  staffPasswordResetEmail,
  staffWelcomeEmail,
  bookingReportEmail,
};
