const nodemailer = require('nodemailer');

const emailService = {
    sendEmail: async (to, subject, html) => {
        try {
            // Create transporter (configure with your email service)
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: false,
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASS
                }
            });

            // Send mail
            const info = await transporter.sendMail({
                from: '"Seminar Meet" <noreply@seminar.com>',
                to: to,
                subject: subject,
                html: html
            });

            console.log('Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('Email error:', error);
            return false;
        }
    },

    sendMeetingInvite: async (email, meetingCode, hostName) => {
        const subject = 'Meeting Invitation';
        const html = `
            <h2>Meeting Invitation</h2>
            <p>You have been invited to a meeting by ${hostName}</p>
            <p><strong>Meeting Code:</strong> ${meetingCode}</p>
            <p><a href="http://localhost:5173/join/${meetingCode}">Click here to join</a></p>
        `;
        return await emailService.sendEmail(email, subject, html);
    }
};

module.exports = emailService;