import { describe, it, expect } from 'vitest';
import { parseCheckoutForm } from './checkoutValidation';

const V = '11111111-1111-1111-1111-111111111111';

function form(fields: Record<string, string>) {
	const f = new FormData();
	for (const [k, v] of Object.entries(fields)) f.set(k, v);
	return f;
}

const valid = {
	customer_name: 'Kari Nordmann',
	email: 'kari@example.com',
	phone: '+47 123 45 678',
	delivery_method: 'pickup',
	cart: JSON.stringify([{ variantId: V, quantity: 2 }])
};

describe('parseCheckoutForm', () => {
	it('accepts a valid pickup order', () => {
		const { input, errors } = parseCheckoutForm(form(valid));
		expect(errors).toEqual({});
		expect(input.items).toEqual([{ variant_id: V, quantity: 2 }]);
		expect(input.delivery_method).toBe('pickup');
		expect(input.country).toBe('Norway');
	});
	it('rejects email address lists and display names, accepts a plain address', () => {
		for (const email of ['a@x.no,b@y.no', 'a@x.no;b@y.no', 'Name <a@x.no>', 'a b@x.no']) {
			expect(parseCheckoutForm(form({ ...valid, email })).errors.email).toBeDefined();
		}
		expect(parseCheckoutForm(form({ ...valid, email: 'kari.nordmann+shop@example.co.uk' })).errors.email).toBeUndefined();
	});
	it('requires name, valid email and phone', () => {
		const { errors } = parseCheckoutForm(form({ ...valid, customer_name: ' ', email: 'nope', phone: '12' }));
		expect(Object.keys(errors).sort()).toEqual(['customer_name', 'email', 'phone']);
	});
	it('requires address fields for shipping', () => {
		const { errors } = parseCheckoutForm(form({ ...valid, delivery_method: 'shipping' }));
		expect(Object.keys(errors).sort()).toEqual(['address_line', 'city', 'postal_code']);
	});
	it('accepts shipping with address', () => {
		const { errors } = parseCheckoutForm(
			form({ ...valid, delivery_method: 'shipping', address_line: 'Gate 1', postal_code: '0150', city: 'Oslo' })
		);
		expect(errors).toEqual({});
	});
	it('treats unknown delivery as pickup', () => {
		expect(parseCheckoutForm(form({ ...valid, delivery_method: 'teleport' })).input.delivery_method).toBe('pickup');
	});
	it('rejects empty, malformed or out-of-range carts', () => {
		for (const cart of ['', '[]', '{bad', JSON.stringify([{ variantId: 'x', quantity: 1 }]), JSON.stringify([{ variantId: V, quantity: 0 }]), JSON.stringify([{ variantId: V, quantity: 21 }])]) {
			expect(parseCheckoutForm(form({ ...valid, cart })).errors.items).toBeDefined();
		}
	});
});
