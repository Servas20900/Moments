#!/bin/bash

echo "Setting up Moments Backend..."

# Install dependencies
echo "Installing npm packages..."
npm install

# Create .env file from template
echo "Setting up environment variables..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo ".env file created. Please update DATABASE_URL and JWT_SECRET"
fi

# Setup Prisma
echo "Setting up Prisma..."
npx prisma generate
npx prisma db push --skip-generate

# Create initial seed (optional)
echo "Running seed script (optional)..."
# npx prisma db seed

echo "Backend setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your database URL and JWT secret"
echo "2. Run: npm run start:dev"
echo "3. Access API docs at http://localhost:3000/api/docs"
