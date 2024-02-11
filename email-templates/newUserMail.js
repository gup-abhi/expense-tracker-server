const { sendEmail } = require("../utils/sendMail"); // Import the sendEmail function from the emailUtil file

// Function to send a welcome email to a new user
const sendWelcomeEmail = async (email, username, link) => {
  // Compile the HTML email template
  const emailTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Our Application</title>
    </head>
    <body>
      <table style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
        <tr>
          <td style="text-align: center;">
            <h2>Welcome to Our Application!</h2>
          </td>
        </tr>
        <tr>
          <td>
            <p>Dear ${username},</p>
            <p>Welcome to our application! We are excited to have you on board.</p>
            <p>Thank you for signing up. Your account has been successfully created.</p>
            <p>Verify your account using the below link - </p>
            <p>${link}</p>
            <p>Best regards,<br> The Application Team</p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  // Send the email using the sendEmail function
  const emailSent = await sendEmail(
    email,
    "Welcome to Our Application",
    emailTemplate
  );

  if (emailSent) {
    console.log("Welcome email sent successfully!");
  } else {
    console.error("Failed to send welcome email.");
  }
};

module.exports = {
  sendWelcomeEmail,
};
