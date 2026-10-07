import { describe, it, expect } from 'vitest';
import { parseProductForm, parseSettingsForm } from './adminForms';

function productForm(fields: Record<string, string>, variants: [string, string, string][]) {
	const f = new FormData();
	for (const [k, v] of Object.entries(fields)) f.set(k, v);
	for (const [id, label, stock] of variants) {
		f.append('variant_id', id);
		f.append('variant_label', label);
		f.append('variant_stock', stock);
	}
	return f;
}

describe('parseProductForm', () => {
	it('parses a valid product with sizes', () => {
		const { values, errors } = parseProductForm(
			productForm({ name: ' Tee ', description: 'Nice', price_nok: '300', is_active: 'on' }, [
				['abc', 'S', '4'],
				['', 'M', '0']
			])
		);
		expect(errors).toEqual({});
		expect(values).toEqual({
			name: 'Tee',
			description: 'Nice',
			price_nok: 300,
			is_active: true,
			variants: [
				{ id: 'abc', label: 'S', stock: 4, sort_order: 0 },
				{ id: null, label: 'M', stock: 0, sort_order: 1 }
			]
		});
	});
	it('a single row with empty label becomes "One size"', () => {
		const { values, errors } = parseProductForm(productForm({ name: 'Bag', price_nok: '150' }, [['', '', '10']]));
		expect(errors).toEqual({});
		expect(values.variants[0].label).toBe('One size');
		expect(values.is_active).toBe(false);
	});
	it('validates name, price and sizes', () => {
		expect(Object.keys(parseProductForm(productForm({ name: '', price_nok: '1.5' }, [['', 'S', '1']])).errors).sort()).toEqual(['name', 'price_nok']);
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '1'], ['', '', '1']])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '1'], ['', 's', '1']])).errors.variants).toBeDefined();
		expect(parseProductForm(productForm({ name: 'X', price_nok: '1' }, [['', 'S', '-1']])).errors.variants).toBeDefined();
	});
});

describe('parseSettingsForm', () => {
	function f(vipps: string, shipping: string) {
		const fd = new FormData();
		fd.set('vipps_number', vipps);
		fd.set('shipping_price_nok', shipping);
		return fd;
	}
	it('empty shipping turns shipping off', () => {
		expect(parseSettingsForm(f(' 12345 ', ''))).toEqual({ values: { vipps_number: '12345', shipping_price_nok: null }, error: null });
	});
	it('parses a shipping price', () => {
		expect(parseSettingsForm(f('12345', '99')).values.shipping_price_nok).toBe(99);
	});
	it('rejects invalid shipping prices', () => {
		expect(parseSettingsForm(f('12345', '-5')).error).not.toBeNull();
		expect(parseSettingsForm(f('12345', 'abc')).error).not.toBeNull();
	});
});
