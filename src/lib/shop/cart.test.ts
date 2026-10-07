import { describe, it, expect } from 'vitest';
import { get } from 'svelte/store';
import {
	addItem,
	updateQuantity,
	removeItem,
	cartTotal,
	cartCount,
	applyStockProblems,
	syncWithCatalog,
	parseStoredCart,
	createCartStore,
	CART_STORAGE_KEY,
	type CartItem
} from './cart';

const tee = {
	variantId: '11111111-1111-1111-1111-111111111111',
	productId: 'p1',
	name: 'Event T-shirt',
	label: 'M',
	unitPriceNok: 300,
	maxQuantity: 5,
	imageUrl: null
};
const bag = { ...tee, variantId: '22222222-2222-2222-2222-222222222222', productId: 'p2', name: 'Tote', label: 'One size', unitPriceNok: 150, maxQuantity: 30 };

describe('pure cart functions', () => {
	it('adds a new line', () => {
		expect(addItem([], tee, 2)).toEqual([{ ...tee, quantity: 2 }]);
	});
	it('merges the same variant and caps at stock', () => {
		const items = addItem(addItem([], tee, 4), tee, 3);
		expect(items).toHaveLength(1);
		expect(items[0].quantity).toBe(5);
	});
	it('caps at 20 even when stock is higher', () => {
		expect(addItem([], bag, 25)[0].quantity).toBe(20);
	});
	it('ignores adding when stock is 0', () => {
		expect(addItem([], { ...tee, maxQuantity: 0 }, 1)).toEqual([]);
	});
	it('updates and removes when quantity <= 0', () => {
		const items = addItem([], tee, 2);
		expect(updateQuantity(items, tee.variantId, 4)[0].quantity).toBe(4);
		expect(updateQuantity(items, tee.variantId, 0)).toEqual([]);
		expect(removeItem(items, tee.variantId)).toEqual([]);
	});
	it('totals and counts', () => {
		const items = addItem(addItem([], tee, 2), bag, 1);
		expect(cartTotal(items)).toBe(750);
		expect(cartCount(items)).toBe(3);
	});
	it('applies stock problems: reduce or remove', () => {
		const items = addItem(addItem([], tee, 3), bag, 1);
		const result = applyStockProblems(items, [
			{ variant_id: tee.variantId, available: 1 },
			{ variant_id: bag.variantId, available: 0 }
		]);
		expect(result).toEqual([{ ...tee, quantity: 1, maxQuantity: 1 }]);
	});
	it('syncs prices and stock from the catalog and drops unknown variants', () => {
		const items = addItem(addItem([], tee, 3), bag, 1);
		const result = syncWithCatalog(items, { [tee.variantId]: { priceNok: 350, stock: 2 } });
		expect(result).toEqual([{ ...tee, unitPriceNok: 350, maxQuantity: 2, quantity: 2 }]);
	});
});

describe('parseStoredCart', () => {
	it('returns [] for null, bad JSON and non-arrays', () => {
		expect(parseStoredCart(null)).toEqual([]);
		expect(parseStoredCart('{nope')).toEqual([]);
		expect(parseStoredCart('{"a":1}')).toEqual([]);
	});
	it('keeps only valid items', () => {
		const good: CartItem = { ...tee, quantity: 1 };
		expect(parseStoredCart(JSON.stringify([good, { foo: 'bar' }]))).toEqual([good]);
	});
});

describe('createCartStore', () => {
	function memoryStorage(initial: Record<string, string> = {}) {
		const data = { ...initial };
		return {
			data,
			getItem: (k: string) => data[k] ?? null,
			setItem: (k: string, v: string) => {
				data[k] = v;
			}
		};
	}

	it('loads from and saves to storage', () => {
		const storage = memoryStorage({ [CART_STORAGE_KEY]: JSON.stringify([{ ...tee, quantity: 1 }]) });
		const store = createCartStore(storage);
		expect(get(store)).toHaveLength(1);
		store.add(bag, 2);
		expect(JSON.parse(storage.data[CART_STORAGE_KEY])).toHaveLength(2);
		store.clear();
		expect(JSON.parse(storage.data[CART_STORAGE_KEY])).toEqual([]);
	});

	it('works when storage throws', () => {
		const store = createCartStore({
			getItem: () => {
				throw new Error('blocked');
			},
			setItem: () => {
				throw new Error('blocked');
			}
		});
		store.add(tee, 1);
		expect(get(store)).toHaveLength(1);
	});

	it('works with no storage (server)', () => {
		const store = createCartStore(undefined);
		store.add(tee, 1);
		expect(get(store)[0].quantity).toBe(1);
	});
});
