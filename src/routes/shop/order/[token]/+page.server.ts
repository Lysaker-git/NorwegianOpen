import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { getOrderByToken, getSettings } from '$lib/shop/db.server';

export const load: PageServerLoad = async ({ params, url, setHeaders }) => {
	setHeaders({ 'cache-control': 'private, no-store' });
	const order = await getOrderByToken(params.token);
	if (!order) error(404, 'Order not found');
	const settings = await getSettings();
	return {
		order,
		vippsNumber: settings.vipps_number,
		isNew: url.searchParams.has('new'),
		mailFailed: url.searchParams.get('mail') === '0',
		session: null // App.PageData requires session; public shop pages never expose it.
	};
};
