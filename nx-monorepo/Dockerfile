# NX Monorepo Dockerfile
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build shared libraries
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy built packages
COPY --from=build /app/packages /app/packages
COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

# Set ownership
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# This is a library container - it doesn't expose ports
# Used for building and sharing libraries with other containers

CMD ["node", "-e", "console.log('NX Monorepo libraries ready for consumption')"]