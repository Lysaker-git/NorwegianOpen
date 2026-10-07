import type { PageServerLoad } from './$types';
import { getSettings, listActiveProducts, productImageUrl } from '$lib/shop/db.server';
import type { ShopProduct } from '$lib/shop/types';

export const load: PageServerLoad = async () => {
	const [products, settings] = await Promise.all([listActiveProducts(), getSettings()]);
	return {
		products: products.map((p): ShopProduct => ({ ...p, imageUrl: productImageUrl(p.image_path) })),
		shippingEnabled: settings.shipping_price_nok !== null,
		// App.PageData requires session; public shop pages never expose it.
		session: null
	};
};
