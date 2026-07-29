# Mini ERP + CRM Operations Portal

A full-stack, production-ready ERP and CRM application designed for modern operations management. This portal provides seamless control over inventory, stock movements, customer relationships (leads and accounts), and order fulfillment through automated PDF challan generation.

**Live Demo:** [https://erp-crm-operations-portal-15ei05new-xenithriders-projects.vercel.app](https://erp-crm-operations-portal-15ei05new-xenithriders-projects.vercel.app)

##  Features

- **Modern Glassmorphism UI:** A premium, fully responsive React interface with interactive components and dark-mode styling.
- **Customer CRM:** Manage leads and active accounts, track follow-up dates, and maintain interaction histories.
- **Inventory Management:** Track current vs. minimum stock levels, record IN/OUT stock movements, and automatically alert on low stock.
- **Order Fulfillment:** Generate draft orders, confirm them to automatically deduct inventory, and instantly generate downloadable PDF invoices/challans.
- **AWS S3 Image Support:** Attach cloud-hosted images to inventory products.
- **Role-Based Access Control:** Secure JWT authentication with distinct permission levels (Admin, Sales, Warehouse, Accounts).

##  Tech Stack

- **Frontend:** React (TypeScript), Vite, Tailwind CSS, Lucide React (Icons).
- **Backend:** Node.js, Express, JSON Web Tokens (JWT), PDFKit.
- **Database:** MySQL (mysql2 driver) hosted on Aiven.
- **Cloud Infrastructure:**
  - Backend API: Render
  - Database: Aiven MySQL
  - Object Storage (Images): AWS S3
  - Frontend: Vercel / Render Static Sites

---

##  Project Structure

This is a monorepo containing both the frontend and backend environments:

```
FundsRoom-Assignment/
├── Backend/                 # Node.js/Express API
│   ├── database/            # MySQL Schema and Seed scripts
│   ├── src/                 # Controllers, Routes, and Services
│   └── .env                 # Backend environment variables
└── Frontend/                # Vite React Application
    ├── src/                 # React components, contexts, and API services
    └── .env                 # Frontend environment variables
```

---

##  Local Setup Instructions

### Prerequisites
- Node.js (v18+)
- MySQL (v8.0+) (If running the database locally instead of using Aiven)

### 1. Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd Backend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Configure the Environment Variables:
   Create a `.env` file in the `Backend` directory (or use the existing one) with the following variables:
   ```env
   PORT=5000
   NODE_ENV=development
   
   # Database (Local or Cloud)
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=mini_erp_crm
   DB_SSL=false # Set to true if using Aiven/Cloud MySQL
   
   # Authentication
   JWT_SECRET=your_super_secret_key
   JWT_EXPIRES_IN=1d
   CORS_ORIGIN=*
   
   # AWS S3 (Optional for product images)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=eu-north-1
   AWS_S3_BUCKET=mini-crm-images
   ```
4. Run the database migrations (if setting up locally for the first time). Import `database/schema.sql` and `database/seed.sql` into your MySQL server.
5. Start the backend development server:
   ```bash
   npm run dev
   ```
   *(The server will start on `http://localhost:5000`)*

### 2. Frontend Setup

1. Open a **new** terminal window and navigate to the frontend directory:
   ```bash
   cd Frontend
   ```
2. Install the required Node dependencies:
   ```bash
   npm install
   ```
3. Configure the Environment Variables:
   Create a `.env` file in the `Frontend` directory with the following variables:
   ```env
   # Point this to your local backend, or your live Render backend URL
   VITE_API_BASE_URL=http://localhost:5000/api
   
   # Set to true to use offline mock data, or false to use the real database
   VITE_USE_MOCK=false
   ```
4. Start the frontend development server:
   ```bash
   npm run dev
   ```
   *(The app will start on `http://localhost:5173`)*

---

##  Default Login Credentials

If you ran the provided `database/seed.sql` file, the following demo accounts are available to test the role-based functionality:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@example.com` | `Password123!` |
| **Sales** | `sales@example.com` | `Password123!` |
| **Warehouse** | `warehouse@example.com` | `Password123!` |
| **Accounts** | `accounts@example.com` | `Password123!` |

---

##  Cloud Deployment Configuration

This project is configured to be easily deployed to modern cloud platforms:

- **Frontend (Vercel):** Set Root Directory to `Frontend`. Build Command: `npm run build`, Output Directory: `dist`. Provide the `VITE_API_BASE_URL` environment variable.
- **Backend (Render):** Set Root Directory to `Backend`. Build Command: `npm install`, Start Command: `node src/server.js`. Provide all backend `.env` keys in the Render dashboard.
