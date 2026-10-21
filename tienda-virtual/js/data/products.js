
(function () {
  const SIZES_SHOES = ["38", "39", "40", "41", "42", "43"];
  const SIZES_TOPS = ["S", "M", "L", "XL"];
  const SIZES_DRESS = ["XS", "S", "M", "L"];
  const SIZES_PANTS = ["28", "30", "32", "34", "36"];
  const IMG = (f) => "images/products/" + f;

  const DELIVERY_NOTE =
    "Envío a todo Lima Metropolitana. Retiro gratis en tienda en 24 horas. Cambios y devoluciones dentro de los 30 días con boleta.";

  window.CATALOG = [
    /* ------------------------------ ZAPATILLAS ------------------------------ */
    {
      id: 101, slug: "zapatillas-urbanas-azul-royal", category: "zapatillas", gender: "Unisex",
      name: "Zapatillas urbanas azul royal", brand: "Urban Step",
      price: 259.9, oldPrice: 349.9, stock: 14, rating: 4.7, reviews: 128,
      sizes: SIZES_SHOES, colors: [{ name: "Azul royal / Blanco", hex: "#2547c4", image: 0 }],
      images: [IMG("zapatilla.jpeg")], tags: ["masvendido"],
      description: "Zapatillas de silueta clásica con capas en contraste azul royal y blanco. Cómodas para el día a día, con suela de goma de buen agarre.",
      features: ["Parte superior sintética y cuero", "Suela de goma antideslizante", "Plantilla acolchada", "Cierre con pasadores"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 102, slug: "zapatillas-tenis-negro-rojo", category: "zapatillas", gender: "Hombre",
      name: "Zapatillas de tenis negro y rojo", brand: "CourtPro",
      price: 229.9, oldPrice: 299.9, stock: 9, rating: 4.5, reviews: 64,
      sizes: SIZES_SHOES, colors: [{ name: "Negro / Rojo", hex: "#161616", image: 0 }],
      images: [IMG("zapatilla.png")], tags: [],
      description: "Diseñadas para el juego rápido: estabilidad lateral, amortiguación en talón y suela con diseño espiga para canchas duras.",
      features: ["Refuerzo lateral anti-desgaste", "Amortiguación en talón", "Malla respirable", "Suela tipo espiga"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 103, slug: "zapatillas-basquet-rojo", category: "zapatillas", gender: "Hombre",
      name: "Zapatillas de básquet rojo", brand: "Hoops Lab",
      price: 329.9, oldPrice: 419.9, stock: 6, rating: 4.8, reviews: 212,
      sizes: SIZES_SHOES, colors: [{ name: "Rojo / Blanco", hex: "#d6202f", image: 0 }],
      images: [IMG("zapatilla1.jpeg")], tags: ["masvendido", "nuevo"],
      description: "Zapatillas de básquet con gran retorno de energía y soporte de tobillo. Look deportivo en rojo intenso.",
      features: ["Amortiguación reactiva", "Soporte de tobillo", "Suela de alto agarre", "Ligeras"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 104, slug: "zapatillas-casual-negro-amarillo", category: "zapatillas", gender: "Hombre",
      name: "Zapatillas casual negro y amarillo", brand: "TrailX",
      price: 199.9, stock: 20, rating: 4.3, reviews: 41,
      sizes: SIZES_SHOES, colors: [{ name: "Negro / Amarillo", hex: "#1c1c1c", image: 0 }],
      images: [IMG("zapatilla2.jpeg")], tags: ["nuevo"],
      description: "Estilo casual con detalles en amarillo. Ideales para caminar toda la jornada con comodidad.",
      features: ["Gamuza sintética y malla", "Suela ligera", "Plantilla removible", "Detalle reflectante"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 105, slug: "zapatillas-skate-verde", category: "zapatillas", gender: "Unisex",
      name: "Zapatillas skate verde", brand: "Skate District",
      price: 279.9, oldPrice: 349.9, stock: 11, rating: 4.6, reviews: 87,
      sizes: SIZES_SHOES, colors: [{ name: "Verde / Crema", hex: "#1f7a3d", image: 0 }],
      images: [IMG("zapatilla3.jpeg")], tags: [],
      description: "Zapatillas de skate con parte superior reforzada y suela vulcanizada que se adapta a la tabla.",
      features: ["Refuerzo en puntera", "Suela vulcanizada", "Lengüeta acolchada", "Costuras dobles"],
      delivery: DELIVERY_NOTE,
    },

    /* -------------------------------- ZAPATOS -------------------------------- */
    {
      id: 201, slug: "zapatos-brogue-cuero-camel", category: "zapatos", gender: "Hombre",
      name: "Zapatos brogue de cuero camel", brand: "Caballero Clásico",
      price: 189.9, oldPrice: 249.9, stock: 8, rating: 4.6, reviews: 53,
      sizes: SIZES_SHOES, colors: [{ name: "Camel", hex: "#a8581f", image: 0 }],
      images: [IMG("zapato1.jpeg")], tags: ["masvendido"],
      description: "Zapatos con perforaciones decorativas en cuero color camel. Un clásico para oficina o eventos casuales elegantes.",
      features: ["Cuero con acabado pulido", "Forro interior suave", "Suela de cuero con taco de goma", "Cordones planos"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 202, slug: "zapatos-vestir-punta-recta-negro", category: "zapatos", gender: "Hombre",
      name: "Zapatos de vestir punta recta negro", brand: "Caballero Clásico",
      price: 219.9, stock: 12, rating: 4.4, reviews: 36,
      sizes: SIZES_SHOES, colors: [{ name: "Negro", hex: "#111111", image: 0 }],
      images: [IMG("zapato2.jpeg")], tags: ["nuevo"],
      description: "Zapatos formales con puntera recta y acabado brillante. Perfectos para ternos y ceremonias.",
      features: ["Cuero genuino", "Acabado brillante", "Plantilla acolchada", "Suela antideslizante"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 203, slug: "zapatos-oxford-negro", category: "zapatos", gender: "Hombre",
      name: "Zapatos Oxford negro", brand: "Caballero Clásico",
      price: 199.9, oldPrice: 259.9, stock: 10, rating: 4.5, reviews: 29,
      sizes: SIZES_SHOES, colors: [{ name: "Negro", hex: "#0e0e0e", image: 0 }],
      images: [IMG("zapato3.jpeg")], tags: [],
      description: "Oxford de corte clásico con puntera costurada. Elegancia atemporal para todo tipo de ocasión formal.",
      features: ["Corte Oxford clásico", "Cuero de primera", "Forro respirable", "Taco bajo"],
      delivery: DELIVERY_NOTE,
    },

    /* -------------------------------- CAMISAS -------------------------------- */
    {
      id: 301, slug: "camisa-blanca-manga-larga-clasica", category: "camisas", gender: "Mujer",
      name: "Camisa blanca manga larga clásica", brand: "Oficina Chic",
      price: 89.9, oldPrice: 119.9, stock: 25, rating: 4.4, reviews: 77,
      sizes: SIZES_TOPS, colors: [{ name: "Blanco", hex: "#ffffff", image: 0 }],
      images: [IMG("camisab1.jpeg")], tags: ["masvendido"],
      description: "Camisa blanca de corte recto y manga larga. Una básica indispensable que combina con todo.",
      features: ["Algodón con elastano", "Cuello clásico", "Botones nacarados", "Lavable a máquina"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 302, slug: "camisa-blanca-estilo-safari", category: "camisas", gender: "Mujer",
      name: "Camisa blanca estilo safari", brand: "Oficina Chic",
      price: 79.9, stock: 18, rating: 4.2, reviews: 22,
      sizes: SIZES_TOPS, colors: [{ name: "Blanco", hex: "#ffffff", image: 0 }],
      images: [IMG("camisab2.jpeg")], tags: ["nuevo"],
      description: "Camisa con bolsillos frontales y hombreras estilo safari. Ligera y fresca para el verano.",
      features: ["Tela liviana", "Bolsillos con solapa", "Hombreras con botón", "Mangas ajustables"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 303, slug: "camisa-slim-fit-azul-marino", category: "camisas", gender: "Hombre",
      name: "Camisa slim fit azul marino", brand: "Gentleman",
      price: 69.9, oldPrice: 99.9, stock: 30, rating: 4.6, reviews: 143,
      sizes: SIZES_TOPS, colors: [{ name: "Azul marino", hex: "#23247a", image: 0 }],
      images: [IMG("camisac1.jpeg")], tags: ["masvendido"],
      description: "Camisa de corte entallado en azul marino intenso, con botones oscuros. Lista para oficina o salida nocturna.",
      features: ["Corte slim fit", "Algodón fácil de planchar", "Cuello italiano", "Puños con botón"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 304, slug: "camisa-slim-fit-negra", category: "camisas", gender: "Hombre",
      name: "Camisa slim fit negra", brand: "Gentleman",
      price: 69.9, stock: 22, rating: 4.5, reviews: 98,
      sizes: SIZES_TOPS, colors: [{ name: "Negro", hex: "#111111", image: 0 }],
      images: [IMG("camisac2.jpeg")], tags: [],
      description: "Camisa negra entallada, versátil para looks formales y casuales.",
      features: ["Corte slim fit", "Algodón fácil de planchar", "Cuello italiano", "Costuras reforzadas"],
      delivery: DELIVERY_NOTE,
    },

    /* ------------------------------- VESTIDOS -------------------------------- */
    {
      id: 401, slug: "vestido-corset-perlas", category: "vestidos", gender: "Mujer",
      name: "Vestido corset de perlas", brand: "Noche Gala",
      price: 349.9, oldPrice: 449.9, stock: 4, rating: 4.9, reviews: 35,
      sizes: SIZES_DRESS, colors: [{ name: "Marfil", hex: "#f1ead9", image: 0 }],
      images: [IMG("vestido1.jpeg")], tags: ["nuevo"],
      description: "Vestido corto tipo corset con aplicaciones de perlas. Una pieza protagonista para matrimonios y eventos.",
      features: ["Aplicaciones de perlas", "Escote corazón", "Varillas internas", "Cierre invisible posterior"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 402, slug: "vestido-fiesta-rojo-encaje", category: "vestidos", gender: "Mujer",
      name: "Vestido de fiesta rojo con encaje", brand: "Noche Gala",
      price: 259.9, oldPrice: 329.9, stock: 7, rating: 4.7, reviews: 61,
      sizes: SIZES_DRESS, colors: [{ name: "Rojo", hex: "#c8101e", image: 0 }],
      images: [IMG("vestido2.jpeg")], tags: ["masvendido"],
      description: "Vestido de falda vaporosa en tul con apliques de encaje en el corpiño. Ideal para fiestas y quince años.",
      features: ["Falda de tul", "Apliques de encaje", "Tirantes finos", "Forro interior"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 403, slug: "vestido-fiesta-negro-encaje", category: "vestidos", gender: "Mujer",
      name: "Vestido de fiesta negro con encaje", brand: "Noche Gala",
      price: 259.9, stock: 9, rating: 4.6, reviews: 48,
      sizes: SIZES_DRESS, colors: [{ name: "Negro", hex: "#111111", image: 0 }],
      images: [IMG("vestido3.jpeg")], tags: [],
      description: "Elegante vestido negro con falda de tul y detalles florales en encaje. Siempre acertado.",
      features: ["Falda de tul", "Apliques florales", "Tirantes finos", "Forro interior"],
      delivery: DELIVERY_NOTE,
    },

    /* ------------------------------ PANTALONES ------------------------------- */
    {
      id: 501, slug: "pantalon-vestir-slim-azul-noche", category: "pantalones", gender: "Hombre",
      name: "Pantalón de vestir slim azul noche", brand: "Gentleman",
      price: 119.9, oldPrice: 159.9, stock: 16, rating: 4.4, reviews: 57,
      sizes: SIZES_PANTS, colors: [{ name: "Azul noche", hex: "#14172b", image: 0 }],
      images: [IMG("pantalon1.jpeg")], tags: [],
      description: "Pantalón de vestir de corte slim con caída impecable. Para oficina y eventos formales.",
      features: ["Corte slim", "Tela con elastano", "Bolsillos laterales", "Cierre con broche"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 502, slug: "pantalon-wide-leg-negro", category: "pantalones", gender: "Mujer",
      name: "Pantalón wide leg negro", brand: "Oficina Chic",
      price: 139.9, stock: 13, rating: 4.7, reviews: 84,
      sizes: SIZES_TOPS, colors: [{ name: "Negro", hex: "#161616", image: 0 }],
      images: [IMG("pantalon2.jpeg")], tags: ["nuevo", "masvendido"],
      description: "Pantalón de pierna ancha y talle alto con pinzas. Elegante, cómodo y muy versátil.",
      features: ["Talle alto", "Pierna ancha con pinzas", "Tela fluida", "Bolsillos laterales"],
      delivery: DELIVERY_NOTE,
    },
    {
      id: 503, slug: "pantalon-vestir-azul-marino", category: "pantalones", gender: "Hombre",
      name: "Pantalón de vestir azul marino", brand: "Gentleman",
      price: 129.9, oldPrice: 169.9, stock: 10, rating: 4.3, reviews: 31,
      sizes: SIZES_PANTS, colors: [{ name: "Azul marino", hex: "#1f2d5c", image: 0 }],
      images: [IMG("pantalon3.jpeg")], tags: [],
      description: "Pantalón de vestir con textura sutil en azul marino. Corte recto y cómodo.",
      features: ["Corte recto", "Tela con textura", "Bolsillos con ojal", "Pretina interior antideslizante"],
      delivery: DELIVERY_NOTE,
    },
  ];
})();
