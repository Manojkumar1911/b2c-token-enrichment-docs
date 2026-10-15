# Azure AD B2C Token Enrichment Documentation

Beginner-friendly React + Vite documentation site for the Azure AD B2C built-in user-flow API connector path, especially “Before including application claims in token (preview)”.

## Run locally
1. Install Node.js 18+ (Node 20 LTS recommended).
2. Extract the ZIP and open this folder in VS Code.
3. Run `npm install` then `npm run dev`.
4. Open the local URL printed by Vite.

## Build
Run `npm run build` and optionally `npm run preview`.

## GitHub Pages
Push to `main`; the included GitHub Actions workflow builds and deploys the `dist` directory. Enable GitHub Pages using GitHub Actions in repository settings.

## Important
- Examples are illustrative, not production credentials or verified values for your tenant.
- Verify the current Microsoft API connector request/response schema, supported claims, authentication options, preview status, and tenant eligibility before production use.
- The Common API does not directly edit a signed token; it returns data to Azure AD B2C, which controls the resulting token.
- Custom policies use a different configuration approach and are outside this built-in user-flow walkthrough.
- Review/redact the supplied portal screenshots before publishing the site publicly; browser headers can contain account or tenant information.
