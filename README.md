# AI Review Generator

A Next.js application that uses Google's Gemini AI to generate personalized customer reviews based on business and customer information.

## Features

- **3-Step Flow**:
  1. Business Information (name, type, description)
  2. Customer Information (purchase details, satisfaction, behavioral insights)
  3. AI-Generated Review with WhatsApp Deep Link

- **AI-Powered**: Uses Google Gemini API to generate authentic, personalized reviews
- **No WhatsApp/SMS Integration**: Just generates reviews and provides a WhatsApp deep link
- **Modern UI**: Clean, mobile-first design with step indicators

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Google Gemini AI API
- Prisma ORM
- PostgreSQL

## Getting Started

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
```

### 2. Set Up Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_API_KEY` - Get from https://makersuite.google.com/app/apikey

### 3. Set Up Database

```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## How It Works

1. **Step 1**: Enter business information
2. **Step 2**: Enter detailed customer information including:
   - Customer name and phone
   - What they purchased and how often
   - Satisfaction ratings (1-10)
   - Shopping motivation and preferences
   - Price sensitivity and brand loyalty
3. **Step 3**: AI generates a personalized review based on all inputs
4. **Share**: Click the WhatsApp button to share the review

## API Routes

- `POST /api/generate-review` - Generate AI review using Gemini

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `GOOGLE_API_KEY` | Google Gemini API key | Yes |
| `APP_URL` | Your app base URL | No (default: http://localhost:3000) |
| `BUSINESS_WHATSAPP_NUMBER` | Optional business WhatsApp for deep links | No |

## License

MIT
