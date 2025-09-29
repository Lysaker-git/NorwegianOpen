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
	// Fetch registrations
	const { data: registrations, error } = await supabaseAdmin
		.from('RegistrationDB')
		.select('id, FullName, Email, RegistrationStatus, Level, PassOption')
		.order('created_at', { ascending: true });
	if (error) {
		return json({ status: 500, error: error.message });
	}

	// Fetch unique statuses
	const { data: statusRows, error: statusError } = await supabaseAdmin
		.from('RegistrationDB')
		.select('RegistrationStatus')
		.neq('RegistrationStatus', null)
		.order('RegistrationStatus', { ascending: true });
	if (statusError) {
		return json({ status: 500, error: statusError.message });
	}
	const statuses = Array.from(new Set((statusRows ?? []).map(r => r.RegistrationStatus)));

	// Fetch unique levels
	const { data: levelRows, error: levelError } = await supabaseAdmin
		.from('RegistrationDB')
		.select('Level')
		.neq('Level', null)
		.order('Level', { ascending: true });
	if (levelError) {
		return json({ status: 500, error: levelError.message });
	}
	const levels = Array.from(new Set((levelRows ?? []).map(r => r.Level)));

	// Fetch unique PassOptions, include both 'Zero to Hero' and 'dummyReg' for testing
	const { data: passRows, error: passError } = await supabaseAdmin
		.from('RegistrationDB')
		.select('PassOption')
		.in('PassOption', ['Zero to Hero', 'dummyReg']);
	if (passError) {
		return json({ status: 500, error: passError.message });
	}
	// Only add the button if at least one exists
	const passOptions = Array.from(new Set((passRows ?? []).map(r => r.PassOption).filter(Boolean)));
	console.log('[LOAD REGISTRATIONS] Pass options:', passOptions)

	return { registrations, statuses, levels, passOptions };
};

export const actions: Actions = {
	sendMassEmail: async ({ request, locals }) => {
		console.log('[SEND MASS EMAIL] Action triggered');
		if (!locals.isAdmin) {
			return json({ status: 403, error: 'Unauthorized' });
		}
		const formData = await request.formData();
		console.log('[SEND MASS EMAIL] Form data received:', Array.from(formData.entries()));
		const selectedIDs = JSON.parse(formData.get('selectedIDs') as string) as string[];
		console.log('[SEND MASS EMAIL] Selected IDs:', selectedIDs);
		const htmlContent = formData.get('htmlContent') as string;
		console.log('[SEND MASS EMAIL] HTML Content length:', htmlContent.length);
		const subject = formData.get('subject') as string;
		console.log('[SEND MASS EMAIL] Subject:', subject);

		// Use testEmails if selectedIDs is empty (for testing)
		const recipients = selectedIDs.length > 0 ? selectedIDs : testEmails;
		console.log('[SEND MASS EMAIL] Recipients:', recipients);

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
