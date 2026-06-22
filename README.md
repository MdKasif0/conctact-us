# Contact Us Page

Production-ready Next.js contact page with a Netlify Function that sends emails through Resend.

## Environment variables

Create a local `.env.local` file for development, and set the same values in Netlify Site Settings.

```bash
RESEND_API_KEY=your_resend_api_key
TO_EMAIL=your_destination_email@example.com
FROM_EMAIL=your_verified_sender@example.com
```

`FROM_EMAIL` must be a sender verified in Resend.

## Deploy to Netlify

1. Push this project to a Git provider and import it into Netlify.
2. In Netlify, set `RESEND_API_KEY`, `TO_EMAIL`, and `FROM_EMAIL` under Site configuration > Environment variables.
3. Install dependencies with `npm install`.
4. Deploy with the default build command `npm run build`.

## Local development

1. Install dependencies with `npm install`.
2. Create `.env.local` using the variables above.
3. Run `npm run dev` for UI-only development, or `npm run dev:netlify` if you want the Netlify Function available locally at `/.netlify/functions/contact`.
