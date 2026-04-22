# FreshMongers - Online Fish Selling Platform

A complete full-stack e-commerce platform for selling fresh fish online in Trivandrum with manual payment verification and WhatsApp integration.

## 📋 Features

### Customer Features
- ✅ Product listing with filtering and search
- ✅ Add to cart functionality
- ✅ Manual UPI/GPay/Bank Transfer payment
- ✅ Payment screenshot verification
- ✅ WhatsApp order confirmation integration
- ✅ Order history and tracking
- ✅ Product reviews and ratings
- ✅ Support ticket system
- ✅ Address management

### Admin Features
- ✅ Product management (CRUD)
- ✅ Order management and tracking
- ✅ Manual payment verification
- ✅ Coupon management
- ✅ Dashboard analytics
- ✅ Customer management
- ✅ Support ticket management

## 🏗️ Project Structure

```
FreshMongers/
├── backend/                 # Node.js + Express API
│   ├── config/             # Database config
│   ├── routes/             # API routes
│   ├── controllers/        # Route handlers
│   ├── middleware/         # Auth & validation
│   ├── utils/              # Utilities & helpers
│   ├── index.js            # Main server file
│   ├── package.json
│   └── .env.example
├── frontend/               # Next.js application
│   ├── src/
│   │   ├── app/           # Pages (app router)
│   │   ├── components/    # React components
│   │   ├── styles/        # Global CSS
│   │   └── utils/         # Helpers & store
│   ├── public/            # Static files
│   ├── package.json
│   └── .env.example
├── db/
│   └── schema.sql         # MySQL database schema
└── README.md
```

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MySQL 5.7+
- npm or yarn

### 1. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Run schema file
source db/schema.sql

# Or paste the SQL directly
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your credentials
nano .env

# Start server
npm run dev  # Development
npm start    # Production
```

**Backend running on:** `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file
cp .env.example .env.local

# Edit environment variables
nano .env.local

# Start development server
npm run dev
```

**Frontend running on:** `http://localhost:3000`

## 🔧 Environment Variables

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=freshmongers_db
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:3000

# Firebase
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_PRIVATE_KEY=your_key
FIREBASE_CLIENT_EMAIL=your_email

# Payment
PAYMENT_UPI_ID=freshmongers@upi
PAYMENT_BANK_ACCOUNT=1234567890
PAYMENT_BANK_IFSC=SBIN0001234

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_name
NEXT_PUBLIC_WHATSAPP_NUMBER=919999999999
NEXT_PUBLIC_UPI_ID=freshmongers@upi
```

## 📚 API Documentation

### Authentication
- `POST /api/auth/customer/register` - Register/Login customer
- `POST /api/auth/admin/login` - Admin login
- `GET /api/auth/verify` - Verify token

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product details
- `GET /api/products/categories/list` - Get all categories

### Cart
- `POST /api/cart/validate` - Validate cart item
- `POST /api/cart/validate-coupon` - Validate coupon

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders` - Get customer orders
- `GET /api/orders/:orderId` - Get order details

### Payments
- `POST /api/payments/upload-screenshot` - Upload payment proof
- `GET /api/payments/order/:orderId` - Get payment info

### Admin Routes (Protected)
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `GET /api/admin/orders` - Get all orders
- `PATCH /api/admin/orders/:id/status` - Update order status
- `PATCH /api/admin/payments/:id/verify` - Verify payment
- `POST /api/admin/coupons` - Create coupon
- `GET /api/admin/dashboard/stats` - Get dashboard stats

## 🎨 Design System

### Colors
- **Primary Blue**: #0066CC
- **Accent Yellow**: #FFD700
- **Coral**: #FF6B6B
- **Teal**: #4ECDC4

### Typography
- **Headings**: Quicksand (Bold)
- **Body**: Plus Jakarta Sans (Medium)

### Components
- Border Radius: 2.5rem - 4rem
- Button Style: 3D Pressable
- Transitions: cubic-bezier(0.175, 0.885, 0.32, 1.275)

## 📱 Payment Integration

### Supported Methods
1. **UPI** - Direct UPI link generation
2. **GPay** - WhatsApp integration
3. **Bank Transfer** - Manual verification

### Payment Flow
1. Customer uploads payment screenshot
2. Admin verifies screenshot
3. Order status updated
4. Confirmation via WhatsApp

## 🔐 Authentication

- **Firebase Phone OTP** - For customers
- **JWT Tokens** - For session management
- **Role-based Access** - Admin/Customer

## 📦 Database Schema

### Main Tables
- `customers` - Customer profiles
- `products` - Product catalog
- `orders` - Customer orders
- `order_items` - Order line items
- `payments` - Payment records
- `addresses` - Delivery addresses
- `feedback` - Product reviews
- `support_tickets` - Customer support
- `coupons` - Discount codes
- `admin_users` - Admin staff

## 🚀 Deployment

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Heroku (Backend)
```bash
heroku login
heroku create app-name
git push heroku main
```

### Database
Use AWS RDS or Digital Ocean MySQL

## 🧪 Testing

### API Testing with cURL
```bash
# Login
curl -X POST http://localhost:5000/api/auth/customer/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"9999999999","name":"Test User"}'

# Get products
curl http://localhost:5000/api/products

# Create order (with token)
curl -X POST http://localhost:5000/api/orders \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

## 📝 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": []
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License - feel free to use this project

## 📞 Support

For support, email: support@freshmongers.com

---

**Built with ❤️ for fresh fish lovers in Trivandrum**
