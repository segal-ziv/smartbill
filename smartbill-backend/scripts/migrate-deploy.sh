#!/bin/bash
set -e

echo "🔍 Checking migration status..."

# Check if _prisma_migrations table exists
MIGRATIONS_EXIST=$(npx prisma migrate status 2>&1 | grep -c "No pending migrations" || true)

if [ "$MIGRATIONS_EXIST" -eq 0 ]; then
  echo "📋 Baseline migration detected - marking as applied without running SQL"
  echo "   (Database tables already exist)"

  # Mark the baseline migration as applied without running it
  npx prisma migrate resolve --applied "0000_init"

  echo "✅ Baseline migration marked as applied"
fi

# Now run any pending migrations normally
echo "🚀 Running migrate deploy..."
npx prisma migrate deploy

echo "✅ All migrations applied successfully"
