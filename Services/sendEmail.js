import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

async function sendEmail(email, firstname, lastname, otp = null, verificationLink = null) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    try {
        let mailOptions;

        // If OTP is provided, send OTP email
        if (otp && !verificationLink) {
            mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Your OTP Code',
                text: `Hello ${firstname} ${lastname},

Here is your OTP code for verification: ${otp}.

Please enter this code to continue with your process.

If you did not request this code, please ignore this email.

Best regards,
Ganesh Patel
Admin, MyApp
If you have any questions, contact us at support@myapp.com.`,
                html: `
                <p>Hello ${firstname} ${lastname},</p>
                <p>Here is your OTP code for verification:</p>
                <h2>${otp}</h2>
                <p>Please enter this code to continue with your process.</p>
                <p>If you did not request this code, please ignore this email.</p>
                <br/>
                <p>Best regards,</p>
                <p>Ganesh Patel</p>
                <p>Admin, MyApp</p>
                <p>If you have any questions, contact us at <a href="mailto:support@myapp.com">support@myapp.com</a>.</p>
                `
            };

            // If verification link is provided, send verification email
        } else if (!otp && verificationLink) {
            mailOptions = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'Verify Your Email - MyApp',
                text: `Hello ${firstname} ${lastname},

Thank you for signing up with MyApp! Please verify your email by clicking the link below:

${verificationLink}

This link will expire in 1 hour.

If you did not sign up for this account, please ignore this email or contact us at support@myapp.com to report any issues.

Best regards,
Ganesh Patel
Admin, MyApp`,
                html: `
                <p>Hello ${firstname} ${lastname},</p>
                <p>Thank you for signing up with MyApp! Please verify your email by clicking the link below:</p>
                <a href="${verificationLink}" target="_blank" style="color: #1DA1F2;">Verify Email</a>
                <p>This link will expire in 1 hour.</p>
                <p>If you did not sign up for this account, please ignore this email or contact us at <a href="mailto:support@myapp.com">support@myapp.com</a> to report any issues.</p>
                <br/>
                <p>Best regards,</p>
                <p>Ganesh Patel</p>
                <p>Admin, MyApp</p>
                `
            };

        } else {
            throw new Error("Neither OTP nor Verification Link provided");
        }

        // Send the email
        await transporter.sendMail(mailOptions);
        console.log('Email sent successfully to:', email);

    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email. Please try again later.');
    }
}

export default sendEmail;
