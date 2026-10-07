export type OrderStatus = 'awaiting_payment' | 'paid' | 'sent' | 'delivered' | 'cancelled';
export type DeliveryMethod = 'pickup' | 'shipping';
export type EmailType = 'confirmation' | 'payment_reminder' | 'paid' | 'sent' | 'delivered' | 'cancelled';

export interface StoreSettings {
	vipps_number: string;
	shipping_price_nok: number | null;
}

export interface ProductVariant {
	id: string;
	product_id: string;
	label: string;
	stock: number;
	sort_order: number;
}

export interface Product {
	id: string;
	name: string;
	description: string;
	price_nok: number;
	image_path: string | null;
	is_active: boolean;
	created_at: string;
	product_variants: ProductVariant[];
}

export interface ShopProduct extends Product {
	imageUrl: string | null;
}

export interface OrderItem {
	id: string;
	order_id: string;
	variant_id: string | null;
	product_name: string;
	variant_label: string;
	unit_price_nok: number;
	quantity: number;
}

export interface Order {
	id: string;
	order_number: string;
	access_token: string;
	customer_name: string;
	email: string;
	phone: string;
	delivery_method: DeliveryMethod;
	address_line: string | null;
	postal_code: string | null;
	city: string | null;
	country: string | null;
	shipping_price_nok: number;
	total_nok: number;
	status: OrderStatus;
	created_at: string;
	paid_at: string | null;
	sent_at: string | null;
	delivered_at: string | null;
	cancelled_at: string | null;
	order_items: OrderItem[];
}

export interface OrderEmailLog {
	id: string;
	order_id: string;
	email_type: EmailType;
	recipient: string;
	success: boolean;
	error: string | null;
	created_at: string;
}
