FROM node:12-alpine AS build
WORKDIR /app
RUN npm i -g requirejs uglify-js
COPY . .
RUN mkdir -p build/lib \
    && r.js -o name=main out=build/main.js baseUrl=js optimize=none \
    && uglifyjs build/main.js -c -m --mangle-props keep_quoted -o build/main.js \
    && cp js/lib/require.min.js build/lib/ \
    && rm -rf js \
    && mv build js

FROM nginx:1.19-alpine
COPY --from=build /app /usr/share/nginx/html
RUN sed -i '/index.html/ a add_header Cache-Control "no-store, no-cache";' /etc/nginx/conf.d/default.conf
