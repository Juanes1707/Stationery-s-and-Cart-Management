//Implementación del LocalStorage

function saveCart() {
    localStorage.setItem("carrito", JSON.stringify(state.cart));
} //Se encarga de guardar el carrito actual en el localStorage con la llave "carrito", debido a que este no guardaa texto, usamos el jsonstringfy para convertir el array del carrito a texto

function loadCart() {
    const data = localStorage.getItem("carrito");
    state.cart = data ? JSON.parse(data) : [];
} // Busca si el carrito existe en loclStorage, y si existe lo convierte devuelta a array con el JSON parse y lo mete al state del carrito, si no existe simplemente lo deja vacío

function saveSales() {
    localStorage.setItem("ventas", JSON.stringify(state.sales));
} //Se encarga de guardar el historial de las ventas cerradas con la llave de "ventas"

function loadSales() {
    const data = localStorage.getItem("ventas");
    state.sales = data ? JSON.parse(data) : [];
} //Busca si el historial existe y su existe lo convierte de vuelta a array y lo mete al state de las ventas, si no, lo deja vacío
