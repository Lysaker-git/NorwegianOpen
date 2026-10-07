import { SHOP_NOTIFY_EMAIL } from './config';
import type { EmailType, OrderStatus } from './types';

export const ORDER_STATUSES: OrderStatus[] = ['awaiting_payment', 'paid', 'sent', 'delivered', 'cancelled'];

export const STATUS_LABELS: Record<OrderStatus, string> = {
	awaiting_payment: 'Awaiting payment',
	paid: 'Paid',
	sent: 'Sent',
	delivered: 'Delivered',
	cancelled: 'Cancelled'
};

export const EMAIL_TYPE_LABELS: Record<EmailType, string> = {
	confirmation: 'Order confirmation',
	payment_reminder: 'Payment reminder',
	paid: 'Payment received',
	sent: 'Order sent',
	delivered: 'Order delivered',
	cancelled: 'Order cancelled'
};

export const CUSTOMER_STATUS_TEXT: Record<OrderStatus, string> = {
	awaiting_payment: 'Awaiting payment. Your items are reserved for you.',
	paid: 'Payment received, thank you.',
	sent: 'Your order has been sent.',
	delivered: 'Your order has been delivered / handed over.',
	cancelled: `This order has been cancelled. If you believe this is a mistake, contact ${SHOP_NOTIFY_EMAIL}.`
};

export interface AdminAction {
	id: string;
	kind: 'status' | 'cancel' | 'resend';
	label: string;
	emailType: EmailType;
	to?: OrderStatus;
	danger?: boolean;
}

const cancelAction: AdminAction = {
	id: 'cancel',
	kind: 'cancel',
	label: 'Cancel order',
	emailType: 'cancelled',
	danger: true
};

function markAs(to: 'paid' | 'sent' | 'delivered'): AdminAction {
	return { id: `mark_${to}`, kind: 'status', label: `Mark ${STATUS_LABELS[to].toLowerCase()}`, emailType: to, to };
}

function resend(emailType: EmailType, label: string): AdminAction {
	return { id: 'resend', kind: 'resend', label, emailType };
}

export function adminActions(status: OrderStatus): AdminAction[] {
	switch (status) {
		case 'awaiting_payment':
			return [markAs('paid'), resend('payment_reminder', 'Send payment reminder'), cancelAction];
		case 'paid':
			return [markAs('sent'), markAs('delivered'), resend('paid', 'Resend "Payment received" email'), cancelAction];
		case 'sent':
			return [markAs('delivered'), resend('sent', 'Resend "Order sent" email'), cancelAction];
		case 'delivered':
			return [resend('delivered', 'Resend "Order delivered" email')];
		case 'cancelled':
			return [resend('cancelled', 'Resend "Order cancelled" email')];
	}
}

export function confirmMessage(action: AdminAction, orderNumber: string, email: string): string {
	if (action.kind === 'status') {
		return `Mark ${orderNumber} as ${STATUS_LABELS[action.to as OrderStatus]} and email ${email}?`;
	}
	if (action.kind === 'cancel') {
		return `Cancel ${orderNumber}, return its items to stock, and email ${email}?`;
	}
	return `Send the "${EMAIL_TYPE_LABELS[action.emailType]}" email for ${orderNumber} to ${email}?`;
}

export function resultMessage(
	action: AdminAction,
	mail: { success: boolean; error: string | null },
	email: string
): string {
	const failure = `the email failed: ${mail.error ?? 'unknown error'}. You can resend it.`;
	if (action.kind === 'status') {
		const done = `Status changed to ${STATUS_LABELS[action.to as OrderStatus]}`;
		return mail.success ? `${done}. Email sent to ${email}.` : `${done}, but ${failure}`;
	}
	if (action.kind === 'cancel') {
		const done = 'Order cancelled and items returned to stock';
		return mail.success ? `${done}. Email sent to ${email}.` : `${done}, but ${failure}`;
	}
	return mail.success ? `Email sent to ${email}.` : `The email failed: ${mail.error ?? 'unknown error'}.`;
}
