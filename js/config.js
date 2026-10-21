/* ==========================================================================
   CONFIGURACIÓN GENERAL DE LA TIENDA
   Aquí cambias nombre, envíos, cupones, banners y categorías sin tocar
   el resto del código.
   ========================================================================== */
window.SITE_CONFIG = {
  name: "Ripley",                       // nombre mostrado en título y textos
  tagline: "Tienda virtual",
  currency: "S/",
  locale: "es-PE",
  freeShippingFrom: 199,                // envío gratis desde este monto
  shippingCost: 14.9,                   // costo de envío a domicilio
  installments: 3,                      // cuotas sin interés mostradas en el producto
  itemsPerPage: 12,                     // productos por "página" en el catálogo
  maxQtyPerLine: 10,
  whatsapp: "51999999999",              // número de contacto (sin +)
  email: "ayuda@tienda.example",
  disclaimer: "Proyecto académico de demostración. Los pagos y el inicio de sesión son simulados.",

  // Cupones: pct = % de descuento | ship = envío gratis
  coupons: {
    BIENVENIDO10: { type: "pct", value: 10, label: "10% de descuento" },
    ENVIOGRATIS:  { type: "ship", label: "Envío gratis" },
  },

  // Tiendas para retiro
  stores: [
    "Ripley Mall del Sur – San Juan de Miraflores",
    "Ripley Jockey Plaza – Santiago de Surco",
    "Ripley Megaplaza – Independencia",
    "Ripley La Rambla – San Borja",
  ],

  // Distritos de reparto (agrega los que necesites)
  districts: [
    "Ate", "Barranco", "Breña", "Comas", "Chorrillos", "Jesús María", "La Molina",
    "La Victoria", "Lima Cercado", "Lince", "Los Olivos", "Magdalena", "Miraflores",
    "Pueblo Libre", "San Borja", "San Isidro", "San Juan de Lurigancho",
    "San Juan de Miraflores", "San Miguel", "Santiago de Surco", "Surquillo",
    "Villa El Salvador", "Villa María del Triunfo",
  ],
};

/* --------------------------------------------------------------------------
   CATEGORÍAS  (id debe coincidir con el campo `category` de cada producto)
   ícono = nombre de Bootstrap Icons (https://icons.getbootstrap.com)
   -------------------------------------------------------------------------- */
window.SITE_CATEGORIES = [
  { id: "zapatillas", name: "Zapatillas", icon: "lightning-charge", image: "images/products/zapatilla1.jpeg", color: "#efe9fb" },
  { id: "zapatos",    name: "Zapatos",    icon: "bag",              image: "images/products/zapato1.jpeg",    color: "#fdeee4" },
  { id: "camisas",    name: "Camisas",    icon: "person-standing",  image: "images/products/camisac1.jpeg",   color: "#e6eefc" },
  { id: "vestidos",   name: "Vestidos",   icon: "stars",            image: "images/products/vestido2.jpeg",   color: "#fde7ea" },
  { id: "pantalones", name: "Pantalones", icon: "rulers",           image: "images/products/pantalon1.jpeg",  color: "#e8f3ec" },
];

/* --------------------------------------------------------------------------
   BANNERS DEL CARRUSEL PRINCIPAL
   type "image": una imagen completa (ideal 1280×~450, o la que tengas)
   type "promo": banner diseñado con texto + imágenes de producto
   -------------------------------------------------------------------------- */
window.SITE_BANNERS = [
  {
    type: "image",
    src: "images/banners/ofertas.jpg",
    alt: "Especial de ofertas: hasta 50% de descuento",
    href: "#/catalogo?oferta=1",
    fit: "contain-left",   // la imagen original es 3:2; se acomoda sin deformarla
  },
  {
    type: "promo",
    theme: "purple",
    kicker: "Moda de fiesta",
    title: "Vestidos y zapatos para brillar",
    text: "Hasta 25% dto. en la colección formal.",
    cta: "Ver vestidos",
    href: "#/catalogo?cat=vestidos",
    images: ["images/products/vestido2.jpeg", "images/products/vestido3.jpeg", "images/products/zapato2.jpeg"],
  },
  {
    type: "promo",
    theme: "dark",
    kicker: "Zapatillas",
    title: "Estrena desde S/ 199.90",
    text: "Urbanas, de básquet, skate y más. Envío gratis desde S/ 199.",
    cta: "Comprar zapatillas",
    href: "#/catalogo?cat=zapatillas",
    images: ["images/products/zapatilla1.jpeg", "images/products/zapatilla3.jpeg", "images/products/zapatilla.jpeg"],
  },
];

/* Banners pequeños de la home (franja doble) */
window.SITE_PROMOS = [
  { title: "Camisas slim fit", text: "Desde S/ 69.90", href: "#/catalogo?cat=camisas", theme: "blue", image: "images/products/camisac1.jpeg" },
  { title: "Pantalones de vestir", text: "Hasta 25% dto.", href: "#/catalogo?cat=pantalones", theme: "green", image: "images/products/pantalon3.jpeg" },
];
