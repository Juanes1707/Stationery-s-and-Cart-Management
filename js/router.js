// Variable para rastrear la ruta actual
let currentRoute = "home";

function navigate(route) {
  const mainSection = document.querySelector(".main__content-section");
  const heroSection = document.querySelector(".hero__section");
  const cartAside = document.querySelector("#cart");
  const historySection = document.querySelector("#historySection");
  const  checkoutSection = document.querySelector("#checkoutSection");
  const cartButton = document.querySelector("#cartButton");

  heroSection.style.display = "none";
  mainSection.style.display = "none";
  cartAside.style.display = "none";
  historySection.style.display = "none";
  checkoutSection.style.display = "none";

  currentRoute = route;

  if (route === "home") {
    heroSection.style.display = "block";
    mainSection.style.display = "block";
    cartAside.style.display = "block";
    cartButton.style.display = "block";
  }

  if (route === "history") {
    historySection.style.display = "block";
    cartButton.style.display = "none";
    renderHistory();
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
