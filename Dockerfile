FROM node:20-alpine AS base
WORKDIR /app

COPY package.json package-lock.json ./
COPY packages/ ./packages/
COPY apps/ ./apps/
COPY prisma/ ./prisma/

RUN npm install
RUN npx prisma generate --schema=prisma/schema.prisma
RUN npm run build --workspaces

EXPOSE 4000
CMD ["npm", "run", "start"]
