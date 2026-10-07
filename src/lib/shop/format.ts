import { ONE_SIZE_LABEL } from './config';

export function formatNok(amount: number): string {
	const sign = amount < 0 ? '-' : '';
	const digits = Math.abs(Math.round(amount))
		.toString()
		.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
	return `${sign}${digits} kr`;
}

export function itemDisplayName(productName: string, variantLabel: string): string {
	return variantLabel === ONE_SIZE_LABEL ? productName : `${productName} – ${variantLabel}`;
}
