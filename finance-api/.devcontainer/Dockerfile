FROM mcr.microsoft.com/devcontainers/java:1-21-bookworm


# limpiar repo problemático y agregar cliente postgres
RUN rm -f /etc/apt/sources.list.d/yarn.list \
    && apt-get update \
    && apt-get install -y --no-install-recommends \
        postgresql-client \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*


