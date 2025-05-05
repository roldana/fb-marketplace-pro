# 1. Base image with Node.js
FROM node:22-slim

# 2. Install Xvfb, VNC server, websockify (noVNC proxy) and git for noVNC
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
      ca-certificates \
      xvfb \
      tigervnc-standalone-server \
      python3-websockify \
      git \
    && update-ca-certificates \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 3. Grab noVNC
RUN git clone https://github.com/novnc/noVNC.git /opt/noVNC \
    && git clone https://github.com/novnc/websockify.git /opt/noVNC/utils/websockify

# 4. Set working dir & install your app
WORKDIR /app
COPY package*.json ./
RUN npm install --production
COPY . .

# 5. Expose VNC and noVNC ports
ENV DISPLAY=:1
# VNC server port
EXPOSE 5901
# noVNC web server port
EXPOSE 6080

# 6. Entrypoint: start Xvfb, set VNC password, launch Electron, then noVNC proxy
CMD bash -lc "\
  mkdir -p /root/.vnc && \
  # vncpasswd will read from STDIN twice (password, verify).  
  # Use env VNC_PASSWORD or default to 'secret'
  echo -e \"${VNC_PASSWORD:-secret}\n${VNC_PASSWORD:-secret}\n\" | vncpasswd -f > /root/.vnc/passwd && \
  chmod 600 /root/.vnc/passwd && \
  Xvfb :1 -screen 0 1280x800x24 & \
  npm start & \
  /opt/noVNC/utils/websockify/run --web=/opt/noVNC 6080 localhost:5901"
