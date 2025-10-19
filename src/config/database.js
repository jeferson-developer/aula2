// src/config/database.js
   import { PrismaClient } from '@prisma/client';

   // Instância única do Prisma Client
   const prisma = new PrismaClient({
     log: ['query', 'info', 'warn', 'error'], // Logs úteis para debug
   });

   export default prisma;