import { ONE_SIZE_LABEL } from './config';

export interface ProductFormVariant {
	id: string | null;
	label: string;
	stock: number;
	original_stock: number | null;
	sort_order: number;
}

export interface ProductFormValues {
	name: string;
	description: string;
	price_nok: number;
	is_active: boolean;
	variants: ProductFormVariant[];
}

export type ProductFormErrors = Partial<Record<'name' | 'price_nok' | 'variants' | 'image', string>>;

export function parseProductForm(form: FormData): { values: ProductFormValues; errors: ProductFormErrors } {
	const ids = form.getAll('variant_id').map((v) => String(v).trim());
	const labels = form.getAll('variant_label').map((v) => String(v).trim());
	const stocks = form.getAll('variant_stock').map((v) => String(v).trim());
	const originals = form.getAll('variant_stock_original').map((v) => String(v).trim());
	const priceRaw = String(form.get('price_nok') ?? '').trim();

	const variants: ProductFormVariant[] = labels.map((label, i) => ({
		id: ids[i] ? ids[i] : null,
		label: label || (labels.length === 1 ? ONE_SIZE_LABEL : ''),
		stock: stocks[i] === '' ? NaN : Number(stocks[i]),
		original_stock: originals[i] && Number.isInteger(Number(originals[i])) ? Number(originals[i]) : null,
		sort_order: i
	}));

	const values: ProductFormValues = {
		name: String(form.get('name') ?? '').trim(),
		description: String(form.get('description') ?? '').trim(),
		price_nok: priceRaw === '' ? NaN : Number(priceRaw),
		is_active: form.get('is_active') === 'on',
		variants
	};

	const errors: ProductFormErrors = {};
	if (!values.name) errors.name = 'Please enter a product name.';
	if (!Number.isInteger(values.price_nok) || values.price_nok < 0) {
		errors.price_nok = 'Enter a price in whole kroner (0 or more).';
	}
	const lowerLabels = variants.map((v) => v.label.toLowerCase());
	if (variants.length === 0) {
		errors.variants = 'Add at least one size. Use "One size" for items without sizes.';
	} else if (variants.some((v) => !v.label)) {
		errors.variants = 'Every size needs a name.';
	} else if (new Set(lowerLabels).size !== lowerLabels.length) {
		errors.variants = 'Each size name must be unique.';
	} else if (variants.some((v) => !Number.isInteger(v.stock) || v.stock < 0)) {
		errors.variants = 'Stock must be a whole number, 0 or more.';
	}

	return { values, errors };
}

export function parseSettingsForm(form: FormData): {
	values: { vipps_number: string; shipping_price_nok: number | null };
	error: string | null;
} {
	const vipps_number = String(form.get('vipps_number') ?? '').trim();
	const raw = String(form.get('shipping_price_nok') ?? '').trim();
	const shipping_price_nok = raw === '' ? null : Number(raw);
	const invalid = shipping_price_nok !== null && (!Number.isInteger(shipping_price_nok) || shipping_price_nok < 0);
	return {
		values: { vipps_number, shipping_price_nok: invalid ? null : shipping_price_nok },
		error: invalid ? 'Shipping price must be a whole number of kroner, or empty to turn shipping off.' : null
	};
}
