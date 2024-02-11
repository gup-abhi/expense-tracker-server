const nodemailer = require("nodemailer");

// Function to send an email
const sendEmail = async (to, subject, html) => {
  try {
    // Create a transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "agabhishek20121998@gmail.com", // Your Gmail email address
        pass: "ydlg ysth phrv zied", // Your Gmail password or app-specific password
      },
    });

    // Define email options
    let mailOptions = {
      from: "agabhishek20121998@gmail.com", // Sender address
      to: to, // Recipient address
      subject: subject, // Subject line
      html: html, // Plain text body
    };

    // Send email
    let info = await transporter.sendMail(mailOptions);
    console.log("Email sent: ", info.response);
    return true; // Email sent successfully
  } catch (error) {
    console.error("Error sending email: ", error);
    return false; // Failed to send email
  }
};

module.exports = {
  sendEmail,
};
