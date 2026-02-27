// SELECTORES
const productsContainer = document.querySelector(".main__products-container");
const cartItemsContainer = document.getElementById("cartItems");
const emptyCartMessage = document.getElementById("emptyCartMessage");
const cartFooter = document.getElementById("cartFooter");
const searchInput = document.getElementById("searchInput");
const cartButton = document.querySelector("#cartButton");
const cart = document.querySelector(".cart__aside");
const appContainer = document.querySelector(".app__container");
const profileButton = document.querySelector('#profileButton');
const homeButton = document.querySelector("#homeButton");
const categoryButtons = document.querySelectorAll(".category__button");

// VARIABLE PARA CONTROLAR LA CATEGORÍA ACTUAL
let currentCategory = "todos";

// FUNCIÓN 1: Renderizar catálogo
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
        <button class="product__button" data-id="${product.id}">Agregar al carrito</button>
      </div>
    </div>
    `;
    productsContainer.innerHTML += productCard;
  });
}

// FUNCIÓN 2: Renderizar carrito
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
        <img src="${item.image}" alt="${item.name}" class="cart__item-image">
        <div class="cart__item-info">
          <h4>${item.name}</h4>
          <p class="cart__item-price">$${subtotal}</p>
          <div class="cart__controls">
            <button class="decrease" data-id="${item.id}" ${item.quantity === 1 ? 'disabled' : ''}>−</button>
            <span class="cart__quantity">${item.quantity}</span>
            <button class="increase" data-id="${item.id}">+</button>
          </div>
        </div>
        <button class="remove" data-id="${item.id}" title="Eliminar"><i class="fa-solid fa-trash"></i></button>
      </div>
    `;
    cartItemsContainer.innerHTML += cartItem;
  });

  const subtotalCarrito = state.cart
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toLocaleString("es-CO");

  cartFooter.innerHTML = `
    <div class="cart__summary">
      <h3 class="cart__total">Subtotal: $${subtotalCarrito}</h3>
    </div>
    <button class="checkout">Finalizar Compra</button>
  `;
}

// FUNCIÓN 3: Filtrar por categoría
function filterByCategory(category) {
  if (category === "todos") {
    renderProducts(products);
  } else {
    const filteredProducts = products.filter(product => product.category === category);
    renderProducts(filteredProducts);
  }
}

// FUNCIÓN 4: Actualizar botones de categoría activos
function updateCategoryButtons(category) {
  categoryButtons.forEach(button => {
    button.classList.remove("active");
    if (button.dataset.category === category) {
      button.classList.add("active");
    }
  });
}

// Abrir/cerrar carrito
cartButton.addEventListener("click", () => {
  appContainer.classList.toggle("cart-open");
  });

// Manejador de eventos del catálogo
productsContainer.addEventListener("click", function (event) {
  if (event.target.tagName === "BUTTON") {
    const productId = parseInt(event.target.dataset.id);
    const product = products.find((p) => p.id === productId);
    addToCart(product);
    saveCart(); // FUNCIÓN DEL ALMACENAMIENTO LOCAL
    renderCart();
    appContainer.classList.add("cart-open");

    //EFECTO VISUAL TEMPORAL "Agregado"
    const productButton = event.target; //Representa el elemento que recibio el clic en este caso que fue el boton
    const originalText = productButton.textContent; //Representa el texto actual que tiene el boton "Agregar al carrito"

    productButton.textContent = "✔ Agregado" // Se encarga de cambiar el texto del botón inmediatamente al hacer clic.
    productButton.disabled = true; //Desactuva el boton de manera temporal, de esta manera el usuario no puede hacer más clics en lo que dura el mensaje
    

    setTimeout(() => { // Esta función aplica una pausa breve; luego devuelve el botón a su estado original tras 1000 ms (1 segundo).
      productButton.textContent = originalText;
      productButton.disabled = false;
    }, 1000)
  }
});

// Manejador de eventos del carrito
cartItemsContainer.addEventListener("click", function (event) {
  const actionButton = event.target.closest("button");
  if (!actionButton) return;

  const productId = parseInt(actionButton.dataset.id);
  if (Number.isNaN(productId)) return;

  if (actionButton.classList.contains("increase")) {
    increaseQuantity(productId);
    saveCart(); // Ponemos la función de guardar en cada funcionalidad del carrito para que su estado se actualice constantemente
    renderCart();
  }

  if (actionButton.classList.contains("decrease")) {
    decreaseQuantity(productId);
    saveCart(); 
    renderCart();
  }

  if (actionButton.classList.contains("remove")) {
    removeFromCart(productId);
    saveCart(); 
    renderCart();
  }
});

// Búsqueda
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
      .includes(searchText)
  );

  renderProducts(filteredProducts);
});

// Manejador de eventos para categorías
categoryButtons.forEach(button => {
  button.addEventListener("click", function () {
    const category = this.dataset.category;
    currentCategory = category;
    filterByCategory(category);
    updateCategoryButtons(category);
  });
});


// Renderizado inicial
loadCart(); // FUNCIONES DE ALMACENAMIENTO LOCAL, se ejecutan primero para renderizar bien los datos del carrito
loadSales();
renderProducts(products);
renderCart();
renderHistory() // Agregamos el renderizado del historial para mantener visibles las ventas al actualizar

// Botón perfil / historial
if (profileButton) {
  profileButton.addEventListener("click", () => {
    navigate("profile");
    // asegurar que el panel de admin se inicialice y se abra
    if (typeof initAdmin === 'function') {
      try { initAdmin(); } catch(e) { console.warn('initAdmin error', e); }
    }
    const adminPanelEl = document.getElementById('adminPanel');
    if (adminPanelEl) adminPanelEl.classList.add('open');
  });
}

// Botón home
if (homeButton) {
  homeButton.addEventListener("click", () => {
    navigate("home");
  });
}

// Finalizar compra
cartFooter.addEventListener("click", (event) => {
  if (event.target.classList.contains("checkout")) {
    appContainer.classList.remove("cart-open");
    navigate("checkout");
  }
});
