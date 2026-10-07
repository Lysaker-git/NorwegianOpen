import transporter from '$lib/emailClient.server';
import { GOOGLE_EMAIL } from '$env/static/private';
import { SHOP_NOTIFY_EMAIL } from './config';
import { getOrderById, getSettings, logOrderEmail } from './db.server';
import { buildOrderEmail } from './emailTemplates';
import type { EmailType } from './types';

export interface SendResult {
	success: boolean;
	error: string | null;
	recipient: string | null;
}

async function safeLog(orderId: string, type: EmailType, recipient: string, success: boolean, error: string | null) {
	try {
		await logOrderEmail({ order_id: orderId, email_type: type, recipient, success, error });
	} catch (err) {
		console.error('[SHOP] Failed to log order email:', err);
	}
}

/** Builds, sends and logs an order email. Never throws. */
export async function sendOrderEmail(orderId: string, type: EmailType, origin: string): Promise<SendResult> {
	let recipient: string | null = null;
	try {
		const [order, settings] = await Promise.all([getOrderById(orderId), getSettings()]);
		if (!order) return { success: false, error: 'Order not found', recipient: null };
		recipient = order.email;

		const email = buildOrderEmail(type, order, {
			orderUrl: `${origin}/shop/order/${order.access_token}`,
			vippsNumber: settings.vipps_number,
			contactEmail: SHOP_NOTIFY_EMAIL
		});

		await transporter.sendMail({
			from: `"Norwegian Open Shop" <${GOOGLE_EMAIL}>`,
			to: order.email,
			bcc: SHOP_NOTIFY_EMAIL,
			replyTo: SHOP_NOTIFY_EMAIL,
			subject: email.subject,
			html: email.html,
			text: email.text
		});

		await safeLog(orderId, type, recipient, true, null);
		return { success: true, error: null, recipient };
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.error(`[SHOP] Failed to send ${type} email for order ${orderId}:`, message);
		if (recipient !== null) await safeLog(orderId, type, recipient, false, message);
		return { success: false, error: message, recipient };
	}
}
