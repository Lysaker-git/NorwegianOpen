import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getOrderById, getOrderEmails } from '$lib/shop/db.server';
import { sendOrderEmail } from '$lib/shop/emails.server';
import { adminActions, resultMessage } from '$lib/shop/orderStatus';

export const load: PageServerLoad = async ({ params, url }) => {
	const order = await getOrderById(params.id);
	if (!order) error(404, 'Order not found');
	const emails = await getOrderEmails(order.id);
	return {
		order,
		emails,
		actions: adminActions(order.status),
		customerUrl: `${url.origin}/shop/order/${order.access_token}`
	};
};

export const actions: Actions = {
	act: async ({ params, request, url }) => {
		const form = await request.formData();
		const actionId = String(form.get('action_id') ?? '');
		const emailType = String(form.get('email_type') ?? '');

		const order = await getOrderById(params.id);
		if (!order) error(404, 'Order not found');

		// Re-check against the current status, in case someone else changed it.
		const action = adminActions(order.status).find((a) => a.id === actionId && a.emailType === emailType);
		if (!action) {
			return fail(400, { result: { ok: false, message: 'That action is no longer available for this order. The page has been refreshed.' } });
		}

		if (action.kind === 'status') {
			const { error: rpcError } = await supabaseAdmin.rpc('set_order_status', { p_order_id: order.id, p_status: action.to });
			if (rpcError) {
				console.error('[SHOP ADMIN] set_order_status failed:', rpcError);
				return fail(500, { result: { ok: false, message: `Could not change status: ${rpcError.message}` } });
			}
		} else if (action.kind === 'cancel') {
			const { error: rpcError } = await supabaseAdmin.rpc('cancel_order', { p_order_id: order.id });
			if (rpcError) {
				console.error('[SHOP ADMIN] cancel_order failed:', rpcError);
				return fail(500, { result: { ok: false, message: `Could not cancel the order: ${rpcError.message}` } });
			}
		}

		// The status change is already committed; a failed email is reported, not rolled back.
		const mail = await sendOrderEmail(order.id, action.emailType, url.origin);
		return { result: { ok: mail.success, message: resultMessage(action, mail, order.email) } };
	}
};
