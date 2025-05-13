FROM node:18-bullseye

# 安裝 sharp 依賴 libvips
RUN apt-get update && apt-get install -y \
  libvips-dev \
  && rm -rf /var/lib/apt/lists/*

# 設定工作目錄
WORKDIR /srv/app

# 複製專案檔案
COPY ./strapi .


# 安裝專案依賴
RUN yarn install

# 啟動 Strapi
CMD ["yarn", "develop"]
