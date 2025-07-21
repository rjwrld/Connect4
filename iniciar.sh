#!/bin/bash
echo "🔄 Regenerando cliente de Prisma..."
cd "c:/progra avanzada web/Connect4"
npx prisma generate

echo "🚀 Iniciando servidor..."
npm run dev
