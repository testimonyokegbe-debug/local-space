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
- **Product Management:** Add, edit, and delete product listings.
- **Product Information:** Manage product names, prices, quantities, and images.
- **Business Management:** Maintain business information and showcase offerings.
- **Service Listings:** Present services to potential customers.
- **Centralized Management:** Manage products and business information from the seller interface.

### Platform Architecture
- **Role-Based Experiences:** Separate interfaces for Customers, Sellers, and Admins.
- **Authentication Interface:** A combined login and signup page at `/login`.
- **Role-Specific Navigation:** Dedicated customer and seller navigation bars.
- **Administrative Dashboard:** A separate interface for platform administration.
- **Shared Components:** Reusable UI components and a common footer.
- **Responsive Design:** Designed to support a consistent experience across desktop and mobile devices.

*Feature availability depends on implementation progress. Features listed here are part of the product scope and are not necessarily fully functional yet.*

## Technology Stack

| Technology | Purpose |
|---|---|
| [Next.js](https://nextjs.org/) | Full-stack web application framework |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe application development |
| [Tailwind CSS](https://tailwindcss.com/) | Utility-first styling and responsive UI |
| [PostgreSQL 18](https://www.postgresql.org/) | Relational database |
| [pgAdmin 4](https://www.pgadmin.org/) | Database administration |
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

Replace `USER` and `PASSWORD` with your PostgreSQL credentials and ensure that the `localspace` database exists.

Add payment-related environment variables only when configuring the payment integration. Never commit secret keys or production credentials to the repository.

### Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

The application is organized around customer-facing pages, seller functionality, administrative interfaces, and reusable components.

```text
local-space/
├── app/
│   ├── (main)/          
│   ├── seller/          
│   ├── admin/          
│   └── login/          
├── components/
│   ├── CustomerNavbar
│   ├── SellerNavbar
│   ├── Footer
│   └── UI components
├── lib/
│   └── assets.ts        
├── public/              
├── .env.local          
├── package.json
└── README.md
```

*The structure above reflects the current intended organization. Individual files and directories may evolve as development progresses.*

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
         |        |
      Bookings Business Info
         \        /
          Shared Platform
                 |
          Payments & Orders
```

Each role has a distinct experience tailored to its responsibilities. Customers discover and purchase offerings, sellers manage their businesses, and administrators oversee platform operations.

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

### Marketplace Development
- [ ] Connect seller product management to PostgreSQL.
- [ ] Display seller products in the customer-facing marketplace.
- [ ] Implement business registration and profile management.
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
- [ ] Complete responsive layouts across devices.
- [ ] Validate inputs and secure database operations.
- [ ] Test core workflows and prepare for deployment.

## Security Considerations

- Store credentials and API secrets in environment variables.
- Enforce authentication and server-side role-based authorization.
- Validate user input before database operations.
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
