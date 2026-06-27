const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const navLinks = document.querySelectorAll(".crm-nav a");

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
let editingIndex = null;

function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function generateBookingNumber() {
  return "ESA-" + String(reservations.length + 1).padStart(4, "0");
}

function money(value) {
  return "$" + Number(value || 0).toFixed(0);
}

async function loadPage(page) {
  try {
    const response = await fetch(`pages/${page}.html`);
    if (!response.ok) throw new Error("Page not found");

    const html = await response.text();
    appContent.innerHTML = html;
    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

    if (page === "reservations") initReservationsPage();

  } catch (error) {
    appContent.innerHTML = `
      <div class="alert alert-warning">
        <h4>Page under construction</h4>
        <p>The ${page} module is not ready yet.</p>
      </div>
    `;
  }
}

function initReservationsPage() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  renderReservations();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const total = Number(document.getElementById("total").value || 0);
    const deposit = Number(document.getElementById("deposit").value || 0);

    if (deposit > total) {
      alert("Deposit cannot be greater than the total.");
      return;
    }

    const adults = Number(document.getElementById("adults").value || 0);
    const children = Number(document.getElementById("children").value || 0);

    const reservation = {
      booking: editingIndex === null ? generateBookingNumber() : reservations[editingIndex].booking,
      clientName: document.getElementById("clientName").value,
      tourDate: document.getElementById("tourDate").value,
      tourName: document.getElementById("tourName").value,
      adults,
      children,
      guests: adults + children,
      total,
      deposit,
      balance: total - deposit,
      hotel: document.getElementById("hotel").value,
      phone: document.getElementById("phone").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value
    };

    if (editingIndex === null) {
      reservations.push(reservation);
    } else {
      reservations[editingIndex] = reservation;
      editingIndex = null;
    }

    saveReservations();
    renderReservations();
    form.reset();

    const modalElement = document.getElementById("reservationModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });
}

function renderReservations(filter = "") {
  const tableBody = document.getElementById("reservationsTableBody");
  if (!tableBody) return;

  const filteredReservations = reservations.filter(reservation => {
    const text = `
      ${reservation.booking}
      ${reservation.clientName}
      ${reservation.tourName}
      ${reservation.tourDate}
      ${reservation.hotel}
      ${reservation.phone}
      ${reservation.status}
    `.toLowerCase();

    return text.includes(filter.toLowerCase());
  });

  if (filteredReservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="10" class="text-muted text-center py-4">
          No reservations found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredReservations.map((reservation) => {
    const index = reservations.indexOf(reservation);

    const badgeClass =
      reservation.status === "Paid" ? "bg-success" :
      reservation.status === "Confirmed" ? "bg-primary" :
      reservation.status === "Cancelled" ? "bg-danger" :
      "bg-warning text-dark";

    return `
      <tr>
        <td>${reservation.booking}</td>
        <td>${reservation.clientName}</td>
        <td>${reservation.tourName}</td>
        <td>${reservation.tourDate}</td>
        <td>${reservation.guests}</td>
        <td>${money(reservation.total)}</td>
        <td>${money(reservation.deposit)}</td>
        <td>${money(reservation.balance)}</td>
        <td><span class="badge ${badgeClass}">${reservation.status}</span></td>
        <td>
          <button class="btn btn-sm btn-info text-white" onclick="viewReservation(${index})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editReservation(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteReservation(${index})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editReservation(index) {
  const reservation = reservations[index];
  editingIndex = index;

  document.getElementById("clientName").value = reservation.clientName;
  document.getElementById("tourDate").value = reservation.tourDate;
  document.getElementById("tourName").value = reservation.tourName;
  document.getElementById("adults").value = reservation.adults;
  document.getElementById("children").value = reservation.children;
  document.getElementById("total").value = reservation.total;
  document.getElementById("deposit").value = reservation.deposit;
  document.getElementById("hotel").value = reservation.hotel;
  document.getElementById("phone").value = reservation.phone;
  document.getElementById("status").value = reservation.status;
  document.getElementById("notes").value = reservation.notes;

  const modal = new bootstrap.Modal(document.getElementById("reservationModal"));
  modal.show();
}

function deleteReservation(index) {
  if (!confirm("Delete this reservation?")) return;

  reservations.splice(index, 1);
  saveReservations();
  renderReservations();
}

navLinks.forEach(link => {
  link.addEventListener("click", function (event) {
    event.preventDefault();

    navLinks.forEach(item => item.classList.remove("active"));
    this.classList.add("active");

    const page = this.getAttribute("data-page");
    loadPage(page);
  });
});

loadPage("dashboard");
