# Equipment Tracker

A simple equipment inventory management tool built for the IT Branch.
Used as the training application for Docker and Git workshops.

---

## Project Structure

```
equipment-tracker/
├── frontend/
│   ├── index.html      # Main HTML page
│   ├── style.css       # Styling
│   ├── app.js          # Frontend logic — talks to the API
│   ├── nginx.conf      # Nginx web server configuration
│   └── Dockerfile      # How to containerise the frontend
├── backend/
│   ├── main.py         # FastAPI application — all API routes
│   ├── requirements.txt
│   └── Dockerfile      # How to containerise the backend
└── docker-compose.yml  # Wires frontend + backend together
```

---

## Running with Docker Compose (recommended)

```bash
# Build and start both services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API docs: http://localhost:8000/docs

# Stop everything
docker-compose down

# Stop and remove all data
docker-compose down -v
```

---

## Running locally without Docker

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**Frontend:**
```bash
# Open frontend/index.html directly in a browser
# OR serve with any static file server:
cd frontend
python -m http.server 3000
# Then open http://localhost:3000
```

---

## API Endpoints

| Method | Endpoint                  | Description                  |
|--------|---------------------------|------------------------------|
| GET    | /equipment                | Get all equipment            |
| POST   | /equipment                | Add new equipment            |
| PATCH  | /equipment/{id}           | Update equipment status      |
| DELETE | /equipment/{id}           | Delete equipment record      |

Interactive API docs available at: `http://localhost:8000/docs`

---

## Features

- Add equipment with name, category, serial number, and location
- View all equipment in a searchable, filterable table
- Cycle equipment status: Serviceable → Under Maintenance → Unserviceable
- Delete equipment records
- Summary counts in the header (total, serviceable, unserviceable)
- Data persisted in a JSON file via Docker volume
