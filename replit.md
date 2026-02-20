# VyPay - Modern iOS Payment Gateway

## Overview

VyPay is a modern, iOS-styled payment gateway frontend that integrates with the **Pakasir** payment processing API. It allows users to create payment transactions via multiple methods including QRIS (QR code payments), various Indonesian bank Virtual Accounts (BNI, BRI, CIMB Niaga, Permata, Maybank, etc.), and PayPal. The application serves as a white-label payment page that merchants can customize with their own Pakasir project credentials.

The app consists of a lightweight Express.js backend that proxies API requests to Pakasir's API, and a vanilla HTML/CSS/JS frontend with an iOS-inspired design featuring dark/light theme support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend
- **Technology**: Vanilla HTML, CSS, and JavaScript — no frontend framework or build system.
- **Design**: iOS-inspired UI with CSS custom properties for theming (light/dark mode via `data-theme` attribute on the root element).
- **Key Files**:
  - `index.html` — Single-page application entry point with all UI markup.
  - `css/style.css` — Complete styling with CSS variables for theme switching.
  - `js/main.js` — Application logic: payment method selection, transaction creation, QR code rendering, status polling, theme management.
  - `js/config.js` — Configuration file holding the Pakasir project slug, API key, available payment methods, fee structures, and PayPal exchange rates.
- **Libraries** (loaded via CDN):
  - Font Awesome 6.4.0 for icons
  - QRCode.js 1.5.1 for generating QR codes client-side
- **Theme**: Persisted in `localStorage` under key `vypay-theme`, falls back to system preference via `prefers-color-scheme`.

### Backend
- **Technology**: Node.js with Express.js (v4).
- **Purpose**: Acts as a thin API proxy between the frontend and Pakasir's API to avoid exposing API keys directly from the browser (though currently the API key is also stored in frontend config).
- **Key File**: `server.js`
- **Endpoints**:
  - `POST /api/create-transaction` — Proxies transaction creation to `https://app.pakasir.com/api/transactioncreate/{method}`. Accepts `method`, `amount`, `order_id`, `project`, and `api_key` in the request body.
  - `GET /api/transaction-status` — Proxies transaction status checks to Pakasir's API.
  - `GET /api/health` — Simple health check endpoint.
- **Static File Serving**: Express serves the frontend files from the project root directory.
- **Port**: Defaults to `process.env.PORT` or `5000`.

### Deployment
- **Vercel**: The project includes a `vercel.json` for deployment on Vercel, routing `/api/*` to the Express server and everything else to `index.html`.
- **Replit**: The app should run with `npm start` (or `npm run dev` for development with nodemon). The server serves both API and static files from a single process.

### Configuration Architecture
- Payment configuration lives in `js/config.js` as a global `VYPAY_CONFIG` object.
- The config includes the Pakasir project slug, API key placeholder, list of payment methods with their types (qris, va, paypal), fee schedule, and PayPal currency conversion rates.
- **Security concern**: The API key is currently stored in frontend code. For production, it should be moved to environment variables and only accessed server-side.

### Key Design Decisions
1. **No frontend framework**: Chosen for simplicity and fast load times. The UI is a single payment form, so a framework would be overkill.
2. **Express as API proxy**: Prevents CORS issues and provides a layer where API keys could be secured server-side.
3. **CSS custom properties for theming**: Enables instant light/dark mode switching without JavaScript class manipulation on individual elements.
4. **Indonesian language UI**: All user-facing text is in Bahasa Indonesia, matching the target market for Indonesian payment methods.

## External Dependencies

### Third-Party APIs
- **Pakasir Payment API** (`https://app.pakasir.com/api/`):
  - `POST /api/transactioncreate/{method}` — Creates a payment transaction. Returns QR string (for QRIS) or Virtual Account number.
  - Transaction status checking endpoint (referenced but implementation incomplete in server.js).
  - Requires a project slug and API key obtained from Pakasir dashboard.
  - Documentation available in `attached_assets/` folder.

### NPM Packages
- `express` (v4.18.2) — Web server framework
- `axios` (v1.6.0) — HTTP client for Pakasir API calls
- `cors` (v2.8.5) — CORS middleware
- `body-parser` (v1.20.2) — Request body parsing
- `nodemon` (v3.0.1, dev) — Auto-restart during development

### CDN Libraries
- Font Awesome 6.4.0 — Icon library
- QRCode.js 1.5.1 — Client-side QR code generation

### No Database
The application is stateless — it does not persist any data. All transaction state is managed by Pakasir's API. The frontend holds current transaction state in JavaScript variables during a session.