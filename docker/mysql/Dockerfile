FROM mysql:8.4

ENV MYSQL_ROOT_PASSWORD=root \
    MYSQL_DATABASE=nest_fastify \
    TZ=America/Sao_Paulo

COPY docker/mysql/init/ /docker-entrypoint-initdb.d/

EXPOSE 3306
