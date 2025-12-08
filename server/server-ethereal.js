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
app.use(bodyParser.json({ limit: '10mb' }));

// --- Ethereal Email Configuration (Auto-generated) ---
let transporter;

nodemailer.createTestAccount().then((account) => {
    console.log('Credentials obtained, sending message...');

    // Create a SMTP transporter object
    transporter = nodemailer.createTransport({
        host: account.smtp.host,
        port: account.smtp.port,
        secure: account.smtp.secure,
        auth: {
            user: account.user,
            pass: account.pass
        }
    });

    console.log('Ethereal Email Server Ready!');
    console.log('Use this for testing if you don\'t have real SMTP credentials.');
}).catch(err => {
    console.error('Failed to create test account. ' + err.message);
});

// --- POST Endpoint to Send Email ---
app.post('/send-email', async (req, res) => {
    const { email, pdfContent, month, year } = req.body;

    if (!email || !pdfContent) {
        return res.status(400).json({ success: false, message: 'Missing email or PDF content' });
    }

    try {
        if (!transporter) {
            return res.status(500).json({ success: false, message: 'Server initializing, please wait...' });
        }

        const mailOptions = {
            from: '"Payslip Portal" <no-reply@portal.com>',
            to: email,
            subject: `Payslip for ${month}/${year}`,
            text: `Please find attached your payslip for ${month}/${year}.`,
            html: `<p>Dear Employee,</p><p>Please find attached your payslip for <b>${month}/${year}</b>.</p><p>Best regards,<br>Employee Portal Team</p>`,
            attachments: [
                {
                    filename: `Payslip_${month}_${year}.pdf`,
                    content: pdfContent,
                    encoding: 'base64'
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        res.status(200).json({
            success: true,
            message: 'Email sent successfully (Test Mode)',
            previewUrl: nodemailer.getTestMessageUrl(info)
        });

    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ success: false, message: 'Failed to send email', error: error.toString() });
    }
});

app.listen(PORT, () => {
    console.log(`Test Email server running on http://localhost:${PORT}`);
});
