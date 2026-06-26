const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const navLinks = document.querySelectorAll(".crm-nav a");

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];

function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function generateBookingNumber() {
  const nextNumber = reservations.length + 1;
  return "ESA-" + String(nextNumber).padStart(4, "0");
}

function money(value) {
  return "$" + Number(value || 0).toFixed(0);
}

async function loadPage(page) {
  try {
    const response = await fetch(`pages/${page}.html`);

    if (!response.ok) {
      throw new Error("Page not found");
    }

    const html = await response.text();
    appContent.innerHTML = html;

    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);

    if (page === "reservations") {
      initReservationsPage();
    }

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
  const tableBody = document.getElementById("reservationsTableBody");

  if (!form || !tableBody) return;

  renderReservations();

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const total = Number(document.getElementById("total").value || 0);
    const deposit = Number(document.getElementById("deposit").value || 0);
    const balance = total - deposit;

    const adults = Number(document.getElementById("adults").value || 0);
    const children = Number(document.getElementById("children").value || 0);
    const guests = adults + children;

    const reservation = {
      booking: generateBookingNumber(),
      clientName: document.getElementById("clientName").value,
      tourDate: document.getElementById("tourDate").value,
      tourName: document.getElementById("tourName").value,
      adults,
      children,
      guests,
      total,
      deposit,
      balance,
      hotel: document.getElementById("hotel").value,
      phone: document.getElementById("phone").value,
      status: document.getElementById("status").value,
      notes: document.getElementById("notes").value
    };

    reservations.push(reservation);
    saveReservations();
    renderReservations();

    form.reset();

    const modalElement = document.getElementById("reservationModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
  });
}

function renderReservations() {
  const tableBody = document.getElementById("reservationsTableBody");
  if (!tableBody) return;

  if (reservations.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="9" class="text-muted text-center py-4">
          No reservations yet. Add the first EcoSamana booking.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = reservations.map(reservation => {
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
      </tr>
    `;
  }).join("");
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
