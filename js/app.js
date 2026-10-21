
(function () {
  const T = window.TV;
  const { html, React, ui } = T;
  const { useEffect } = React;

  const App = () => {
    const { path, query } = T.useRoute();

    // Al navegar se cierran los paneles abiertos
    useEffect(() => { ui.set({ menuOpen: false, cartOpen: false, quick: null, authOpen: false }); }, [path]);

    let page;
    let m;
    if (path === "/") page = html`<${T.Home} />`;
    else if (path === "/catalogo") page = html`<${T.Catalog} query=${query} />`;
    else if ((m = path.match(/^\/producto\/([^/]+)$/))) page = html`<${T.ProductPage} slug=${decodeURIComponent(m[1])} />`;
    else if (path === "/carrito") page = html`<${T.CartPage} />`;
    else if (path === "/checkout") page = html`<${T.Checkout} />`;
    else if ((m = path.match(/^\/pedido\/([^/]+)$/))) page = html`<${T.OrderPage} id=${m[1]} />`;
    else if (path === "/favoritos") page = html`<${T.Wishlist} />`;
    else if (path === "/cuenta") page = html`<${T.Account} />`;
    else if (path === "/ayuda") page = html`<${T.Help} />`;
    else page = html`<${T.NotFound} />`;

    return html`
      <${React.Fragment}>
        <a href="#main" className="skip-link" onClick=${(e) => { e.preventDefault(); document.getElementById("main").focus(); }}>Saltar al contenido</a>
        <${T.Header} path=${path} />
        <main id="main" tabIndex="-1">${page}</main>
        <${T.Footer} />
        <${T.MobileMenu} /><${T.CartDrawer} /><${T.QuickView} /><${T.AuthModal} />
        <${T.Toasts} /><${T.WhatsApp} />
      <//>`;
  };

  ReactDOM.createRoot(document.getElementById("root")).render(html`<${App} />`);
})();
