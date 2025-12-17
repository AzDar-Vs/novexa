# NOVEXA Backend Setup Guide

## Prerequisites
- Node.js 16+ & npm
- MySQL 8+
- Git

## Installation

1. **Clone Repository**
```bash
git clone <repository-url>
cd backend

install dependencies
npm install

cp .env.example .env
# Edit .env with your database credentials

# Create database
mysql -u root -p
CREATE DATABASE novexa_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Run migrations
npm run migrate

# Run seeders (optional)
npm run seed

Run dev
npm run dev

Testing
# Run tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test
npm test -- tests/auth.test.js

Deployment
# Install production dependencies
npm ci --only=production

# Build (if using TypeScript/Babel)
npm run build

# Start production server
npm start

PM2 Setup
# Install PM2 globally
npm install -g pm2

# Start with PM2
pm2 start server.js --name novexa-api

# Save process list
pm2 save

# Setup startup script
pm2 startup

Monitoring
API Docs: /api-docs

Health Check: /health

Logs: logs/ directory