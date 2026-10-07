import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => ({
	sendMail: vi.fn(),
	getOrderById: vi.fn(),
	getSettings: vi.fn(),
	logOrderEmail: vi.fn()
}));

vi.mock('$env/static/private', () => ({ GOOGLE_EMAIL: 'shop@test.no' }));
vi.mock('$lib/emailClient.server', () => ({ default: { sendMail: mocks.sendMail } }));
vi.mock('./db.server', () => ({
	getOrderById: mocks.getOrderById,
	getSettings: mocks.getSettings,
	logOrderEmail: mocks.logOrderEmail
}));

import { sendOrderEmail } from './emails.server';

const order = {
	id: 'o1',
	order_number: 'NO-1001',
	access_token: 'a'.repeat(32),
	customer_name: 'Kari',
	email: 'kari@example.com',
	delivery_method: 'pickup',
	address_line: null,
	postal_code: null,
	city: null,
	country: null,
	shipping_price_nok: 0,
	total_nok: 300,
	order_items: [{ product_name: 'Tee', variant_label: 'M', unit_price_nok: 300, quantity: 1 }]
};

beforeEach(() => {
	// The server test project does not set clearMocks, so reset call history here.
	vi.clearAllMocks();
	vi.spyOn(console, 'error').mockImplementation(() => {});
	mocks.getOrderById.mockResolvedValue(order);
	mocks.getSettings.mockResolvedValue({ vipps_number: '123456', shipping_price_nok: null });
	mocks.logOrderEmail.mockResolvedValue(undefined);
	mocks.sendMail.mockResolvedValue({});
});

describe('sendOrderEmail', () => {
	it('sends to the customer with bcc to the event and logs success', async () => {
		const result = await sendOrderEmail('o1', 'confirmation', 'https://norwegianopen.no');
		expect(result).toEqual({ success: true, error: null, recipient: 'kari@example.com' });
		const mail = mocks.sendMail.mock.calls[0][0];
		expect(mail.to).toBe('kari@example.com');
		expect(mail.bcc).toBe('norwegianopenwcs@gmail.com');
		expect(mail.from).toContain('shop@test.no');
		expect(mail.text).toContain(`https://norwegianopen.no/shop/order/${'a'.repeat(32)}`);
		expect(mocks.logOrderEmail).toHaveBeenCalledWith({
			order_id: 'o1',
			email_type: 'confirmation',
			recipient: 'kari@example.com',
			success: true,
			error: null
		});
	});

	it('logs and returns the error when sending fails, without throwing', async () => {
		mocks.sendMail.mockRejectedValue(new Error('SMTP down'));
		const result = await sendOrderEmail('o1', 'paid', 'https://x.no');
		expect(result).toEqual({ success: false, error: 'SMTP down', recipient: 'kari@example.com' });
		expect(mocks.logOrderEmail).toHaveBeenCalledWith(
			expect.objectContaining({ success: false, error: 'SMTP down', email_type: 'paid' })
		);
	});

	it('returns an error without sending when the order does not exist', async () => {
		mocks.getOrderById.mockResolvedValue(null);
		const result = await sendOrderEmail('missing', 'paid', 'https://x.no');
		expect(result.success).toBe(false);
		expect(mocks.sendMail).not.toHaveBeenCalled();
	});

	it('logs a failure when loading settings fails', async () => {
		mocks.getSettings.mockRejectedValue(new Error('db down'));
		const result = await sendOrderEmail('o1', 'paid', 'https://x.no');
		expect(result).toEqual({ success: false, error: 'db down', recipient: null });
		expect(mocks.sendMail).not.toHaveBeenCalled();
		expect(mocks.logOrderEmail).toHaveBeenCalledWith(
			expect.objectContaining({ order_id: 'o1', email_type: 'paid', recipient: '', success: false, error: 'db down' })
		);
	});

	it('still succeeds if writing the log fails', async () => {
		mocks.logOrderEmail.mockRejectedValue(new Error('db down'));
		const result = await sendOrderEmail('o1', 'sent', 'https://x.no');
		expect(result.success).toBe(true);
	});
});
