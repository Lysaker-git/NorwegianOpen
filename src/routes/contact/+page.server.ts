// src/routes/contact/+page.server.ts
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { GOOGLE_EMAIL } from '$env/static/private'; // Your authenticated Gmail address
import transporter from '$lib/emailClient.server'; // Your Nodemailer transporter setup

export const actions: Actions = {
    sendMessage: async ({ request }) => {
        const formData = await request.formData();
        const name = formData.get('name') as string;
        const email = formData.get('email') as string; // Email of the person contacting you
        const subject = formData.get('subject') as string;
        const messageBody = formData.get('message') as string;

        // Basic validation
        if (!name || !email || !subject || !messageBody) {
            return fail(400, {
                error: 'All fields are required.',
                values: { name, email, subject, messageBody } // Send back values to prefill form
            });
        }
        if (!/^\S+@\S+\.\S+$/.test(email)) {
            return fail(400, {
                error: 'Please enter a valid email address.',
                values: { name, email, subject, messageBody }
            });
        }

        // Construct the email message
        const mailToSend = {
            from: `"Contact Form - Norwegian Open" <${GOOGLE_EMAIL}>`, // From your authenticated email
            to: GOOGLE_EMAIL, // Send to yourself (or your support email)
            replyTo: email, // When you reply, it goes to the sender's email
            subject: `Contact Form: ${subject} (from ${name})`,
            text: `You have a new contact form submission:\n\nName: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${messageBody}`,
            html: `
                <p>You have a new contact form submission:</p>
                <hr>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
                <p><strong>Subject:</strong> ${subject}</p>
                <hr>
                <p><strong>Message:</strong></p>
                <div style="white-space: pre-wrap; padding: 10px; border: 1px solid #eee; background-color: #f9f9f9;">${messageBody.replace(/\n/g, '<br>')}</div>
                <hr>
                <p><em>This email was sent from the contact form on the Norwegian Open website.</em></p>
            `
        };

        try {
            // Re-using your existing sendMail promise wrapper
            // If your `transporter` itself returns a promise, you can await it directly.
            // This assumes your `emailClient.server.ts`'s `transporter` is already configured with OAuth2.
            const sendOp = async (msg: typeof mailToSend) => {
                return new Promise((resolve, reject) => {
                    transporter.sendMail(msg, (err, info) => { // transporter should be your configured Nodemailer transporter
                        if (err) {
                            console.error('Contact Form Email error:', err);
                            reject(err);
                        } else {
                            resolve(info);
                        }
                    });
                });
            };

            await sendOp(mailToSend);

            return { success: true };

        } catch (error) {
            console.error('Failed to send contact message:', error);
            return fail(500, {
                error: 'There was an issue sending your message. Please try again later.',
                values: { name, email, subject, messageBody }
            });
        }
    }
};