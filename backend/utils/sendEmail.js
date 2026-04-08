const nodemailer = require('nodemailer');

/**
 * Utility to send emails using nodemailer
 * @param {Object} options - { email, subject, message, html }
 */
const sendEmail = async (options) => {
    // 1. Create a transporter
    // For production, use service/host credentials from .env
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_USER || 'placeholder',
            pass: process.env.SMTP_PASS || 'placeholder',
        },
    });

    // 2. Define email options
    const mailOptions = {
        from: `J2AutoParts <${process.env.FROM_EMAIL || 'noreply@j2autoparts.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html,
    };

    // 3. Send the email
    try {
        if (!process.env.SMTP_USER || process.env.SMTP_USER === 'placeholder') {
            console.log('--- MOCK EMAIL START ---');
            console.log(`To: ${options.email}`);
            console.log(`Subject: ${options.subject}`);
            console.log(`Message: ${options.message}`);
            console.log('--- MOCK EMAIL END ---');
            return { success: true, mock: true };
        }

        const info = await transporter.sendMail(mailOptions);
        console.log('Message sent: %s', info.messageId);
        return info;
    } catch (error) {
        console.error('Email sending failed:', error);
        // We don't want to throw error if email fails, just log it 
        // to prevent breaking the order flow
        return { success: false, error };
    }
};

module.exports = sendEmail;
