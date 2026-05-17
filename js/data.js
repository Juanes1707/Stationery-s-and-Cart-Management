// ============================================================
// data.js - Productos cargados desde backend Express + SQLite
// ============================================================

let products = [];

function normalizeProduct(p) {
  const row = p?.dataValues || p || {};
  return {
    id: Number(row.id),
    name: row.nombre || row.name || "",
    category: row.categoria || row.category || "",
    price: parseFloat(row.precio ?? row.price ?? 0),
    cost: parseFloat(row.costo ?? row.cost ?? 0),
    code: row.codigo || row.code || "",
    tracking:
      row.seguimientoInventario === "true" ||
      row.seguimientoInventario === true ||
      row.tracking === "true" ||
      row.tracking === true,
    stock: parseInt(row.stock ?? 0, 10),
    image: row.imagen || row.image || "./imagenes y recursos/default.jpg",
    description: row.descripcion || row.description || "",
  };
}

async function loadProductsFromAPI() {
  try {
    const data = await apiGet("productos");
    products = Array.isArray(data) ? data.map(normalizeProduct) : [];

    if (products.length === 0) {
      console.warn('La tabla "productos" esta vacia o no devolvio datos.');
      if (typeof renderCatalogMessage === "function") {
        renderCatalogMessage(
          lastApiError
            ? "No se pudo conectar con SQLite. Inicia el backend con: cd backend && npm start"
            : 'La tabla "Productos" esta vacia.'
        );
      }
    }
  } catch (e) {
    products = [];
    console.error("Error al cargar productos desde SQLite:", e);
    if (typeof renderCatalogMessage === "function") {
      renderCatalogMessage("No se pudieron cargar los productos desde SQLite.");
    }
  }

  if (typeof renderProducts === "function" && products.length > 0) renderProducts(products);
  if (typeof rebuildCategoryButtons === "function") rebuildCategoryButtons();
  if (typeof initAdmin === "function") initAdmin();
}

function saveProductsToStorage() {
  // Migrado a API.
}
