# Build stage
FROM node:20-slim AS builder

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
FROM node:20-slim

WORKDIR /app

# Install Grafana Agent and envsubst for metrics forwarding
RUN apt-get update && apt-get install -y wget ca-certificates gettext unzip && \
    wget https://github.com/grafana/agent/releases/download/v0.40.0/grafana-agent-linux-amd64.zip && \
    unzip grafana-agent-linux-amd64.zip && \
    mv grafana-agent-linux-amd64 /usr/local/bin/grafana-agent && \
    chmod +x /usr/local/bin/grafana-agent && \
    rm grafana-agent-linux-amd64.zip && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

# Copy Grafana Agent config
COPY grafana-agent.yml /etc/grafana-agent.yml

# Create startup script that substitutes env vars
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo '# Substitute environment variables in Grafana Agent config' >> /app/start.sh && \
    echo 'if [ -n "$GRAFANA_PROMETHEUS_URL" ]; then' >> /app/start.sh && \
    echo '  envsubst < /etc/grafana-agent.yml > /tmp/grafana-agent.yml' >> /app/start.sh && \
    echo '  /usr/local/bin/grafana-agent --config.file=/tmp/grafana-agent.yml &' >> /app/start.sh && \
    echo '  echo "Grafana Agent started with config"' >> /app/start.sh && \
    echo 'else' >> /app/start.sh && \
    echo '  echo "Grafana Cloud credentials not set, skipping agent"' >> /app/start.sh && \
    echo 'fi' >> /app/start.sh && \
    echo 'exec node dist/start.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Create non-root user
RUN groupadd --gid 1001 nodejs && \
    useradd --uid 1001 --gid nodejs --shell /bin/bash --create-home nodejs

# Change ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose metrics port (optional)
EXPOSE 9090

# Start both bot and Grafana Agent
CMD ["/app/start.sh"]

