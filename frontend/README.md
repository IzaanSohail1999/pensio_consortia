# Pensio Consortia Frontend

A production-ready Next.js application with comprehensive security features, authentication, and geolocation capabilities.

## 🚀 Features

- **Authentication & Authorization**: JWT-based auth with role-based access control
- **Security**: Input validation, rate limiting, XSS protection, security headers
- **Geolocation**: IP-based location detection with multiple fallback services
- **Admin Panel**: User management, geolocation settings, transaction monitoring
- **User Portal**: Tenant and landlord dashboards with payment tracking
- **Production Ready**: Environment validation, logging, monitoring, and deployment guides

## 🔒 Security Features

- ✅ JWT authentication with secure secret validation
- ✅ Input validation and sanitization
- ✅ Rate limiting and abuse prevention
- ✅ XSS and SQL injection protection
- ✅ Security headers (HSTS, X-Frame-Options, etc.)
- ✅ Environment variable validation
- ✅ Production debug endpoint protection

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with TypeScript
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT with bcrypt password hashing
- **Styling**: Tailwind CSS
- **Validation**: Custom input validation with sanitization
- **Logging**: Structured logging with production support

## 📋 Prerequisites

- Node.js 18+ 
- npm 8+
- MongoDB instance

## 🚀 Getting Started

### 1. Clone and Install
```bash
git clone <repository-url>
cd frontend
npm install
```

### 2. Environment Setup
Create a `.env.local` file:
```bash
# Required
JWT_SECRET=your_super_secret_jwt_key_at_least_32_characters_long_for_security
MONGO_URI=mongodb://localhost:27017/your_database_name

# Optional
NODE_ENV=development
LOG_LEVEL=debug
```

### 3. Development
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## 📚 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run type-check` - TypeScript type checking
- `npm run analyze` - Bundle analysis
- `npm run security-check` - Security audit

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── middleware/         # API middleware (auth, rate limiting)
├── pages/              # Next.js pages and API routes
│   ├── api/           # API endpoints
│   ├── admin/         # Admin panel pages
│   └── user/          # User portal pages
├── utils/              # Utility functions
└── styles/             # Global styles and CSS modules
```

## 🔐 API Endpoints

### Public
- `POST /api/users/login` - User authentication
- `POST /api/users/register` - User registration
- `POST /api/admin/login` - Admin authentication
- `POST /api/admin/register` - Admin registration

### Protected (Require JWT)
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/geolocation` - Update geolocation settings
- `GET /api/invoices/*` - Invoice management
- `GET /api/geolocation/check` - Check user location

## 🌍 Geolocation Features

- IP-based location detection
- Multiple fallback geolocation services
- Country-based access restrictions
- Admin-configurable blocked countries
- Testing and debugging tools

## 🚀 Production Deployment

See [PRODUCTION.md](./PRODUCTION.md) for comprehensive deployment instructions, security considerations, and monitoring setup.

## 🧪 Testing

```bash
# Run security audit
npm run security-check

# Test rate limiting
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test"}'
```

## 📊 Monitoring & Logging

- Structured logging with different levels
- Production-ready error handling
- Rate limiting monitoring
- Security event logging

## 🤝 Contributing

1. Follow the existing code style
2. Add tests for new features
3. Update documentation
4. Ensure security best practices

## 📄 License

This project is proprietary software. All rights reserved.

## 🆘 Support

For issues and questions:
1. Check the [PRODUCTION.md](./PRODUCTION.md) guide
2. Review application logs
3. Contact the development team

---

**Status**: ✅ Production Ready with Security Hardening
