# Página estática servida por nginx com compressão e cache (ver deploy/nginx.conf).
# No Dokploy: Build Type = Dockerfile, porta do container = 80.
FROM nginx:1.27-alpine

COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html styles.min.css app.min.js /usr/share/nginx/html/
COPY assets /usr/share/nginx/html/assets

EXPOSE 80
