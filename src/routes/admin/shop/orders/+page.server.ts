import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getSettings } from '$lib/shop/db.server';
import { parseSettingsForm } from '$lib/shop/adminForms';
import { ORDER_STATUSES } from '$lib/shop/orderStatus';
import type { DeliveryMethod, OrderStatus } from '$lib/shop/types';

type Filter = OrderStatus | 'all';

interface OrderRow {
	id: string;
	order_number: string;
	created_at: string;
	customer_name: string;
	email: string;
	delivery_method: DeliveryMethod;
	total_nok: number;
	status: OrderStatus;
	order_items: { product_name: string; variant_label: string; quantity: number }[];
	order_emails: { success: boolean; created_at: string }[];
}

export const load: PageServerLoad = async ({ url }) => {
	const requested = url.searchParams.get('status');
	const status: Filter =
		requested === 'all' || ORDER_STATUSES.includes(requested as OrderStatus) ? (requested as Filter) : 'awaiting_payment';

	let query = supabaseAdmin
		.from('orders')
		.select(
			'id, order_number, created_at, customer_name, email, delivery_method, total_nok, status, order_items(product_name, variant_label, quantity), order_emails(success, created_at)'
		)
		.order('created_at', { ascending: false });
	if (status !== 'all') query = query.eq('status', status);

	const { data, error: loadError } = await query;
	if (loadError) {
		console.error('[SHOP ADMIN] Load orders failed:', loadError);
		error(500, 'Could not load orders');
	}

	const orders = ((data ?? []) as OrderRow[]).map(({ order_emails, ...o }) => {
		const latest = [...order_emails].sort((a, b) => b.created_at.localeCompare(a.created_at))[0];
		return { ...o, lastEmailFailed: latest ? !latest.success : false };
	});

	return { orders, status, settings: await getSettings() };
};

export const actions: Actions = {
	saveSettings: async ({ request }) => {
		const { values, error: settingsError } = parseSettingsForm(await request.formData());
		if (settingsError) return fail(400, { settingsError });
		const { error: saveError } = await supabaseAdmin
			.from('store_settings')
			.update({ ...values, updated_at: new Date().toISOString() })
			.eq('id', 1);
		if (saveError) {
			console.error('[SHOP ADMIN] Save settings failed:', saveError);
			return fail(500, { settingsError: 'Could not save settings.' });
		}
		return { settingsSaved: true };
	}
};
