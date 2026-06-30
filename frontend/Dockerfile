# ── Stage 1: Base image ───────────────────────────────────────────────────────
# Nginx is a lightweight web server — perfect for serving static HTML/CSS/JS files
FROM nginx:alpine

# ── Stage 2: Remove the default Nginx welcome page ────────────────────────────
RUN rm -rf /usr/share/nginx/html/*

# ── Stage 3: Copy our frontend files into Nginx's serving directory ───────────
COPY index.html /usr/share/nginx/html/
COPY style.css  /usr/share/nginx/html/
COPY app.js     /usr/share/nginx/html/

# ── Stage 4: Copy our custom Nginx configuration ──────────────────────────────
COPY nginx.conf /etc/nginx/conf.d/default.conf

# ── Stage 5: Expose port 80 (standard HTTP port) ──────────────────────────────
EXPOSE 80

# ── Stage 6: Start Nginx ───────────────────────────────────────────────────────
# 'daemon off' keeps Nginx in the foreground so Docker can manage the process
CMD ["nginx", "-g", "daemon off;"]
