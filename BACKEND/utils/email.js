const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Cấu hình transporter cho nodemailer
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
};

/**
 * Gửi email OTP để reset password
 * @param {string} email - Email người nhận
 * @param {string} otp - Mã OTP 6 chữ số
 * @param {string} fullName - Tên đầy đủ của người dùng
 */
const sendPasswordResetOTP = async (email, otp, fullName) => {
  try {
    console.log("📧 Preparing to send email...");
    console.log("   To:", email);
    console.log("   OTP:", otp);
    console.log("   Name:", fullName);
    console.log("   SMTP Config:", {
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      user: process.env.SMTP_USER,
      secure: process.env.SMTP_SECURE,
    });

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Basketball System <noreply@system.com>",
      to: email,
      subject: "Đặt lại mật khẩu - Basketball Tournament System",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏀 Basketball Tournament System</h1>
              <p>Đặt lại mật khẩu</p>
            </div>
            <div class="content">
              <h2>Xin chào ${fullName},</h2>
              <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Mã OTP của bạn là:</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #999;">
                  Mã này có hiệu lực trong ${
                    process.env.OTP_EXPIRES_MINUTES || 10
                  } phút
                </p>
              </div>

              <p><strong>Hướng dẫn sử dụng:</strong></p>
              <ol>
                <li>Truy cập trang đặt lại mật khẩu</li>
                <li>Nhập email: <strong>${email}</strong></li>
                <li>Nhập mã OTP: <strong>${otp}</strong></li>
                <li>Nhập mật khẩu mới của bạn</li>
              </ol>

              <div class="warning">
                <strong>⚠️ Lưu ý bảo mật:</strong>
                <ul style="margin: 5px 0; padding-left: 20px;">
                  <li>KHÔNG chia sẻ mã OTP này với bất kỳ ai</li>
                  <li>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này</li>
                  <li>Mã OTP chỉ sử dụng được 1 lần</li>
                </ul>
              </div>

              <p>Nếu bạn gặp vấn đề, vui lòng liên hệ với chúng tôi.</p>
              
              <p>Trân trọng,<br>
              <strong>Basketball Tournament System Team</strong></p>
            </div>
            <div class="footer">
              <p>Email này được gửi tự động, vui lòng không trả lời.</p>
              <p>&copy; 2025 Basketball Tournament System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Xin chào ${fullName},

Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.

Mã OTP của bạn là: ${otp}
Mã này có hiệu lực trong ${process.env.OTP_EXPIRES_MINUTES || 10} phút.

Hướng dẫn sử dụng:
1. Truy cập trang đặt lại mật khẩu
2. Nhập email: ${email}
3. Nhập mã OTP: ${otp}
4. Nhập mật khẩu mới của bạn

⚠️ LƯU Ý BẢO MẬT:
- KHÔNG chia sẻ mã OTP này với bất kỳ ai
- Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này
- Mã OTP chỉ sử dụng được 1 lần

Trân trọng,
Basketball Tournament System Team

---
Email này được gửi tự động, vui lòng không trả lời.
© 2025 Basketball Tournament System. All rights reserved.
      `,
    };

    console.log("🚀 Sending email via SMTP...");
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("   Message ID:", info.messageId);
    console.log("   Response:", info.response);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("❌ Email sending error:", error);
    console.error("   Error details:", error.message);
    console.error("   Error code:", error.code);
    return { success: false, error: error.message };
  }
};

/**
 * Test kết nối email
 */
const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log("✅ Email server connection successful");
    return true;
  } catch (error) {
    console.error("❌ Email server connection failed:", error);
    return false;
  }
};

module.exports = {
  sendPasswordResetOTP,
  testEmailConnection,
};
