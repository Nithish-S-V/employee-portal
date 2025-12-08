require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
    methods: ['GET', 'POST', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-csrf-token']
}));
app.use(bodyParser.json({ limit: '10mb' })); // Increase limit for PDF base64

// --- SMTP Configuration ---
// REPLACE THESE WITH YOUR ACTUAL CREDENTIALS
const smtpConfig = {
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
};

const transporter = nodemailer.createTransport(smtpConfig);

// Verify connection
transporter.verify(function (error, success) {
    if (error) {
        console.log('Error connecting to SMTP server:', error);
    } else {
        console.log('Valid SMTP connection established');
    }
});

// --- POST Endpoint to Send Email ---
app.post('/send-email', async (req, res) => {
    const { email, pdfContent, month, year } = req.body;

    if (!email || !pdfContent) {
        return res.status(400).json({ success: false, message: 'Missing email or PDF content' });
    }

    try {
        const mailOptions = {
            from: '"Payslip Portal" <no-reply@portal.com>',
            to: email,
            subject: `Payslip for ${month}/${year}`,
            text: `Please find attached your payslip for ${month}/${year}.`,
            html: `<p>Dear Employee,</p><p>Please find attached your payslip for <b>${month}/${year}</b>.</p><p>Best regards,<br>Employee Portal Team</p>`,
            attachments: [
                {
                    filename: `Payslip_${month}_${year}.pdf`,
                    content: pdfContent, // Nodemailer handles base64 string automatically
                    encoding: 'base64'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        res.status(200).json({ success: true, message: 'Email sent successfully', messageId: info.messageId });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Email server running on http://localhost:${PORT}`);
});
