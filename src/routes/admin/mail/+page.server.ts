import { supabaseAdmin } from '$lib/supabaseAdminClient';
import type { PageServerLoad, Actions } from './$types';
import { json } from '@sveltejs/kit';
import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';

const testEmails = [
	'roblysa@hotmail.com',
	'roblysa@gmail.com',
	'lysakerwcs@hotmail.com'
];

interface Registration {
	id: any;
	FullName: string | null;
	Email: string | null;
	RegistrationStatus: string;
	// ...other fields as needed...
}

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.isAdmin) {
		return json({ status: 403, error: 'Unauthorized' });
	}
	const { data: registrations, error } = await supabaseAdmin
		.from('RegistrationDB')
		.select('id, FullName, Email, RegistrationStatus')
		.order('created_at', { ascending: true });
	if (error) {
		return json({ status: 500, error: error.message });
	}
	return { registrations: registrations };
};

export const actions: Actions = {
	sendMassEmail: async ({ request, locals }) => {
		if (!locals.isAdmin) {
			return json({ status: 403, error: 'Unauthorized' });
		}
		const formData = await request.formData();
		const selectedIDs = JSON.parse(formData.get('selectedIDs') as string) as string[];
		const htmlContent = formData.get('htmlContent') as string;
		const subject = formData.get('subject') as string;

		// Use testEmails if selectedIDs is empty (for testing)
		const recipients = selectedIDs.length > 0 ? selectedIDs : testEmails;

		// Send email using transporter with BCC
		const message = {
			from: GOOGLE_EMAIL,
			bcc: recipients,
			subject,
			html: htmlContent
		};
		try {
			await new Promise((resolve, reject) => {
				transporter.sendMail(message, (err, info) => {
					if (err) {
						console.error('Mass email error:', err);
						reject(err);
					} else {
						resolve(info);
					}
				});
			});
			return json({ status: 200, message: `Emails sent to ${recipients.length} recipients.` });
		} catch (error) {
			return json({ status: 500, error: 'Failed to send mass email.' });
		}
	}
};
