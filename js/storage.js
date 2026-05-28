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

function normalizeDateValue(value) {
    if (!value) return "";
    if (value instanceof Date) {
        return value.toLocaleString("es-CO");
    }
    if (value instanceof String) {
        value = value.valueOf();
    }
    if (typeof value === "object") {
        if (value.date || value.fecha || value.fechaISO || value.value) {
            return normalizeDateValue(value.date || value.fecha || value.fechaISO || value.value);
        }
        if (typeof value.valueOf === "function") {
            const primitive = value.valueOf();
            if (primitive !== value) {
                return normalizeDateValue(primitive);
            }
        }
        const stringLike = tryConvertStringLikeObject(value);
        if (stringLike) {
            return normalizeDateValue(stringLike);
        }
        if (typeof value.toISOString === "function") {
            const parsed = new Date(value.toISOString());
            return isNaN(parsed.getTime()) ? "" : parsed.toLocaleString("es-CO");
        }
        if (typeof value.toJSON === "function") {
            const parsed = new Date(value.toJSON());
            return isNaN(parsed.getTime()) ? "" : parsed.toLocaleString("es-CO");
        }
        if (value._seconds != null || value.seconds != null) {
            const seconds = Number(value._seconds ?? value.seconds);
            const nanos = Number(value._nanoseconds ?? value.nanoseconds ?? 0);
            const parsed = new Date(seconds * 1000 + nanos / 1e6);
            return isNaN(parsed.getTime()) ? "" : parsed.toLocaleString("es-CO");
        }
        if (value.year != null && value.month != null && value.day != null) {
            const year = Number(value.year);
            const month = Number(value.month) - 1;
            const day = Number(value.day);
            const parsed = new Date(year, month, day);
            return isNaN(parsed.getTime()) ? "" : parsed.toLocaleString("es-CO");
        }
        return "";
    }
    if (typeof value === "number") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? String(value) : parsed.toLocaleString("es-CO");
    }
    if (typeof value === "string") {
        const parsed = new Date(value);
        return isNaN(parsed.getTime()) ? value : parsed.toLocaleString("es-CO");
    }
    return String(value);
}

function tryConvertStringLikeObject(objectValue) {
    if (!objectValue || typeof objectValue !== 'object') return '';
    const keys = Object.keys(objectValue);
    if (!keys.length) return '';
    const digitKeys = keys.filter(k => /^[0-9]+$/.test(k)).sort((a, b) => Number(a) - Number(b));
    if (digitKeys.length === 0) return '';
    const reconstructed = digitKeys.map(key => objectValue[key]).join('');
    return reconstructed || '';
}

function safeStringify(value) {
    try {
        return JSON.stringify(value);
    } catch (error) {
        return String(value);
    }
}

function loadSales() {
    const data = localStorage.getItem("ventas");
    state.sales = data ? JSON.parse(data) : [];
    state.sales = state.sales.map((sale) => ({
        ...sale,
        date: normalizeDateValue(sale.date || sale.fecha || sale.fechaISO),
        total: Number(sale.total || 0).toLocaleString("es-CO"),
    }));
} //Busca si el historial existe y su existe lo convierte de vuelta a array y lo mete al state de las ventas, si no, lo deja vacío

function normalizeSaleFromAPI(sale) {
    const payload = sale.itemsJson || {};
    const items = Array.isArray(payload) ? payload : (payload.items || []);
    const customer = Array.isArray(payload)
        ? { name: sale.clienteId || "", email: "", phone: "", address: "" }
        : (payload.customer || { name: sale.clienteId || "", email: "", phone: "", address: "" });
    const payment = Array.isArray(payload)
        ? { method: sale.metodoPago || "" }
        : (payload.payment || { method: sale.metodoPago || "" });

    return {
        id: sale.id,
        date: normalizeDateValue(sale.fecha || sale.date || sale.fechaISO),
        total: Number(sale.total || 0).toLocaleString("es-CO"),
        subtotal: Number(sale.subtotal || 0),
        descuentoValor: Number(sale.descuentoValor || 0),
        descuento: sale.descuentoJson || payload.descuento || null,
        estado: sale.estado || "CERRADA",
        items,
        customer,
        payment
    };
}

async function loadSalesFromAPI() {
    try {
        const data = await apiGet("ventas");
        state.sales = Array.isArray(data) ? data.map(normalizeSaleFromAPI) : [];
        saveSales();
    } catch (error) {
        console.error("Error cargando ventas desde SQLite:", error);
        loadSales();
    }
}
