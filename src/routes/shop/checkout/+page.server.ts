import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getSettings, listActiveProducts } from '$lib/shop/db.server';
import { sendOrderEmail } from '$lib/shop/emails.server';
import { parseCheckoutForm, type CheckoutErrors, type CheckoutInput } from '$lib/shop/checkoutValidation';
import type { CatalogEntry, StockProblem } from '$lib/shop/cart';

export const load: PageServerLoad = async () => {
	const [settings, products] = await Promise.all([getSettings(), listActiveProducts()]);
	const catalog: Record<string, CatalogEntry> = {};
	for (const p of products) {
		for (const v of p.product_variants) catalog[v.id] = { priceNok: p.price_nok, stock: v.stock };
	}
	return {
		// App.PageData requires session; public shop pages never expose it.
		session: null,
		shippingPriceNok: settings.shipping_price_nok,
		paymentConfigured: settings.vipps_number.trim() !== '',
		catalog
	};
};

// Everything except the cart, to refill the form after an error.
function formValues(input: CheckoutInput) {
	const { items: _items, ...values } = input;
	return values;
}

export const actions: Actions = {
	placeOrder: async ({ request, url }) => {
		const { input, errors } = parseCheckoutForm(await request.formData());
		const values = formValues(input);
		if (Object.keys(errors).length > 0) return fail(400, { errors, values });

		const settings = await getSettings();
		if (settings.vipps_number.trim() === '') {
			return fail(503, { message: 'The shop is not taking orders right now. Please try again later.', values });
		}

		const { data, error } = await supabaseAdmin.rpc('place_order', {
			p_customer: {
				customer_name: input.customer_name,
				email: input.email,
				phone: input.phone,
				delivery_method: input.delivery_method,
				address_line: input.address_line,
				postal_code: input.postal_code,
				city: input.city,
				country: input.country
			},
			p_items: input.items
		});

		if (error) {
			if (error.message === 'OUT_OF_STOCK') {
				let stockProblems: StockProblem[] = [];
				try {
					stockProblems = JSON.parse(error.details ?? '[]');
				} catch {
					stockProblems = [];
				}
				return fail(409, { stockProblems, values });
			}
			if (error.message === 'SHIPPING_DISABLED') {
				const shippingErrors: CheckoutErrors = {
					delivery_method: 'Shipping is not available right now. Please choose pickup.'
				};
				return fail(400, { errors: shippingErrors, values });
			}
			console.error('[SHOP] place_order failed:', error);
			return fail(500, { message: 'Something went wrong placing your order. Please try again.', values });
		}

		const row = (Array.isArray(data) ? data[0] : data) as { out_order_id: string; out_access_token: string };
		// The order stands even if the email fails; the order page shows the payment details.
		const mail = await sendOrderEmail(row.out_order_id, 'confirmation', url.origin);
		redirect(303, `/shop/order/${row.out_access_token}?new=1${mail.success ? '' : '&mail=0'}`);
	}
};
