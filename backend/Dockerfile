# ── Stage 1: Base image ───────────────────────────────────────────────────────
# We use the official lightweight Python image
FROM python:3.11-slim

# ── Stage 2: Set working directory inside the container ───────────────────────
WORKDIR /app

# ── Stage 3: Install dependencies ─────────────────────────────────────────────
# Copy requirements first so Docker can cache this layer
# If requirements.txt doesn't change, Docker won't reinstall packages on rebuild
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Stage 4: Copy application code ────────────────────────────────────────────
COPY main.py .

# ── Stage 5: Create data directory for the JSON storage file ──────────────────
RUN mkdir -p /app/data

# ── Stage 6: Expose the port the app runs on ──────────────────────────────────
EXPOSE 8000

# ── Stage 7: Start the application ────────────────────────────────────────────
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
