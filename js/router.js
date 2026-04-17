// Variable para rastrear la ruta actual
let currentRoute = "home";

function navigate(route) {
  const mainSection = document.querySelector(".main__content-section");
  const heroSection = document.querySelector(".hero__section");
  const cartAside = document.querySelector("#cart");
  const historySection = document.querySelector("#historySection");
  const checkoutSection = document.querySelector("#checkoutSection");
  const adminPanel = document.querySelector("#adminPanel");
  const cartButton = document.querySelector("#cartButton");
  const invoiceContainer = document.querySelector("#invoiceContainer");

  heroSection.style.display = "none";
  mainSection.style.display = "none";
  cartAside.style.display = "none";
  historySection.style.display = "none";
  checkoutSection.style.display = "none";
  adminPanel.style.display = "none"
  
  if (adminPanel) {
    adminPanel.classList.remove('open');
  }
  // quitar margen extra si estaba activo
  document.querySelector('.app__container')?.classList.remove('admin-open');
  // retirar clase de listado para no mantener ancho reducido
  if (historySection) historySection.classList.remove('admin-listing');

  currentRoute = route;

  if (route === "home") {
    heroSection.style.display = "block";
    mainSection.style.display = "block";
    cartAside.style.display = "block";
    cartButton.style.display = "block";
    if (typeof resetAdminMenuSelectionToHistorial === "function") {
      resetAdminMenuSelectionToHistorial();
    }
    // asegurarse de que el carrito refleje el estado actual (vacío tras compra)
    if (typeof renderCart === "function") {
      renderCart();
    }
  }

  if (route === "history") {
    historySection.style.display = "block";
    cartButton.style.display = "none";
    renderHistory();
  }

  if (route === "invoice") {
    historySection.style.display = "block";
    cartButton.style.display = "none";
    if (adminPanel) {
      adminPanel.style.display = "flex";
      adminPanel.classList.add('open');
    }
    document.querySelector('.app__container')?.classList.add('admin-open');
    if (typeof initAdmin === "function") {
      initAdmin();
    }
    if (typeof resetAdminMenuSelectionToHistorial === "function") {
      resetAdminMenuSelectionToHistorial();
    }
    if (typeof renderHistory === "function") renderHistory();
    if (typeof renderInvoice === "function" && typeof currentInvoiceId !== "undefined" && currentInvoiceId != null) {
      renderInvoice(currentInvoiceId);
      invoiceContainer?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  if (route === "profile") {
    // Mostrar historial a la izquierda y el panel admin a la derecha
    historySection.style.display = "block";
    if (adminPanel) {
      adminPanel.style.display = "flex";
      adminPanel.classList.add('open');
    }
    // también asegura el margen del contenedor para el listado
    document.querySelector('.app__container')?.classList.add('admin-open');
    cartButton.style.display = "none";
    renderHistory();
    if (typeof initAdmin === "function") {
      initAdmin();
    }
    if (typeof resetAdminMenuSelectionToHistorial === "function") {
      resetAdminMenuSelectionToHistorial();
    }
  }

  if (route === "checkout") {
    checkoutSection.style.display = "flex";
    cartButton.style.display = "none";
    renderCheckout();
  }
  if (route === "cart") {
    cartAside.style.display = "block";
  }
}
