function navigate(route) {
  const mainSection = document.querySelector(".main__content-section");
  const heroSection = document.querySelector(".hero__section");
  const cartAside = document.querySelector("#cart");
  const historySection = document.querySelector("#historySection");
  const  checkoutSection = document.querySelector("#checkoutSection");

  heroSection.style.display = "none";
  mainSection.style.display = "none";
  cartAside.style.display = "none";
  historySection.style.display = "none";
  checkoutSection.style.display = "none";

  if (route === "home") {
    heroSection.style.display = "block";
    mainSection.style.display = "block";
    cartAside.style.display = "block";
  }

  if (route === "history") {
    historySection.style.display = "block";
    renderHistory();
  }

  if (route === "checkout") {
    checkoutSection.style.display = "block";
  }

  if (route === "cart") {
    cartAside.style.display = "block";
  }
}
