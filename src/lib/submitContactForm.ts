export interface ContactFormPayload {
	name: string;
	email: string;
	dealershipName: string;
	message: string;
	honeypot?: string;
}

export interface ContactFormResult {
	ok: boolean;
	error?: string;
}

const CONTACT_FUNCTION_URL = import.meta.env.PUBLIC_CONTACT_FUNCTION_URL as string | undefined;

/**
 * Single entry point for sending the contact/demo form. Posts to the
 * standalone Lambda function in functions/contact-form, which calls Amazon SES
 * server-side via the function's own IAM role (no secret to leak from here).
 */
export async function submitContactForm(payload: ContactFormPayload): Promise<ContactFormResult> {
	if (!CONTACT_FUNCTION_URL) {
		console.warn('[submitContactForm] PUBLIC_CONTACT_FUNCTION_URL is not configured.');
		return { ok: false, error: 'Form submission is not connected to an email service yet.' };
	}

	try {
		const res = await fetch(CONTACT_FUNCTION_URL, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(payload),
		});

		const data = await res.json().catch(() => ({}) as Partial<ContactFormResult>);

		if (!res.ok || !data.ok) {
			return { ok: false, error: data.error ?? 'Something went wrong. Please try again.' };
		}

		return { ok: true };
	} catch {
		return { ok: false, error: 'Network error — please check your connection and try again.' };
	}
}
