// Función recursiva que recorre el objeto y elimina campos que terminen en 'Id'
// Por ejemplo: clienteId, proveedorId, categoriaId
function stripIdSuffixes(data) {
  // Si es un array, aplicamos la limpieza a cada elemento
  if (Array.isArray(data)) return data.map(stripIdSuffixes);

  // Si es un objeto, recorremos cada campo
  if (data && typeof data === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(data)) {
      // Si el campo termina en 'Id', lo saltamos (no lo incluimos en la respuesta)
      if (key.endsWith('Id')) continue;
      // Si no termina en 'Id', lo incluimos y aplicamos la limpieza recursivamente
      cleaned[key] = stripIdSuffixes(value);
    }
    return cleaned;
  }

  // Si es un valor primitivo (string, number, boolean), lo devolvemos tal cual
  return data;
}

// Middleware de post-procesamiento — intercepta res.json antes de enviar la respuesta
module.exports = (req, res, next) => {
  // Guardamos el res.json original
  const originalJson = res.json.bind(res);

  // Reemplazamos res.json por nuestra versión que limpia los campos antes de enviar
  res.json = (body) => originalJson(stripIdSuffixes(body));

  // Llamamos a next() para que la petición continúe hacia el controlador
  next();
};