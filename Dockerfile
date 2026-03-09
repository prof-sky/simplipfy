FROM debian:bookworm

ENV DEBIAN_FRONTEND=noninteractive
ENV PATH="/usr/local/simplipfyVenv/bin:${PATH}"
WORKDIR /src

RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    python3-pip \
    python3-venv \
    python3-dev

# Install apache + vsftpd
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        apache2 \
        proftpd-basic \
        && rm -rf /var/lib/apt/lists/*

RUN apt-get update && \
    apt-get install -y ftp && \
    apt-get install -y nano && \
    apt-get install -y nodejs && \
    apt-get install -y npm && \
    apt-get install -y dos2unix

# Ensure ProFTPD runs in standalone mode (required in Docker)
COPY proftpd.conf /etc/proftpd/proftpd.conf

RUN useradd -d /var/www/html -s /usr/sbin/nologin ftp-user && echo "ftp-user:ftp-pass" | chpasswd

RUN mkdir -p /var/www/html/dev /var/www/html/docs /var/www/html/simplipfy
RUN chown -R ftp-user:ftp-user /var/www/html
RUN chmod -R u+rw /var/www/html

# Apache server
EXPOSE 80
# Python http.server dist
EXPOSE 8000
# Python http.server docs
EXPOSE 7500

# -----------------------------
# FTP SETUP (internal only)
# -----------------------------

# Copy entrypoint
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN sed -i 's/\r$//' /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]

# -----------------------------
# Your python project
# -----------------------------
COPY requirements.txt .
RUN python3 -m venv /usr/local/simplipfyVenv
RUN echo 'simPython() { /usr/local/simplipfyVenv/bin/python "$@"; }' >> /etc/bash.bashrc \
 && echo 'simPip() { /usr/local/simplipfyVenv/bin/pip "$@"; }' >> /etc/bash.bashrc \
 && echo 'simplipfy() { /usr/local/simplipfyVenv/bin/python /src/Pyodide/Scripts/cli.py "$@"; }' >> /etc/bash.bashrc

RUN /usr/local/simplipfyVenv/bin/pip install -r requirements.txt

# Start all services
CMD ["bash"]