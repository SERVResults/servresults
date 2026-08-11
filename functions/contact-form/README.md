# Contact form email function

A standalone Lambda function that receives the "Send a message" form submission
and sends it via **Amazon SES**. Deployed independently of the site's static
hosting — the Astro build stays 100% static; this is the one small serverless
piece. Authenticates to SES via the function's own IAM role — no API key or
secret involved.

## Prerequisites

1. **AWS CLI** installed and configured with credentials for the
   `devops-user` account (`aws configure`).
2. **Verify a sending identity in SES** — either the whole domain (better
   deliverability via DKIM, one-time DNS setup) or just the `FROM_EMAIL`
   address. To verify the domain:
   ```bash
   aws sesv2 create-email-identity --email-identity servresults.com
   ```
   This prints DKIM CNAME records — add them wherever `servresults.com`'s DNS
   is currently managed. Verification can take a few minutes to a few hours.
3. **Verify each recipient address** (SES starts new accounts in "sandbox
   mode," which only sends to verified addresses). Since `TO_EMAILS` is a
   small fixed internal list, just verify those specific addresses instead of
   requesting production access:
   ```bash
   aws sesv2 create-email-identity --email-identity info@servresults.com
   ```
   This sends a confirmation link to that inbox — click it to verify.

   **If you later add an auto-reply to the visitor's own email** (an
   arbitrary, unverifiable recipient), you'll need to request production
   access instead: SES console → **Account dashboard** → **Request production
   access**. Not needed for the current internal-notification-only scope.

## One-time setup: IAM role

The function needs permission to write its own logs, plus permission to send
through SES.

```bash
aws iam create-role \
  --role-name contact-form-lambda-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Principal": { "Service": "lambda.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }]
  }'

aws iam attach-role-policy \
  --role-name contact-form-lambda-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole

aws iam put-role-policy \
  --role-name contact-form-lambda-role \
  --policy-name ses-send \
  --policy-document '{
    "Version": "2012-10-17",
    "Statement": [{
      "Effect": "Allow",
      "Action": ["ses:SendEmail", "ses:SendRawEmail"],
      "Resource": "*"
    }]
  }'
```

Note the `Role` ARN returned by the first command — you'll need it below.
IAM roles can take ~10 seconds to propagate before the next step will succeed.

## Deploy the function

This function has a real dependency (the AWS SDK's SES client), so
`node_modules` needs to be bundled into the zip — Lambda's runtime doesn't
pre-include it.

```bash
cd functions/contact-form
npm install --omit=dev
zip -r function.zip index.mjs node_modules package.json

aws lambda create-function \
  --function-name servresults-contact-form \
  --runtime nodejs20.x \
  --handler index.handler \
  --role <ROLE_ARN_FROM_ABOVE> \
  --zip-file fileb://function.zip \
  --timeout 10 \
  --environment "Variables={FROM_EMAIL='SERV Results Website <noreply@servresults.com>',TO_EMAILS=info@servresults.com,ALLOWED_ORIGIN=https://www.servresults.com}"
```

For local dev/testing, you can add `http://localhost:4321` to the CORS config
below alongside the real domain.

## Expose it publicly via a Function URL

```bash
aws lambda create-function-url-config \
  --function-name servresults-contact-form \
  --auth-type NONE \
  --cors '{"AllowOrigins":["https://www.servresults.com","http://localhost:4321"],"AllowMethods":["POST"],"AllowHeaders":["content-type"]}'

aws lambda add-permission \
  --function-name servresults-contact-form \
  --statement-id AllowPublicInvoke \
  --action lambda:InvokeFunctionUrl \
  --principal '*' \
  --function-url-auth-type NONE
```

The `create-function-url-config` command prints a `FunctionUrl` — that's the
value to put in the site's `PUBLIC_CONTACT_FUNCTION_URL` environment variable
(both in Amplify's environment variables and your local `.env` — see
`.env.example` at the repo root).

## Updating the function later

```bash
cd functions/contact-form
npm install --omit=dev
zip -r function.zip index.mjs node_modules package.json
aws lambda update-function-code --function-name servresults-contact-form --zip-file fileb://function.zip
```

## Sending to multiple internal recipients

Set `TO_EMAILS` as a comma-separated list, e.g.
`TO_EMAILS=info@servresults.com,sales@servresults.com` — and remember each one
needs to be verified in SES while still in sandbox mode (see Prerequisites).
