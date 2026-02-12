FROM node:18-bookworm

# Strapi (with upload) uses sharp. On arm64, compiling sharp from source is slow and fragile.
# Prefer sharp prebuilt binaries and force sharp to ignore any system libvips.
RUN apt-get update && apt-get install -y \
  python3 \
  make \
  g++ \
  pkg-config \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /srv/app

# Copy only lockfiles first for better layer caching
COPY ./strapi/package.json ./strapi/package-lock.json ./

ENV SHARP_IGNORE_GLOBAL_LIBVIPS=1

RUN npm ci

# Copy the rest of the Strapi app
COPY ./strapi ./

# Build admin panel once at image build time
ENV NODE_ENV=production
RUN npm run build

EXPOSE 1337

CMD ["npm", "run", "start"]
