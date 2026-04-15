// ============================================================
// app.js - Lógica principal de la interfaz
// Depende de: api.js, data.js, state.js, storage.js,
//             sales.js, history.js, router.js, admin.js
// ============================================================
 
// ── Selectores globales ─────────────────────────────────────
const productsContainer  = document.querySelector('.main__products-container');
const cartItemsContainer = document.getElementById('cartItems');
const emptyCartMessage   = document.getElementById('emptyCartMessage');
const cartFooter         = document.getElementById('cartFooter');
const searchInput        = document.getElementById('searchInput');
const cartButton         = document.querySelector('#cartButton');
const appContainer       = document.querySelector('.app__container');
const profileButton      = document.querySelector('#profileButton');
const homeButton         = document.querySelector('#homeButton');
const categoryButtons    = document.querySelectorAll('.category__button');
 
// Categoría activa en el catálogo
let currentCategory = 'todos';
 
// ============================================================
// FUNCIÓN 1 — Renderizar catálogo de productos
// Cada tarjeta incluye un botón "Editar" (sección 2.3)
// para modificar el producto directamente desde el flujo de venta
// ============================================================
function renderProducts(productList) {
  productsContainer.innerHTML = '';
 
  productList.forEach(product => {
    const card = `
      <div class="product__card">
        <img src="${product.image}" alt="${product.name}">
        <div class="product__info">
          <h3>${product.name}</h3>
          <p>${product.description}</p>
          <span class="product__price">$${Number(product.price).toLocaleString('es-CO')}</span>
          <div class="product__card-actions">
            <button class="product__button"      data-id="${product.id}">Agregar al carrito</button>
            <button class="product__edit-button" data-id="${product.id}" title="Editar producto">✏️</button>
          </div>
        </div>
      </div>
    `;
    productsContainer.innerHTML += card;
  });
}
 
// ============================================================
// FUNCIÓN 2 — Renderizar carrito
// Incluye botón "Guardar venta" para ventas abiertas (sección 2.2)
// ============================================================
function renderCart() {
  cartItemsContainer.innerHTML = '';
 
  if (state.cart.length === 0) {
    emptyCartMessage.innerHTML = '<p>El carrito está vacío</p>';
    cartFooter.innerHTML       = '';
    return;
  }
 
  emptyCartMessage.innerHTML = '';
 
  state.cart.forEach(item => {
    const subtotal = (item.price * item.quantity).toLocaleString('es-CO');
    cartItemsContainer.innerHTML += `
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
        <button class="remove" data-id="${item.id}" title="Eliminar">
          <i class="fa-solid fa-trash"></i>
        </button>
      </div>
    `;
  });
 
  const subtotalCarrito = state.cart
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
    .toLocaleString('es-CO');
 
  // El footer tiene dos botones:
  // 1. "Guardar venta" → holdCurrentSale() de sales.js (venta abierta)
  // 2. "Finalizar Compra" → va al checkout
  cartFooter.innerHTML = `
    <div class="cart__summary">
      <h3 class="cart__total">Subtotal: $${subtotalCarrito}</h3>
    </div>
    <button class="hold-sale">🔖 Guardar venta</button>
    <button class="checkout">Finalizar Compra</button>
  `;
}
 
// ============================================================
// FUNCIÓN 3 — Filtrar catálogo por categoría
// ============================================================
function filterByCategory(category) {
  if (category === 'todos') {
    renderProducts(products);
  } else {
    renderProducts(products.filter(p => p.category === category));
  }
}
 
// ============================================================
// FUNCIÓN 4 — Actualizar botón de categoría activo visualmente
// ============================================================
function updateCategoryButtons(category) {
  categoryButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === category);
  });
}
 
// ============================================================
// MODAL DE EDICIÓN RÁPIDA (sección 2.3)
// Permite editar nombre, precio y stock de un producto
// directamente desde el catálogo sin ir al panel admin.
// Los cambios se reflejan de inmediato en la UI y se envían
// a Google Sheets vía apiUpdate.
// ============================================================
function openQuickEditModal(productId) {
  const prod = products.find(p => p.id === productId);
  if (!prod) return;
 
  // Cerrar modal anterior si existe
  document.getElementById('quickEditModal')?.remove();
 
  const modal = document.createElement('div');
  modal.id        = 'quickEditModal';
  modal.className = 'sale-details-modal'; // reutiliza el mismo estilo de modal
 
  modal.innerHTML = `
    <div class="sale-details-content">
      <span class="close-btn">&times;</span>
      <h3>Editar producto</h3>
      <label>Nombre</label>
      <input id="qe-name"  value="${prod.name}"  style="width:100%; margin-bottom:8px; padding:6px; box-sizing:border-box;">
      <label>Precio venta</label>
      <input id="qe-price" value="${prod.price}" type="number" min="0"
             style="width:100%; margin-bottom:8px; padding:6px; box-sizing:border-box;">
      <label>Stock</label>
      <input id="qe-stock" value="${prod.stock ?? 0}" type="number" min="0"
             style="width:100%; margin-bottom:12px; padding:6px; box-sizing:border-box;">
      <button id="qe-save"   style="margin-right:8px;">Guardar</button>
      <button id="qe-cancel">Cancelar</button>
    </div>
  `;
 
  document.body.appendChild(modal);
 
  // Cerrar
  modal.querySelector('.close-btn').addEventListener('click', () => modal.remove());
  document.getElementById('qe-cancel').addEventListener('click', () => modal.remove());
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
 
  // Guardar cambios
  document.getElementById('qe-save').addEventListener('click', async () => {
    const newName  = document.getElementById('qe-name').value.trim();
    const newPrice = parseFloat(document.getElementById('qe-price').value);
    const newStock = parseInt(document.getElementById('qe-stock').value, 10);
 
    if (!newName || isNaN(newPrice) || newPrice < 0 || isNaN(newStock) || newStock < 0) {
      alert('Por favor ingresa valores válidos.');
      return;
    }
 
    // Actualizar en el array local
    prod.name  = newName;
    prod.price = newPrice;
    prod.stock = newStock;
 
    // Reflejar cambios en la UI de inmediato (sin esperar a Sheets)
    filterByCategory(currentCategory);
    renderCart(); // por si el producto está en el carrito
    modal.remove();
 
    // Enviar actualización a Google Sheets en segundo plano
    try {
      await apiUpdate('productos', {
        id:                    prod.id,
        nombre:                prod.name,
        categoría:             prod.category,
        precio:                prod.price,
        costo:                 prod.cost,
        codigo:                prod.code,
        seguimientoInventario: prod.tracking,
        stock:                 prod.stock,
        imagen:                prod.image,
        descripcion:           prod.description
      });
    } catch (e) {
      console.error('Error actualizando producto en Sheets:', e);
    }
  });
}
 
// ============================================================
// EVENTOS
// ============================================================
 
// Abrir / cerrar carrito
cartButton.addEventListener('click', () => {
  appContainer.classList.toggle('cart-open');
});
 
// Catálogo: agregar al carrito o editar producto rápido
productsContainer.addEventListener('click', function (event) {
  const btn = event.target.closest('button');
  if (!btn) return;
 
  const productId = parseInt(btn.dataset.id);
  if (isNaN(productId)) return;
 
  // Botón edición rápida (✏️)
  if (btn.classList.contains('product__edit-button')) {
    openQuickEditModal(productId);
    return;
  }
 
  // Botón agregar al carrito
  if (btn.classList.contains('product__button')) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
 
    addToCart(product);
    saveCart();
    renderCart();
    appContainer.classList.add('cart-open');
 
    // Efecto visual temporal "✔ Agregado"
    const originalText   = btn.textContent;
    btn.textContent      = '✔ Agregado';
    btn.disabled         = true;
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled    = false;
    }, 1000);
  }
});
 
// Carrito: aumentar, disminuir, eliminar items
cartItemsContainer.addEventListener('click', function (event) {
  const btn = event.target.closest('button');
  if (!btn) return;
 
  const productId = parseInt(btn.dataset.id);
  if (isNaN(productId)) return;
 
  if (btn.classList.contains('increase')) {
    increaseQuantity(productId);
    saveCart();
    renderCart();
  }
  if (btn.classList.contains('decrease')) {
    decreaseQuantity(productId);
    saveCart();
    renderCart();
  }
  if (btn.classList.contains('remove')) {
    removeFromCart(productId);
    saveCart();
    renderCart();
  }
});
 
// Footer del carrito: guardar venta o finalizar compra
cartFooter.addEventListener('click', event => {
  // Guardar venta abierta
  if (event.target.classList.contains('hold-sale')) {
    holdCurrentSale(); // definida en sales.js
  }
  // Ir al checkout
  if (event.target.classList.contains('checkout')) {
    appContainer.classList.remove('cart-open');
    navigate('checkout');
  }
});
 
// Búsqueda en tiempo real
searchInput.addEventListener('input', function () {
  const searchText = this.value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
 
  const filtered = products.filter(p =>
    p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').includes(searchText)
  );
  renderProducts(filtered);
});
 
// Filtro por categorías
categoryButtons.forEach(btn => {
  btn.addEventListener('click', function () {
    currentCategory = this.dataset.category;
    filterByCategory(currentCategory);
    updateCategoryButtons(currentCategory);
  });
});
 
// Botón perfil
if (profileButton) {
  profileButton.addEventListener('click', () => {
    navigate('profile');
    if (typeof initAdmin === 'function') {
      try { initAdmin(); } catch (e) { console.warn('initAdmin error', e); }
    }
    document.getElementById('adminPanel')?.classList.add('open');
  });
}
 
// Botón home
if (homeButton) {
  homeButton.addEventListener('click', () => navigate('home'));
}
 
// ============================================================
// INICIALIZACIÓN
// Se ejecuta una sola vez al cargar la página.
// data.js (que carga antes) ya llamó a loadProductsFromAPI()
// que a su vez llama a renderProducts() e initAdmin().
// Aquí solo cargamos carrito y ventas desde localStorage.
// ============================================================
loadCart();
loadSales();
renderCart();
renderHistory();