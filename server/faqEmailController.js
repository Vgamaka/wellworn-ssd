const nodemailer = require('nodemailer');

const sendFaqEmail = async (req, res) => {
    console.log("sendFaqEmail invoked with data:", req.body); // Debug log
  const { customerEmail, question, answer } = req.body;

  const transporter = nodemailer.createTransport({
    host: 'mail.wellworn.lk', // SMTP server address
    port: 465, // Secure SMTP port
    secure: true, // True for 465, false for other ports
    auth: {
      user: 'faq@wellworn.lk', // FAQ email address
      pass: '123wellhelp#$', // FAQ email password
    },
  });

  const mailOptions = {
    from: '"WellWorn Private Limited" <faq@wellworn.lk>',
    to: customerEmail,
    subject: 'Answer to Your FAQ Inquiry',
    html: `
      <p>Dear Customer,</p>
      <p>Thank you for reaching out to WellWorn. Below is the answer to your inquiry:</p>
      <p><strong>Your Question:</strong> ${question}</p>
      <p><strong>Our Answer:</strong> ${answer}</p>
      <p>If you have any further questions, please feel free to reply to this email.</p>
      <p>Best regards,</p>
      <p>WellWorn Private Limited</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email: ', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
};

module.exports = { sendFaqEmail };
