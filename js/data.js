// ============================================================
// data.js - Productos cargados 100% desde Google Sheets
// No hay datos hardcodeados. La hoja "productos" es la fuente
// de verdad. Si está vacía, el catálogo aparece vacío.
// ============================================================

let products = []; // siempre empieza vacío

// ============================================================
// Normaliza una fila cruda de Google Sheets al formato del app.
// Sheets devuelve todo como string, así que hay que convertir.
// Los encabezados en Sheets son: id | nombre | categoría |
//   precio | costo | stock | seguimientoInventario
// (se aceptan también las claves en inglés por compatibilidad)
// ============================================================
function normalizeProduct(p) {
  return {
    id: Number(p.id),
    name: p.nombre || p.name || "",
    category: p.categoría || p.categoria || p.category || "",
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

// ============================================================
// Carga productos desde la API (Google Sheets).
// Llama a renderProducts() e initAdmin() cuando termina.
// ============================================================
async function loadProductsFromAPI() {
  try {
    const data = await apiGet("productos");
    if (Array.isArray(data) && data.length > 0) {
      products = data.map(normalizeProduct);
    } else {
      products = [];
      console.warn('La hoja "productos" está vacía o no devolvió datos.');
    }
  } catch (e) {
    products = [];
    console.error("Error al cargar productos desde Google Sheets:", e);
  }

  renderProducts(products);
  if (typeof rebuildCategoryButtons === "function") rebuildCategoryButtons();
  initAdmin();
}

// ============================================================
// No-op: ya no se usa localStorage.
// Se mantiene para no romper posibles llamadas en otros archivos
// mientras terminas la migración.
// ============================================================
function saveProductsToStorage() {
  // Migrado a API — no hace nada
}

// ============================================================
// Punto de entrada
// IMPORTANTE: api.js debe cargarse ANTES que data.js en el HTML
// ============================================================
loadProductsFromAPI();
