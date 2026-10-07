export const ONE_SIZE_LABEL = 'One size';
export const SHOP_NOTIFY_EMAIL = 'norwegianopenwcs@gmail.com';
export const PRODUCT_IMAGE_BUCKET = 'product-images';
export const MAX_LINE_QUANTITY = 20;
// Vercel rejects request bodies over 4.5 MB, so keep uploads below that.
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES: Record<string, string> = {
	'image/jpeg': 'jpg',
	'image/png': 'png',
	'image/webp': 'webp'
};
export const ORDER_TOKEN_PATTERN = /^[0-9a-f]{32}$/;
export const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
