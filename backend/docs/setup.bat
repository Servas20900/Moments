#!/bin/bash

echo "Moments Backend Setup for Windows..."
echo ""

# Install dependencies
echo "Installing npm packages..."
npm install

# Create .env file from template
echo "Setting up environment variables..."
if not exist .env (
  copy .env.example .env
  echo ".env file created. Please update DATABASE_URL and JWT_SECRET"
)

# Setup Prisma
echo "Setting up Prisma..."
npx prisma generate
npx prisma db push --skip-generate

echo "Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database URL and JWT secret"
echo "2. Run: npm run start:dev"
echo "3. Access API docs at http://localhost:3000/api/docs"
