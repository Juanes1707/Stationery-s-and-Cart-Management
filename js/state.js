const state = {
  cart: [],
  sales: []
}; 

function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
}

function addToCart(product) {
  const existingProduct = state.cart.find(item => item.id === product.id);
  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    state.cart.push({ ...product, quantity: 1 });
  }
}

function increaseQuantity(id) {
  const product = state.cart.find(item => item.id === id);
  if (product) {
    product.quantity += 1;
  }
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

 