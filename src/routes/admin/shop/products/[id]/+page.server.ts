import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { supabaseAdmin } from '$lib/supabaseAdminClient';
import { getOrderedVariantIds, getProduct, productImageUrl } from '$lib/shop/db.server';
import { parseProductForm, type ProductFormErrors } from '$lib/shop/adminForms';
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES, PRODUCT_IMAGE_BUCKET } from '$lib/shop/config';

export const load: PageServerLoad = async ({ params, url }) => {
	if (params.id === 'new') {
		return { product: null, imageUrl: null, orderedVariantIds: [] as string[], imageFailed: false, saveFailed: false, stockConflict: null as string | null };
	}
	const product = await getProduct(params.id);
	if (!product) error(404, 'Product not found');
	const orderedVariantIds = await getOrderedVariantIds(product.product_variants.map((v) => v.id));
	return {
		product,
		imageUrl: productImageUrl(product.image_path),
		orderedVariantIds,
		imageFailed: url.searchParams.has('image_failed'),
		saveFailed: url.searchParams.has('save_failed'),
		stockConflict: url.searchParams.get('stock_conflict')
	};
};

function imageError(file: File): string | null {
	if (!ALLOWED_IMAGE_TYPES[file.type]) return 'Image must be JPG, PNG or WebP.';
	if (file.size > MAX_IMAGE_BYTES) return 'Image must be 4 MB or smaller.';
	return null;
}

export const actions: Actions = {
	save: async ({ params, request }) => {
		const form = await request.formData();
		const { values, errors } = parseProductForm(form);
		const image = form.get('image');
		const file = image instanceof File && image.size > 0 ? image : null;
		const imgErr = file ? imageError(file) : null;
		if (imgErr) errors.image = imgErr;
		if (Object.keys(errors).length > 0) return fail(400, { errors, values });

		const isNew = params.id === 'new';
		const existing = isNew ? null : await getProduct(params.id);
		if (!isNew && !existing) error(404, 'Product not found');

		// Refuse to remove sizes that have orders, before changing anything.
		const keptIds = new Set(values.variants.map((v) => v.id).filter((id): id is string => !!id));
		const removed = (existing?.product_variants ?? []).filter((v) => !keptIds.has(v.id));
		const orderedRemoved = new Set(await getOrderedVariantIds(removed.map((v) => v.id)));
		const blocked = removed.filter((v) => orderedRemoved.has(v.id));
		if (blocked.length > 0) {
			return fail(400, {
				errors: <ProductFormErrors>{
					variants: `These sizes have orders and can't be removed: ${blocked.map((v) => v.label).join(', ')}. Set their stock to 0 instead.`
				},
				values
			});
		}

		const productFields = {
			name: values.name,
			description: values.description,
			price_nok: values.price_nok,
			is_active: values.is_active
		};

		let productId = params.id;
		// New products start hidden, so a half-saved product is never visible in the shop.
		const abortSave = async (what: string, err: unknown) => {
			console.error(`[SHOP ADMIN] ${what} failed:`, err);
			if (isNew && productId !== 'new') {
				const { error: cleanupError } = await supabaseAdmin.from('products').delete().eq('id', productId);
				if (cleanupError) console.error('[SHOP ADMIN] Cleanup of new product failed:', cleanupError);
			}
			if (!isNew) redirect(303, `/admin/shop/products/${productId}?save_failed=1`);
			return fail(500, { message: 'Could not save the product.', values });
		};

		if (isNew) {
			const { data, error: insertError } = await supabaseAdmin
				.from('products')
				.insert({ ...productFields, is_active: false })
				.select('id')
				.single();
			if (insertError || !data) return abortSave('Insert product', insertError);
			productId = data.id;
		} else {
			const { error: updateError } = await supabaseAdmin.from('products').update(productFields).eq('id', productId);
			if (updateError) return abortSave('Update product', updateError);
		}

		// (a) delete removed sizes
		if (removed.length > 0) {
			const { error: deleteError } = await supabaseAdmin
				.from('product_variants')
				.delete()
				.in('id', removed.map((v) => v.id));
			if (deleteError) return abortSave('Remove sizes', deleteError);
		}

		const kept = values.variants.filter((v): v is typeof v & { id: string } => !!v.id);
		const added = values.variants.filter((v) => !v.id);

		// (b) move kept sizes to temporary labels so renames/swaps can't hit unique (product_id, label)
		for (const v of kept) {
			const { error: tmpError } = await supabaseAdmin
				.from('product_variants')
				.update({ label: `__tmp_${v.id}` })
				.eq('id', v.id)
				.eq('product_id', productId);
			if (tmpError) return abortSave(`Temp-rename size "${v.label}"`, tmpError);
		}
		// (c) apply final values. Stock is only written if the admin changed it, and then only if
		// it still matches what the editor loaded, so live orders/cancellations are never overwritten.
		for (const v of kept) {
			const stockUnchanged = v.original_stock !== null && v.stock === v.original_stock;
			const fields = stockUnchanged
				? { label: v.label, sort_order: v.sort_order }
				: { label: v.label, stock: v.stock, sort_order: v.sort_order };
			let query = supabaseAdmin.from('product_variants').update(fields).eq('id', v.id).eq('product_id', productId);
			const guarded = !stockUnchanged && v.original_stock !== null;
			if (guarded) query = query.eq('stock', v.original_stock as number);
			const { data: updated, error: updError } = await query.select('id');
			if (updError) return abortSave(`Update size "${v.label}"`, updError);
			if (guarded && (updated?.length ?? 0) === 0) {
				console.error(`[SHOP ADMIN] Stock conflict for size "${v.label}" of product ${productId}`);
				redirect(303, `/admin/shop/products/${productId}?stock_conflict=${encodeURIComponent(v.label)}`);
			}
		}
		// (d) insert new sizes
		for (const v of added) {
			const { error: insError } = await supabaseAdmin
				.from('product_variants')
				.insert({ label: v.label, stock: v.stock, sort_order: v.sort_order, product_id: productId });
			if (insError) return abortSave(`Insert size "${v.label}"`, insError);
		}

		if (isNew && values.is_active) {
			const { error: activateError } = await supabaseAdmin.from('products').update({ is_active: true }).eq('id', productId);
			if (activateError) return abortSave('Activate product', activateError);
		}

		const removeImage = form.get('remove_image') === 'on';
		if (file || removeImage) {
			const oldPath = existing?.image_path ?? null;
			let newPath: string | null = null;
			if (file) {
				newPath = `products/${productId}-${Date.now()}.${ALLOWED_IMAGE_TYPES[file.type]}`;
				const { error: uploadError } = await supabaseAdmin.storage
					.from(PRODUCT_IMAGE_BUCKET)
					.upload(newPath, file, { contentType: file.type });
				if (uploadError) {
					console.error('[SHOP ADMIN] Image upload failed:', uploadError);
					redirect(303, `/admin/shop/products/${productId}?image_failed=1`);
				}
			}
			const { error: pathError } = await supabaseAdmin.from('products').update({ image_path: newPath }).eq('id', productId);
			if (pathError) {
				console.error('[SHOP ADMIN] Saving image path failed:', pathError);
				if (newPath) {
					const { error: rmNew } = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([newPath]);
					if (rmNew) console.error('[SHOP ADMIN] Removing uploaded image failed:', rmNew);
				}
				redirect(303, `/admin/shop/products/${productId}?image_failed=1`);
			}
			if (oldPath) {
				const { error: rmOld } = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([oldPath]);
				if (rmOld) console.error('[SHOP ADMIN] Removing old image failed:', rmOld);
			}
		}

		redirect(303, '/admin/shop/products?saved=1');
	},

	delete: async ({ params }) => {
		const product = await getProduct(params.id);
		if (!product) error(404, 'Product not found');
		const ordered = await getOrderedVariantIds(product.product_variants.map((v) => v.id));
		if (ordered.length > 0) {
			return fail(400, { message: 'This product has orders and cannot be deleted. Untick "Visible in shop" to hide it instead.' });
		}
		const { error: deleteError } = await supabaseAdmin.from('products').delete().eq('id', product.id);
		if (deleteError) return fail(500, { message: 'Could not delete the product.' });
		if (product.image_path) {
			const { error: removeError } = await supabaseAdmin.storage.from(PRODUCT_IMAGE_BUCKET).remove([product.image_path]);
			if (removeError) console.error('[SHOP ADMIN] Removing image failed:', removeError);
		}
		redirect(303, '/admin/shop/products?deleted=1');
	}
};
