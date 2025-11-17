#!/bin/bash
# Production build script that uses the safe vite config
NODE_ENV=production npx vite build --config vite.config.production.ts && \
esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist
