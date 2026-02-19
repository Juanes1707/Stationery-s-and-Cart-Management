
export const state = {
  cart: []
};

export function removeFromCart(id) {
  state.cart = state.cart.filter(item => item.id !== id);
}


// Agregar producto al carrito
export function addToCart(product) {

  const existingProduct = state.cart.find(item => item.id === product.id);

  if (existingProduct) {
    existingProduct.quantity += 1;
  } else {
    state.cart.push({
      ...product,
      quantity: 1
    });
  }

}

export function increaseQuantity(id) {
  const product = state.cart.find(item => item.id === id);
  if (product) {
    product.quantity += 1;
  }
}

export function decreaseQuantity(id) {
  const product = state.cart.find(item => item.id === id);
  if (product && product.quantity > 1) {
    product.quantity -= 1;
  }
}
