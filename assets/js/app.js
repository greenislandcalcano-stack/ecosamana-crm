const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const navLinks = document.querySelectorAll(".crm-nav a");

let reservations = JSON.parse(localStorage.getItem("reservations")) || [];
let editingIndex = null;

let customers = JSON.parse(localStorage.getItem("customers")) || [];
let editingCustomerIndex = null;

let payments = JSON.parse(localStorage.getItem("payments")) || [];
let editingPaymentIndex = null;

function saveReservations() {
  localStorage.setItem("reservations", JSON.stringify(reservations));
}

function saveCustomers() {
  localStorage.setItem("customers", JSON.stringify(customers));
}

function savePayments() {
  localStorage.setItem("payments", JSON.stringify(payments));
}

function generateBookingNumber() {
  return "ESA-" + String(reservations.length + 1).padStart(4, "0");
}

function generateCustomerNumber() {
  return "CUS-" + String(customers.length + 1).padStart(4, "0");
}

function generateReceiptNumber() {
  return "PAY-" + String(payments.length + 1).padStart(4, "0");
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
    if (page === "customers") initCustomersPage();
    if (page === "payments") initPaymentsPage();
    if (page === "tours") initTours();
 function initTours() {
  const toursTableBody = document.getElementById("toursTableBody");
  const tourSearch = document.getElementById("tourSearch");

  const tours = [
    {
      name: "El Limón Waterfall",
      category: "Nature / Waterfall",
      price: "$55 adult / $40 child",
      private: "From $260",
      duration: "4 hrs",
      status: "Active"
    },
    {
      name: "Los Haitises National Park",
      category: "Nature / Caves",
      price: "$85",
      private: "From $750",
      duration: "5 hrs",
      status: "Active"
    },
    {
      name: "Cayo Levantado",
      category: "Beach / Island",
      price: "$65",
      private: "From $600",
      duration: "Full Day",
      status: "Active"
    },
    {
      name: "Snorkeling Tour",
      category: "Ocean / Snorkeling",
      price: "$55",
      private: "From $650",
      duration: "3 hrs",
      status: "Active"
    },
    {
      name: "Eco Buggies",
      category: "Adventure",
      price: "$155 single / $220 double",
      private: "N/A",
      duration: "4 hrs",
      status: "Active"
    },
    {
      name: "Whale Watching",
      category: "Seasonal / Ocean",
      price: "Seasonal",
      private: "Available",
      duration: "Half Day",
      status: "Seasonal"
    },
    {
      name: "Kayak Los Haitises",
      category: "Adventure / Kayak",
      price: "Ask office",
      private: "Available",
      duration: "Half Day",
      status: "Active"
    },
    {
      name: "Half-Day Los Haitises Sánchez",
      category: "Nature / Local",
      price: "$70 adult / $50 child",
      private: "Available",
      duration: "9:00 AM - 1:00 PM",
      status: "Active"
    }
  ];

  function renderTours(list) {
    toursTableBody.innerHTML = "";

    list.forEach(tour => {
      const statusClass =
        tour.status === "Active"
          ? "bg-success"
          : tour.status === "Seasonal"
          ? "bg-warning text-dark"
          : "bg-secondary";

      toursTableBody.innerHTML += `
        <tr>
          <td class="fw-semibold">${tour.name}</td>
          <td>${tour.category}</td>
          <td>${tour.price}</td>
          <td>${tour.private}</td>
          <td>${tour.duration}</td>
          <td>
            <span class="badge ${statusClass}">
              ${tour.status}
            </span>
          </td>
        </tr>
      `;
    });
  }

  tourSearch.addEventListener("input", () => {
    const searchValue = tourSearch.value.toLowerCase();

    const filteredTours = tours.filter(tour =>
      tour.name.toLowerCase().includes(searchValue) ||
      tour.category.toLowerCase().includes(searchValue) ||
      tour.price.toLowerCase().includes(searchValue) ||
      tour.private.toLowerCase().includes(searchValue) ||
      tour.duration.toLowerCase().includes(searchValue) ||
      tour.status.toLowerCase().includes(searchValue)
    );

    renderTours(filteredTours);
  });

  renderTours(tours);
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

/* ===========================
   RESERVATIONS
=========================== */

function initReservationsPage() {
  const form = document.getElementById("reservationForm");
  if (!form) return;

  renderReservations();

  const searchInput = document.getElementById("reservationSearch");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderReservations(this.value);
    });
  }

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

    if (modal) modal.hide();
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

function viewReservation(index) {
  const reservation = reservations[index];

  document.getElementById("viewBookingTitle").textContent =
    `Reservation ${reservation.booking}`;

  document.getElementById("viewReservationBody").innerHTML = `
    <div class="reservation-detail-card">
      <div class="row g-4">

        <div class="col-md-6">
          <div class="detail-box">
            <small>Client</small>
            <h5>${reservation.clientName}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Tour</small>
            <h5>${reservation.tourName}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Date</small>
            <h5>${reservation.tourDate}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Guests</small>
            <h5>${reservation.guests}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Status</small>
            <h5>${reservation.status}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Hotel / Pickup</small>
            <h5>${reservation.hotel || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Phone / WhatsApp</small>
            <h5>${reservation.phone || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box money-box">
            <small>Total</small>
            <h5>${money(reservation.total)}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box money-box">
            <small>Deposit</small>
            <h5>${money(reservation.deposit)}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box balance-box">
            <small>Balance</small>
            <h5>${money(reservation.balance)}</h5>
          </div>
        </div>

        <div class="col-12">
          <div class="detail-box">
            <small>Notes</small>
            <p class="mb-0">${reservation.notes || "None"}</p>
          </div>
        </div>

      </div>

      <hr>

      <div class="d-flex gap-2 justify-content-end flex-wrap">
        <button class="btn btn-success" onclick="printReservation(${index})">
          <i class="bi bi-printer"></i> Print
        </button>

        <button class="btn btn-primary" onclick="editReservation(${index})">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("viewReservationModal"));
  modal.show();
}

function printReservation(index) {
  const reservation = reservations[index];

  const printContent = `
    <div class="print-ticket">
      <img src="./assets/images/logo.png" class="print-logo" alt="EcoSamana Adventures Logo">

      <h1>EcoSamana Adventures</h1>
      <p class="print-subtitle">Reservation Ticket</p>

      <div class="print-row"><strong>Booking:</strong><span>${reservation.booking}</span></div>
      <div class="print-row"><strong>Client:</strong><span>${reservation.clientName}</span></div>
      <div class="print-row"><strong>Tour:</strong><span>${reservation.tourName}</span></div>
      <div class="print-row"><strong>Date:</strong><span>${reservation.tourDate}</span></div>
      <div class="print-row"><strong>Guests:</strong><span>${reservation.guests}</span></div>
      <div class="print-row"><strong>Hotel / Pickup:</strong><span>${reservation.hotel || "Not specified"}</span></div>
      <div class="print-row"><strong>Phone:</strong><span>${reservation.phone || "Not specified"}</span></div>

      <div class="print-payment">
        <div class="print-row"><strong>Total:</strong><span>${money(reservation.total)}</span></div>
        <div class="print-row"><strong>Deposit:</strong><span>${money(reservation.deposit)}</span></div>
        <div class="print-row"><strong>Balance:</strong><span>${money(reservation.balance)}</span></div>
        <div class="print-row"><strong>Status:</strong><span>${reservation.status}</span></div>
      </div>

      <p class="print-footer">
        Thank you for booking with EcoSamana Adventures.<br>
        eco-samana.com
      </p>
    </div>
  `;

  const originalContent = document.body.innerHTML;

  document.body.innerHTML = `
    <style>
      @page {
        size: Letter;
        margin: 0.35in;
      }

      body {
        margin: 0;
        background: white;
        font-family: Arial, sans-serif;
        color: #123;
      }

      .print-ticket {
        max-width: 680px;
        margin: 0 auto;
        border: 2px solid #0f766e;
        border-radius: 16px;
        padding: 22px 28px;
      }

      .print-logo {
        width: 110px;
        display: block;
        margin: 0 auto 8px;
      }

      h1 {
        text-align: center;
        color: #0f766e;
        font-size: 24px;
        margin: 4px 0 2px;
      }

      .print-subtitle {
        text-align: center;
        font-size: 13px;
        margin: 0 0 18px;
      }

      .print-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        border-bottom: 1px solid #d9e2e2;
        padding: 8px 0;
        font-size: 14px;
      }

      .print-row span {
        text-align: right;
      }

      .print-payment {
        margin-top: 14px;
        padding: 12px;
        border-radius: 12px;
        background: #eefaf8;
        border: 1px solid #b7e4dc;
      }

      .print-footer {
        margin-top: 16px;
        text-align: center;
        font-size: 12px;
        color: #555;
      }
    </style>

    ${printContent}
  `;

  setTimeout(function () {
    window.print();
    document.body.innerHTML = originalContent;
    location.reload();
  }, 500);
}

/* ===========================
   CUSTOMERS
=========================== */

function initCustomersPage() {
  const form = document.getElementById("customerForm");
  if (!form) return;

  renderCustomers();

  const searchInput = document.getElementById("customerSearch");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderCustomers(this.value);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const customer = {
      id: editingCustomerIndex === null ? generateCustomerNumber() : customers[editingCustomerIndex].id,
      name: document.getElementById("customerName").value,
      phone: document.getElementById("customerPhone").value,
      email: document.getElementById("customerEmail").value,
      country: document.getElementById("customerCountry").value,
      hotel: document.getElementById("customerHotel").value,
      notes: document.getElementById("customerNotes").value
    };

    if (editingCustomerIndex === null) {
      customers.push(customer);
    } else {
      customers[editingCustomerIndex] = customer;
      editingCustomerIndex = null;
    }

    saveCustomers();
    renderCustomers();
    form.reset();

    const modalElement = document.getElementById("customerModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) modal.hide();
  });
}

function renderCustomers(filter = "") {
  const tableBody = document.getElementById("customersTableBody");
  if (!tableBody) return;

  const filteredCustomers = customers.filter(customer => {
    const text = `
      ${customer.id}
      ${customer.name}
      ${customer.phone}
      ${customer.email}
      ${customer.country}
      ${customer.hotel}
    `.toLowerCase();

    return text.includes(filter.toLowerCase());
  });

  if (filteredCustomers.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="6" class="text-muted text-center py-4">
          No customers found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredCustomers.map((customer) => {
    const index = customers.indexOf(customer);

    return `
      <tr>
        <td>${customer.name}</td>
        <td>${customer.phone || "Not specified"}</td>
        <td>${customer.email || "Not specified"}</td>
        <td>${customer.country || "Not specified"}</td>
        <td>${customer.hotel || "Not specified"}</td>
        <td>
          <button class="btn btn-sm btn-info text-white" onclick="viewCustomer(${index})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editCustomer(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${index})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editCustomer(index) {
  const customer = customers[index];
  editingCustomerIndex = index;

  document.getElementById("customerName").value = customer.name;
  document.getElementById("customerPhone").value = customer.phone;
  document.getElementById("customerEmail").value = customer.email;
  document.getElementById("customerCountry").value = customer.country;
  document.getElementById("customerHotel").value = customer.hotel;
  document.getElementById("customerNotes").value = customer.notes;

  const modal = new bootstrap.Modal(document.getElementById("customerModal"));
  modal.show();
}

function deleteCustomer(index) {
  if (!confirm("Delete this customer?")) return;

  customers.splice(index, 1);
  saveCustomers();
  renderCustomers();
}

function viewCustomer(index) {
  const customer = customers[index];

  document.getElementById("viewCustomerTitle").textContent =
    `Customer ${customer.id}`;

  document.getElementById("viewCustomerBody").innerHTML = `
    <div class="reservation-detail-card">
      <div class="row g-4">

        <div class="col-md-6">
          <div class="detail-box">
            <small>Customer Name</small>
            <h5>${customer.name}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Phone / WhatsApp</small>
            <h5>${customer.phone || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Email</small>
            <h5>${customer.email || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Country</small>
            <h5>${customer.country || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-12">
          <div class="detail-box">
            <small>Hotel</small>
            <h5>${customer.hotel || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-12">
          <div class="detail-box">
            <small>Notes</small>
            <p class="mb-0">${customer.notes || "None"}</p>
          </div>
        </div>

      </div>

      <hr>

      <div class="d-flex gap-2 justify-content-end flex-wrap">
        <button class="btn btn-primary" onclick="editCustomer(${index})">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("viewCustomerModal"));
  modal.show();
}

/* ===========================
   PAYMENTS
=========================== */

function initPaymentsPage() {
  const form = document.getElementById("paymentForm");
  if (!form) return;

  renderPayments();

  const searchInput = document.getElementById("paymentSearch");

  if (searchInput) {
    searchInput.addEventListener("input", function () {
      renderPayments(this.value);
    });
  }

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const payment = {
      receipt: editingPaymentIndex === null ? generateReceiptNumber() : payments[editingPaymentIndex].receipt,
      booking: document.getElementById("paymentBooking").value,
      client: document.getElementById("paymentClient").value,
      amount: Number(document.getElementById("paymentAmount").value || 0),
      method: document.getElementById("paymentMethod").value,
      date: document.getElementById("paymentDate").value,
      status: document.getElementById("paymentStatus").value,
      notes: document.getElementById("paymentNotes").value
    };

    if (editingPaymentIndex === null) {
      payments.push(payment);
    } else {
      payments[editingPaymentIndex] = payment;
      editingPaymentIndex = null;
    }

    savePayments();
    renderPayments();
    form.reset();

    const modalElement = document.getElementById("paymentModal");
    const modal = bootstrap.Modal.getInstance(modalElement);

    if (modal) modal.hide();
  });
}

function renderPayments(filter = "") {
  const tableBody = document.getElementById("paymentsTableBody");
  if (!tableBody) return;

  const filteredPayments = payments.filter(payment => {
    const text = `
      ${payment.receipt}
      ${payment.booking}
      ${payment.client}
      ${payment.amount}
      ${payment.method}
      ${payment.date}
      ${payment.status}
    `.toLowerCase();

    return text.includes(filter.toLowerCase());
  });

  if (filteredPayments.length === 0) {
    tableBody.innerHTML = `
      <tr>
        <td colspan="8" class="text-muted text-center py-4">
          No payments found.
        </td>
      </tr>
    `;
    return;
  }

  tableBody.innerHTML = filteredPayments.map((payment) => {
    const index = payments.indexOf(payment);

    const badgeClass =
      payment.status === "Paid" ? "bg-success" :
      payment.status === "Refunded" ? "bg-danger" :
      "bg-warning text-dark";

    return `
      <tr>
        <td>${payment.receipt}</td>
        <td>${payment.booking}</td>
        <td>${payment.client}</td>
        <td>${money(payment.amount)}</td>
        <td>${payment.method}</td>
        <td>${payment.date || "Not specified"}</td>
        <td><span class="badge ${badgeClass}">${payment.status}</span></td>
        <td>
          <button class="btn btn-sm btn-info text-white" onclick="viewPayment(${index})">View</button>
          <button class="btn btn-sm btn-primary" onclick="editPayment(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deletePayment(${index})">Delete</button>
        </td>
      </tr>
    `;
  }).join("");
}

function editPayment(index) {
  const payment = payments[index];
  editingPaymentIndex = index;

  document.getElementById("paymentBooking").value = payment.booking;
  document.getElementById("paymentClient").value = payment.client;
  document.getElementById("paymentAmount").value = payment.amount;
  document.getElementById("paymentMethod").value = payment.method;
  document.getElementById("paymentDate").value = payment.date;
  document.getElementById("paymentStatus").value = payment.status;
  document.getElementById("paymentNotes").value = payment.notes;

  const modal = new bootstrap.Modal(document.getElementById("paymentModal"));
  modal.show();
}

function deletePayment(index) {
  if (!confirm("Delete this payment?")) return;

  payments.splice(index, 1);
  savePayments();
  renderPayments();
}

function viewPayment(index) {
  const payment = payments[index];

  document.getElementById("viewPaymentTitle").textContent =
    `Payment ${payment.receipt}`;

  document.getElementById("viewPaymentBody").innerHTML = `
    <div class="reservation-detail-card">
      <div class="row g-4">

        <div class="col-md-6">
          <div class="detail-box">
            <small>Receipt</small>
            <h5>${payment.receipt}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Booking</small>
            <h5>${payment.booking}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box">
            <small>Client</small>
            <h5>${payment.client}</h5>
          </div>
        </div>

        <div class="col-md-6">
          <div class="detail-box money-box">
            <small>Amount</small>
            <h5>${money(payment.amount)}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Method</small>
            <h5>${payment.method}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Date</small>
            <h5>${payment.date || "Not specified"}</h5>
          </div>
        </div>

        <div class="col-md-4">
          <div class="detail-box">
            <small>Status</small>
            <h5>${payment.status}</h5>
          </div>
        </div>

        <div class="col-12">
          <div class="detail-box">
            <small>Notes</small>
            <p class="mb-0">${payment.notes || "None"}</p>
          </div>
        </div>

      </div>

      <hr>

      <div class="d-flex gap-2 justify-content-end flex-wrap">
        <button class="btn btn-primary" onclick="editPayment(${index})">
          <i class="bi bi-pencil-square"></i> Edit
        </button>
      </div>
    </div>
  `;

  const modal = new bootstrap.Modal(document.getElementById("viewPaymentModal"));
  modal.show();
}

/* ===========================
   NAVIGATION
=========================== */

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
