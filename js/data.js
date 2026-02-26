let products = [
  // Cuadernos
    {
    id: 1,
    name: "Cuaderno Profesional",
    category: "Cuadernos",
    price: 8500,
    image: "./imagenes y recursos/cuaderno_profesional.jpg",
    stock: 30,
    description: "Cuaderno de 100 hojas rayadas."
    },
    {
    id: 9,
    name: "Bloc de Notas",
    category: "Cuadernos",
    price: 6000,
    image: "./imagenes y recursos/bloc.jpg",
    stock: 12,
    description: "Bloc de notas de colores con 400 hojas."
    },
    {
    id: 11,
    name: "Cuaderno Universitario",
    category: "Cuadernos",
    price: 9800,
    image: "./imagenes y recursos/cuaderno.jpg",
    stock: 26,
    description: "Cuaderno universitario de 100 hojas cuadriculadas."
    },
    {
    id: 12,
    name: "Agenda Academica",
    category: "Cuadernos",
    price: 17000,
    image: "./imagenes y recursos/agenda.jpg",
    stock: 14,
    description: "Agenda academica semanal para organizar tareas y clases."
    },
    {
    id: 13,
    name: "Cuaderno Argollado A4",
    category: "Cuadernos",
    price: 12500,
    image: "./imagenes y recursos/cuaderno_argolladoA4.jpg",
    stock: 19,
    description: "Cuaderno argollado A4 de 120 hojas rayadas."
    },

  // Escritura
    {
    id: 2,
    name: "Lapiz HB",
    category: "Escritura",
    price: 1200,
    image: "./imagenes y recursos/lapiz.jpg",
    stock: 20,
    description: "Lapiz de grafito HB."
    },
    {
    id: 3,
    name: "Esferos Caja x12",
    category: "Escritura",
    price: 14000,
    image: "./imagenes y recursos/esferos.jpg",
    stock: 40,
    description: "Caja de 12 esferos de colores surtidos."
    },
    {
    id: 4,
    name: "Resaltadores Neon",
    category: "Escritura",
    price: 3500,
    image: "./imagenes y recursos/resaltador.jpg",
    stock: 25,
    description: "Resaltadores de colores neon."
    },
    {
    id: 5,
    name: "Borradores",
    category: "Escritura",
    price: 1000,
    image: "./imagenes y recursos/borrador.jpg",
    stock: 60,
    description: "Borradores de nata y de miga de pan, ideales para corregir errores de lapiz."
    },
    {
    id: 14,
    name: "Boligrafo Negro",
    category: "Escritura",
    price: 1800,
    image: "./imagenes y recursos/esferos.jpg",
    stock: 48,
    description: "Boligrafo de tinta negra con trazo suave."
    },
    {
    id: 15,
    name: "Set de Lapices x6",
    category: "Escritura",
    price: 5200,
    image: "./imagenes y recursos/lapiz.jpg",
    stock: 34,
    description: "Set de 6 lapices HB para uso escolar y oficina."
    },
    {
    id: 16,
    name: "Portaminas 0.5 mm",
    category: "Escritura",
    price: 4200,
    image: "./imagenes y recursos/portaminas.jpg",
    stock: 27,
    description: "Portaminas ergonomico de 0.5 mm para escritura precisa."
    },
    {
    id: 17,
    name: "Boligrafo Azul",
    category: "Escritura",
    price: 1700,
    image: "./imagenes y recursos/esferos.jpg",
    stock: 52,
    description: "Boligrafo azul de secado rapido."
    },

  // Utiles
    {
    id: 6,
    name: "Regla 30 cm",
    category: "Arte",
    price: 2500,
    image: "./imagenes y recursos/regla.jpg",
    stock: 20,
    description: "Regla de plastico transparente de 30 cm."
    },
    {
    id: 7,
    name: "Tijeras Escolares",
    category: "Arte",
    price: 5000,
    image: "./imagenes y recursos/tijeras.jpg",
    stock: 18,
    description: "Tijeras con punta redonda, ideales para ninos."
    },
    {
    id: 18,
    name: "Set Geometrico",
    category: "Arte",
    price: 7900,
    image: "./imagenes y recursos/setgeometrico.jpg",
    stock: 21,
    description: "Incluye regla, escuadra y transportador."
    },
    {
    id: 19,
    name: "Compas Escolar",
    category: "Arte",
    price: 6800,
    image: "./imagenes y recursos/compas.jpg",
    stock: 16,
    description: "Compas metalico para trazos de precision."
    },
    {
    id: 20,
    name: "Sacapuntas Doble",
    category: "Arte",
    price: 2300,
    image: "./imagenes y recursos/sacapuntas-doble.jpg",
    stock: 37,
    description: "Sacapuntas doble para lapiz estandar y jumbo."
    },
    {
    id: 21,
    name: "Pegante en Barra",
    category: "Útiles",
    price: 3200,
    image: "./imagenes y recursos/pegante_barra.jpg",
    stock: 29,
    description: "Pegante en barra de secado rapido y limpio."
    },

  // Organizacion
    {
    id: 8,
    name: "Carpeta Plastica",
    category: "Organización",
    price: 4000,
    image: "./imagenes y recursos/carpeta.jpg",
    stock: 22,
    description: "Carpeta plastica con cierre, ideal para organizar documentos."
    },
    {
    id: 22,
    name: "Archivador de Palanca",
    category: "Organización",
    price: 13500,
    image: "./imagenes y recursos/archivador_palanca.jpg",
    stock: 15,
    description: "Archivador resistente para documentos tamano carta."
    },
    {
    id: 23,
    name: "Separadores x8",
    category: "Organización",
    price: 3200,
    image: "./imagenes y recursos/separadoresx8.jpg",
    stock: 41,
    description: "Separadores de colores para clasificar materias."
    },
    {
    id: 24,
    name: "Carpeta Acordeon",
    category: "Organización",
    price: 11200,
    image: "./imagenes y recursos/carpeta_acordeon.jpg",
    stock: 18,
    description: "Carpeta acordeon de multiples divisiones."
    },
    {
    id: 25,
    name: "Etiquetas Adhesivas",
    category: "Organización",
    price: 2800,
    image: "./imagenes y recursos/etiquetas_adhesivas.jpg",
    stock: 46,
    description: "Etiquetas adhesivas para marcar cuadernos y carpetas."
    },

  // Arte
    {
    id: 10,
    name: "Marcadores x12",
    category: "Arte",
    price: 15000,
    image: "./imagenes y recursos/marcadores.jpg",
    stock: 10,
    description: "Set de 12 marcadores de colores surtidos, ideales para dibujo y arte."
    },
    {
    id: 26,
    name: "Lapices de Color x24",
    category: "Arte",
    price: 21000,
    image: "./imagenes y recursos/colores.jpg",
    stock: 13,
    description: "Set de 24 lapices de color con tonos intensos."
    },
    {
    id: 27,
    name: "Acuarelas x12",
    category: "Arte",
    price: 17800,
    image: "./imagenes y recursos/acuarelas.jpg",
    stock: 11,
    description: "Caja de acuarelas con 12 colores vibrantes."
    },
    {
    id: 28,
    name: "Pinceles Escolares x6",
    category: "Arte",
    price: 9500,
    image: "./imagenes y recursos/pinceles.jpg",
    stock: 17,
    description: "Set de 6 pinceles de diferentes puntas."
    },
    {
    id: 29,
    name: "Temperas x6",
    category: "Arte",
    price: 12400,
    image: "./imagenes y recursos/Temperas.jpg",
    stock: 14,
    description: "Set de temperas escolares en 6 colores basicos."
    },
    {
    id: 30,
    name: "Crayones x12",
    category: "Arte",
    price: 7300,
    image: "./imagenes y recursos/crayones.jpg",
    stock: 22,
    description: "Caja de crayones x12 para dibujo creativo."
    }
];

// Persistencia simple: si hay productos en localStorage los usamos
try {
  const stored = localStorage.getItem('productsData');
  if (stored) {
    const parsed = JSON.parse(stored);
    if (Array.isArray(parsed) && parsed.length > 0) {
      products = parsed;
    } else {
      localStorage.setItem('productsData', JSON.stringify(products));
    }
  } else {
    localStorage.setItem('productsData', JSON.stringify(products));
  }
} catch (e) {
  console.warn('No se pudo acceder a localStorage para productos', e);
}

function saveProductsToStorage() {
  try {
    localStorage.setItem('productsData', JSON.stringify(products));
  } catch (e) {
    console.warn('Error saving products', e);
  }
}

