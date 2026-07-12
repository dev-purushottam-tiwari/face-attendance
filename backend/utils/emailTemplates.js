exports.otpTemplate = (otp, purpose) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2 style="color:#2563eb;">Face Attendance System</h2>
    <p>Your one-time password (OTP) for <strong>${purpose}</strong> is:</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px;">
      ${otp}
    </div>
    <p>This OTP is valid for <strong>5 minutes</strong>.</p>
    <p style="color:#666;font-size:12px;">If you did not request this, please ignore this email.</p>
  </div>
`;

exports.approvalTemplate = (name, type) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2 style="color:#16a34a;">Welcome, ${name}!</h2>
    <p>Your <strong>${type}</strong> has been approved by the admin.</p>
    <p>You can now log in and start using the system.</p>
  </div>
`;

exports.rejectionTemplate = (name, type, reason) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2 style="color:#dc2626;">Hello ${name}</h2>
    <p>Your <strong>${type}</strong> has been rejected.</p>
    ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
    <p>Please contact the admin for more details.</p>
  </div>
`;

exports.leaveStatusTemplate = (name, status, reason) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2>Leave Request ${status}</h2>
    <p>Hi ${name}, your leave request has been <strong>${status}</strong>.</p>
    ${reason ? `<p><strong>Note:</strong> ${reason}</p>` : ''}
  </div>
`;

exports.resetTemplate = (otp) => `
  <div style="font-family:Arial,sans-serif;max-width:500px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px;">
    <h2 style="color:#2563eb;">Password Reset</h2>
    <p>Your OTP for password reset is:</p>
    <div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#111;background:#f3f4f6;padding:16px;text-align:center;border-radius:8px;">
      ${otp}
    </div>
    <p>Valid for 5 minutes.</p>
  </div>
`;