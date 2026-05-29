# Papel y Luna — Sistema de Punto de Venta

Sistema de gestión y punto de venta (POS) desarrollado para la papelería **Papel y Luna**. La aplicación permite administrar el inventario, procesar ventas, gestionar clientes, proveedores, compras y generar reportes, todo desde una interfaz web moderna y responsiva.

## Descripción del proyecto

**Papel y Luna** es un sistema POS completo orientado al comercio minorista de papelería. Cuenta con:

- **Punto de venta**: Búsqueda de productos, carrito de compras, checkout con descuentos y generación de facturas.
- **Gestión de inventario**: Registro, edición y control de stock de productos por categoría.
- **Gestión de clientes y proveedores**: CRUD completo con información de contacto.
- **Registro de compras**: Control de entradas de mercancía y actualización automática de stock.
- **Descuentos**: Creación y aplicación de descuentos a ventas.
- **Faltantes**: Seguimiento de productos con stock bajo o agotado.
- **Reportes**: Visualización de ventas, ingresos y movimientos.
- **Autenticación y roles**: Sistema de login con JWT, roles de administrador y cajero, contraseñas cifradas con bcrypt.
- **Auditoría**: Registro de actividad y logs de solicitudes.

### Stack tecnológico

| Capa | Tecnología |
|------|-----------|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Backend | Node.js, Express.js |
| Base de datos | SQLite (vía Sequelize ORM) |
| Autenticación | JWT + bcrypt |
| Validación | express-validator |

---

## Autores

| Nombre | Código |
|--------|--------|
| Samuel Alejandro Gerena | 340727 |
| Samuel Hernandez Hoyos | 350997 |
| Juan Esteban Rubio Castaño | 352018 |

**Institución:** Universidad de La Sabana

---

## Instalación y ejecución

### Requisitos previos

- Node.js v18 o superior
- npm

### Pasos

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones y datos iniciales
node backend/migrate.js

# Iniciar el servidor
node backend/server.js
```

El servidor quedará disponible en `http://localhost:3000`.

Abrir `index.html` en el navegador o acceder a través del servidor para usar la aplicación.

---

*Proyecto académico — Universidad de La Sabana, 2026.*
