// AWS Lambda handler (Node.js 20.x runtime, invoked via a Lambda Function URL).
// Receives the contact form payload, validates it, and sends it through Resend.
// No dependencies — uses the runtime's built-in fetch, so this deploys as a plain
// zip of this one file with no `npm install` step.

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://servresults.com';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'SERV Results Website <noreply@servresults.com>';
const TO_EMAILS = (process.env.TO_EMAILS || 'info@servresults.com').split(',').map((s) => s.trim());

const corsHeaders = {
	'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

function json(statusCode, body) {
	return {
		statusCode,
		headers: { 'Content-Type': 'application/json', ...corsHeaders },
		body: JSON.stringify(body),
	};
}

function isValidEmail(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export const handler = async (event) => {
	if (event.requestContext?.http?.method === 'OPTIONS') {
		return { statusCode: 204, headers: corsHeaders, body: '' };
	}

	let payload;
	try {
		payload = JSON.parse(event.body || '{}');
	} catch {
		return json(400, { ok: false, error: 'Invalid request body.' });
	}

	const name = String(payload.name || '').trim();
	const email = String(payload.email || '').trim();
	const dealershipName = String(payload.dealershipName || '').trim();
	const message = String(payload.message || '').trim();
	const honeypot = String(payload.honeypot || '').trim();

	// Bots fill hidden fields; humans never see this one. Pretend success, send nothing.
	if (honeypot) {
		return json(200, { ok: true });
	}

	if (!name || !email || !dealershipName || !message) {
		return json(400, { ok: false, error: 'Please fill in all fields.' });
	}

	if (!isValidEmail(email)) {
		return json(400, { ok: false, error: 'Please enter a valid email address.' });
	}

	if (!RESEND_API_KEY) {
		console.error('RESEND_API_KEY is not configured.');
		return json(500, { ok: false, error: 'Something went wrong. Please try again later.' });
	}

	try {
		const res = await fetch('https://api.resend.com/emails', {
			method: 'POST',
			headers: {
				Authorization: `Bearer ${RESEND_API_KEY}`,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				from: FROM_EMAIL,
				to: TO_EMAILS,
				reply_to: email,
				subject: `New demo request from ${dealershipName}`,
				text: `Name: ${name}\nEmail: ${email}\nDealership: ${dealershipName}\n\nMessage:\n${message}`,
			}),
		});

		if (!res.ok) {
			console.error('Resend error', res.status, await res.text());
			return json(502, { ok: false, error: 'Something went wrong sending your message. Please try again.' });
		}

		return json(200, { ok: true });
	} catch (err) {
		console.error('Unexpected error calling Resend', err);
		return json(500, { ok: false, error: 'Something went wrong. Please try again.' });
	}
};
