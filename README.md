# Tappy — Global Top-ups & Gift Cards Platform

A SaaS platform for global mobile top-ups, gift cards, and wallet management.

## Tech Stack

- **Backend**: Laravel 13 (PHP 8.4)
- **Frontend**: React 19 + Inertia.js + Vite + TypeScript
- **Database**: PostgreSQL (Supabase)
- **Storage**: Supabase Storage (S3-compatible)
- **Auth**: Laravel Fortify + Supabase Auth (email/phone verification NOT required)
- **Styling**: Tailwind CSS 4 + shadcn/ui

## Features

- Multi-currency wallets (Base: YER, Additional: SAR, USD)
- Mobile airtime & data top-ups (Reloadly, DingConnect, DT One)
- Gift card distribution (Tremendous, Tillo, Giftbit, Tango)
- Stripe payment processing
- Reseller & business accounts with tier system
- Admin dashboard with audit logs, KYC, risk management
- Webhooks & API keys for developers
- Bulk batch operations
- AI copilot for transactions
- Support ticket system
- Real-time notifications

## Currency Configuration

The platform uses **YER (Yemeni Rial)** as the base currency with **SAR (Saudi Riyal)** and **USD (US Dollar)** as additional supported currencies.

All amounts are stored as integer minor units in the base currency (YER). Conversions use the rates defined in `config/currency.php`:

| Currency | Decimals | Symbol | Rate (from YER) |
|----------|----------|--------|------------------|
| YER      | 0        | ر.ي    | 1.0              |
| SAR      | 2        | ر.س    | 0.037            |
| USD      | 2        | $      | 0.0099           |

## Supabase Setup

The project is configured to use Supabase for:

1. **PostgreSQL database** — Connection via Supabase pooler (port 6543)
2. **Storage buckets** — `public-assets`, `avatars`, `kyc-documents`, `tickets`, `documents`
3. **Auth** — Email/phone auto-confirm enabled (verification not mandatory)
4. **Row Level Security** — All tables have RLS policies

### Database Schema

30+ tables including: `users`, `wallets`, `transactions`, `recipients`, `customers`, `commission_rules`, `payments`, `tickets`, `audit_logs`, `api_keys`, `webhook_events`, `kyc_documents`, and more.

### Demo Accounts

| Role     | Email                  | Password |
|----------|------------------------|----------|
| Admin    | admin@tappy.test       | password |
| Business | business@tappy.test    | password |
| Reseller | reseller@tappy.test    | password |
| Customer | customer@tappy.test    | password |

## Local Development

```bash
# Install dependencies
composer install
npm install

# Configure environment
cp .env.example .env
php artisan key:generate

# Run database migrations
php artisan migrate --force
php artisan db:seed --force

# Build frontend assets
npm run build

# Start development server
php artisan serve
```

## GitHub Actions

This repository includes CI/CD workflows:

- **CI** (`.github/workflows/ci.yml`) — Lint, test, security audit on every push
- **Build Admin** (`.github/workflows/build-admin.yml`) — Build & deploy admin dashboard
- **Build User** (`.github/workflows/build-user.yml`) — Build & deploy user dashboard

## License

MIT
