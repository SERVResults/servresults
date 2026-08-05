export interface ContactFormPayload {
	name: string;
	email: string;
	dealershipName: string;
	message: string;
}

export interface ContactFormResult {
	ok: boolean;
	error?: string;
}

/**
 * Single entry point for sending the contact/demo form. Swap the
 * implementation here when the email service is decided (Resend, Formspree,
 * or EmailJS) — nothing else in the form needs to change.
 */
export async function submitContactForm(payload: ContactFormPayload): Promise<ContactFormResult> {
	// TODO: replace with the chosen provider (Resend, Formspree, or EmailJS).
	console.warn('[submitContactForm] No email provider configured yet.', payload);
	return { ok: false, error: 'Form submission is not connected to an email service yet.' };
}
