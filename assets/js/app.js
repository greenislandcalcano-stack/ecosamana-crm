const appContent = document.getElementById("app-content");
const pageTitle = document.getElementById("page-title");
const navLinks = document.querySelectorAll(".crm-nav a");

async function loadPage(page) {
  try {
    const response = await fetch(`pages/${page}.html`);

    if (!response.ok) {
      throw new Error("Page not found");
    }

    const html = await response.text();
    appContent.innerHTML = html;

    pageTitle.textContent = page.charAt(0).toUpperCase() + page.slice(1);
  } catch (error) {
    appContent.innerHTML = `
      <div class="alert alert-warning">
        <h4>Page under construction</h4>
        <p>The ${page} module is not ready yet.</p>
      </div>
    `;
  }
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
