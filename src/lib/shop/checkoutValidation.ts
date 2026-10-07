import { MAX_LINE_QUANTITY, UUID_PATTERN } from './config';
import type { DeliveryMethod } from './types';

export interface CheckoutItem {
	variant_id: string;
	quantity: number;
}

export interface CheckoutInput {
	customer_name: string;
	email: string;
	phone: string;
	delivery_method: DeliveryMethod;
	address_line: string;
	postal_code: string;
	city: string;
	country: string;
	items: CheckoutItem[];
}

export type CheckoutField =
	| 'customer_name'
	| 'email'
	| 'phone'
	| 'delivery_method'
	| 'address_line'
	| 'postal_code'
	| 'city'
	| 'items';

export type CheckoutErrors = Partial<Record<CheckoutField, string>>;

function text(form: FormData, key: string, max = 200): string {
	return String(form.get(key) ?? '').trim().slice(0, max);
}

function parseItems(raw: string): CheckoutItem[] | null {
	try {
		const value = JSON.parse(raw);
		if (!Array.isArray(value) || value.length === 0 || value.length > 50) return null;
		const items = value.map((x) => ({
			variant_id: String(x?.variantId ?? ''),
			quantity: Number(x?.quantity)
		}));
		const valid = items.every(
			(i) =>
				UUID_PATTERN.test(i.variant_id) &&
				Number.isInteger(i.quantity) &&
				i.quantity >= 1 &&
				i.quantity <= MAX_LINE_QUANTITY
		);
		return valid ? items : null;
	} catch {
		return null;
	}
}

export function parseCheckoutForm(form: FormData): { input: CheckoutInput; errors: CheckoutErrors } {
	const delivery_method: DeliveryMethod = text(form, 'delivery_method') === 'shipping' ? 'shipping' : 'pickup';
	const input: CheckoutInput = {
		customer_name: text(form, 'customer_name'),
		email: text(form, 'email'),
		phone: text(form, 'phone', 40),
		delivery_method,
		address_line: text(form, 'address_line'),
		postal_code: text(form, 'postal_code', 20),
		city: text(form, 'city', 100),
		country: text(form, 'country', 100) || 'Norway',
		items: parseItems(String(form.get('cart') ?? '')) ?? []
	};

	const errors: CheckoutErrors = {};
	if (!input.customer_name) errors.customer_name = 'Please enter your name.';
	if (!/^\S+@\S+\.\S+$/.test(input.email)) errors.email = 'Please enter a valid email address.';
	if (input.phone.replace(/\D/g, '').length < 8) errors.phone = 'Please enter a valid phone number.';
	if (delivery_method === 'shipping') {
		if (!input.address_line) errors.address_line = 'Please enter your street address.';
		if (!input.postal_code) errors.postal_code = 'Please enter your postcode.';
		if (!input.city) errors.city = 'Please enter your city.';
	}
	if (input.items.length === 0) errors.items = 'Your cart is empty or invalid. Please go back to the shop.';

	return { input, errors };
}
