// IMPORTS
import { products } from "./data.js";
import { state, addToCart } from "./state.js";
import { increaseQuantity, decreaseQuantity } from "./state.js";
import { removeFromCart } from "./state.js";
import { navigate } from "./router.js";
// SELECTORES
const productsContainer = document.querySelector(".main__products-container");
const cartItemsContainer = document.getElementById("cartItems");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const cartFooter = document.getElementById("cartFooter");
const searchInput = document.getElementById("searchInput");
const cartButton = document.querySelector("#cartButton");
const cart = document.querySelector(".cart__aside");
const appContainer = document.querySelector(".app__container");
const profileButton = document.querySelector('#profileButton')
const homeButton = document.querySelector("#homeButton")


//  FUNCIÓN 1: Render catálogo
function renderProducts(productList) {
  productsContainer.innerHTML = "";

  productList.forEach((product) => {
    const productCard = `
    <div class="product__card">
      <img src="${product.image}" alt="${product.name}">
      <div class="product__info">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="product__price">$${product.price}</span>
        <button data-id="${product.id}">
        Agregar al carrito
        </button>
      </div>
    </div>
    `;
    productsContainer.innerHTML += productCard;
  });
}

//  FUNCIÓN 2: Render carrito
function renderCart() {
  cartItemsContainer.innerHTML = "";

  if (state.cart.length === 0) {
    emptyCartMessage.innerHTML = "<p>El carrito está vacío</p>";
    cartFooter.innerHTML = "";
    return;
  }

  emptyCartMessage.innerHTML = "";

  state.cart.forEach((item) => {
    const subtotal = (item.price * item.quantity).toLocaleString("es-CO");

    const cartItem = `
        <div class="cart__item-container">
          <div class="cart__item">
              <img src="${item.image}" alt="${item.name}">  
              <div class="cart__controls">
                  <button class="decrease" data-id="${item.id}">-</button>
                  <span class="cart__quantity">${item.quantity}</span>
                <button class="increase" data-id="${item.id}">+</button>
              </div>
          <div class="cart__item-info">
            <h4>${item.name}</h4>
            <p>$${subtotal}</p>
          </div>
          <button class="remove" data-id="${item.id}"><i class="fa-solid fa-trash"></i></button>
        </div>
    `;

    cartItemsContainer.innerHTML += cartItem;
  });

  const total = state.cart
    .reduce((acc, item) => {
      return acc + item.price * item.quantity;
    }, 0)
    .toLocaleString("es-CO");

  cartFooter.innerHTML = `
  <h3 class="cart__total">Total: $${total}</h3>
  <button class="checkout">Finalizar Compra</button>
`;
}

//crea un estado para el carrito (cuando se abre)
cartButton.addEventListener("click", () => {
    appContainer.classList.toggle("cart-open");
});

//  EVENT LISTENER catálogo
productsContainer.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find((p) => p.id === productId);

    addToCart(product);
    renderCart();
  }
});

cartItemsContainer.addEventListener("click", function (event) {
  const productId = parseInt(event.target.dataset.id);

  if (event.target.classList.contains("increase")) {
    increaseQuantity(productId);
    renderCart();
  }

  if (event.target.classList.contains("decrease")) {
    decreaseQuantity(productId);
    renderCart();
  }

  if (event.target.classList.contains("remove")) {
    removeFromCart(productId);
    renderCart();
  }
});

searchInput.addEventListener("input", function (event) {
  const searchText = event.target.value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const filteredProducts = products.filter((product) =>
    product.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .includes(searchText),
  );

  renderProducts(filteredProducts);
});
//  Render inicial
renderProducts(products);
renderCart();

console.log(products);
console.log(state);

//EVENT LISTENER PARA EL HISTORIAL DE VENTAS
if (profileButton) {
  profileButton.addEventListener("click", () => {
  navigate("history")
  });
}
//EVENT LISTENER PARA VOLVER AL HOME DE LA PAGINA
if (homeButton) {
  homeButton.addEventListener("click", () => {
    navigate("")
  });
}
