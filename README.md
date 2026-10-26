# Barista Lab — Specialty Coffee Roastery & Pastry Platform

> **Live Demo:** [https://barista-lab.vercel.app/](https://barista-lab.vercel.app/)  
> **Created by:** Kasorn Leelapisuth (Kay)

Barista Lab is a full-stack e-commerce storefront, online pre-order system, and store management platform built for a modern specialty coffee roastery and artisan dessert kitchen. The application combines a 5-page customer-facing interface with a passcode-authenticated Kitchen Display System (KDS), dynamic photo & menu management, and an applicant tracking system (ATS).

---

## Key Features

### Customer Experience
- **5-Page Storefront:**
  - `Home`: Curated highlights, sensory extraction parameters, customer testimonials, and venue hours.
  - `Menu & Pre-Order`: Real-time inventory browsing with milk/temperature customization.
  - `Coffee Sweets Showcase`: Dedicated tasting lounge for desserts infused with single-origin espresso extractions (Mille-Feuille, Basque Burnt Cheesecake, Canelés).
  - `Work With Us`: Integrated career portal with applicant submission flows.
  - `Our Story`: Provenance notes, origin sourcing (Ethiopian Yirgacheffe, Colombia Huila), and founder spotlight.
- **Express Pre-Order Engine:** Select custom milk alternatives (Minor Figures Oat, Bonsoy, Full Cream) and pickup times.
- **Thermal Receipt Generator:** Automatically generates a café-style itemized tax docket with GST breakdown, order barcodes, and one-click PDF printing (`window.print()`).

### Staff & Store Manager Portal (`Passcode: barista123`)
- **Live Kitchen Display System (KDS):** Real-time incoming orders with stage progressions (`Pending` ➔ `Ready` ➔ `Completed`).
- **Dynamic Menu & Photo Management:** Full CRUD operations allowing staff to add new items, modify pricing/descriptions, or upload real photos directly from their device (stored via Base64/URI).
- **Applicant Tracking System (ATS):** Review candidate applications, availability schedules, contact information, and hospitality experience.

---

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Database:** Serverless PostgreSQL hosted on [Neon](https://neon.tech/)
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Deployment:** [Vercel](https://vercel.com/)

---

## Database Architecture

The application uses Prisma to manage three primary models in Neon PostgreSQL:

- `MenuItem`: Handles item titles, categories, pricing, availability toggles, and base64/URI photo storage.
- `Order`: Stores generated docket numbers, customer details, pickup schedules, total amounts, and serialized item specifications.
- `Application`: Tracks job applicant profiles, role titles, contact records, weekly availability, and experience summaries.

```prisma
model MenuItem {
  id            String   @id @default(cuid())
  name          String
  category      String
  price         Float
  description   String   @db.Text
  image         String   @db.Text
  isCoffeeSweet Boolean  @default(false)
  isAvailable   Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
}

model Order {
  id           String      @id @default(cuid())
  orderNumber  String      @unique
  customerName String
  phone        String
  pickupTime   String
  total        Float
  itemsJson    String      @db.Text
  status       OrderStatus @default(PENDING)
  createdAt    DateTime    @default(now())
}

model Application {
  id           String          @id @default(cuid())
  roleTitle    String
  name         String
  email        String
  phone        String
  availability String
  experience   String          @db.Text
  status       ApplicantStatus @default(NEW)
  createdAt    DateTime        @default(now())
}
```

---

## Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/Kasorn-Leelapisuth/barista-lab.git](https://github.com/Kasorn-Leelapisuth/barista-lab.git)
   cd barista-lab
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx-pooler.ap-southeast-2.aws.neon.tech/neondb?sslmode=require"
   DIRECT_URL="postgresql://neondb_owner:YOUR_PASSWORD@ep-xxx.ap-southeast-2.aws.neon.tech/neondb?sslmode=require"
   NEXTAUTH_SECRET="your-random-secret"
   ```

4. **Sync Schema & Seed Starter Data:**
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```

5. **Start Dev Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` to view the app.

---

## Staff Portal Access (Demo)

To test administrative features on the live site:
1. Click **Staff Login** in the upper right header.
2. Enter the demo passcode: `barista123`
3. Manage live orders, upload menu photos, or add/delete menu items.
