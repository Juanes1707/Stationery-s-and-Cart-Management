// Variable para rastrear la ruta actual
let currentRoute = "home";

function navigate(route) {
  const mainSection = document.querySelector(".main__content-section");
  const heroSection = document.querySelector(".hero__section");
  const cartAside = document.querySelector("#cart");
  const historySection = document.querySelector("#historySection");
  const  checkoutSection = document.querySelector("#checkoutSection");
  const adminPanel = document.querySelector("#adminPanel");
  const cartButton = document.querySelector("#cartButton");

  heroSection.style.display = "none";
  mainSection.style.display = "none";
  cartAside.style.display = "none";
  historySection.style.display = "none";
  checkoutSection.style.display = "none";
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

  if (route === "profile") {
    // Mostrar historial a la izquierda y el panel admin a la derecha
    historySection.style.display = "block";
    if (adminPanel) adminPanel.classList.add('open');
    // also ensure container margin for listing
    document.querySelector('.app__container')?.classList.add('admin-open');
    cartButton.style.display = "none";
    renderHistory();
    if (typeof initAdmin === "function") {
      initAdmin();
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
