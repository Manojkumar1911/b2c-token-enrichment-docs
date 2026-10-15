export const navigation = [
  { group: 'OVERVIEW', items: [
    { id: 'introduction', title: 'Introduction' },
    { id: 'architecture', title: 'Architecture' },
    { id: 'prerequisites', title: 'Prerequisites' },
  ]},
  { group: 'USER FLOW', items: [
    { id: 'uf-register', title: 'Register the external app' },
    { id: 'uf-provider', title: 'Configure OIDC provider' },
    { id: 'uf-parameters', title: 'OIDC parameters' },
    { id: 'uf-claims', title: 'Claims mapping' },
    { id: 'uf-enable', title: 'Enable in a user flow' },
    { id: 'uf-test', title: 'Test the user flow' },
  ]},
  { group: 'CUSTOM FLOW', items: [
    { id: 'cf-environment', title: 'Prepare IEF environment' },
    { id: 'cf-register', title: 'Register the external app' },
    { id: 'cf-keys', title: 'Configure policy keys' },
    { id: 'cf-claims', title: 'Define claims' },
    { id: 'cf-profile', title: 'OIDC technical profile' },
    { id: 'cf-provider', title: 'Add claims provider' },
    { id: 'cf-journey', title: 'Integrate user journey' },
    { id: 'cf-rp', title: 'Relying-party policy' },
    { id: 'cf-upload', title: 'Upload custom policies' },
    { id: 'cf-test', title: 'Test the custom flow' },
  ]},
  { group: 'REFERENCE', items: [
    { id: 'troubleshooting', title: 'Troubleshooting' },
    { id: 'security', title: 'Security best practices' },
    { id: 'checklist', title: 'Setup checklist' },
    { id: 'references', title: 'Official references' },
  ]},
];

export const pages = {
  introduction: {
    title: 'OIDC Provider Configuration', eyebrow: 'OVERVIEW', subtitle: 'Configure external OpenID Connect federation in Azure AD B2C using built-in user flows or IEF custom policies.', updated: 'Internal engineering guide · v1.0',
    sections: [
      { id: 'purpose', title: '1. Purpose', body: 'This guide explains how to connect an external OpenID Connect (OIDC) identity provider to an existing Azure AD B2C tenant. It is designed to help an engineer complete the configuration, test the sign-in journey, and troubleshoot common integration failures.' },
      { id: 'paths', title: '2. Choose a configuration path', type: 'table', headers: ['Requirement', 'Use this path'], rows: [['Standard sign-up and sign-in experience configured in the portal', 'Built-in user flow'], ['Custom claims processing, orchestration, or policy-defined logic', 'IEF custom policy'], ['Existing solution already based on custom policies', 'Extend the existing policy set; do not replace it blindly']] },
      { id: 'scope', title: '3. Scope and important distinction', type: 'callout', tone: 'info', label: 'Read before starting', body: 'This guide targets an existing Azure AD B2C tenant and its B2C user-flow / IEF custom-policy experience. Microsoft Entra External ID for external tenants is a separate customer identity platform with different portal paths. Do not mix the two sets of instructions.' },
      { id: 'outcome', title: '4. Expected outcome', bullets: ['The external OIDC provider is registered and configured in B2C.', 'The provider is exposed in the intended sign-in journey.', 'The external response is validated and claims are mapped.', 'The application receives the expected B2C authentication result.', 'Positive and negative test cases have been checked.'] },
    ]
  },
  architecture: {
    title: 'Architecture and Authentication Flow', eyebrow: 'OVERVIEW', subtitle: 'Understand the responsibilities of the application, Azure AD B2C, and the external OIDC provider.',
    sections: [
      { id: 'flow', title: '1. End-to-end flow', type: 'steps', steps: [
        ['Application', 'The user starts the sign-in flow from the application.'],
        ['Azure AD B2C', 'B2C starts the selected user flow or custom policy and presents configured identity providers.'],
        ['External OIDC provider', 'The user authenticates with the external provider.'],
        ['Azure AD B2C', 'B2C processes and validates the response, then executes the remaining journey and maps claims.'],
        ['Application', 'The application receives the authentication result issued for its B2C registration.']
      ]},
      { id: 'tokens', title: '2. Understand the tokens', body: 'The external provider’s response and the tokens issued by Azure AD B2C have different audiences and purposes. The application should validate and consume the B2C response intended for that application; it should not treat an external IDP token as a substitute for the B2C token.' },
      { id: 'terms', title: '3. Key terms', type: 'table', headers: ['Term', 'Meaning'], rows: [['Issuer (`iss`)', 'Identifies the authority that issued a token.'], ['Subject (`sub`)', 'Identifies a user within the issuer’s namespace.'], ['Client ID', 'Identifies an application registration at the external provider.'], ['Metadata URL', 'OIDC discovery document describing endpoints and signing keys.'], ['Claims', 'Statements about the authenticated user or authentication event.'], ['Redirect URI', 'Registered endpoint to which the provider returns the authorization response.']] },
    ]
  },
  prerequisites: {
    title: 'Prerequisites', eyebrow: 'OVERVIEW', subtitle: 'Collect access, registration details, and provider metadata before making changes.',
    sections: [
      { id: 'azure-access', title: '1. Azure access', bullets: ['Access to the correct Azure AD B2C tenant.', 'Permission to manage identity providers and user flows.', 'For custom policies, permission to manage IEF policy keys and upload policies.', 'An application registration in B2C for the client application that will use the flow.'] },
      { id: 'provider-details', title: '2. Information from the external IDP', type: 'table', headers: ['Item', 'Why it is needed'], rows: [['Client ID', 'Identifies the application registered at the external IDP.'], ['Client secret (if required)', 'Authenticates a confidential client. Store it securely.'], ['OIDC metadata URL', 'Provides discovery metadata, including endpoints and signing-key information.'], ['Issuer URL', 'Identifies the token issuer.'], ['Scopes', 'Specifies the identity information requested.'], ['Supported response type / mode', 'Must be compatible with the provider and B2C configuration.'], ['Required claims', 'Defines the user information needed by the journey and application.']] },
      { id: 'record', title: '3. Record configuration values', type: 'code', language: 'text', code: 'B2C tenant:              {tenant-name}\nExternal provider name:  {provider-name}\nExternal client ID:      {external-client-id}\nOIDC metadata URL:       {metadata-url}\nB2C application:         {b2c-application-name}\nUser flow / policy ID:   {flow-or-policy-id}\nScopes:                  {required-scopes}\nRequired claims:         {claim-list}' },
      { id: 'secret-note', title: 'Credential handling', type: 'callout', tone: 'warning', label: 'Never put secrets in docs', body: 'Do not put real client secrets in screenshots, Markdown, XML committed to source control, or shared configuration tables. Store secrets in the appropriate Azure AD B2C policy key or approved secret store.' }
    ]
  },
  'uf-register': {
    title: 'Register the External Application', eyebrow: 'USER FLOW', subtitle: 'Create or configure an application registration at the external OIDC provider.',
    sections: [
      { id: 'open-idp', title: 'Step 1 — Open the external provider portal', body: 'Sign in to the developer or administration portal for the identity provider you plan to federate with. Confirm that you are working in the correct organization and environment.' },
      { id: 'create-app', title: 'Step 2 — Create or select an application', body: 'Create a dedicated application registration for the B2C federation, or select an existing registration that is approved for this use. Record the generated client ID.' },
      { id: 'callback', title: 'Step 3 — Register the B2C callback URI', body: 'For the standard tenant-based Azure AD B2C callback, the URI commonly follows this pattern. Replace the placeholder with the actual tenant name and confirm it matches the B2C configuration exactly.', type: 'code', language: 'text', code: 'https://{tenant-name}.b2clogin.com/{tenant-name}.onmicrosoft.com/oauth2/authresp' },
      { id: 'callback-note', title: 'Callback URI notes', type: 'callout', tone: 'warning', label: 'Exact match required', body: 'Do not use the client application’s local callback URL here. The external provider must redirect the OIDC response back to Azure AD B2C. If you use a custom domain or a policy-specific redirect configuration, follow the callback URI generated or documented for that configuration.' },
      { id: 'secret', title: 'Step 4 — Configure client authentication', body: 'Enable the OIDC authorization-code flow and confidential-client authentication as supported by the provider and B2C integration. Generate a client secret if the selected configuration requires one. Store it securely and record only where it is stored.' },
      { id: 'metadata', title: 'Step 5 — Obtain the OIDC metadata URL', body: 'Use the discovery URL supplied by the provider. It often resembles the following pattern, but provider-specific paths differ.', type: 'code', language: 'text', code: 'https://{issuer-host}/.well-known/openid-configuration' },
      { id: 'verify-metadata', title: 'Step 6 — Verify discovery metadata', bullets: ['Open the discovery URL in a browser or approved API tool.', 'Confirm that it returns JSON rather than an HTML login page.', 'Check the issuer, authorization endpoint, token endpoint, and signing-key endpoint.', 'Confirm the metadata is from the intended environment and uses HTTPS.'] }
    ]
  },
  'uf-provider': {
    title: 'Configure the OIDC Provider in Azure AD B2C', eyebrow: 'USER FLOW', subtitle: 'Create the provider configuration in the Azure portal.',
    sections: [
      { id: 'portal', title: 'Step 1 — Open Azure portal', body: 'Go to the Azure portal and sign in with an account that has permission to manage the target B2C tenant.', type: 'link', url: 'https://portal.azure.com/', linkLabel: 'Open Microsoft Azure Portal' },
      { id: 'tenant', title: 'Step 2 — Select and verify the tenant', steps: [['Open the directory selector', 'Choose the directory selector in the Azure portal.'], ['Switch to the B2C tenant', 'Select the Azure AD B2C tenant used by the application.'], ['Verify the context', 'Confirm the tenant name before making configuration changes.']] },
      { id: 'identity-providers', title: 'Step 3 — Open Identity providers', body: 'Navigate to Azure AD B2C → Identity providers. Portal labels may vary slightly by tenant experience.' },
      { id: 'portal-reference-image', title: 'Portal reference', type: 'image', src: `${import.meta.env.BASE_URL}images/azure-identity-providers.png`, alt: 'Azure AD B2C Identity providers page showing the New OpenID Connect provider action and configured providers', caption: 'Reference screenshot: Azure AD B2C → Identity providers. Your tenant may show different providers or labels.' },
      { id: 'new-provider', title: 'Step 4 — Create the provider', steps: [['Select the OIDC provider option', 'Choose “New OpenID Connect provider” or the equivalent option shown in the portal.'], ['Enter a provider name', 'Use a clear name such as ContosoOIDC. This is an internal display name.'], ['Enter metadata URL', 'Use the verified discovery URL from the external provider.'], ['Enter client credentials', 'Provide the external client ID and secret if required by the chosen configuration.'], ['Review remaining fields', 'Configure scope, response type, response mode, and any other fields shown.'], ['Save', 'Save the provider, reopen it, and verify that the values persisted.']] },
      { id: 'portal-note', title: 'Configuration note', type: 'callout', tone: 'info', label: 'Use the fields shown in your tenant', body: 'The portal’s available fields and labels can vary. Do not invent values for fields that are not shown. Use settings supported by both the external provider and Azure AD B2C.' }
    ]
  },
  'uf-parameters': {
    title: 'Configure OIDC Parameters', eyebrow: 'USER FLOW', subtitle: 'Choose protocol settings that are compatible with the external provider.',
    sections: [
      { id: 'fields', title: '1. Field-by-field guidance', type: 'table', headers: ['Field', 'Guidance'], rows: [['Name', 'Use a clear and unique provider name.'], ['Metadata URL', 'Use the external provider’s valid OIDC discovery URL.'], ['Client ID', 'Enter the client ID issued by the external provider.'], ['Client secret', 'Provide the secret if required by the chosen client-authentication method.'], ['Scope', 'Include `openid`; request additional scopes only when needed and supported.'], ['Response type', 'Choose a supported response type, commonly `code` for authorization-code flow.'], ['Response mode', 'Use a response mode supported by both systems, for example `form_post` where applicable.'], ['Domain hint', 'Configure only if the provider and sign-in experience support it.']] },
      { id: 'scope', title: '2. Scope example', type: 'code', language: 'text', code: 'openid profile email' },
      { id: 'parameter-warning', title: '3. Do not copy settings blindly', type: 'callout', tone: 'warning', label: 'Provider compatibility matters', body: 'The response type, response mode, token endpoint authentication method, and scope must match the provider’s capabilities and B2C’s supported configuration. Confirm them against the provider metadata and official B2C guidance.' }
    ]
  },
  'uf-claims': {
    title: 'Map User Claims', eyebrow: 'USER FLOW', subtitle: 'Align claims returned by the external IDP with claims used by Azure AD B2C.',
    sections: [
      { id: 'mapping', title: '1. Typical claim mapping', type: 'table', headers: ['B2C claim', 'Common external claim', 'Purpose'], rows: [['`issuerUserId`', '`sub`', 'Stable external user identifier.'], ['`displayName`', '`name`', 'Display name.'], ['`givenName`', '`given_name`', 'First name.'], ['`surName`', '`family_name`', 'Last name.'], ['`email`', '`email`', 'Email address, if provided and verified as needed.'], ['`identityProvider`', 'Configured provider identifier', 'Records which identity provider was used.']] },
      { id: 'map-steps', title: '2. Mapping procedure', steps: [['Inspect provider claims', 'Use the provider’s documentation and a safe test response to identify actual claim names.'], ['Compare required claims', 'List the claims needed by the B2C journey and application.'], ['Configure mappings', 'Use the supported claim-mapping fields exposed by the portal or policy.'], ['Test missing claims', 'Confirm the journey handles optional or missing claims as intended.']] },
      { id: 'sub-note', title: 'Identifier guidance', type: 'callout', tone: 'warning', label: 'Do not assume email is a stable ID', body: 'Treat `sub` as an identifier within the issuer’s namespace. Do not use email as a permanent unique key unless the identity system and account-linking design explicitly guarantee the required behavior.' }
    ]
  },
  'uf-enable': {
    title: 'Enable the Provider in a User Flow', eyebrow: 'USER FLOW', subtitle: 'Make the configured OIDC provider available on the intended sign-in page.',
    sections: [
      { id: 'open-flow', title: 'Step 1 — Open User flows', body: 'In Azure AD B2C, select User flows and open the existing sign-up and sign-in flow used by the application. If none exists, create an appropriate flow first.' },
      { id: 'select-provider', title: 'Step 2 — Select the identity provider', steps: [['Open the identity-provider configuration', 'Find the section that controls identity providers for this user flow.'], ['Select the external OIDC provider', 'Choose the provider created in the previous chapter.'], ['Save changes', 'Save the user flow configuration.'], ['Verify persistence', 'Reopen the configuration and confirm the provider remains selected.']] },
      { id: 'enable-note', title: 'Important', type: 'callout', tone: 'info', label: 'Provider setup and flow enablement are separate', body: 'Creating an identity provider does not automatically enable it in every user flow. Repeat the enablement step for each flow that should offer this provider.' }
    ]
  },
  'uf-test': {
    title: 'Test and Validate the User Flow', eyebrow: 'USER FLOW', subtitle: 'Verify the entire B2C journey, not only the external login.',
    sections: [
      { id: 'run', title: 'Step 1 — Run the flow', steps: [['Open the selected user flow', 'Choose the flow configured in the previous chapter.'], ['Select Run user flow', 'Choose the registered test application and its configured reply URL.'], ['Start sign-in', 'Open the flow in a new browser session.'], ['Choose the external provider', 'Select the configured OIDC provider and authenticate with a test account.']] },
      { id: 'validate', title: 'Step 2 — Validate the result', bullets: ['The external provider authenticates the test user.', 'The browser returns to Azure AD B2C.', 'The user flow completes without an error.', 'The resulting token has the expected issuer and audience.', 'Required claims are present and mapped correctly.', 'The application can complete its expected sign-in behavior.'] },
      { id: 'test-cases', title: 'Step 3 — Test negative scenarios', type: 'table', headers: ['Scenario', 'Expected check'], rows: [['Incorrect credentials', 'Authentication fails safely at the external provider.'], ['Missing optional claim', 'The flow behaves according to the claim requirements.'], ['Missing required claim', 'The flow handles the condition predictably and securely.'], ['Cancelled sign-in', 'The application receives or displays the intended cancellation behavior.']] },
      { id: 'success-note', title: 'Acceptance criteria', type: 'callout', tone: 'success', label: 'End-to-end success', body: 'A successful login at the external provider is not enough. The full B2C flow and application response must complete successfully.' }
    ]
  },
  'cf-environment': {
    title: 'Prepare the IEF Custom Policy Environment', eyebrow: 'CUSTOM FLOW', subtitle: 'Understand how Azure portal and your XML policy files connect before making edits.',
    sections: [
      { id: 'mental-model', title: '1. The beginner mental model: Where work happens', type: 'callout', tone: 'info', label: 'Understand the two workspaces', body: '• Azure Portal: Used ONLY for creating secret keys (Policy Keys), uploading your XML files, and running test logins.\n• Your Code Editor (VS Code): Used for editing the actual XML policy files on your computer.\nYou never edit XML directly inside the Azure portal.' },
      { id: 'open-ief', title: '2. Exact Azure portal navigation', steps: [
        ['Switch to B2C Tenant', 'In the Azure Portal top bar, click the Directory + Subscription icon (book with gear) and switch to your Azure AD B2C tenant (e.g. contosob2c.onmicrosoft.com).'],
        ['Search for B2C', 'In the top search bar, search for and select "Azure AD B2C".'],
        ['Open Identity Experience Framework', 'In the left sidebar under "Policies", click "Identity Experience Framework" (IEF). This is the mission control for custom policies.']
      ]},
      { id: 'file-hierarchy', title: '3. Where changes go in the XML files', type: 'code', language: 'xml', code: '<!-- TrustFrameworkExtensions.xml structure -->\n<TrustFrameworkPolicy ...>\n  <BuildingBlocks>\n    <ClaimsSchema>\n      <!-- 👉 STEP 1: Define new custom claims here -->\n    </ClaimsSchema>\n  </BuildingBlocks>\n\n  <ClaimsProviders>\n    <!-- 👉 STEP 2: Define your external OIDC technical profile here -->\n  </ClaimsProviders>\n\n  <UserJourneys>\n    <UserJourney Id="SignUpOrSignIn">\n      <OrchestrationSteps>\n        <!-- 👉 STEP 3: Add provider selection button & exchange steps here -->\n      </OrchestrationSteps>\n    </UserJourney>\n  </UserJourneys>\n</TrustFrameworkPolicy>' },
      { id: 'policy-files', title: '4. The 4 standard starter-pack files', type: 'table', headers: ['File', 'Role', 'Do you edit this?'], rows: [
        ['`TrustFrameworkBase.xml`', 'Base foundation policy containing default schemas & steps.', 'Rarely / Never (keep clean)'],
        ['`TrustFrameworkLocalization.xml`', 'Localization and string translations.', 'Only if translating languages'],
        ['`TrustFrameworkExtensions.xml`', 'Custom claims, OIDC technical profiles & journeys.', 'YES — 90% of edits happen here'],
        ['`SignUpOrSignin.xml`', 'Relying party file exposed to your web/mobile app.', 'YES — specify app output claims']
      ]},
      { id: 'backup', title: '5. Always back up before editing', bullets: ['Download a copy of your current XML files and commit them to Git.', 'Never copy-paste an unrelated starter pack over an existing production policy set.'] }
    ]
  },
  'cf-register': {
    title: 'Register the External Application', eyebrow: 'CUSTOM FLOW', subtitle: 'Register your B2C custom policy redirect URI in the external identity provider.',
    sections: [
      { id: 'register-steps', title: '1. What to do in the external IDP portal', steps: [
        ['Open external IDP', 'Sign in to Okta, Auth0, Google, Ping, or your custom OIDC provider.'],
        ['Create application', 'Create an application registration of type "Web App" / "Server-side Web App".'],
        ['Obtain credentials', 'Save the generated Client ID and Client Secret in a secure note.'],
        ['Get discovery URL', 'Locate the OpenID Connect discovery endpoint (must end in `/.well-known/openid-configuration`).'],
        ['Enter redirect URI', 'Set the callback redirect URL to your Azure AD B2C tenant callback.']
      ]},
      { id: 'redirect', title: '2. Exact B2C custom policy redirect URI pattern', type: 'code', language: 'text', code: 'https://{your-tenant-name}.b2clogin.com/{your-tenant-name}.onmicrosoft.com/oauth2/authresp' },
      { id: 'redirect-example', title: 'Example URL', type: 'callout', tone: 'success', label: 'Real-world example', body: 'If your B2C tenant name is "contosob2c", your redirect URI is:\nhttps://contosob2c.b2clogin.com/contosob2c.onmicrosoft.com/oauth2/authresp\n\nEnsure there are no trailing slashes or typos — the external IDP will reject authentication if this does not match character-for-character.' }
    ]
  },
  'cf-keys': {
    title: 'Configure the External Client Secret', eyebrow: 'CUSTOM FLOW', subtitle: 'Store the external client secret securely in Azure B2C Policy Keys.',
    sections: [
      { id: 'policy-key-nav', title: '1. Azure Portal navigation path', steps: [
        ['Navigate to B2C', 'Go to Azure AD B2C in the Azure Portal.'],
        ['Open Policy Keys', 'Under "Policies", click "Identity Experience Framework" → In the left sub-menu, click "Policy Keys".'],
        ['Click Add', 'Click the "+ Add" button at the top of the policy keys list.']
      ]},
      { id: 'create-key', title: '2. Create key form fields (Exact values)', steps: [
        ['Options', 'Select "Manual" (do not choose Generate).'],
        ['Name', 'Enter: ExternalOIDCSecret (Notice: Azure will automatically prefix this with "B2C_1A_").'],
        ['Secret', 'Paste the Client Secret obtained from your external OIDC provider.'],
        ['Key usage', 'Select "Signature" (or follow provider documentation for shared secrets).'],
        ['Click Create', 'Save the key. In the keys table, verify that the key is listed as B2C_1A_ExternalOIDCSecret.']
      ]},
      { id: 'prefix-warning', title: 'Crucial beginner rule: The B2C_1A_ prefix', type: 'callout', tone: 'warning', label: 'Do not double-prefix', body: 'When naming the key in the portal, you type "ExternalOIDCSecret". Azure automatically prepends "B2C_1A_".\nIn your XML policy file, you MUST refer to it as "B2C_1A_ExternalOIDCSecret".\nIf you type "B2C_1A_ExternalOIDCSecret" in the portal box, your final key becomes "B2C_1A_B2C_1A_ExternalOIDCSecret" and the policy will fail!' },
      { id: 'key-snippet', title: '3. How the key is referenced in XML', type: 'code', language: 'xml', code: '<!-- Inside your TechnicalProfile in TrustFrameworkExtensions.xml -->\n<CryptographicKeys>\n  <Key Id="client_secret" StorageReferenceId="B2C_1A_ExternalOIDCSecret" />\n</CryptographicKeys>' }
    ]
  },
  'cf-claims': {
    title: 'Define Required Claims', eyebrow: 'CUSTOM FLOW', subtitle: 'Declare any custom claims in ClaimsSchema before mapping them.',
    sections: [
      { id: 'claims-explanation', title: '1. Why declare claims?', body: 'Azure AD B2C is strictly typed. Before you can receive a claim from an external provider (like `sub`, `email`, or `name`), the claim name must be declared in the schema if it is not already provided by the base policy.' },
      { id: 'claims-schema-location', title: '2. Where to paste in TrustFrameworkExtensions.xml', body: 'Open `TrustFrameworkExtensions.xml`. Inside `<BuildingBlocks>`, find or add `<ClaimsSchema>`. Paste any missing claims here:' },
      { id: 'claims-schema-code', title: '3. Complete ClaimsSchema XML example', type: 'code', language: 'xml', code: '<BuildingBlocks>\n  <ClaimsSchema>\n    <!-- External IDP User Identifier (often mapped from sub) -->\n    <ClaimType Id="issuerUserId">\n      <DisplayName>User Identifier</DisplayName>\n      <DataType>string</DataType>\n      <UserHelpText>Unique user ID from external provider</UserHelpText>\n    </ClaimType>\n\n    <!-- Identity Provider Name -->\n    <ClaimType Id="identityProvider">\n      <DisplayName>Identity Provider</DisplayName>\n      <DataType>string</DataType>\n      <UserHelpText>The identity provider used to sign in</UserHelpText>\n    </ClaimType>\n\n    <!-- Authentication Source indicator -->\n    <ClaimType Id="authenticationSource">\n      <DisplayName>Authentication Source</DisplayName>\n      <DataType>string</DataType>\n    </ClaimType>\n  </ClaimsSchema>\n</BuildingBlocks>' },
      { id: 'common-claims-rule', title: 'Rule: Avoid duplicate declarations', type: 'callout', tone: 'info', label: 'Check inherited claims first', body: 'Claims like `displayName`, `givenName`, `surName`, and `email` are typically already declared in `TrustFrameworkBase.xml`. Do NOT re-declare them in `TrustFrameworkExtensions.xml` or Azure will return a duplicate claim schema error on upload.' }
    ]
  },
  'cf-profile': {
    title: 'Create the OIDC Technical Profile', eyebrow: 'CUSTOM FLOW', subtitle: 'Configure how B2C sends authentication requests and receives claims.',
    sections: [
      { id: 'profile-location', title: '1. File and section location', body: 'Open `TrustFrameworkExtensions.xml`. Scroll to `<ClaimsProviders>`. Add a new `<ClaimsProvider>` block containing the technical profile:' },
      { id: 'xml-example', title: '2. Copyable OIDC Technical Profile template', type: 'code', language: 'xml', code: '<ClaimsProvider>\n  <DisplayName>External OpenID Connect</DisplayName>\n  <TechnicalProfiles>\n    <TechnicalProfile Id="ExternalOIDC-OIDC">\n      <DisplayName>External Account</DisplayName>\n      <Description>Sign in with your external OIDC account</Description>\n      <Protocol Name="OpenIdConnect" />\n      <Metadata>\n        <!-- 🔴 REPLACE: Provider discovery metadata URL -->\n        <Item Key="METADATA">https://issuer.example.com/.well-known/openid-configuration</Item>\n        <!-- 🔴 REPLACE: Client ID registered at external provider -->\n        <Item Key="client_id">YOUR_EXTERNAL_CLIENT_ID</Item>\n        <!-- 🔴 REPLACE: Token endpoint issuer if different from discovery -->\n        <Item Key="ProviderName">https://issuer.example.com</Item>\n        <!-- 🟢 Standard OIDC protocol configuration -->\n        <Item Key="response_types">code</Item>\n        <Item Key="response_mode">form_post</Item>\n        <Item Key="scope">openid profile email</Item>\n        <Item Key="HttpBinding">POST</Item>\n        <Item Key="UsePolicyInRedirectUri">false</Item>\n      </Metadata>\n      <CryptographicKeys>\n        <!-- Reference to the policy key created in Azure Portal -->\n        <Key Id="client_secret" StorageReferenceId="B2C_1A_ExternalOIDCSecret" />\n      </CryptographicKeys>\n      <OutputClaims>\n        <!-- Map PartnerClaimType (External token) to ClaimTypeReferenceId (B2C policy) -->\n        <OutputClaim ClaimTypeReferenceId="issuerUserId" PartnerClaimType="sub" />\n        <OutputClaim ClaimTypeReferenceId="displayName" PartnerClaimType="name" />\n        <OutputClaim ClaimTypeReferenceId="givenName" PartnerClaimType="given_name" />\n        <OutputClaim ClaimTypeReferenceId="surName" PartnerClaimType="family_name" />\n        <OutputClaim ClaimTypeReferenceId="email" PartnerClaimType="email" />\n        <OutputClaim ClaimTypeReferenceId="identityProvider" DefaultValue="ExternalOIDC" AlwaysUseDefaultValue="true" />\n        <OutputClaim ClaimTypeReferenceId="authenticationSource" DefaultValue="socialIdpAuthentication" AlwaysUseDefaultValue="true" />\n      </OutputClaims>\n      <OutputClaimsTransformations />\n    </TechnicalProfile>\n  </TechnicalProfiles>\n</ClaimsProvider>' },
      { id: 'partner-claims-tip', title: 'Understanding PartnerClaimType', type: 'callout', tone: 'info', label: 'Claim Mapping Anatomy', body: '• PartnerClaimType = The exact claim name sent by your external provider in its ID token (e.g. "sub", "email", "name").\n• ClaimTypeReferenceId = The internal B2C claim name you defined in ClaimsSchema or inherited from Base (e.g. "issuerUserId", "email").' }
    ]
  },
  'cf-provider': {
    title: 'Review the Claims Provider Placement', eyebrow: 'CUSTOM FLOW', subtitle: 'Verify the claims provider is placed cleanly inside TrustFrameworkExtensions.xml.',
    sections: [
      { id: 'provider-checklist', title: '1. File placement checklist', steps: [
        ['Check Parent Tag', 'Confirm your `<ClaimsProvider>` is directly enclosed inside `<ClaimsProviders> ... </ClaimsProviders>` in `TrustFrameworkExtensions.xml`.'],
        ['Unique Profile ID', 'Ensure the `<TechnicalProfile Id="...">` (e.g. `ExternalOIDC-OIDC`) is unique and has no duplicate ID across Base or Extensions.'],
        ['Display Name on Button', 'The `<DisplayName>` in your TechnicalProfile will appear as the button label on your B2C sign-in screen.'],
        ['Matching Secret Reference', 'Ensure `StorageReferenceId="B2C_1A_ExternalOIDCSecret"` matches the key name created in Policy Keys.']
      ]},
      { id: 'xml-placement-visual', title: '2. Placement snapshot', type: 'code', language: 'xml', code: '<TrustFrameworkPolicy ...>\n  <BasePolicy>\n    <TenantId>yourtenant.onmicrosoft.com</TenantId>\n    <PolicyId>B2C_1A_TrustFrameworkBase</PolicyId>\n  </BasePolicy>\n\n  <BuildingBlocks> ... </BuildingBlocks>\n\n  <ClaimsProviders>\n    <!-- Existing local account providers... -->\n\n    <!-- 👉 YOUR NEW OIDC CLAIMS PROVIDER GOES HERE -->\n    <ClaimsProvider>\n      <DisplayName>External OIDC</DisplayName>\n      <TechnicalProfiles> ... </TechnicalProfiles>\n    </ClaimsProvider>\n  </ClaimsProviders>\n</TrustFrameworkPolicy>' }
    ]
  },
  'cf-journey': {
    title: 'Integrate the Provider into the User Journey', eyebrow: 'CUSTOM FLOW', subtitle: 'Expose the sign-in button in Step 1 and execute the authentication in Step 2.',
    sections: [
      { id: 'journey-explanation', title: '1. How the User Journey works', body: 'A B2C User Journey is an ordered series of Orchestration Steps. To add an external provider:\n• Step 1 (Selection): Adds a button on the login screen alongside Local Account email/password.\n• Step 2 (Execution): When the user clicks the button, B2C redirects to the external provider and exchanges the token.' },
      { id: 'step-1-code', title: '2. Orchestration Step 1: Add ClaimsProviderSelection', type: 'code', language: 'xml', code: '<!-- In TrustFrameworkExtensions.xml inside <UserJourney Id="SignUpOrSignIn"> -->\n<OrchestrationStep Order="1" Type="CombinedSignInAndSignUp" ContentDefinitionReferenceId="api.signuporsignin">\n  <ClaimsProviderSelections>\n    <!-- Existing local account / email selection -->\n    <ClaimsProviderSelection TargetClaimsExchangeId="ForgotPasswordExchange" />\n    <ClaimsProviderSelection ValidationClaimsExchangeId="LocalAccountSigninEmailExchange" />\n\n    <!-- 👉 ADD YOUR NEW OIDC PROVIDER BUTTON HERE: -->\n    <ClaimsProviderSelection TargetClaimsExchangeId="ExternalOIDCExchange" />\n  </ClaimsProviderSelections>\n  <ClaimsExchanges>\n    <ClaimsExchange Id="LocalAccountSigninEmailExchange" TechnicalProfileReferenceId="SelfAsserted-LocalAccountSignin-Email" />\n  </ClaimsExchanges>\n</OrchestrationStep>' },
      { id: 'step-2-code', title: '3. Orchestration Step 2: Add ClaimsExchange', type: 'code', language: 'xml', code: '<!-- Orchestration Step 2: Execute the selected exchange -->\n<OrchestrationStep Order="2" Type="ClaimsExchange">\n  <ClaimsExchanges>\n    <!-- Existing local account signup exchange... -->\n    <ClaimsExchange Id="SignUpWithLogonEmailExchange" TechnicalProfileReferenceId="LocalAccountSignUpWithLogonEmail" />\n\n    <!-- 👉 ADD YOUR CORRESPONDING CLAIMS EXCHANGE HERE: -->\n    <ClaimsExchange Id="ExternalOIDCExchange" TechnicalProfileReferenceId="ExternalOIDC-OIDC" />\n  </ClaimsExchanges>\n</OrchestrationStep>' },
      { id: 'matching-ids-rule', title: 'The 2 IDs that MUST match', type: 'callout', tone: 'warning', label: 'ID Matching Rule', body: '1. TargetClaimsExchangeId in Step 1 ("ExternalOIDCExchange") must EXACTLY match the ClaimsExchange Id in Step 2 ("ExternalOIDCExchange").\n2. TechnicalProfileReferenceId in Step 2 ("ExternalOIDC-OIDC") must EXACTLY match your TechnicalProfile Id in ClaimsProviders.' }
    ]
  },
  'cf-rp': {
    title: 'Configure the Relying-Party Policy', eyebrow: 'CUSTOM FLOW', subtitle: 'Expose the user journey to your client application via SignUpOrSignin.xml.',
    sections: [
      { id: 'rp-role', title: '1. What is the Relying Party (RP) file?', body: '`SignUpOrSignin.xml` is the public-facing entry point. It tells Azure AD B2C which user journey to run when an application requests authentication and which claims to include in the final application token.' },
      { id: 'rp-complete-code', title: '2. Complete SignUpOrSignin.xml example', type: 'code', language: 'xml', code: '<TrustFrameworkPolicy\n  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"\n  xmlns:xsd="http://www.w3.org/2001/XMLSchema"\n  xmlns="http://schemas.microsoft.com/online/cpim/schemas/2013/06"\n  PolicySchemaVersion="0.3.0.0"\n  TenantId="yourtenant.onmicrosoft.com"\n  PolicyId="B2C_1A_signup_signin"\n  PublicPolicyURI="http://yourtenant.onmicrosoft.com/B2C_1A_signup_signin">\n\n  <BasePolicy>\n    <TenantId>yourtenant.onmicrosoft.com</TenantId>\n    <PolicyId>B2C_1A_TrustFrameworkExtensions</PolicyId>\n  </BasePolicy>\n\n  <RelyingParty>\n    <!-- Points to the journey where you added your OIDC provider -->\n    <DefaultUserJourney ReferenceId="SignUpOrSignIn" />\n    <TechnicalProfile Id="PolicyProfile">\n      <DisplayName>PolicyProfile</DisplayName>\n      <Protocol Name="OpenIdConnect" />\n      <OutputClaims>\n        <!-- Claims returned to your web/mobile application token -->\n        <OutputClaim ClaimTypeReferenceId="displayName" />\n        <OutputClaim ClaimTypeReferenceId="givenName" />\n        <OutputClaim ClaimTypeReferenceId="surname" />\n        <OutputClaim ClaimTypeReferenceId="email" />\n        <OutputClaim ClaimTypeReferenceId="identityProvider" />\n        <OutputClaim ClaimTypeReferenceId="objectId" PartnerClaimType="sub"/>\n        <OutputClaim ClaimTypeReferenceId="tenantId" AlwaysUseDefaultValue="true" DefaultValue="{Policy:TenantObjectId}" />\n      </OutputClaims>\n      <SubjectNamingInfo ClaimType="sub" />\n    </TechnicalProfile>\n  </RelyingParty>\n</TrustFrameworkPolicy>' },
      { id: 'rp-policy-id', title: 'Application setting alignment', type: 'callout', tone: 'info', label: 'Match your app config', body: 'The PolicyId attribute (e.g. `B2C_1A_signup_signin`) is the exact authority name your web application must request. If your app requests `B2C_1_susi`, it will invoke a user flow instead of this custom policy!' }
    ]
  },
  'cf-upload': {
    title: 'Upload Custom Policies', eyebrow: 'CUSTOM FLOW', subtitle: 'Upload the policy files to Azure B2C in the required order and resolve upload errors.',
    sections: [
      { id: 'upload-portal-steps', title: '1. Exact Azure Portal upload instructions', steps: [
        ['Open IEF', 'In Azure AD B2C, select "Identity Experience Framework".'],
        ['Click Upload', 'Click the "Upload custom policy" button in the top action toolbar.'],
        ['Select File', 'Click the folder icon and choose the policy XML file from your disk.'],
        ['Check Overwrite box', 'CRITICAL: Check the checkbox "Overwrite the custom policy if it already exists".'],
        ['Click Upload', 'Click Upload at the bottom of the blade and wait for the green success message.']
      ]},
      { id: 'upload-order', title: '2. Strict upload dependency order', type: 'table', headers: ['Order', 'File to upload', 'Why this order?'], rows: [
        ['1st', '`TrustFrameworkBase.xml`', 'Contains base definitions (only upload once during initial setup).'],
        ['2nd', '`TrustFrameworkLocalization.xml`', 'If your environment uses separate localization files.'],
        ['3rd', '`TrustFrameworkExtensions.xml`', 'Contains your new Claims, Technical Profile, and User Journey.'],
        ['4th', '`SignUpOrSignin.xml`', 'Relying party policy that depends on the extensions policy.']
      ]},
      { id: 'common-errors-table', title: '3. Troubleshooting common upload errors', type: 'table', headers: ['Azure Portal Error Message', 'Root Cause', 'How to Fix'], rows: [
        ['"Policy with ID ... already exists"', 'You forgot to check the Overwrite checkbox.', 'Check "Overwrite the custom policy if it already exists" and re-upload.'],
        ['"Schema validation error on line X"', 'XML typo, unclosed tag, or incorrect tag nesting.', 'Open the file at line X in VS Code. Ensure tags are properly closed and in valid XML sequence.'],
        ['"ClaimType with id ... not found"', 'A claim in OutputClaims was never declared.', 'Declare the missing claim in ClaimsSchema inside TrustFrameworkExtensions.xml.'],
        ['"TechnicalProfile with id ... not found"', 'Orchestration step references an ID that does not exist.', 'Ensure TechnicalProfileReferenceId in Step 2 matches the exact Id of your TechnicalProfile.'],
        ['"A cryptographic key with storage reference id ... was not found"', 'Policy key missing or misspelled.', 'Check Policy Keys in the portal. Ensure it exists as B2C_1A_ExternalOIDCSecret.']
      ]}
    ]
  },
  'cf-test': {
    title: 'Test the Custom Flow', eyebrow: 'CUSTOM FLOW', subtitle: 'Execute the relying-party policy using the portal Run Now feature.',
    sections: [
      { id: 'run-policy-steps', title: '1. Running the test in Azure Portal', steps: [
        ['Open Custom Policies', 'Go to Azure AD B2C → Identity Experience Framework → Custom policies.'],
        ['Select Policy', 'Click on your relying party policy: `B2C_1A_signup_signin`.'],
        ['Select Application', 'In the "Select application" dropdown, choose a registered test application (e.g. your SPA or web app).'],
        ['Select Reply URL', 'In the "Select reply URL" dropdown, select the registered callback URL (e.g. `https://jwt.ms`).'],
        ['Click Run now', 'Click the blue "Run now" button. A new browser tab will launch.']
      ]},
      { id: 'verify-ui', title: '2. What you should observe', bullets: [
        'The B2C sign-in page displays your new External OIDC button alongside local account inputs.',
        'Clicking the button redirects you smoothly to the external provider login page.',
        'Entering external credentials succeeds and redirects back to `https://{tenant}.b2clogin.com/.../authresp`.',
        'Azure AD B2C completes token issuance and redirects to your test URL (e.g. `jwt.ms`).',
        'In the decoded token on `jwt.ms`, inspect your claims: `displayName`, `email`, and `identityProvider` should be present.'
      ]},
      { id: 'troubleshooting-tip', title: 'Helpful testing tip: Use jwt.ms', type: 'callout', tone: 'success', label: 'Inspect tokens instantly', body: 'Register "https://jwt.ms" as a redirect URI on your test application registration. When you click "Run now", Azure B2C will redirect to jwt.ms and display all decoded token claims, making it effortless to verify that email, name, and sub were mapped correctly.' }
    ]
  },
  troubleshooting: {
    title: 'Troubleshooting', eyebrow: 'REFERENCE', subtitle: 'Use the observed symptom and full error details to narrow down the cause.',
    sections: [
      { id: 'errors', title: 'Common errors', type: 'table', headers: ['Symptom', 'Possible cause', 'What to check'], rows: [
        ['`invalid_client`', 'Incorrect client ID or client authentication.', 'Verify client ID, secret, and supported authentication method.'],
        ['Redirect URI mismatch', 'Registered callback differs from actual callback.', 'Compare exact scheme, host, path, tenant, and policy behavior.'],
        ['Metadata error', 'Invalid or inaccessible discovery endpoint.', 'Open the metadata URL and verify its JSON, issuer and endpoints.'],
        ['Provider not visible', 'Provider not enabled in the user flow or not connected to the custom journey.', 'Check user-flow provider selection or orchestration references.'],
        ['Missing claims', 'Scope or claim mapping is incorrect.', 'Inspect actual provider claims and output mappings.'],
        ['Issuer validation failure', 'Issuer configuration differs from the token issuer.', 'Compare configured issuer with provider metadata and response.'],
        ['Custom policy upload fails', 'Malformed XML, duplicate ID, or unresolved reference.', 'Validate schema, inheritance, claims, keys and technical-profile IDs.'],
        ['External login works but B2C fails', 'B2C validation or subsequent policy step fails.', 'Check callback, token validation, required claims and account-processing steps.']
      ] },
      { id: 'debug-order', title: 'Recommended diagnostic order', steps: [['Capture the exact error', 'Record the error code and safe diagnostic details; remove secrets and tokens.'], ['Verify tenant and policy', 'Confirm the expected tenant, user flow or relying-party policy is being run.'], ['Verify metadata and callback', 'Check discovery metadata and exact redirect URI.'], ['Verify credentials', 'Confirm the client ID and secure secret reference.'], ['Verify claims and journey', 'Check claim mappings, policy IDs and orchestration references.'], ['Retest after one change', 'Change one item at a time and record the result.']] }
    ]
  },
  security: {
    title: 'Security Best Practices', eyebrow: 'REFERENCE', subtitle: 'Protect credentials, validate the federation configuration, and limit exposed user data.',
    sections: [
      { id: 'practices', title: 'Required practices', bullets: ['Store client secrets in policy keys or an approved secret store; never commit them to source control.', 'Use HTTPS endpoints and trusted OIDC metadata.', 'Validate issuer, audience, signing keys, and response behavior according to the protocol and B2C configuration.', 'Use stable external identifiers for account association; do not assume email is immutable.', 'Request only necessary scopes and claims.', 'Avoid exposing tokens, credentials, or sensitive personal data in logs and screenshots.', 'Back up policies and use change review before deploying to shared or production tenants.', 'Test success, failure, cancellation, and missing-claim scenarios.'] },
      { id: 'security-note', title: 'Security review', type: 'callout', tone: 'warning', label: 'Before production', body: 'Have the identity/security owner review the external provider’s token validation settings, account-linking rules, client-secret rotation process, and diagnostic logging before production rollout.' }
    ]
  },
  checklist: {
    title: 'Setup Checklist', eyebrow: 'REFERENCE', subtitle: 'Use this interactive checklist to verify the implementation before handover.',
    sections: [
      { id: 'checklist-intro', title: 'Implementation verification', body: 'Check the items relevant to the implementation path you used. Checklist state is kept only in the current page session and is not saved to a server.' },
      { id: 'checklist-items', title: 'Checklist', type: 'checklist', groups: [
        { title: 'Prerequisites', items: ['Correct Azure AD B2C tenant selected', 'External IDP application registered', 'Client ID, metadata URL, and required credentials available', 'Required permissions confirmed'] },
        { title: 'OIDC configuration', items: ['Redirect URI verified', 'Metadata endpoint accessible', 'OIDC parameters configured', 'Required claims mapped'] },
        { title: 'User Flow path', items: ['OIDC provider enabled in the selected user flow', 'Test sign-in completed', 'B2C token and required claims validated'] },
        { title: 'Custom Flow path', items: ['Policy key configured securely', 'Technical profile added and validated', 'Provider connected to the user journey', 'Relying-party policy reviewed', 'Policies uploaded and tested'] },
        { title: 'Final verification', items: ['Failure scenarios tested', 'No secrets exposed in source control or logs', 'Configuration and rollback notes recorded'] }
      ]}
    ]
  },
  references: {
    title: 'Official References', eyebrow: 'REFERENCE', subtitle: 'Use Microsoft Learn as the source of truth for portal behavior and custom policy schema.',
    sections: [
      { id: 'links', title: 'Microsoft Learn', type: 'links', links: [
        ['Generic OIDC identity provider for Azure AD B2C', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-generic-openid-connect'],
        ['OpenID Connect technical profile', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/openid-connect-technical-profile'],
        ['Get started with custom policies', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/custom-policy-get-started'],
        ['Policy keys overview', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/policy-keys-overview'],
        ['Claims providers in custom policies', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/claimsproviders'],
        ['User flows overview', 'https://learn.microsoft.com/en-us/azure/active-directory-b2c/user-flow-overview']
      ] },
      { id: 'lifecycle', title: 'Platform lifecycle note', type: 'callout', tone: 'warning', label: 'Confirm tenant eligibility', body: 'Azure AD B2C stopped being available for purchase by new customers on May 1, 2025. Confirm that your organization has an eligible existing tenant and that the required features remain available before planning a new deployment. Do not confuse Azure AD B2C with Microsoft Entra External ID for external tenants.' }
    ]
  }
};
