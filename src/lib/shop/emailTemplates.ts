import { formatNok, itemDisplayName } from './format';
import type { DeliveryMethod, EmailType } from './types';

export interface EmailOrder {
	order_number: string;
	customer_name: string;
	delivery_method: DeliveryMethod;
	address_line: string | null;
	postal_code: string | null;
	city: string | null;
	country: string | null;
	shipping_price_nok: number;
	total_nok: number;
	order_items: { product_name: string; variant_label: string; unit_price_nok: number; quantity: number }[];
}

export interface EmailContext {
	orderUrl: string;
	vippsNumber: string;
	contactEmail: string;
}

export interface BuiltEmail {
	subject: string;
	html: string;
	text: string;
}

export function escapeHtml(s: string): string {
	return s
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

const SUBJECTS: Record<EmailType, (orderNumber: string) => string> = {
	confirmation: (n) => `Order ${n} – Norwegian Open Shop`,
	payment_reminder: (n) => `Payment reminder – Order ${n}`,
	paid: (n) => `Payment received – Order ${n}`,
	sent: (n) => `Your order ${n} has been sent`,
	delivered: (n) => `Your order ${n} has been delivered`,
	cancelled: (n) => `Order ${n} has been cancelled`
};

function introLines(type: EmailType, order: EmailOrder, ctx: EmailContext): string[] {
	const hi = `Hi ${order.customer_name},`;
	switch (type) {
		case 'confirmation':
			return [`Thank you for your order, ${order.customer_name}!`, 'Your items are reserved for you until we receive your payment.'];
		case 'payment_reminder':
			return [hi, `This is a friendly reminder that we have not yet received payment for order ${order.order_number}.`];
		case 'paid':
			return [
				hi,
				'We have received your payment. Thank you!',
				order.delivery_method === 'shipping'
					? 'We will email you when your order has been sent.'
					: 'We will contact you to arrange pickup.'
			];
		case 'sent':
			return [hi, 'Your order has been sent to the address below.'];
		case 'delivered':
			return [hi, 'Your order has been delivered / handed over. Enjoy!'];
		case 'cancelled':
			return [
				hi,
				'Your order has been cancelled.',
				`If you believe this is a mistake, or you have already paid, contact us at ${ctx.contactEmail}.`
			];
	}
}

function deliveryLine(order: EmailOrder): string {
	if (order.delivery_method !== 'shipping') return 'Delivery: Pickup / arranged with the organizer';
	const cityLine = `${order.postal_code ?? ''} ${order.city ?? ''}`.trim();
	return `Delivery: Shipping to ${[order.address_line, cityLine, order.country].filter(Boolean).join(', ')}`;
}

export function buildOrderEmail(type: EmailType, order: EmailOrder, ctx: EmailContext): BuiltEmail {
	const intro = introLines(type, order, ctx);
	const needsPayment = type === 'confirmation' || type === 'payment_reminder';
	const payment = needsPayment
		? [
				`Pay ${formatNok(order.total_nok)} with Vipps to ${ctx.vippsNumber}.`,
				`Write ${order.order_number} in the Vipps message.`
			]
		: [];
	const items = order.order_items.map(
		(i) => `${i.quantity} × ${itemDisplayName(i.product_name, i.variant_label)} – ${formatNok(i.unit_price_nok * i.quantity)}`
	);
	const totals = [
		...(order.shipping_price_nok > 0 ? [`Shipping: ${formatNok(order.shipping_price_nok)}`] : []),
		`Total: ${formatNok(order.total_nok)}`
	];
	const delivery = deliveryLine(order);

	const text = [
		...intro,
		'',
		...(payment.length ? [...payment, ''] : []),
		`Order ${order.order_number}`,
		...items,
		...totals,
		delivery,
		'',
		`See your order and its status: ${ctx.orderUrl}`,
		'',
		'Norwegian Open WCS'
	].join('\n');

	const p = (s: string) => `<p style="margin:0 0 12px">${escapeHtml(s)}</p>`;
	const html = [
		'<div style="font-family:Arial,Helvetica,sans-serif;color:#222;max-width:560px">',
		intro.map(p).join(''),
		needsPayment
			? `<div style="border:2px solid #f59e0b;border-radius:8px;padding:12px;margin:16px 0">${payment.map(p).join('')}</div>`
			: '',
		`<h3 style="margin:16px 0 8px">Order ${escapeHtml(order.order_number)}</h3>`,
		`<ul style="padding-left:20px;margin:0 0 12px">${items.map((l) => `<li>${escapeHtml(l)}</li>`).join('')}</ul>`,
		totals.map(p).join(''),
		p(delivery),
		`<p style="margin:16px 0"><a href="${escapeHtml(ctx.orderUrl)}">See your order and its status</a><br><span style="font-size:12px;color:#666">${escapeHtml(ctx.orderUrl)}</span></p>`,
		'<p style="margin:0;color:#666">Norwegian Open WCS</p>',
		'</div>'
	].join('');

	return { subject: SUBJECTS[type](order.order_number), html, text };
}
