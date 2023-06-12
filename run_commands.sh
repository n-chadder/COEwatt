#!/usr/bin bash

npx prisma migrate dev

npx nodemon src/index.ts