// AWS Lambda handler (Node.js 20.x runtime, invoked via a Lambda Function URL).
// Receives the contact form payload, validates it, and sends it through
// Amazon SES. Authenticates to SES via the function's own IAM role — no API
// key or secret involved. See README.md for the SES identity verification
// and IAM permission this depends on.

import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';

const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'https://devservresults.com';
const FROM_EMAIL = process.env.FROM_EMAIL || 'SERV Results Website <noreply@servresults.com>';
const TO_EMAILS = (process.env.TO_EMAILS || 'info@servresults.com').split(',').map((s) => s.trim());

const ses = new SESv2Client({});

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

	try {
		await ses.send(
			new SendEmailCommand({
				FromEmailAddress: FROM_EMAIL,
				Destination: { ToAddresses: TO_EMAILS },
				ReplyToAddresses: [email],
				Content: {
					Simple: {
						Subject: { Data: `New demo request from ${dealershipName}` },
						Body: {
							Text: {
								Data: `Name: ${name}\nEmail: ${email}\nDealership: ${dealershipName}\n\nMessage:\n${message}`,
							},
						},
					},
				},
			}),
		);

		return json(200, { ok: true });
	} catch (err) {
		console.error('SES send error', err);
		return json(502, { ok: false, error: 'Something went wrong sending your message. Please try again.' });
	}
};
