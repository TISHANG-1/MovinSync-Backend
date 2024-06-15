import nodemailer from "nodemailer";

const sendEmail = async (options) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_SERVICE,
      port: 465,
      auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD,
      },
      secure: true, // use SSL/TLS
    });

    const mailOptions = {
      from: process.env.SMTP_MAIL,
      to: options.email,
      subject: options.subject,
      text: options.message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
  }
};

export default sendEmail;
