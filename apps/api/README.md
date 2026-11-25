# MilkShop API

NestJS 11 + Prisma 7 + MariaDB. Follow root README for importing `database/MilkShop_MariaDB.sql`, configuring `.env`, seeding admin, starting backend and testing `/health`.

`npm run db:seed-admin` creates RBAC and an admin with BCrypt. `npm run start:dev` starts API on port 5300. `npm run test:milkshop-runtime` requires a running disposable QA database and seeded Admin.
