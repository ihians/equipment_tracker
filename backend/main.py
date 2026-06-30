from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import json
import os
import uuid
from datetime import datetime

app = FastAPI(title="Equipment Tracker API")

# Allow frontend to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# JSON file path — will be stored in a volume in Docker
DATA_FILE = os.getenv("DATA_FILE", "data/equipment.json")


def read_data():
    """Read all equipment from the JSON file."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    if not os.path.exists(DATA_FILE):
        return []
    with open(DATA_FILE, "r") as f:
        return json.load(f)


def write_data(equipment_list):
    """Write all equipment to the JSON file."""
    os.makedirs(os.path.dirname(DATA_FILE), exist_ok=True)
    with open(DATA_FILE, "w") as f:
        json.dump(equipment_list, f, indent=2)


# ── Data model ────────────────────────────────────────────────────────────────

class EquipmentCreate(BaseModel):
    name: str
    category: str
    serial_number: str
    location: str
    status: Optional[str] = "AVAILABLE"


class EquipmentUpdate(BaseModel):
    status: str


# ── Routes ────────────────────────────────────────────────────────────────────

@app.get("/")
def root():
    return {"message": "Equipment Tracker API is running"}


@app.get("/equipment")
def get_all_equipment():
    """Return all equipment records."""
    return read_data()


@app.post("/equipment", status_code=201)
def add_equipment(item: EquipmentCreate):
    """Add a new equipment record."""
    equipment_list = read_data()

    # Check for duplicate serial number
    for existing in equipment_list:
        if existing["serial_number"] == item.serial_number:
            raise HTTPException(
                status_code=400,
                detail=f"Equipment with serial number {item.serial_number} already exists."
            )

    new_item = {
        "id": str(uuid.uuid4()),
        "name": item.name,
        "category": item.category,
        "serial_number": item.serial_number,
        "location": item.location,
        "status": item.status,
        "added_on": datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC"),
    }

    equipment_list.append(new_item)
    write_data(equipment_list)
    return new_item


@app.patch("/equipment/{equipment_id}")
def update_status(equipment_id: str, update: EquipmentUpdate):
    """Update the status of an equipment item."""
    equipment_list = read_data()

    for item in equipment_list:
        if item["id"] == equipment_id:
            item["status"] = update.status
            write_data(equipment_list)
            return item

    raise HTTPException(status_code=404, detail="Equipment not found.")


@app.delete("/equipment/{equipment_id}", status_code=204)
def delete_equipment(equipment_id: str):
    """Delete an equipment record."""
    equipment_list = read_data()
    updated_list = [item for item in equipment_list if item["id"] != equipment_id]

    if len(updated_list) == len(equipment_list):
        raise HTTPException(status_code=404, detail="Equipment not found.")

    write_data(updated_list)
    return None
