# Authentication and Business Creation Flow

## Overview
This document describes the enhanced authentication flow that supports multiple token scenarios and automatic business creation.

## Authentication Scenarios

### 1. JWT Token in URL (`?jwt=...`)
When a user arrives with a JWT token in the URL:
- **JWT is verified** via API call to `/api/auth/verify` with `Authorization: Bearer {jwt}`
- API returns `{ success: true, user_id: "..." }` or `{ error: "JWT has expired" }`
- If verification fails, user sees error message
- If successful:
  - User data is extracted from the token payload
  - Token and user data are stored in localStorage
  - Password step is automatically skipped
  - User proceeds directly to the onboarding flow

**Verification Process:**
```javascript
const verifyResult = await verifyJWT(jwt);
if (!verifyResult.success) {
  // Show error: "Token JWT inválido ou expirado"
  return;
}
// Continue with user data extraction and storage
```

### 2. Activation Token in URL (`?token=...`)
When a user arrives with an activation token:
- Token is verified against the backend API
- User's email is retrieved
- User must complete account name and password steps
- Upon completion, authentication tokens are stored

### 3. Existing Authentication in localStorage
When no URL parameters are present:
- System checks localStorage for existing authentication
- If valid tokens exist, user is automatically authenticated
- Password step is skipped
- User proceeds with the onboarding flow

### 4. No Authentication Found
If no valid authentication is found:
- User sees an error message
- Option to resend activation email is provided (if email is available)

## Token Expiration Handling

### Expired or Invalid Activation Token
When the backend returns `ACTIVATION_TOKEN_EXPIRED` or `INVALID_ACTIVATION_TOKEN`:
- User is notified that the token has expired or is invalid
- System attempts to extract email from the token automatically using JWT parsing
- **If email is found**: Shows the email and offers a direct "Reenviar Email de Ativação" button
- **If email is NOT found**: Shows an input field for the user to manually enter their email
- Option to resend activation email via `/api/auth/resend-activation` is ALWAYS presented
- New activation email is sent with fresh token upon request
- Success message is shown after email is resent

### Invalid JWT Token
- User is shown an error message about invalid authentication
- User must obtain a new valid JWT to proceed

## Business Creation Flow

### Data Collection
Throughout the onboarding funnel, the following data is collected:
- Account name (business name)
- Social network type (Marca pessoal or Empresa)
- Instagram handle (required)
- LinkedIn handle (optional)
- Website URL (optional)
- Niches (at least 1 required)
- Main objective (business objective)
- Profiles to monitor (minimum 3 influencers)

### Business Creation Process
During the Phase1LoadingPage (final step):

1. **Step 1: Saving Information**
   - Form data is prepared for submission

2. **Step 2: Creating Business**
   - Access token is retrieved from localStorage
   - Form data is transformed into business API payload
   - POST request is made to `/api/business` endpoint
   - Handles validation errors and network failures

3. **Step 3: Initializing Feed**
   - Placeholder step for user experience

4. **Step 4: Personalizing**
   - localStorage is cleared of onboarding data
   - User is redirected to the next application

### Data Transformation
The system automatically transforms form data:
- Normalizes Instagram/LinkedIn handles (removes @ symbol)
- Converts profiles to monitor into influencers array
- Adds language and country codes based on browser locale
- Separates predefined niches from custom niches
- Ensures minimum requirements (3 influencers, 1 niche)

## API Integration

### Authentication Service (`authService.ts`)
Functions:
- `verifyJWT()` - **NEW** - Verifies JWT token via `/api/auth/verify` endpoint
- `verifyActivationToken()` - Validates activation tokens
- `completeRegistration()` - Creates user account with password
- `resendActivationEmail()` - Requests new activation email
- `checkAuthenticationStatus()` - Verifies stored authentication
- `getStoredAuthTokens()` - Retrieves tokens from localStorage
- `storeAuthData()` - Saves authentication data to localStorage

### Business Service (`businessService.ts`)
Functions:
- `createBusiness()` - Creates business record via API
- `transformFormDataToBusinessPayload()` - Converts form data to API format

### Token Helpers (`utils/tokenHelpers.ts`)
Utility functions:
- `parseJWT()` - Decodes JWT payload
- `isJWTExpired()` - Checks token expiration
- `extractUserDataFromJWT()` - Gets user data from token
- `getJWTExpirationTime()` - Calculates expiration timestamp
- `extractEmailFromToken()` - **NEW** - Extracts email from token (even if expired/invalid)

## Debugging

### Console Logs
The application includes comprehensive logging for debugging:

**JWT Verification Logs:**
```
[JWT Verification] Starting JWT verification...
[JWT Verification] Result: { success: true, user_id: "..." }
[JWT Verification] User data extracted: { id, email, name }
[JWT Verification] Expires at: 2024-11-17T...
[JWT Verification] JWT validated and stored successfully
```

**Business Creation Logs:**
```
[Phase1Loading] Starting business creation process
[Phase1Loading] Form data: { accountName, instagram, ... }
[Phase1Loading] Access token retrieved: true
[Phase1Loading] Transforming form data to payload...

[Business Payload] Starting transformation
[Business Payload] Form data received: { ... }
[Business Payload] Extracted fields: { accountName, instagramHandle, ... }
[Business Payload] Niches from form: [{ text, type, id }]
[Business Payload] Separated niches: { predefinedNiches: [...], customNiches: [...] }
[Business Payload] Building influencers list: [...]
[Business Payload] Final payload: { name, instagram, niches, ... }

[Create Business] Starting business creation
[Create Business] Payload: { ... }
[Create Business] Access token present: true
[Create Business] Response status: 201
[Create Business] Response data: { success: true, ... }
[Create Business] Success!
```

**Error Logs:**
```
[Phase1Loading] Payload is null - insufficient data
[Phase1Loading] Form data that failed: { ... }
[Business Payload] Missing required fields: { hasAccountName: false, ... }
[Create Business] Failed: { error: "...", details: [...] }
```

### Common Issues

1. **"Dados insuficientes para criar o business"**
   - Check console logs for `[Business Payload]` entries
   - Verify all required fields are present: accountName, instagramHandle, socialNetworkType, mainObjective
   - Ensure at least 3 profiles to monitor
   - Ensure at least 1 niche (predefined or custom)

2. **"JWT has expired"**
   - JWT token from URL is no longer valid
   - User needs to obtain a new JWT token

3. **Missing niches despite filling form**
   - Check if niches are being matched correctly with predefined list
   - Look for `[Business Payload] Separated niches` log to see if IDs are assigned

## Error Handling

### Validation Errors
- API validation errors are displayed to users
- Field-specific errors are shown when available
- User can retry after fixing issues

### Network Errors
- Connection failures show generic error message
- Retry button allows user to attempt again
- Errors are logged for debugging

### Business Creation Failures
- User sees specific error message
- Option to reload and try again
- Onboard data remains in localStorage for retry

## Security Considerations

- JWT tokens are validated before use
- Access tokens are stored securely in localStorage
- Tokens are checked for expiration before API calls
- All handles are sanitized (@ symbol removal)
- Minimum data validation (3 influencers, 1 niche)

## Flow Diagram

```
URL Check
├── Has JWT? → Parse JWT → Store Auth → Skip Password → Continue
├── Has Token? → Verify Token → Show Password → Complete Registration
├── Has LocalStorage Auth? → Validate → Skip Password → Continue
└── No Auth → Show Error → Offer Resend Email

Onboarding Flow
├── Account Name
├── Password (conditional - skipped if JWT present)
├── Social Network Type
├── Instagram Handle
├── LinkedIn Handle
├── Website (conditional)
├── Niches
├── Main Objective
├── Profile Monitoring
└── Phase1 Loading
    ├── Step 1: Save Info
    ├── Step 2: Create Business ← API CALL
    ├── Step 3: Initialize Feed
    ├── Step 4: Personalize
    └── Clear Storage → Redirect
```

## Testing Scenarios

1. **New user with activation token**: Full flow with password
2. **Returning user with JWT**: Skip password, complete onboarding
3. **User with expired token**: Show resend email option
4. **User with invalid JWT**: Show error message
5. **User with localStorage auth**: Auto-authenticate and continue
6. **Business creation success**: Clear data and redirect
7. **Business creation failure**: Show error with retry option
