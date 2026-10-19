# syntax=docker.io/docker/dockerfile:1

# Mostly taken from https://github.com/vercel/next.js/blob/canary/examples/with-docker/Dockerfile

FROM node:lts-alpine AS base
ENV NEXT_TELEMETRY_DISABLED=1 NODE_ENV=production
# Yarn 4 via Corepack + committed release (.yarnrc.yml yarnPath)
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
RUN corepack enable

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat

RUN mkdir /code
WORKDIR /code

# Install dependencies (Berry: packageManager + yarnPath require .yarn/releases)
COPY package.json yarn.lock .yarnrc.yml ./
COPY .yarn/releases ./.yarn/releases
RUN yarn install --immutable

# Rebuild the source code only when needed
FROM base AS builder
RUN mkdir /code
WORKDIR /code
COPY --from=deps /code/node_modules ./node_modules
COPY . .

RUN yarn build

# Production image, copy all the files and run next
FROM base AS runner
RUN mkdir /code
WORKDIR /code

COPY --from=builder /code/public ./public
# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /code/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /code/.next/static ./.next/static

EXPOSE 3000

# server.js is created by next build from the standalone output
# https://nextjs.org/docs/pages/api-reference/config/next-config-js/output
CMD ["node", "server.js"]
