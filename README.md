# PharmaOne — Your Health, Our Priority
A full MERN stack pharmacy management system with green theme and cross (+) branding.

## Project Structure
```
pharmaone/
├── backend/              # Node.js + Express + MongoDB
│   ├── config/           # DB & Cloudinary config
│   ├── controllers/      # One controller per module
│   ├── middleware/        # Auth middleware (protect, adminOnly, etc.)
│   ├── models/           # Mongoose schemas
│   ├── routes/           # One route file per module
│   ├── utils/            # JWT token generator
│   ├── .env              # Environment variables
│   └── server.js         # Entry point
└── frontend/             # React + Vite
    └── src/
        ├── components/   # Auth context, UI components
        ├── layouts/      # AdminLayout with sidebar
        ├── pages/        # Login, Register, Dashboard, all CRUD pages
        ├── services/     # Axios API service
        └── styles/       # Global CSS with green theme
```

## Roles
- **Admin** — Register & login, manage all modules
- **Superadmin** — Full permissions including managing other admins
- **Doctor** — stored in Doctors collection with full profile
- **Client (Patient)** — with xray, audio, video files, treatment details
- **Employee (Staff)** — Aadhar, PAN, license, salary
- **Vendor** — Distributor with products, bank details, drug license
- **Auditor** — With firm details, audit type, assigned branches

## Sidebar Modules
Dashboard → Branch → Client → Doctor → Staff → Vendor → Auditor → Invoice → Expense

## Setup

### Backend
```bash
cd backend
npm install
# Edit .env with your MongoDB URI, JWT secret, Cloudinary credentials
npm run dev     # starts on port 5000
```

### Frontend
```bash
cd frontend
npm install
npm run dev     # starts on port 5173
```

## API Endpoints
| Module    | Base URL           |
|-----------|-------------------|
| Auth      | POST /api/auth/register, /api/auth/login |
| Dashboard | GET /api/dashboard/stats |
| Branches  | CRUD /api/branches |
| Clients   | CRUD /api/clients |
| Doctors   | CRUD /api/doctors |
| Employees | CRUD /api/employees |
| Vendors   | CRUD /api/vendors |
| Auditors  | CRUD /api/auditors |
| Invoices  | CRUD /api/invoices |
| Expenses  | CRUD /api/expenses |

## Invoice Fields
invoiceNo (auto), companyType, client, totalAmount, paidAmount, balanceAmount (auto), paymentMode, transaction, softCopy, comments

## Environment Variables (.env)
```
MONGO_URI=mongodb://...
JWT_SECRET=your_secret
PORT=5000
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```
"# PharmaOne" 
