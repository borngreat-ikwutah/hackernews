# Hacker News Clone API

Complete API including authentication and custom endpoints

**Version:** 1.1.0

## Base URL

``

## Authentication

This API uses cookie-based authentication powered by Better-Auth. The session cookie is automatically managed by Better-Auth.

## Interactive Documentation

- **Unified Documentation**: [/docs](http://localhost:3000/docs) - Complete API documentation with Scalar
- **Better-Auth Reference**: [/api/auth/reference](http://localhost:3000/api/auth/reference) - Better-Auth specific endpoints

## API Endpoints

### Default

#### `POST /sign-in/social`

No summary

Sign in with a social provider

#### `GET /get-session`

No summary

Get the current session

#### `POST /sign-out`

No summary

Sign out the current user

#### `POST /sign-up/email`

No summary

Sign up a user using email and password

#### `POST /sign-in/email`

No summary

Sign in with email and password

#### `POST /forget-password`

No summary

Send a password reset email to the user

#### `POST /reset-password`

No summary

Reset the password for a user

#### `GET /verify-email`

No summary

Verify the email of the user

#### `POST /send-verification-email`

No summary

Send a verification email to the user

#### `POST /change-email`

No summary

#### `POST /change-password`

No summary

Change the password of the user

#### `POST /update-user`

No summary

Update the current user

#### `POST /delete-user`

No summary

Delete the user

#### `GET /reset-password/{token}`

No summary

Redirects the user to the callback URL with the token

#### `POST /request-password-reset`

No summary

Send a password reset email to the user

#### `GET /list-sessions`

No summary

List all active sessions for the user

#### `POST /revoke-session`

No summary

Revoke a single session

#### `POST /revoke-sessions`

No summary

Revoke all sessions for the user

#### `POST /revoke-other-sessions`

No summary

Revoke all other sessions for the user except the current one

#### `POST /link-social`

No summary

Link a social account to the user

#### `GET /list-accounts`

No summary

List all accounts linked to the user

#### `GET /delete-user/callback`

No summary

Callback to complete user deletion with verification token

#### `POST /unlink-account`

No summary

Unlink an account

#### `POST /refresh-token`

No summary

Refresh the access token using a refresh token

#### `POST /get-access-token`

No summary

Get a valid access token, doing a refresh if needed

#### `POST /account-info`

No summary

Get the account info provided by the provider

#### `GET /ok`

No summary

Check if the API is working

#### `GET /error`

No summary

Displays an error page

### Posts

#### `POST /api/posts/create-post`

Create a new post

Create a new post (requires authentication)

## Development

To start the development server:

```bash
bun run dev
```

To regenerate this documentation:

```bash
bun run scripts/generate-openapi.ts
```
