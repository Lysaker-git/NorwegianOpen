import type { PageServerLoad } from './$types';
import { listAllProducts, productImageUrl } from '$lib/shop/db.server';

export const load: PageServerLoad = async ({ url }) => {
	const products = await listAllProducts();
	return {
		products: products.map((p) => ({ ...p, imageUrl: productImageUrl(p.image_path) })),
		notice: url.searchParams.has('saved') ? 'Product saved.' : url.searchParams.has('deleted') ? 'Product deleted.' : null
	};
};
