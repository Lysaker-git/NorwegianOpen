import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { ORDER_TOKEN_PATTERN, PRODUCT_IMAGE_BUCKET, UUID_PATTERN } from './config';
import type { EmailType, Order, OrderEmailLog, Product, StoreSettings } from './types';

function sortVariants(product: Product): Product {
	return {
		...product,
		product_variants: [...(product.product_variants ?? [])].sort((a, b) => a.sort_order - b.sort_order)
	};
}

export async function getSettings(): Promise<StoreSettings> {
	const { data, error } = await supabaseAdmin
		.from('store_settings')
		.select('vipps_number, shipping_price_nok')
		.eq('id', 1)
		.single();
	if (error) throw error;
	return data as StoreSettings;
}

export async function getOrderById(id: string): Promise<Order | null> {
	if (!UUID_PATTERN.test(id)) return null;
	const { data, error } = await supabaseAdmin.from('orders').select('*, order_items(*)').eq('id', id).maybeSingle();
	if (error) throw error;
	return data as Order | null;
}

export async function getOrderByToken(token: string): Promise<Order | null> {
	if (!ORDER_TOKEN_PATTERN.test(token)) return null;
	const { data, error } = await supabaseAdmin
		.from('orders')
		.select('*, order_items(*)')
		.eq('access_token', token)
		.maybeSingle();
	if (error) throw error;
	return data as Order | null;
}

export async function listActiveProducts(): Promise<Product[]> {
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.eq('is_active', true)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data as Product[]).map(sortVariants);
}

export async function listAllProducts(): Promise<Product[]> {
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.order('created_at', { ascending: false });
	if (error) throw error;
	return (data as Product[]).map(sortVariants);
}

export async function getProduct(id: string): Promise<Product | null> {
	if (!UUID_PATTERN.test(id)) return null;
	const { data, error } = await supabaseAdmin
		.from('products')
		.select('*, product_variants(*)')
		.eq('id', id)
		.maybeSingle();
	if (error) throw error;
	return data ? sortVariants(data as Product) : null;
}

export async function getOrderedVariantIds(variantIds: string[]): Promise<string[]> {
	if (variantIds.length === 0) return [];
	const { data, error } = await supabaseAdmin.from('order_items').select('variant_id').in('variant_id', variantIds);
	if (error) throw error;
	return [...new Set((data ?? []).map((r: { variant_id: string }) => r.variant_id))];
}

export async function getOrderEmails(orderId: string): Promise<OrderEmailLog[]> {
	const { data, error } = await supabaseAdmin
		.from('order_emails')
		.select('*')
		.eq('order_id', orderId)
		.order('created_at', { ascending: false });
	if (error) throw error;
	return data as OrderEmailLog[];
}

export async function logOrderEmail(row: {
	order_id: string;
	email_type: EmailType;
	recipient: string;
	success: boolean;
	error: string | null;
}): Promise<void> {
	const { error } = await supabaseAdmin.from('order_emails').insert(row);
	if (error) throw error;
}

export function productImageUrl(path: string | null): string | null {
	if (!path) return null;
	return supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).getPublicUrl(path).data.publicUrl;
}
