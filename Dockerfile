#######################################################################################################################
# build the Vue app
FROM node:22-alpine AS build
# Chromium + fonts are used to print the PDF version of the site
RUN apk add --no-cache chromium font-noto font-noto-symbols
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

#######################################################################################################################
# serve the static files
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
