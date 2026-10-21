# Tienda virtual (estilo e-commerce)

HTML + CSS + JavaScript, con **Bootstrap 5.3** (diseño responsivo) y **React** (interfaz).
No necesita instalar nada ni compilar: todas las librerías están en `vendor/` y funciona sin internet.

## Cómo abrirla
- Doble clic en `index.html`, **o** (recomendado) con un servidor local:
  `python -m http.server 8000` y abre http://localhost:8000
- En VS Code: extensión *Live Server* → "Go Live".

## Estructura
```
index.html            Página única (la navegación usa #/rutas, sin recargar)
css/styles.css        Colores y estilos (variables en :root)
js/config.js          Nombre, envíos, cupones, categorías, banners
js/data/products.js   CATÁLOGO de productos  ← aquí agregas productos
js/lib.js             Estado (carrito, favoritos, sesión), router, utilidades
js/ui.js              Header, buscador, carro lateral, login, footer…
js/pages.js           Inicio, catálogo, producto, carro, checkout, pedido…
images/products/      Fotos de productos
images/banners/       Banners del carrusel
vendor/               Bootstrap, Bootstrap Icons, React, htm (locales)
```

## Cómo escalar
**Agregar un producto:** abre `js/data/products.js`, copia un bloque, cambia `id` y `slug` (únicos) y completa los datos.
Aparece solo en el catálogo, buscador, filtros y ofertas (si tiene `oldPrice`).

**Agregar más imágenes a un producto:** copia las fotos a `images/products/` y añade sus rutas al arreglo `images`:
`images: ["images/products/a.jpg", "images/products/a-2.jpg", "images/products/a-3.jpg"]`
→ la ficha muestra galería con miniaturas y zoom; la tarjeta cambia a la 2.ª foto al pasar el mouse.
Tip: usa fotos de al menos 800×800 px, fondo blanco o claro.

**Nueva categoría:** agrégala en `SITE_CATEGORIES` (`js/config.js`) y usa su `id` en el campo `category` del producto.

**Banners:** edita `SITE_BANNERS` / `SITE_PROMOS` en `js/config.js` (imagen completa o banner con texto + productos).

**Envío, cupones, tiendas, distritos, nombre de la marca:** `js/config.js`.

**Colores:** variables `--brand`, `--accent`… al inicio de `css/styles.css`.

## Qué incluye
Carrusel, ofertas con cuenta regresiva, buscador con sugerencias, catálogo con filtros (categoría, precio, talla,
género, ofertas) y orden, ficha con galería/zoom/tallas/colores/cuotas, carro lateral y página de carro con
barra de envío gratis y cupones (`BIENVENIDO10`, `ENVIOGRATIS`), checkout validado (domicilio/retiro),
confirmación de pedido, favoritos, cuenta con historial, login/registro, ayuda, SEO básico
(título/descripción por página y datos estructurados), accesibilidad (teclado, lectores de pantalla,
`prefers-reduced-motion`) y datos guardados en el navegador (localStorage).

## Importante
- **Es una demostración sin servidor:** el login es simulado (la contraseña NO se guarda ni se muestra) y no se procesan
  pagos. Para vender de verdad necesitas un backend (usuarios, base de datos de productos y pasarela de pago).
  `products.js` está pensado para reemplazarse luego por una API: solo cambia de dónde sale `window.CATALOG`.
- Precios de ejemplo (los originales eran de prueba, p. ej. S/ 29.99): edítalos en `products.js`.
- Las fotos originales son pequeñas (≈200–800 px); se verán mejor con imágenes más grandes.
- Si usas marcas/logos de terceros (p. ej. Ripley) en un sitio público, necesitas autorización de su titular.
