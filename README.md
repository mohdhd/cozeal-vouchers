# Cozeal Vouchers

A sales platform for CompTIA certification exam vouchers, built for Saudi Arabian universities.

## Features

- 🎫 CompTIA exam voucher sales (Security+ and more)
- 🌐 Bilingual support (Arabic & English with RTL)
- 💳 Tap.company payment gateway integration
- 🧾 PDF invoice generation
- 🏷️ Discount code system
- 👨‍💼 Admin dashboard for orders, discounts, and settings
- 📱 Responsive design

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: NextAuth.js v5
- **Styling**: Tailwind CSS + shadcn/ui
- **Payments**: Tap.company
- **i18n**: next-intl
- **PDF**: @react-pdf/renderer

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB database (local or MongoDB Atlas)
- Tap.company account for payments

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd cozeal-sales
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp env.example .env
# Edit .env with your values
```

4. Run database seed (creates admin user):
```bash
npm run db:seed
```

5. Start development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Default Admin CredentialsßAfter running the seed script:
- **Email**: admin@cozeal.ai
- **Password**: Cz@Admin#2026!Secure

⚠️ **IMPORTANT**: Change the admin password after first login!

## Docker Deployment

### Quick Start (First-Time Setup)

1. Configure environment:
```bash
cp env.example .env
# Edit .env with production values
```

2. Initialize and start (builds, starts, and seeds):
```bash
./docker-deploy.sh init

# For production:
./docker-deploy.sh init prod
```

This will:
- Build the Docker image
- Start containers (app + MongoDB)
- Seed the database with admin account and settings

### Deployment Script Commands

```bash
./docker-deploy.sh init       # First-time setup (build, start, seed)
./docker-deploy.sh build      # Build Docker image
./docker-deploy.sh start      # Start containers
./docker-deploy.sh stop       # Stop containers
./docker-deploy.sh restart    # Restart containers
./docker-deploy.sh logs       # View logs
./docker-deploy.sh logs-app   # View app logs only
./docker-deploy.sh logs-mongo # View MongoDB logs only
./docker-deploy.sh status     # Show status
./docker-deploy.sh seed       # Run database seed
./docker-deploy.sh shell      # Open shell in container
./docker-deploy.sh mongo-shell# Open MongoDB shell
./docker-deploy.sh backup     # Create MongoDB backup
./docker-deploy.sh clean      # Remove everything
```

Add `prod` to any command to use production configuration:
```bash
./docker-deploy.sh start prod
./docker-deploy.sh logs prod
```

### Production Deployment

For production with HTTPS, use system-level Nginx as a reverse proxy:

```bash
# Start containers on port 3000
./docker-deploy.sh start prod

# Configure system Nginx to proxy to localhost:3000
```

The production compose file (`docker-compose.prod.yml`) exposes the app on port 3000.
Configure your system's Nginx with SSL and proxy to `localhost:3000`.

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | MongoDB connection string |
| `NEXTAUTH_SECRET` | Random secret for NextAuth (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Your app URL (e.g., https://vouchers.cozeal.com) |
| `TAP_SECRET_KEY` | Tap.company secret key |
| `TAP_PUBLIC_KEY` | Tap.company public key |
| `NEXT_PUBLIC_APP_URL` | Public app URL for payment redirects |

## Project Structure

```
├── app/
│   ├── [locale]/          # Localized pages (en, ar)
│   ├── admin/             # Admin dashboard
│   └── api/               # API routes
├── components/
│   ├── admin/             # Admin components
│   ├── checkout/          # Checkout form
│   ├── home/              # Landing page sections
│   ├── invoice/           # PDF invoice
│   ├── layout/            # Header, footer
│   └── ui/                # shadcn/ui components
├── dictionaries/          # Translations (en.json, ar.json)
├── i18n/                  # Internationalization config
├── lib/                   # Utilities and database
│   ├── models/            # Mongoose models
│   ├── auth.ts            # NextAuth config
│   ├── db.ts              # Database connection
│   └── pricing.ts         # Pricing calculations
└── scripts/               # Database seed
```

## API Endpoints

### Public
- `POST /api/discount/validate` - Validate discount code
- `POST /api/payment/create-charge` - Create payment
- `POST /api/payment/webhook` - Tap webhook
- `GET /api/invoice/[orderId]/pdf` - Download invoice

### Admin (Protected)
- `GET/POST /api/admin/discounts` - Manage discounts
- `GET/PUT/DELETE /api/admin/discounts/[id]` - Single discount
- `GET/PUT /api/settings` - App settings

## License

Private - All rights reserved
