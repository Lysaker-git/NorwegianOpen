import { describe, it, expect } from 'vitest';
import { buildOrderEmail, escapeHtml, type EmailOrder } from './emailTemplates';
import type { EmailType } from './types';

const order: EmailOrder = {
	order_number: 'NO-1001',
	customer_name: 'Kari <b>',
	delivery_method: 'shipping',
	address_line: 'Gate 1',
	postal_code: '0150',
	city: 'Oslo',
	country: 'Norway',
	shipping_price_nok: 99,
	total_nok: 699,
	order_items: [
		{ product_name: 'Event T-shirt', variant_label: 'M', unit_price_nok: 300, quantity: 2 }
	]
};
const ctx = { orderUrl: 'https://norwegianopen.no/shop/order/abc', vippsNumber: '123456', contactEmail: 'norwegianopenwcs@gmail.com' };
const ALL: EmailType[] = ['confirmation', 'payment_reminder', 'paid', 'sent', 'delivered', 'cancelled'];

describe('buildOrderEmail', () => {
	it('every email has order number, total, link and items', () => {
		for (const type of ALL) {
			const e = buildOrderEmail(type, order, ctx);
			for (const body of [e.text, e.html]) {
				expect(body).toContain('NO-1001');
				expect(body).toContain('699 kr');
				expect(body).toContain(ctx.orderUrl);
				expect(body).toContain('Event T-shirt – M');
			}
			expect(e.subject).toContain('NO-1001');
		}
	});
	it('only confirmation and payment reminder include the Vipps number', () => {
		for (const type of ALL) {
			const hasVipps = buildOrderEmail(type, order, ctx).text.includes('123456');
			expect(hasVipps).toBe(type === 'confirmation' || type === 'payment_reminder');
		}
	});
	it('subjects', () => {
		expect(buildOrderEmail('confirmation', order, ctx).subject).toBe('Order NO-1001 – Norwegian Open Shop');
		expect(buildOrderEmail('payment_reminder', order, ctx).subject).toBe('Payment reminder – Order NO-1001');
		expect(buildOrderEmail('paid', order, ctx).subject).toBe('Payment received – Order NO-1001');
		expect(buildOrderEmail('sent', order, ctx).subject).toBe('Your order NO-1001 has been sent');
		expect(buildOrderEmail('delivered', order, ctx).subject).toBe('Your order NO-1001 has been delivered');
		expect(buildOrderEmail('cancelled', order, ctx).subject).toBe('Order NO-1001 has been cancelled');
	});
	it('cancelled email includes the contact email', () => {
		expect(buildOrderEmail('cancelled', order, ctx).text).toContain('norwegianopenwcs@gmail.com');
	});
	it('shows the shipping address for shipping orders and pickup text otherwise', () => {
		expect(buildOrderEmail('sent', order, ctx).text).toContain('Gate 1, 0150 Oslo, Norway');
		const pickup = buildOrderEmail('paid', { ...order, delivery_method: 'pickup', shipping_price_nok: 0, total_nok: 600 }, ctx).text;
		expect(pickup).toContain('Pickup / arranged with the organizer');
		expect(pickup).toContain('We will contact you to arrange pickup.');
	});
	it('escapes customer input in HTML', () => {
		const html = buildOrderEmail('confirmation', order, ctx).html;
		expect(html).toContain('Kari &lt;b&gt;');
		expect(html).not.toContain('Kari <b>');
	});
});

describe('escapeHtml', () => {
	it('escapes special characters', () => {
		expect(escapeHtml(`<a href="x">'&'</a>`)).toBe('&lt;a href=&quot;x&quot;&gt;&#39;&amp;&#39;&lt;/a&gt;');
	});
});
