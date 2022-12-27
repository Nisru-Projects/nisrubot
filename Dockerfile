FROM node:alpine
WORKDIR /usr/app
COPY package*.json ./
RUN apk add --no-cache \
        git \
        build-base \
        g++ \
        cairo-dev \
        jpeg-dev \
        pango-dev \
        freetype-dev \
        giflib-dev
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]