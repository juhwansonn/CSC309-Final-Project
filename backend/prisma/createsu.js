#!/usr/bin/env node

'use strict';
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient();

const [, , utorid, email, password] = process.argv;
const createdAtIso = new Date().toISOString();
const expiresAtDate = new Date();
expiresAtDate.setDate(expiresAtDate.getDate() + 7);

if (!utorid) {
  console.error('Usage: node prisma/createsu.js <utorid>')
  process.exit(1)
} else if (!email) {
  console.error('Usage: node prisma/createsu.js <email>')
  process.exit(1)
} else if (!password) {
  console.error('Usage: node prisma/createsu.js <password>')
  process.exit(1)
}

async function main() {
  const newSuperUser = await prisma.user.create({
    data: {
      utorid,
      name: utorid,
      email,
      password,
      verified: true,
      role: 'superuser',
      points: 0,
      suspicious: false,
      token: 'superToken',
      createdAt: createdAtIso,
      expiresAt: expiresAtDate,
    }
  });

  console.log('created user =', newSuperUser);
  process.exit(0);
}


main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
