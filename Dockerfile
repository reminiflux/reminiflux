FROM node:alpine as builder
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build

FROM nginx:stable
COPY --from=builder /app/build /www
COPY --from=builder /app/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
