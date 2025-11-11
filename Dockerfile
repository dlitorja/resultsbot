# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Install Grafana Agent for metrics forwarding
RUN apk add --no-cache wget ca-certificates && \
    wget https://github.com/grafana/agent/releases/download/v0.40.0/grafana-agent-linux-amd64.zip && \
    unzip grafana-agent-linux-amd64.zip && \
    mv grafana-agent-linux-amd64 /usr/local/bin/grafana-agent && \
    chmod +x /usr/local/bin/grafana-agent && \
    rm grafana-agent-linux-amd64.zip

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy Grafana Agent config
COPY grafana-agent.yml /etc/grafana-agent.yml

# Create startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'grafana-agent --config.file=/etc/grafana-agent.yml &' >> /app/start.sh && \
    echo 'exec node dist/start.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose metrics port (optional)
EXPOSE 9090

# Start both bot and Grafana Agent
CMD ["/app/start.sh"]

