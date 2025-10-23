# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app

# Copy và cài đặt dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build project
RUN npm run build

# Stage 2: Run (nhỏ gọn và nhẹ hơn nhiều)
FROM node:20-alpine AS runner
WORKDIR /app

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./

RUN npm install --omit=dev

EXPOSE 8080

CMD ["npm", "start"]
