# PasswdMan Server

> [!IMPORTANT]
> **This project has been archived and is no longer actively maintained.** The current version of PasswdMan is available at [PasswdMan2](https://github.com/zcorw/PasswdMan2).

PasswdMan Server is the NestJS API for the original PasswdMan password manager. It provides authentication and backend services for storing, organizing, searching, importing, and exporting passwords and secure notes.

## Features

- User registration and sign-in with JWT-based authentication.
- Password creation, retrieval, update, deletion, grouping, pagination, and search.
- Secure-note management.
- CSV import and export for password-vault data.
- Optional AI-assisted parsing of natural-language password queries.
- Encryption of stored password values.
- Application-layer encryption for sensitive communication with the UI.
- HTTP security headers and request rate limiting.

## Encrypted Communication

**Sensitive data exchanged between the UI and server is protected with an additional application-layer encryption flow.** The server generates a 2048-bit RSA key pair and publishes the public key. During login or registration, the UI encrypts a random 128-bit AES session key with RSA-OAEP using SHA-256, encrypts the submitted data with AES-CBC, and signs it with HMAC-SHA256. The server unwraps the AES key, decrypts the payload, verifies its integrity, and can use the session key to encrypt protected responses.

Password values are also encrypted with AES-CBC before being stored in the database. This application-layer encryption is defense in depth and does not replace HTTPS/TLS, which should always be enabled in production.

## Repository Status

This repository belongs to the archived first version of PasswdMan:

- Server: [zcorw/PasswdMan-server](https://github.com/zcorw/PasswdMan-server)
- UI: [zcorw/PasswdMan-ui](https://github.com/zcorw/PasswdMan-ui)
- Current version: [zcorw/PasswdMan2](https://github.com/zcorw/PasswdMan2)

## Technology

- NestJS and TypeScript
- MySQL with TypeORM
- JWT authentication
- node-forge and CryptoJS
- Docker and Docker Compose

## Historical Setup

This setup information is retained for reference because the project is archived.

Install dependencies:

```sh
npm install
```

Create a production configuration from the development example:

```sh
cp config/dev.yml config/prod.yml
```

Review the application port, MySQL connection, JWT expiration, registration setting, and cryptographic configuration before starting the service. Do not use the example credentials or keys in a public deployment.

Start a development instance:

```sh
npm run start:dev
```

Build the server:

```sh
npm run build
```

For the historical container-based deployment, copy the supplied Docker files to the repository root, ensure their ports and database settings match `config/prod.yml`, and then run:

```sh
docker compose up --build -d
```
