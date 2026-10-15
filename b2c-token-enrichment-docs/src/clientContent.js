// Client-facing documentation for integrating with the Common Token Enrichment API
// Excludes internal Azure Portal steps, private tenant secrets, and internal-only troubleshooting

export const clientDocs = [
  {
    id: 'client-intro',
    group: 'Overview',
    title: 'Introduction',
    subtitle: 'Beginner-friendly overview for connecting client applications to the Token Enrichment Common API',
    blocks: [
      ['lead', 'Welcome to the Token Enrichment API client integration guide. This documentation is written specifically for client and external developers who need to receive or contribute enrichment claims without requiring administrative access to the Azure AD B2C tenant.'],
      ['callout', 'info', 'What is Token Enrichment?', 'During user sign-in or sign-up, the authentication system calls a secure Common API endpoint. This API returns supplementary, verified user attributes (such as customer ID or subscription tier) that are embedded directly into the issued security token.'],
      ['h2', 'Who this guide is for'],
      ['p', 'This guide is designed for client-side engineers, frontend developers, and backend API authors who need to:'],
      ['ul', [
        'Understand what enrichment claims are included in tokens delivered to your application.',
        'Implement or consume the REST API contract used during the enrichment cycle.',
        'Validate incoming JSON Web Tokens (JWTs) and securely extract enrichment fields.',
        'Perform local and staging verification without internal Azure Portal permissions.'
      ]],
      ['h2', 'Core Architecture Overview'],
      ['flow', [
        ['1', 'Client Application', 'Initiates the standard user authentication flow.'],
        ['2', 'Identity Provider', 'Verifies user identity and calls the Common API behind the scenes.'],
        ['3', 'Common Enrichment API', 'Looks up authorized attributes from approved data sources and returns them.'],
        ['4', 'Token Delivery', 'Issues signed token containing the enriched claims to your client application.'],
        ['5', 'Client Authorization', 'Your application validates the token and enforces access permissions.']
      ]],
      ['callout', 'warn', 'Security Boundary', 'Client applications never call the enrichment API directly with end-user credentials. The authentication service mediates the call, ensuring all claims in the token are cryptographically signed and tamper-proof.']
    ]
  },
  {
    id: 'client-prereq',
    group: 'Overview',
    title: 'Prerequisites',
    subtitle: 'Requirements and credentials needed before beginning integration',
    blocks: [
      ['lead', 'Ensure you have the following prerequisites in place before testing or deploying your client integration.'],
      ['h2', 'Developer Checklist'],
      ['check', [
        'Registered Client Application ID (client_id) provided by your identity administrator.',
        'Valid Redirect URI configured for your local or hosted application.',
        'Target API Base URL (HTTPS) for the Common Enrichment API.',
        'Approved API Authentication Credential (HTTP Basic or Bearer token header).',
        'OpenID Connect discovery endpoint or public signing keys to validate issued tokens.',
        'Authorized test accounts with seeded test records in the backend data source.'
      ]],
      ['h2', 'Required Configuration Parameters'],
      ['table',
        ['Parameter', 'Description', 'Example Placeholder'],
        [
          ['CLIENT_ID', 'Your public application registration identifier', '{your-client-app-id}'],
          ['COMMON_API_ENDPOINT', 'Base URL of the token enrichment REST API', 'https://api.example.com/v1/token-enrichment'],
          ['AUTH_METHOD', 'Authentication type configured for the API connector', 'HTTP Basic or Bearer Token'],
          ['TOKEN_ISSUER', 'Expected issuer claim (iss) in issued tokens', 'https://{tenant-name}.b2clogin.com/...'],
          ['ENRICHMENT_CLAIMS', 'List of claims enriched into the token', 'customerId, subscriptionTier']
        ]
      ],
      ['callout', 'info', 'No Azure Portal Access Required', 'As a client developer, you do not need Azure tenant administrator roles. All tenant-side connector configurations are maintained by the identity team.']
    ]
  },
  {
    id: 'client-overview',
    group: 'Overview',
    title: 'Integration Overview',
    subtitle: 'How client applications interact with the token enrichment lifecycle',
    blocks: [
      ['lead', 'Token enrichment runs synchronously during authentication before the final token is signed and returned to your app.'],
      ['h2', 'Integration Lifecycle'],
      ['ol', [
        'User initiates sign-in on your web, mobile, or single-page app.',
        'User successfully completes credentials verification.',
        'The identity gateway sends an HTTP POST request to the Common Enrichment API with the user identifier.',
        'The Common API retrieves data from trusted backends and returns an HTTP 200 continuation response.',
        'The gateway issues an ID token / Access token containing the enriched claims to your app.',
        'Your client or backend API validates the token signature, reads the enrichment claims, and grants appropriate user features.'
      ]],
      ['h2', 'Key System Roles'],
      ['table',
        ['System', 'Role & Responsibility'],
        [
          ['Client Application', 'Receives the signed token, verifies claims, and enforces application UI/permissions.'],
          ['Common API', 'Exposes the REST endpoint, validates caller credentials, and returns enrichment data.'],
          ['Identity Gateway', 'Orchestrates authentication, invokes the Common API, and signs the resulting token.'],
          ['Downstream Services', 'Resource APIs that validate bearer tokens on subsequent client requests.']
        ]
      ]
    ]
  },
  {
    id: 'client-endpoint-auth',
    group: 'API Specification',
    title: 'API Endpoint and Authentication',
    subtitle: 'Endpoint specifications and required authentication methods',
    blocks: [
      ['lead', 'The Common API must be hosted on an HTTPS endpoint accessible with strong transport security and authentication.'],
      ['h2', 'Endpoint Specification'],
      ['code', 'HTTP Endpoint', 'POST /v1/token-enrichment\nHost: api.example.com\nContent-Type: application/json; charset=utf-8\nAccept: application/json'],
      ['h2', 'Supported Authentication Methods'],
      ['p', 'Calls between the identity gateway and the Common API use one of the two standard authentication mechanisms:'],
      ['table',
        ['Method', 'Header Format', 'Details'],
        [
          ['HTTP Basic Authentication', 'Authorization: Basic {base64(username:password)}', 'Standard HTTP basic credentials provisioned specifically for the gateway.'],
          ['Client Certificate / Bearer', 'Authorization: Bearer {token}', 'OAuth2 client credentials bearer token or mutual TLS client certificate.']
        ]
      ],
      ['callout', 'warn', 'Mandatory HTTPS', 'Plain HTTP endpoints are strictly prohibited. The identity gateway will refuse to invoke any endpoint not secured with valid TLS/SSL certificates.']
    ]
  },
  {
    id: 'client-request-format',
    group: 'API Specification',
    title: 'API Request Format',
    subtitle: 'Schema and sample payload sent to the Common Enrichment API',
    blocks: [
      ['lead', 'When the identity provider reaches the enrichment stage, it issues an HTTP POST request containing user attributes available at that moment.'],
      ['h2', 'Request JSON Schema'],
      ['table',
        ['Field', 'Type', 'Description', 'Required'],
        [
          ['objectId', 'String (UUID)', 'Unique immutable identifier of the user in the identity directory', 'Yes'],
          ['email', 'String', 'Verified email address of the user (if captured)', 'Conditional'],
          ['displayName', 'String', 'User full or display name', 'No'],
          ['client_id', 'String (UUID)', 'Application registration ID requesting authentication', 'Yes'],
          ['step', 'String', 'The lifecycle stage calling the API (e.g. PreTokenIssuance)', 'Yes'],
          ['ui_locales', 'String', 'User language / locale tag (e.g. en-US)', 'No']
        ]
      ],
      ['h2', 'Illustrative Request Payload'],
      ['code', 'JSON', JSON.stringify({
        objectId: 'aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb',
        email: 'developer@example.com',
        displayName: 'Jane Doe',
        client_id: '00001111-aaaa-2222-bbbb-3333cccc4444',
        step: 'PreTokenIssuance',
        ui_locales: 'en-US'
      }, null, 2)],
      ['callout', 'info', 'Handling Missing Fields', 'Your API implementation must handle nullable or missing optional fields gracefully. Never rely solely on email as an immutable primary key—always key lookups by objectId.']
    ]
  },
  {
    id: 'client-response-format',
    group: 'API Specification',
    title: 'API Response Format',
    subtitle: 'Continuation, validation, and error contracts expected by the gateway',
    blocks: [
      ['lead', 'The API connector expects a JSON response complying with the Microsoft API connector specification.'],
      ['h2', 'Successful Continuation Response (HTTP 200)'],
      ['p', 'To enrich the token and allow the user flow to proceed uninterrupted, return HTTP 200 with action set to Continue:'],
      ['code', 'HTTP/1.1 200 OK\nContent-Type: application/json', JSON.stringify({
        version: '1.0.0',
        action: 'Continue',
        customerId: 'CUST-10025',
        subscriptionTier: 'Premium'
      }, null, 2)],
      ['h2', 'Response Status Codes'],
      ['table',
        ['Status Code', 'Action', 'Gateway Behavior'],
        [
          ['200 OK', 'Continue', 'Applies enrichment values and issues the token.'],
          ['200 OK', 'ShowBlockPage', 'Halts authentication and displays a user-facing error message.'],
          ['400 Bad Request', 'Error', 'Fails authentication due to an invalid request format.'],
          ['401 / 403', 'Unauthorized', 'Connector fails due to invalid gateway credentials.'],
          ['5xx / Timeout', 'ServerError', 'Gateway executes configured fallback or aborts the flow.']
        ]
      ],
      ['h2', 'Blocking User Example (ShowBlockPage)'],
      ['p', 'If an account is suspended or ineligible for enrichment, you can return a block page response:'],
      ['code', 'JSON', JSON.stringify({
        version: '1.0.0',
        action: 'ShowBlockPage',
        userMessage: 'Your organization account is suspended. Please contact enterprise support.'
      }, null, 2)]
    ]
  },
  {
    id: 'client-claims-ref',
    group: 'API Specification',
    title: 'Enrichment Claims Reference',
    subtitle: 'List of supported custom and standard enrichment claims',
    blocks: [
      ['lead', 'Below is the reference catalog of enrichment attributes currently supported for token injection.'],
      ['h2', 'Supported Claims Catalog'],
      ['table',
        ['Claim Name', 'JWT Claim Key', 'Data Type', 'Description'],
        [
          ['Customer ID', 'customerId', 'String', 'Enterprise account or customer identifier in ERP/CRM (e.g. CUST-10025).'],
          ['Subscription Tier', 'subscriptionTier', 'String', 'Active license plan: Free, Professional, or Enterprise.'],
          ['Account Status', 'accountStatus', 'String', 'Account lifecycle status: Active, Pending, or Suspended.'],
          ['Tenant Organization', 'orgCode', 'String', 'Multi-tenant organization code assigned to the user.']
        ]
      ],
      ['h2', 'Sample Decoded JWT Token Body'],
      ['code', 'Decoded JWT Payload', JSON.stringify({
        iss: 'https://{tenant-name}.b2clogin.com/{tenant-id}/v2.0/',
        sub: 'aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb',
        aud: '00001111-aaaa-2222-bbbb-3333cccc4444',
        exp: 1776250000,
        nbf: 1776246400,
        name: 'Jane Doe',
        emails: ['developer@example.com'],
        customerId: 'CUST-10025',
        subscriptionTier: 'Premium'
      }, null, 2)],
      ['callout', 'info', 'Custom Extension Attribute Names', 'In some tenant setups, custom claims may be prefixed with extension_{claimName}. Always check your application registration manifest if claims appear with extension prefixes.']
    ]
  },
  {
    id: 'client-examples',
    group: 'Implementation',
    title: 'Client Integration Examples',
    subtitle: 'Code snippets demonstrating token decoding and enrichment claim consumption',
    blocks: [
      ['lead', 'Examples showing how to parse, validate, and extract enrichment claims in Node.js / JavaScript and Python client backends.'],
      ['h2', 'Node.js (JWT Claims Extraction)'],
      ['code', 'JavaScript', `import jwt from 'jsonwebtoken';
import jwksClient from 'jwks-rsa';

const client = jwksClient({
  jwksUri: 'https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/discovery/v2.0/keys'
});

function getKey(header, callback) {
  client.getSigningKey(header.kid, (err, key) => {
    callback(null, key ? key.getPublicKey() : null);
  });
}

export function verifyAndGetEnrichment(tokenString) {
  return new Promise((resolve, reject) => {
    jwt.verify(tokenString, getKey, {
      audience: '{your-client-id}',
      issuer: 'https://{tenant}.b2clogin.com/{tenant-id}/v2.0/'
    }, (err, decoded) => {
      if (err) return reject(err);
      
      // Extract enriched claims
      const { customerId, subscriptionTier } = decoded;
      resolve({ customerId, subscriptionTier, user: decoded });
    });
  });
}`],
      ['h2', 'Python (FastAPI / PyJWT)'],
      ['code', 'Python', `import jwt
from jwt import PyJWKClient

JWKS_URL = "https://{tenant}.b2clogin.com/{tenant}.onmicrosoft.com/{policy}/discovery/v2.0/keys"
jwks_client = PyJWKClient(JWKS_URL)

def validate_token(token: str):
    signing_key = jwks_client.get_signing_key_from_jwt(token)
    data = jwt.decode(
        token,
        signing_key.key,
        algorithms=["RS256"],
        audience="{your-client-id}",
        issuer="https://{tenant}.b2clogin.com/{tenant-id}/v2.0/"
    )
    
    # Read custom enrichment claims
    customer_id = data.get("customerId")
    tier = data.get("subscriptionTier", "Free")
    return {"customer_id": customer_id, "tier": tier}`]
    ]
  },
  {
    id: 'client-testing',
    group: 'Implementation',
    title: 'Testing and Validation',
    subtitle: 'Step-by-step procedures to verify your integration locally and in staging',
    blocks: [
      ['lead', 'Follow this testing workflow to ensure your application handles enrichment claims correctly in all scenarios.'],
      ['h2', 'Testing Steps'],
      ['flow', [
        ['1', 'Mock API Verification', 'Use cURL or Postman to send test payloads directly to the Common API.'],
        ['2', 'Sign-in Flow Test', 'Perform sign-in through your client app using an authorized test account.'],
        ['3', 'Token Inspection', 'Capture the returned JWT and verify that customerId and subscriptionTier are present.'],
        ['4', 'Negative Testing', 'Test with an unknown user identifier to verify default/fallback handling.'],
        ['5', 'Expiry & Refresh Test', 'Verify behavior when the token expires and a fresh token is requested.']
      ]],
      ['h2', 'cURL Verification Command'],
      ['code', 'Bash', `curl -X POST "https://api.example.com/v1/token-enrichment" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Basic {BASE64_CREDENTIALS}" \\
  -d '{
    "objectId": "aaaaaaaa-0000-1111-2222-bbbbbbbbbbbb",
    "email": "developer@example.com",
    "client_id": "{client-id}",
    "step": "PreTokenIssuance"
  }'`],
      ['callout', 'info', 'Token Inspection Tools', 'You can inspect test tokens locally with standard tools. Never paste production JWTs containing sensitive customer identifiers into untrusted public websites.']
    ]
  },
  {
    id: 'client-errors',
    group: 'Reliability & Security',
    title: 'Error Handling and Troubleshooting',
    subtitle: 'Common client-facing issues, symptoms, and troubleshooting steps',
    blocks: [
      ['lead', 'Quick reference for debugging integration failures and claim discrepancies.'],
      ['h2', 'Troubleshooting Matrix'],
      ['table',
        ['Symptom', 'Probable Cause', 'Client Resolution'],
        [
          ['Enrichment claim missing in token', 'User not found in data source or claim not mapped', 'Confirm test user objectId exists in the backend data source.'],
          ['HTTP 401 Unauthorized during sign-in', 'Gateway connector credential mismatch', 'Contact identity team to check gateway API connector credentials.'],
          ['Sign-in blocked with custom message', 'API returned ShowBlockPage', 'Review API logs to determine why user was blocked.'],
          ['Sign-in timeout / delayed response', 'Common API latency > 2000ms', 'Optimize downstream database queries; gateway timeout is strict.'],
          ['Token signature validation failed', 'Outdated JWKS keys or wrong issuer URL', 'Ensure application refreshes JWKS signing keys from discovery URL.']
        ]
      ],
      ['h2', 'Error Diagnostic Checklist'],
      ['ol', [
        'Confirm the client_id matches your registered application.',
        'Inspect the raw JWT payload to confirm claim key spelling (case-sensitive).',
        'Verify that your application handles missing optional claims with sensible defaults.',
        'Check server-side application logs for token validation exception details.'
      ]]
    ]
  },
  {
    id: 'client-security',
    group: 'Reliability & Security',
    title: 'Security Guidelines',
    subtitle: 'Security best practices for consuming and protecting enriched tokens',
    blocks: [
      ['lead', 'Follow these essential security recommendations when storing and processing tokens containing enriched claims.'],
      ['h2', 'Security Best Practices'],
      ['check', [
        'Always validate the token signature, expiration (exp), and audience (aud) before trusting claims.',
        'Never store tokens in unprotected client storage (such as unencrypted localStorage in vulnerable domains).',
        'Use HttpOnly, Secure, SameSite cookies for web applications where possible.',
        'Enforce server-side authorization checks; do not rely solely on client-side claim assertions.',
        'Do not transmit or expose internal objectId values or customer identifiers in public URLs.',
        'Rotate API connector credentials periodically in coordination with the identity team.'
      ]],
      ['callout', 'warn', 'Claim Freshness Notice', 'Token claims represent user state at the moment of authentication. If a user tier changes mid-session, your backend should verify against live data for sensitive operations.']
    ]
  },
  {
    id: 'client-faq',
    group: 'Reliability & Security',
    title: 'FAQ and Official References',
    subtitle: 'Frequently asked questions and official Microsoft documentation',
    blocks: [
      ['h2', 'Frequently Asked Questions'],
      ['p', '**Q: Does the Common API run on every token refresh?**\nA: Built-in user flows typically invoke API connectors during interactive sign-in and sign-up. Consult the identity team for silent refresh caching behavior.'],
      ['p', '**Q: Can the API add arbitrary JSON objects to the token?**\nA: No. The token issuer only emits claims that map to pre-configured attribute schemas. Extra unknown fields in the JSON response are ignored.'],
      ['p', '**Q: What happens if the Common API goes down?**\nA: The identity gateway can be configured to either block authentication or continue without enrichment. For critical claims, blocking is the default.'],
      ['h2', 'Official Documentation & Standards'],
      ['links', [
        ['Microsoft Learn: Token Enrichment with API Connectors', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-api-connector-token-enrichment'],
        ['RFC 7519: JSON Web Token (JWT) Standard', 'https://datatracker.ietf.org/doc/html/rfc7519'],
        ['OpenID Connect Core 1.0 Specification', 'https://openid.net/specs/openid-connect-core-1_0.html']
      ]]
    ]
  }
];
