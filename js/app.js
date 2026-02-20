// IMPORTS
import { products } from "./data.js";
import { state, addToCart } from "./state.js";
import { increaseQuantity, decreaseQuantity } from "./state.js";
import { removeFromCart } from "./state.js";

// SELECTORES
const productsContainer = document.querySelector(".main__products-container");
const cartItemsContainer = document.getElementById("cartItems");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const cartFooter = document.getElementById("cartFooter");
const searchInput = document.getElementById("searchInput");
const cartButton = document.querySelector(".cart__button");
const cart = document.querySelector(".cart__aside");
const appContainer = document.querySelector(".app__container");


//  FUNCIÓN 1: Render catálogo
function renderProducts(productList) {
  productsContainer.innerHTML = "";

  productList.forEach((product) => {
    const productCard = `
    <div class="product__card">
        <img src="${product.image}" alt="${product.name}">
        <h3>${product.name}</h3>
        <p>${product.description}</p>
        <span class="product__price">$${product.price}</span>
        <button data-id="${product.id}">
        Agregar al carrito
        </button>
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
        <div class="cart__item">
            <h4>${item.name}</h4>
            <img src="${item.image}" alt="${item.name}">  
            <div class="cart__controls">
                <button class="decrease" data-id="${item.id}">-</button>
                <span>${item.quantity}</span>
                <button class="increase" data-id="${item.id}">+</button>
            </div>

            <p>Subtotal: $${subtotal}</p>

            <button class="remove" data-id="${item.id}">Eliminar</button>
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
  <h3>Total: $${total}</h3>
  <button class="checkout">Comprar</button>
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
