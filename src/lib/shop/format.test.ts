import { describe, it, expect } from 'vitest';
import { formatNok, itemDisplayName } from './format';

describe('formatNok', () => {
	it('formats whole kroner with space thousands separator', () => {
		expect(formatNok(0)).toBe('0 kr');
		expect(formatNok(300)).toBe('300 kr');
		expect(formatNok(1250)).toBe('1 250 kr');
		expect(formatNok(1234567)).toBe('1 234 567 kr');
	});
});

describe('itemDisplayName', () => {
	it('hides the "One size" label', () => {
		expect(itemDisplayName('Tote bag', 'One size')).toBe('Tote bag');
	});
	it('appends a real size', () => {
		expect(itemDisplayName('Event T-shirt', 'M')).toBe('Event T-shirt – M');
	});
});
