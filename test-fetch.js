const express = require('express');

// Probar si fetch está disponible
console.log('🔍 Verificando fetch...');
console.log('typeof fetch:', typeof fetch);
console.log('typeof global.fetch:', typeof global.fetch);

if (typeof fetch === 'undefined' && typeof global.fetch === 'undefined') {
  console.log('❌ fetch no está disponible nativamente');
  console.log('📦 Necesitas instalar node-fetch: npm install node-fetch@2');
} else {
  console.log('✅ fetch está disponible');
}

console.log('Node.js version:', process.version);
