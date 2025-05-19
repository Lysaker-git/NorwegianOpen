import Nodemailer from 'nodemailer';
import { GOOGLE_EMAIL, GOOGLE_PASSWORD } from '$env/static/private';

const transportOptions = {
	host: 'smtp.gmail.com',
	port: 587,
	secure: false,
	auth: {
		user: GOOGLE_EMAIL,
		pass: GOOGLE_PASSWORD
	}
};

const transporter = Nodemailer.createTransport(transportOptions);

(async () => {
	try {
		await transporter.verify();
		console.log('Server is ready');
	} catch (error) {
		console.error('Verification failed:', error);
	}
})();

export default transporter;
