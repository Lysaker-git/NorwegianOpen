import { writable } from 'svelte/store';
import { MAX_LINE_QUANTITY } from './config';

export interface CartItem {
	variantId: string;
	productId: string;
	name: string;
	label: string;
	unitPriceNok: number;
	quantity: number;
	maxQuantity: number;
	imageUrl: string | null;
}

export interface StockProblem {
	variant_id: string;
	available: number;
}

export interface CatalogEntry {
	priceNok: number;
	stock: number;
}

export const CART_STORAGE_KEY = 'no-shop-cart';

function clamp(quantity: number, max: number): number {
	const q = Number.isFinite(quantity) ? Math.floor(quantity) : 0;
	return Math.max(0, Math.min(q, max, MAX_LINE_QUANTITY));
}

export function addItem(items: CartItem[], item: Omit<CartItem, 'quantity'>, quantity: number): CartItem[] {
	const existing = items.find((i) => i.variantId === item.variantId);
	if (existing) {
		return items
			.map((i) =>
				i.variantId === item.variantId
					? { ...i, ...item, quantity: clamp(i.quantity + quantity, item.maxQuantity) }
					: i
			)
			.filter((i) => i.quantity > 0);
	}
	const q = clamp(quantity, item.maxQuantity);
	return q > 0 ? [...items, { ...item, quantity: q }] : items;
}

export function updateQuantity(items: CartItem[], variantId: string, quantity: number): CartItem[] {
	return items
		.map((i) => (i.variantId === variantId ? { ...i, quantity: clamp(quantity, i.maxQuantity) } : i))
		.filter((i) => i.quantity > 0);
}

export function removeItem(items: CartItem[], variantId: string): CartItem[] {
	return items.filter((i) => i.variantId !== variantId);
}

export function cartTotal(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.unitPriceNok * i.quantity, 0);
}

export function cartCount(items: CartItem[]): number {
	return items.reduce((sum, i) => sum + i.quantity, 0);
}

export function applyStockProblems(items: CartItem[], problems: StockProblem[]): CartItem[] {
	const available = new Map(problems.map((p) => [p.variant_id, p.available]));
	return items
		.map((i) => {
			const max = available.get(i.variantId);
			return max === undefined ? i : { ...i, maxQuantity: max, quantity: clamp(i.quantity, max) };
		})
		.filter((i) => i.quantity > 0);
}

export function syncWithCatalog(items: CartItem[], catalog: Record<string, CatalogEntry>): CartItem[] {
	return items
		.filter((i) => catalog[i.variantId])
		.map((i) => {
			const entry = catalog[i.variantId];
			return {
				...i,
				unitPriceNok: entry.priceNok,
				maxQuantity: entry.stock,
				quantity: clamp(i.quantity, entry.stock)
			};
		})
		.filter((i) => i.quantity > 0);
}

function isCartItem(value: unknown): value is CartItem {
	if (!value || typeof value !== 'object') return false;
	const v = value as Record<string, unknown>;
	return (
		typeof v.variantId === 'string' &&
		typeof v.productId === 'string' &&
		typeof v.name === 'string' &&
		typeof v.label === 'string' &&
		typeof v.unitPriceNok === 'number' &&
		typeof v.quantity === 'number' &&
		typeof v.maxQuantity === 'number' &&
		(v.imageUrl === null || typeof v.imageUrl === 'string')
	);
}

export function parseStoredCart(raw: string | null): CartItem[] {
	if (!raw) return [];
	try {
		const value = JSON.parse(raw);
		return Array.isArray(value) ? value.filter(isCartItem) : [];
	} catch {
		return [];
	}
}

type CartStorage = Pick<Storage, 'getItem' | 'setItem'>;

export function createCartStore(storage?: CartStorage) {
	let initial: CartItem[] = [];
	try {
		initial = parseStoredCart(storage?.getItem(CART_STORAGE_KEY) ?? null);
	} catch {
		initial = [];
	}

	const { subscribe, set, update } = writable<CartItem[]>(initial);

	subscribe((items) => {
		try {
			storage?.setItem(CART_STORAGE_KEY, JSON.stringify(items));
		} catch {
			// Storage blocked or full: the cart still works for this page view.
		}
	});

	return {
		subscribe,
		add: (item: Omit<CartItem, 'quantity'>, quantity: number) => update((i) => addItem(i, item, quantity)),
		setQuantity: (variantId: string, quantity: number) => update((i) => updateQuantity(i, variantId, quantity)),
		remove: (variantId: string) => update((i) => removeItem(i, variantId)),
		applyStockProblems: (problems: StockProblem[]) => update((i) => applyStockProblems(i, problems)),
		sync: (catalog: Record<string, CatalogEntry>) => update((i) => syncWithCatalog(i, catalog)),
		clear: () => set([])
	};
}

function browserStorage(): CartStorage | undefined {
	try {
		return typeof window !== 'undefined' ? window.localStorage : undefined;
	} catch {
		return undefined;
	}
}

export const cart = createCartStore(browserStorage());
