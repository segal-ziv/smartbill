#!/bin/bash
set -e

echo "🚀 Running Prisma migrate deploy..."
echo "   (Prisma will automatically skip already-applied migrations)"

# Run migrate deploy - Prisma handles migration history automatically
npx prisma migrate deploy

echo "✅ All migrations applied successfully"
