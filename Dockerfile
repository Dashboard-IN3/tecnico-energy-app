# https://pnpm.io/docker#example-1-build-a-bundle-in-a-docker-container
FROM node:lts-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
# https://github.com/nodejs/docker-node/issues/1919
RUN apt-get update
RUN apt-get install -y openssl

RUN corepack enable
COPY . /app
WORKDIR /app

FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile

# FROM base AS build
# RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
# ARG POSTGRES_PRISMA_URL
# ENV POSTGRES_PRISMA_URL $POSTGRES_PRISMA_URL
# RUN echo $POSTGRES_PRISMA_URL
# ENV POSTGRES_URL_NON_POOLING $POSTGRES_PRISMA_URL
# RUN pnpm run build

FROM base
COPY --from=deps /app/node_modules /app/node_modules
# COPY --from=build /app/dist /app/dist
EXPOSE 8000
CMD [ "pnpm", "dev:build" ]