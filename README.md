# LocalSpace

**Your Business. Your Space. One Marketplace.**

LocalSpace is a marketplace platform designed to connect customers with service providers and small businesses through a single digital platform. It enables businesses to establish an online presence, showcase their products and services, and reach potential customers without the cost and complexity of building and maintaining a standalone website.

Customers can explore services, browse products, make bookings, and purchase items through the platform. By bringing business discovery and commerce into one place, LocalSpace aims to make digital opportunities more accessible to small businesses across Nigeria.

**Project Status:** In Development 🚧

## Features

### Customer Experience
- **Service Discovery:** Explore services offered by registered businesses on the platform.
- **Online Store:** Browse products from different sellers in one marketplace.
- **Business Profiles:** View business information, products, and available services.
- **Bookings:** Request and manage service bookings.
- **Online Payments:** Support digital payments for eligible orders and bookings through integrated payment options.
- **Customer Pages:** Dedicated sections for About, Market, Testimonials, and Contact.

### Seller Experience
- **Business Presence:** Establish an online storefront without building a separate website.
- **Seller Dashboard:** Three dedicated pages for My Products, My Services, and Business Info, linked by a shared tab bar.
- **Product Management:** Add, edit, and delete product listings with names, prices, stock quantities, and images. Stock badges show in stock, low stock, and out of stock.
- **Service Management:** Add, edit, and delete services with a description, price, availability, contact phone, location, social handle, and image.
- **Business Management:** Create and edit store details: name, description, category, phone, email, address, location, and logo.
- **Image Uploads:** Upload PNG, JPG, or WEBP images (up to 2 MB) for products, services, and the business logo.

### Platform Architecture
- **Role-Based Experiences:** Separate interfaces for Customers, Sellers, and Admins.
- **Authentication Interface:** A combined login and signup page at `/login`.
- **Role-Specific Navigation:** Dedicated customer and seller navigation bars.
- **Administrative Dashboard:** A separate interface for platform administration.
- **Shared Components:** Reusable UI components and a common footer.
- **REST API:** Create, read, update, and delete endpoints for products, services, and stores, with server-side validation.
- **Responsive Design:** Designed to support a consistent experience across desktop and mobile devices.

## Technology Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) | Full-stack web application framework (App Router and API route handlers) |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe application development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling and responsive UI |
| [PostgreSQL 18](https://www.postgresql.org/) | Relational database |
| [pgAdmin 4](https://www.pgadmin.org/) | Database administration |
| [Supabase](https://supabase.com/) | Authentication and user login|
| [lucide-react](https://lucide.dev/) | Icons |
| [react-phone-number-input](https://www.npmjs.com/package/react-phone-number-input) | Phone number fields |
| [Paystack](https://paystack.com/) | Planned payment processing integration |

| [Git](https://git-scm.com/) and [GitHub](https://github.com/) | Version control and collaboration |

## Getting Started

### Prerequisites

Ensure the following tools are installed:

- Node.js 18 or later, subject to the version required by the installed Next.js release
- npm
- PostgreSQL 18
- pgAdmin 4 (optional, for graphical database management)
- Git

### Installation

Clone the repository:

```bash
git clone https://github.com/testimonyokegbe-debug/local-space.git
cd local-space
```

Install the dependencies:

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/localspace"
```

### Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

The application is organized around customer-facing pages, seller functionality, administrative interfaces, API routes, and reusable components.

```text
local-space/
├── app/
│   ├── (main)/
│   │   ├── customer/        customer pages
│   │   ├── seller/
│   │   │   ├── products/    My Products page
│   │   │   ├── services/    My Services page
│   │   │   └── business/    Business Info page
│   │   └── store/           public store listing
│   ├── admin/
│   ├── api/
│   │   ├── products/        route.ts and [id]/route.ts
│   │   ├── services/        route.ts and [id]/route.ts
│   │   ├── stores/          route.ts and [id]/route.ts
│   │   └── uploads/         route.ts
│   └── login/
├── components/
│   ├── seller/              tab components, shared UI, upload helper
│   ├── CustomerNavbar
│   ├── SellerNavbar
│   └── Footer
├── lib/
│   ├── assets.ts
│   ├── db.ts                PostgreSQL connection pool
│   └── mockDb.ts            temporary in-memory storage
├── public/
│   └── uploads/             uploaded images (not committed)
├── .env.local
├── package.json
└── README.md
```

*The structure above reflects the current organization. Individual files and directories may evolve as development progresses.*

## Application Flow

```text
             LocalSpace
                 |
          Authentication
             /   |   \
            /    |    \
      Customer  Seller  Admin
         |        |       |
      Services   Store  Dashboard
         |        |       |
       Market   Products Administration
         |      Services
      Bookings  Business Info
         \        /
          Shared Platform
                 |
          Payments & Orders
```

Each role has a distinct experience tailored to its responsibilities. Customers discover and purchase offerings, sellers manage their businesses, and administrators oversee platform operations.

## API Reference

All endpoints return JSON. Invalid input returns `400` with an `error` message, and unknown ids return `404`.

| Resource | Method | Route | Description |
|---|---|---|---|
| Products | GET | `/api/products` | List all products |
| Products | POST | `/api/products` | Add a product |
| Products | GET, PUT, PATCH, DELETE | `/api/products/:id` | Get, replace, update fields, delete |
| Services | GET | `/api/services` | List all services |
| Services | POST | `/api/services` | Add a service |
| Services | GET, PUT, PATCH, DELETE | `/api/services/:id` | Get, replace, update fields, delete |
| Stores | POST | `/api/stores` | Create a store |
| Stores | GET, PUT, DELETE | `/api/stores/:id` | Get, edit, delete |
| Uploads | POST | `/api/uploads` | Upload an image (`multipart/form-data`, field `file`). Returns `{ "url": "/uploads/..." }` |

## Database

Stores are saved in PostgreSQL. The `stores` table has these columns:

| Column | Description |
|---|---|
| `id` | Primary key |
| `name` | Business name |
| `description` | Business description |
| `logo_url` | Path of the uploaded logo |
| `category` | Business category |
| `phone` | Business phone number |
| `email` | Business email |
| `address` | Street address |
| `location` | City and state |

Products and services are currently kept in memory (`lib/mockDb.ts`), so they reset when the development server restarts.

## Design System

LocalSpace uses a modern visual identity designed to feel accessible, consistent, and professional.

- **Primary — Deep Indigo:** `#1e1b4b`
- **Accent — Lavender:** `#c4b5fd`
- **Navigation:** Gold and lavender pill-style elements
- **Design approach:** Clean layouts, reusable components, and responsive interfaces

## Business Model

LocalSpace is designed to support a sustainable marketplace through two potential revenue streams:

- **Business subscriptions:** Paid plans that give sellers access to selected platform features and business benefits.
- **Transaction commissions:** Commissions on eligible product sales and service bookings.

The final pricing structure, subscription benefits, and commission rates will be determined as the platform develops.

## Roadmap

### Completed
- [x] Split the seller dashboard into separate Products, Services, and Business Info pages.
- [x] Build REST API routes for products, services, and stores with server-side validation.
- [x] Add image uploads for products, services, and business logos.
- [x] Connect the seller pages to the API.
- [x] Save store details to PostgreSQL.

### Marketplace Development
- [ ] Move products and services from in-memory storage to PostgreSQL with a `store_id` link.
- [ ] Display seller products in the customer-facing marketplace.
- [ ] Add an advert and showcase section to the store page.
- [ ] Implement business registration and profile management tied to the logged-in seller.
- [ ] Complete customer pages: About, Market, Testimonials, and Contact.
- [ ] Complete the seller storefront and business management experience.

### Transactions
- [ ] Implement the service booking workflow.
- [ ] Implement product ordering and order management.
- [ ] Integrate and test online payment processing.
- [ ] Implement subscription and transaction commission logic.

### Platform Improvements
- [ ] Complete the admin dashboard.
- [ ] Implement and test authentication and role-based authorization.
- [ ] Add ownership checks so sellers can only edit their own items.
- [ ] Complete responsive layouts across devices.
- [ ] Test core workflows and prepare for deployment.

## Security Considerations

- Store credentials and API secrets in environment variables.
- Enforce authentication and server-side role-based authorization.
- Validate user input on the server before saving it.
- Restrict uploads to PNG, JPG, and WEBP files under 2 MB.
- Verify payment transactions on the server before confirming orders or bookings.
- Protect customer, seller, and transaction data.
- Apply appropriate database constraints and error handling.

## Vision

To empower small businesses to participate in the digital economy by providing an accessible platform where they can establish an online presence, showcase their offerings, reach customers, and grow without needing to build their own websites.

LocalSpace aims to make online commerce simpler for businesses and more convenient for customers by bringing services, products, and transactions together in one marketplace.

## Author

**Testimony Okegbe**

- GitHub: [testimonyokegbe-debug](https://github.com/testimonyokegbe-debug)
- LinkedIn: [Testimony Okegbe](https://www.linkedin.com/in/testimony-okegbe-338175406/)

---

*LocalSpace is an independent software project currently under development.*
