import { describe, it, expect } from 'vitest';
import { adminActions, confirmMessage, resultMessage, CUSTOMER_STATUS_TEXT } from './orderStatus';

const ids = (status: Parameters<typeof adminActions>[0]) =>
	adminActions(status).map((a) => `${a.kind}:${a.to ?? a.emailType}`);

describe('adminActions', () => {
	it('awaiting payment: mark paid, payment reminder, cancel', () => {
		expect(ids('awaiting_payment')).toEqual(['status:paid', 'resend:payment_reminder', 'cancel:cancelled']);
	});
	it('paid: mark sent, mark delivered, resend paid, cancel', () => {
		expect(ids('paid')).toEqual(['status:sent', 'status:delivered', 'resend:paid', 'cancel:cancelled']);
	});
	it('sent: mark delivered, resend sent, cancel', () => {
		expect(ids('sent')).toEqual(['status:delivered', 'resend:sent', 'cancel:cancelled']);
	});
	it('delivered and cancelled: resend only', () => {
		expect(ids('delivered')).toEqual(['resend:delivered']);
		expect(ids('cancelled')).toEqual(['resend:cancelled']);
	});
	it('status actions send the email of the new status', () => {
		for (const a of adminActions('paid').filter((x) => x.kind === 'status')) {
			expect(a.emailType).toBe(a.to);
		}
	});
	it('labels', () => {
		expect(adminActions('awaiting_payment')[0].label).toBe('Mark paid');
		expect(adminActions('awaiting_payment')[1].label).toBe('Send payment reminder');
	});
});

describe('confirmMessage', () => {
	const [markPaid, reminder, cancel] = adminActions('awaiting_payment');
	it('describes each action with order number and email', () => {
		expect(confirmMessage(markPaid, 'NO-1001', 'kari@example.com')).toBe(
			'Mark NO-1001 as Paid and email kari@example.com?'
		);
		expect(confirmMessage(cancel, 'NO-1001', 'kari@example.com')).toBe(
			'Cancel NO-1001, return its items to stock, and email kari@example.com?'
		);
		expect(confirmMessage(reminder, 'NO-1001', 'kari@example.com')).toBe(
			'Send the "Payment reminder" email for NO-1001 to kari@example.com?'
		);
	});
});

describe('resultMessage', () => {
	const [markPaid, reminder, cancel] = adminActions('awaiting_payment');
	const ok = { success: true, error: null };
	const bad = { success: false, error: 'SMTP down' };
	it('status change', () => {
		expect(resultMessage(markPaid, ok, 'k@x.no')).toBe('Status changed to Paid. Email sent to k@x.no.');
		expect(resultMessage(markPaid, bad, 'k@x.no')).toBe(
			'Status changed to Paid, but the email failed: SMTP down. You can resend it.'
		);
	});
	it('cancel', () => {
		expect(resultMessage(cancel, ok, 'k@x.no')).toBe(
			'Order cancelled and items returned to stock. Email sent to k@x.no.'
		);
		expect(resultMessage(cancel, bad, 'k@x.no')).toBe(
			'Order cancelled and items returned to stock, but the email failed: SMTP down. You can resend it.'
		);
	});
	it('resend', () => {
		expect(resultMessage(reminder, ok, 'k@x.no')).toBe('Email sent to k@x.no.');
		expect(resultMessage(reminder, bad, 'k@x.no')).toBe('The email failed: SMTP down.');
	});
});

describe('CUSTOMER_STATUS_TEXT', () => {
	it('cancelled text includes the contact email', () => {
		expect(CUSTOMER_STATUS_TEXT.cancelled).toContain('norwegianopenwcs@gmail.com');
	});
});
