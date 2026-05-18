require("dotenv").config();
const path = require("path");
const express = require("express");
const cors    = require("cors");
const { sequelize } = require("./models");
const { runMigrations } = require("./migrate");

const requestLogger = require("./middlewares/requestLogger");
const sanitizeIds   = require("./middlewares/sanitizeIds");
const authJwt       = require("./middlewares/authJwt");
const requireRole   = require("./middlewares/requireRole");

const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(sanitizeIds);

// Rutas publicas de autenticacion
app.use("/api/auth", require("./routes/auth"));

// Catalogo de productos: GET publico, escritura protegida en el router
app.use("/api/productos", require("./routes/productos"));

// Rutas protegidas: cualquier usuario autenticado
app.use("/api/ventas",   authJwt, requireRole("USER"), require("./routes/ventas"));
app.use("/api/clientes", authJwt, requireRole("USER"), require("./routes/clientes"));

// Rutas protegidas: solo ADMIN
app.use("/api/compras",     authJwt, requireRole("ADMIN"), require("./routes/compras"));
app.use("/api/proveedores", authJwt, requireRole("ADMIN"), require("./routes/proveedores"));
app.use("/api/categorias",  authJwt, requireRole("ADMIN"), require("./routes/categorias"));

app.use(express.static(path.join(__dirname, "..")));

app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    message: status === 500 ? "Error interno del servidor" : err.message,
  });
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Conexion a SQLite exitosa");
    await runMigrations();
    console.log("Migraciones verificadas");
    app.listen(PORT, () => console.log("Servidor en http://localhost:" + PORT));
  } catch (error) {
    console.error("Error al iniciar el servidor:", error);
  }
})();
