import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {
  // Use your actual email service settings here
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your Gmail address
      pass: process.env.EMAIL_PASS, // App password or real password (use app password for security)
    },
  });

  const mailOptions = {
    from: `"Your App Name" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
