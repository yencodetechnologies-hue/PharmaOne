require('dotenv').config()

const express      = require('express')
const cors         = require('cors')
const cookieParser = require('cookie-parser')
const helmet       = require('helmet')
const morgan       = require('morgan')

const connectDB = require('./config/db')

// ── Existing routes ─────────────────────────────────────────
const authRoutes       = require('./routes/authRoutes')
const clientRoutes     = require('./routes/clientRoutes')
const doctorRoutes     = require('./routes/doctorRoutes')
const employeeRoutes   = require('./routes/employeeRoutes')
const vendorRoutes     = require('./routes/vendorRoutes')
const auditorRoutes    = require('./routes/auditorRoutes')
const invoiceRoutes    = require('./routes/invoiceRoutes')
const branchRoutes     = require('./routes/branchRoutes')
const expenseRoutes    = require('./routes/expenseRoutes')
const dashboardRoutes  = require('./routes/dashboardRoutes')

// ── New routes ───────────────────────────────────────────────
const hostRoutes        = require('./routes/hostRoutes')
const transactionRoutes = require('./routes/transactionRoutes')
const orderRoutes       = require('./routes/orderRoutes')
const estimationRoutes  = require('./routes/estimationRoutes')
const deliveryRoutes    = require('./routes/deliveryRoutes')

// ── Multi-role auth & branch portal ──────────────────────────
const multiAuthRoutes    = require('./routes/multiAuthRoutes')
const branchPortalRoutes = require('./routes/branchPortalRoutes')
const productRouter= require('./routes/productRoutes')

// ── Master routes ────────────────────────────────────────────
const { categoryRouter, brandRouter, paymentModeRouter, treatmentRouter } = require('./routes/masterRoutes')

connectDB()

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
]

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
}))

app.use(helmet())
app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// ── Existing API routes ──────────────────────────────────────
app.use('/api/auth',       authRoutes)
app.use('/api/clients',    clientRoutes)
app.use('/api/doctors',    doctorRoutes)
app.use('/api/employees',  employeeRoutes)
app.use('/api/vendors',    vendorRoutes)
app.use('/api/auditors',   auditorRoutes)
app.use('/api/invoices',   invoiceRoutes)
app.use('/api/branches',   branchRoutes)
app.use('/api/expenses',   expenseRoutes)
app.use('/api/dashboard',  dashboardRoutes)
app.use('/api/products', require('./routes/productRoutes'))


// ── New API routes ───────────────────────────────────────────
app.use('/api/hosts',         hostRoutes)
app.use('/api/transactions',  transactionRoutes)
app.use('/api/orders',        orderRoutes)
app.use('/api/estimations',   estimationRoutes)
app.use('/api/deliveries',    deliveryRoutes)

// ── Multi-role auth & branch portal ──────────────────────────
app.use('/api/multi-auth',     multiAuthRoutes)
app.use('/api/branch-portal',  branchPortalRoutes)

// ── Master routes ────────────────────────────────────────────
app.use('/api/categories',    categoryRouter)
app.use('/api/brands',        brandRouter)
app.use('/api/payment-modes', paymentModeRouter)
app.use('/api/products',      productRouter)
app.use('/api/treatments',    treatmentRouter)

app.get('/', (req, res) => res.send('PharmaOne API Running ✅'))

const PORT = process.env.PORT || 7004
app.listen(PORT, () => {
  console.log(`🚀 PharmaOne Server running on port ${PORT}`)
})
