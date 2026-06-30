// ── Configuration ─────────────────────────────────────────────────────────────
// The API URL is read from an environment variable injected at build time,
// or falls back to localhost for local development.
const API_URL = window.API_URL || "http://localhost:8000";

// ── State ─────────────────────────────────────────────────────────────────────
let allEquipment = [];  // Full list fetched from the API

// ── DOM references ────────────────────────────────────────────────────────────
const tableBody     = document.getElementById("table-body");
const loadingEl     = document.getElementById("loading");
const emptyMsg      = document.getElementById("empty-message");
const addForm       = document.getElementById("add-form");
const formMessage   = document.getElementById("form-message");
const searchInput   = document.getElementById("search-input");
const filterStatus  = document.getElementById("filter-status");
const totalCount    = document.getElementById("total-count");
const okCount       = document.getElementById("ok-count");
const badCount      = document.getElementById("bad-count");

// ── Fetch all equipment from the API ──────────────────────────────────────────
async function fetchEquipment() {
  try {
    const response = await fetch(`${API_URL}/equipment`);
    if (!response.ok) throw new Error("Failed to load equipment.");
    allEquipment = await response.json();
    renderTable();
    updateSummary();
  } catch (err) {
    loadingEl.textContent = "Error: Could not connect to the API. Is the backend running?";
    loadingEl.style.color = "var(--red)";
  }
}

// ── Render table rows ─────────────────────────────────────────────────────────
function renderTable() {
  const searchTerm   = searchInput.value.toLowerCase();
  const statusFilter = filterStatus.value;

  // Filter based on search input and status dropdown
  const filtered = allEquipment.filter(item => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm) ||
      item.serial_number.toLowerCase().includes(searchTerm) ||
      item.location.toLowerCase().includes(searchTerm);
    const matchesStatus = statusFilter === "" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  loadingEl.style.display = "none";

  if (filtered.length === 0) {
    tableBody.innerHTML = "";
    emptyMsg.style.display = "block";
    return;
  }

  emptyMsg.style.display = "none";
  tableBody.innerHTML = filtered.map(item => `
    <tr id="row-${item.id}">
      <td><strong>${escapeHtml(item.name)}</strong></td>
      <td>${escapeHtml(item.category)}</td>
      <td><code>${escapeHtml(item.serial_number)}</code></td>
      <td>${escapeHtml(item.location)}</td>
      <td><span class="badge ${badgeClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td>${escapeHtml(item.added_on)}</td>
      <td>
        <div class="actions-cell">
          <button class="btn btn-sm btn-status" onclick="cycleStatus('${item.id}', '${item.status}')">
            Change Status
          </button>
          <button class="btn btn-sm btn-delete" onclick="deleteEquipment('${item.id}')">
            Delete
          </button>
        </div>
      </td>
    </tr>
  `).join("");
}

// ── Update header summary counts ──────────────────────────────────────────────
function updateSummary() {
  const serviceable   = allEquipment.filter(i => i.status === "Serviceable").length;
  const unserviceable = allEquipment.filter(i => i.status !== "Serviceable").length;
  totalCount.textContent = allEquipment.length;
  okCount.textContent    = serviceable;
  badCount.textContent   = unserviceable;
}

// ── Add new equipment ─────────────────────────────────────────────────────────
addForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const payload = {
    name:          document.getElementById("name").value.trim(),
    category:      document.getElementById("category").value,
    serial_number: document.getElementById("serial").value.trim(),
    location:      document.getElementById("location").value.trim(),
    status:        "Serviceable",
  };

  try {
    const response = await fetch(`${API_URL}/equipment`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      showMessage(err.detail || "Failed to add equipment.", "error");
      return;
    }

    const newItem = await response.json();
    allEquipment.push(newItem);
    renderTable();
    updateSummary();
    addForm.reset();
    showMessage("Equipment added successfully.", "success");
  } catch (err) {
    showMessage("Network error. Is the backend running?", "error");
  }
});

// ── Cycle through statuses ────────────────────────────────────────────────────
const statusCycle = ["Serviceable", "Under Maintenance", "Unserviceable"];

async function cycleStatus(id, currentStatus) {
  const nextIndex  = (statusCycle.indexOf(currentStatus) + 1) % statusCycle.length;
  const nextStatus = statusCycle[nextIndex];

  try {
    const response = await fetch(`${API_URL}/equipment/${id}`, {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ status: nextStatus }),
    });

    if (!response.ok) throw new Error();

    const updated = await response.json();
    allEquipment = allEquipment.map(item => item.id === id ? updated : item);
    renderTable();
    updateSummary();
  } catch {
    alert("Failed to update status.");
  }
}

// ── Delete equipment ──────────────────────────────────────────────────────────
async function deleteEquipment(id) {
  if (!confirm("Are you sure you want to delete this equipment record?")) return;

  try {
    const response = await fetch(`${API_URL}/equipment/${id}`, { method: "DELETE" });
    if (!response.ok) throw new Error();

    allEquipment = allEquipment.filter(item => item.id !== id);
    renderTable();
    updateSummary();
  } catch {
    alert("Failed to delete equipment.");
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function badgeClass(status) {
  if (status === "Serviceable")       return "badge-serviceable";
  if (status === "Unserviceable")     return "badge-unserviceable";
  if (status === "Under Maintenance") return "badge-maintenance";
  return "";
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

function showMessage(msg, type) {
  formMessage.textContent  = msg;
  formMessage.className    = type;
  setTimeout(() => { formMessage.textContent = ""; }, 4000);
}

// ── Search and filter listeners ───────────────────────────────────────────────
searchInput.addEventListener("input", renderTable);
filterStatus.addEventListener("change", renderTable);

// ── Initial load ──────────────────────────────────────────────────────────────
fetchEquipment();
