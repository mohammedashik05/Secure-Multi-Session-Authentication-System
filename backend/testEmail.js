const nodemailer = require("nodemailer");
require("dotenv").config();

async function sendTest() {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: "mohammedashik2k05@gmail.com",
      subject: "Cybrex Test Mail",
      text: "Cybrex email system is working! 🔥",
    });

    console.log("Test mail sent!");
  } catch (err) {
    console.error("Error sending email:", err);
  }
}

sendTest();
