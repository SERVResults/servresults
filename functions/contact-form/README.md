# Contact form email function

A standalone Lambda function that receives the "Send a message" form submission
and sends it via [Resend](https://resend.com). Deployed independently of the
site's static hosting — the Astro build stays 100% static; this is the one
small serverless piece.

## Prerequisites

1. **Resend account** — sign up at resend.com, add and verify the
   `servresults.com` sending domain (they'll give you DNS records to add
   wherever the domain's DNS is currently managed), and create an API key.
2. **AWS CLI** installed and configured with credentials for the
   `devops-user` account (`aws configure`).

## One-time setup: IAM role

The function only needs permission to write its own logs.

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
```

Note the `Role` ARN returned by the first command — you'll need it below.
IAM roles can take ~10 seconds to propagate before the next step will succeed.

## Deploy the function

```bash
cd functions/contact-form
zip function.zip index.mjs

aws lambda create-function \
  --function-name servresults-contact-form \
  --runtime nodejs20.x \
  --handler index.handler \
  --role <ROLE_ARN_FROM_ABOVE> \
  --zip-file fileb://function.zip \
  --timeout 10 \
  --environment "Variables={RESEND_API_KEY=<your-resend-api-key>,FROM_EMAIL='SERV Results Website <noreply@servresults.com>',TO_EMAILS=info@servresults.com,ALLOWED_ORIGIN=https://servresults.com}"
```

For local dev/testing before the real domain is live, set `ALLOWED_ORIGIN` to
`http://localhost:4321` temporarily (or redeploy with `update-function-configuration`
when you need to switch it).

## Expose it publicly via a Function URL

```bash
aws lambda create-function-url-config \
  --function-name servresults-contact-form \
  --auth-type NONE \
  --cors '{"AllowOrigins":["https://servresults.com"],"AllowMethods":["POST"],"AllowHeaders":["content-type"]}'

aws lambda add-permission \
  --function-name servresults-contact-form \
  --statement-id AllowPublicInvoke \
  --action lambda:InvokeFunctionUrl \
  --principal '*' \
  --function-url-auth-type NONE
```

The `create-function-url-config` command prints a `FunctionUrl` — that's the
value to put in the site's `PUBLIC_CONTACT_FUNCTION_URL` environment variable
(see `.env.example` at the repo root).

## Updating the function later

```bash
cd functions/contact-form
zip function.zip index.mjs
aws lambda update-function-code --function-name servresults-contact-form --zip-file fileb://function.zip
```

## Sending to multiple internal recipients

Set `TO_EMAILS` as a comma-separated list, e.g.
`TO_EMAILS=info@servresults.com,sales@servresults.com`.
