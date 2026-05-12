const state = {
  cart: [],
  sales: []
}; 

function getAvailableStock(productId) {
  const product = products.find(item => item.id === productId);
  if (!product || product.tracking === false) return Number.MAX_SAFE_INTEGER;
  return Number.parseInt(product.stock ?? 0, 10);
}

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
}

function addToCart(product) {
  if (product.tracking !== false && Number(product.stock || 0) <= 0) {
    if (typeof showToast === "function") showToast("Producto sin stock disponible.", "error");
    return false;
  }

  const existingProduct = state.cart.find(item => item.id === product.id);
  if (existingProduct) {
    if (existingProduct.quantity >= getAvailableStock(product.id)) {
      if (typeof showToast === "function") showToast("No hay más stock disponible para este producto.", "error");
      return false;
    }
    existingProduct.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
  return true;
}

function increaseQuantity(id) {
  const product = state.cart.find(item => item.id === id);
  if (product) {
    if (product.quantity >= getAvailableStock(id)) {
      if (typeof showToast === "function") showToast("No hay más stock disponible para este producto.", "error");
      return false;
    }
    product.quantity += 1;
  }
  return true;
}

function decreaseQuantity(id) {
  const product = state.cart.find(item => item.id === id);
  if (product) {
    if (product.quantity === 1) {
      removeFromCart(id);
    } else {
      product.quantity -= 1;
    }
  }
}

 
