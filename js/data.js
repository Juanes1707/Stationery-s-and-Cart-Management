// ============================================================
// data.js - Productos cargados desde backend Express + SQLite
// ============================================================

let products = [];

function normalizeProduct(p) {
  return {
    id: Number(p.id),
    name: p.nombre || p.name || "",
    category: p.categoria || p.category || "",
    price: parseFloat(p.precio ?? p.price ?? 0),
    cost: parseFloat(p.costo ?? p.cost ?? 0),
    code: p.codigo || p.code || "",
    tracking:
      p.seguimientoInventario === "true" ||
      p.seguimientoInventario === true ||
      p.tracking === "true" ||
      p.tracking === true,
    stock: parseInt(p.stock ?? 0, 10),
    image: p.imagen || p.image || "./imagenes y recursos/default.jpg",
    description: p.descripcion || p.description || "",
  };
}

async function loadProductsFromAPI() {
  try {
    const data = await apiGet("productos");
    products = Array.isArray(data) ? data.map(normalizeProduct) : [];

    if (products.length === 0) {
      console.warn('La tabla "productos" esta vacia o no devolvio datos.');
    }
  } catch (e) {
    products = [];
    console.error("Error al cargar productos desde SQLite:", e);
  }

  if (typeof renderProducts === "function") renderProducts(products);
  if (typeof rebuildCategoryButtons === "function") rebuildCategoryButtons();
  if (typeof initAdmin === "function") initAdmin();
}

function saveProductsToStorage() {
  // Migrado a API.
}
