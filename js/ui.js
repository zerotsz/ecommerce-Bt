/* ==========================================================================
   COMPONENTES COMPARTIDOS (React + htm)
   ========================================================================== */
(function () {
  const T = window.TV;
  const { html, React, CFG, PRODUCTS, CATEGORIES, fmt, norm, discountPct, byId, catById, PLACEHOLDER, db, ui, useStore } = T;
  const { useState, useEffect, useRef, useMemo } = React;

  /* ----------------------------- Piezas básicas ----------------------------- */
  const Icon = ({ n, className = "" }) => html`<i className=${"bi bi-" + n + " " + className} aria-hidden="true"></i>`;

  const Img = ({ src, alt = "", className = "", ...rest }) => html`
    <img src=${src} alt=${alt} className=${className} loading="lazy" decoding="async"
      onError=${(e) => { if (!e.currentTarget.src.endsWith(PLACEHOLDER)) e.currentTarget.src = PLACEHOLDER; }} ...${rest} />`;

  const Stars = ({ rating, reviews }) => {
    const full = Math.floor(rating), half = rating - full >= 0.5;
    return html`<span className="stars" role="img" aria-label=${`Calificación ${rating} de 5`}>
      ${[0, 1, 2, 3, 4].map((i) => html`<${Icon} key=${i} n=${i < full ? "star-fill" : i === full && half ? "star-half" : "star"} />`)}
      ${reviews != null && html`<small className="text-body-secondary ms-1">(${reviews})</small>`}
    </span>`;
  };

  const Price = ({ p, large }) => {
    const d = discountPct(p);
    return html`<div className=${"price-block " + (large ? "price-lg" : "")}>
      <span className="price-now">${fmt(p.price)}</span>
      ${d > 0 && html`<span className="price-old">${fmt(p.oldPrice)}</span><span className="price-off">-${d}%</span>`}
    </div>`;
  };

  const QtyInput = ({ value, max, onChange, small }) => html`
    <div className=${"qty " + (small ? "qty-sm" : "")} role="group" aria-label="Cantidad">
      <button type="button" aria-label="Disminuir cantidad" disabled=${value <= 1} onClick=${() => onChange(value - 1)}><${Icon} n="dash-lg" /></button>
      <output aria-live="polite">${value}</output>
      <button type="button" aria-label="Aumentar cantidad" disabled=${value >= max} onClick=${() => onChange(value + 1)}><${Icon} n="plus-lg" /></button>
    </div>`;

  const Breadcrumb = ({ items }) => html`
    <nav aria-label="Ruta de navegación" className="crumbs">
      <ol className="breadcrumb mb-0">
        ${items.map((it, i) => html`<li key=${i} className=${"breadcrumb-item " + (i === items.length - 1 ? "active" : "")} aria-current=${i === items.length - 1 ? "page" : undefined}>
          ${it.href && i < items.length - 1 ? html`<a href=${it.href}>${it.label}</a>` : it.label}</li>`)}
      </ol>
    </nav>`;

  /* ------------------ Control de overlays de Bootstrap desde React ---------- */
  function useOverlay(Type, evt, open, onClosed) {
    const ref = useRef(null);
    useEffect(() => {
      const el = ref.current;
      const h = () => onClosed();
      el.addEventListener("hidden.bs." + evt, h);
      return () => el.removeEventListener("hidden.bs." + evt, h);
    }, []);
    useEffect(() => {
      const inst = Type.getOrCreateInstance(ref.current);
      open ? inst.show() : inst.hide();
    }, [open]);
    return ref;
  }

  /* ------------------------------- Tarjeta producto ------------------------- */
  const WishButton = ({ id, className = "" }) => {
    const wish = useStore(db).wish;
    const on = wish.includes(id);
    return html`<button type="button" className=${"wish " + className + (on ? " on" : "")} aria-pressed=${on}
      aria-label=${on ? "Quitar de favoritos" : "Agregar a favoritos"}
      onClick=${(e) => { e.preventDefault(); e.stopPropagation(); T.toggleWish(id); }}><${Icon} n=${on ? "heart-fill" : "heart"} /></button>`;
  };

  const ProductCard = ({ p }) => {
    const d = discountPct(p);
    const href = "#/producto/" + p.slug;
    return html`
      <article className="pcard">
        <a href=${href} className="pcard-media" tabIndex="-1" aria-hidden="true">
          <${Img} src=${p.images[0]} alt="" className="pcard-img" />
          ${p.images[1] && html`<${Img} src=${p.images[1]} alt="" className="pcard-img pcard-img-alt" />`}
        </a>
        <div className="pcard-badges">
          ${d > 0 && html`<span className="badge-off">-${d}%</span>`}
          ${p.tags.includes("nuevo") && html`<span className="badge-new">Nuevo</span>`}
        </div>
        <${WishButton} id=${p.id} className="pcard-wish" />
        <div className="pcard-body">
          <small className="pcard-brand">${p.brand}</small>
          <h3 className="pcard-name"><a href=${href}>${p.name}</a></h3>
          <${Stars} rating=${p.rating} reviews=${p.reviews} />
          <${Price} p=${p} />
          ${p.price >= CFG.freeShippingFrom && html`<small className="text-success fw-semibold"><${Icon} n="truck" /> Envío gratis</small>`}
          <button type="button" className="btn btn-outline-primary btn-sm pcard-quick" onClick=${() => ui.set({ quick: p.id })}>
            <${Icon} n="bag-plus" /> Agregar</button>
        </div>
      </article>`;
  };

  const ProductGrid = ({ items, className = "" }) => html`
    <div className=${"row g-3 g-lg-4 row-cols-2 row-cols-md-3 row-cols-xl-4 " + className}>
      ${items.map((p) => html`<div className="col" key=${p.id}><${ProductCard} p=${p} /></div>`)}
    </div>`;

  /* Selector de talla/color/cantidad + botones (usado en producto y vista rápida) */
  const BuyBox = ({ p, onAdded, showBuyNow }) => {
    const [size, setSize] = useState(p.sizes.length === 1 ? p.sizes[0] : null);
    const [color, setColor] = useState(0);
    const [qty, setQty] = useState(1);
    const [err, setErr] = useState(false);
    const max = Math.min(p.stock, CFG.maxQtyPerLine);
    const isShoe = p.category === "zapatillas" || p.category === "zapatos";
    const validate = () => { if (!size) { setErr(true); return false; } return true; };
    const add = (silent) => validate() && T.addToCart(p, { size, color: p.colors[color].name, qty }, silent);
    return html`
      <div className="buybox">
        ${p.colors.length > 0 && html`<div className="mb-3">
          <div className="opt-label">Color: <strong>${p.colors[color].name}</strong></div>
          <div className="swatches">${p.colors.map((c, i) => html`
            <button type="button" key=${i} className=${"swatch " + (i === color ? "on" : "")} style=${{ "--sw": c.hex }}
              aria-label=${c.name} aria-pressed=${i === color} onClick=${() => { setColor(i); onAdded && onAdded.onColor && onAdded.onColor(c.image); }}></button>`)}</div>
        </div>`}
        <div className="mb-3">
          <div className="opt-label d-flex justify-content-between">
            <span>${isShoe ? "Talla (EU)" : "Talla"}${size && html`: <strong>${size}</strong>`}</span>
            ${err && !size && html`<span className="text-danger" role="alert"><${Icon} n="exclamation-circle" /> Elige una talla</span>`}
          </div>
          <div className=${"sizes " + (err && !size ? "shake" : "")} role="group" aria-label="Tallas">
            ${p.sizes.map((s) => html`<button type="button" key=${s} className=${"size " + (s === size ? "on" : "")} aria-pressed=${s === size}
              onClick=${() => { setSize(s); setErr(false); }}>${s}</button>`)}
          </div>
        </div>
        <div className="d-flex align-items-center gap-3 mb-3 flex-wrap">
          <${QtyInput} value=${qty} max=${max} onChange=${setQty} />
          <small className=${p.stock <= 5 ? "text-danger fw-semibold" : "text-body-secondary"}>
            ${p.stock <= 5 ? `¡Últimas ${p.stock} unidades!` : `${p.stock} disponibles`}</small>
        </div>
        <div className="d-grid gap-2 d-sm-flex">
          <button type="button" className="btn btn-primary btn-lg flex-fill" onClick=${() => { if (add()) onAdded && onAdded.done && onAdded.done(); }}>
            <${Icon} n="bag-plus" /> Agregar al carro</button>
          ${showBuyNow && html`<button type="button" className="btn btn-accent btn-lg flex-fill" onClick=${() => { if (add(true)) T.go("/checkout"); }}>Comprar ahora</button>`}
        </div>
      </div>`;
  };

  /* ------------------------------- Buscador --------------------------------- */
  const SearchBox = ({ id }) => {
    const [q, setQ] = useState("");
    const [open, setOpen] = useState(false);
    const [hi, setHi] = useState(-1);
    const box = useRef(null);
    const route = T.parseHash();
    useEffect(() => { if (route.path === "/catalogo") setQ(route.query.q || ""); }, [location.hash]);
    const sugg = useMemo(() => {
      const n = norm(q);
      if (n.length < 2) return [];
      const cats = CATEGORIES.filter((c) => norm(c.name).includes(n)).map((c) => ({ type: "cat", c }));
      const prods = PRODUCTS.filter((p) => norm(p.name + " " + p.brand + " " + p.category).includes(n)).slice(0, 5).map((p) => ({ type: "p", p }));
      return [...cats, ...prods];
    }, [q]);
    useEffect(() => {
      const out = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
      document.addEventListener("pointerdown", out);
      return () => document.removeEventListener("pointerdown", out);
    }, []);
    const submit = (e) => {
      e && e.preventDefault();
      if (hi >= 0 && sugg[hi]) return choose(sugg[hi]);
      setOpen(false);
      T.go("/catalogo", { q: q.trim() });
    };
    const choose = (s) => {
      setOpen(false);
      s.type === "cat" ? T.go("/catalogo", { cat: s.c.id }) : T.go("/producto/" + s.p.slug);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
      else if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setHi((h) => Math.min(h + 1, sugg.length - 1)); }
      else if (e.key === "ArrowUp") { e.preventDefault(); setHi((h) => Math.max(h - 1, -1)); }
    };
    return html`
      <form className="search" role="search" onSubmit=${submit} ref=${box}>
        <label htmlFor=${id} className="visually-hidden">Buscar productos</label>
        <input id=${id} type="search" className="form-control" placeholder="¿Qué estás buscando?" autoComplete="off" value=${q}
          role="combobox" aria-expanded=${open && sugg.length > 0} aria-controls=${id + "-list"} aria-autocomplete="list"
          onChange=${(e) => { setQ(e.target.value); setOpen(true); setHi(-1); }} onFocus=${() => setOpen(true)} onKeyDown=${onKey} />
        <button type="submit" aria-label="Buscar"><${Icon} n="search" /></button>
        ${open && sugg.length > 0 && html`<ul className="search-list" id=${id + "-list"} role="listbox">
          ${sugg.map((s, i) => html`<li key=${i} role="option" aria-selected=${i === hi} className=${i === hi ? "hi" : ""} onPointerDown=${(e) => { e.preventDefault(); choose(s); }}>
            ${s.type === "cat"
              ? html`<span className="s-ico"><${Icon} n="grid" /></span><span>Categoría: <strong>${s.c.name}</strong></span>`
              : html`<${Img} src=${s.p.images[0]} alt="" /><span className="s-txt">${s.p.name}<small>${fmt(s.p.price)}</small></span>`}
          </li>`)}
          <li className="s-all" role="option" aria-selected="false" onPointerDown=${(e) => { e.preventDefault(); submit(); }}>Ver todos los resultados para “${q}”</li>
        </ul>`}
      </form>`;
  };

  /* --------------------------------- Header --------------------------------- */
  const Header = ({ path }) => {
    const state = useStore(db);
    const units = state.cart.reduce((a, l) => a + l.qty, 0);
    const user = state.user;
    const isActive = (cat) => path === "/catalogo" && T.parseHash().query.cat === cat;
    return html`
      <header className="site-header">
        <div className="topbar d-none d-md-block">
          <div className="container d-flex justify-content-between align-items-center">
            <span><${Icon} n="truck" /> Envío gratis desde ${fmt(CFG.freeShippingFrom)}</span>
            <span className="d-none d-lg-inline"><${Icon} n="shop" /> Retira gratis en tienda</span>
            <span><${Icon} n="tag" /> Cupón <strong>BIENVENIDO10</strong>: 10% dto. en tu primera compra</span>
          </div>
        </div>
        <div className="mainbar">
          <div className="container">
            <div className="mainbar-row">
              <button type="button" className="icon-btn d-lg-none" aria-label="Abrir menú" onClick=${() => ui.set({ menuOpen: true })}><${Icon} n="list" /></button>
              <a href="#/" className="brand" aria-label=${CFG.name + " - Inicio"}>
                <img src="images/brand/logo-white.png" alt=${CFG.name} width="289" height="85" />
              </a>
              <div className="search-wrap d-none d-lg-block"><${SearchBox} id="search-d" /></div>
              <div className="actions">
                <button type="button" className="action d-none d-sm-flex" onClick=${() => user ? T.go("/cuenta") : ui.set({ authOpen: true, authTab: "login" })}>
                  <${Icon} n="person" />
                  <span className="d-none d-xl-block text-start lh-1"><small>${user ? "Hola," : "Hola,"}</small><br /><strong>${user ? user.name.split(" ")[0] : "Inicia sesión"}</strong></span>
                </button>
                <a href="#/favoritos" className="action" aria-label=${`Favoritos (${state.wish.length})`}>
                  <${Icon} n="heart" />${state.wish.length > 0 && html`<span className="count">${state.wish.length}</span>`}</a>
                <button type="button" className="action" aria-label=${`Carro de compras (${units})`} onClick=${() => ui.set({ cartOpen: true })}>
                  <${Icon} n="bag" />${units > 0 && html`<span className="count">${units}</span>`}
                  <span className="d-none d-xl-block fw-semibold">Carro</span></button>
              </div>
            </div>
            <div className="d-lg-none pb-2"><${SearchBox} id="search-m" /></div>
          </div>
        </div>
        <nav className="catnav d-none d-lg-block" aria-label="Categorías">
          <div className="container">
            <ul>
              <li><a href="#/catalogo" className=${path === "/catalogo" && !T.parseHash().query.cat && !T.parseHash().query.oferta ? "active" : ""}><${Icon} n="grid-3x3-gap" /> Todo</a></li>
              ${CATEGORIES.map((c) => html`<li key=${c.id}><a href=${"#/catalogo?cat=" + c.id} className=${isActive(c.id) ? "active" : ""}>${c.name}</a></li>`)}
              <li className="ms-auto"><a href="#/catalogo?oferta=1" className="hot"><${Icon} n="fire" /> Ofertas</a></li>
              <li><a href="#/catalogo?sort=nuevo">Novedades</a></li>
            </ul>
          </div>
        </nav>
      </header>`;
  };

  /* ----------------------------- Menú móvil -------------------------------- */
  const MobileMenu = () => {
    const open = useStore(ui).menuOpen;
    const user = useStore(db).user;
    const ref = useOverlay(bootstrap.Offcanvas, "offcanvas", open, () => ui.set({ menuOpen: false }));
    const close = () => ui.set({ menuOpen: false });
    return html`
      <div className="offcanvas offcanvas-start" tabIndex="-1" id="menu" aria-labelledby="menu-title" ref=${ref}>
        <div className="offcanvas-header menu-head">
          <h2 className="offcanvas-title h6 mb-0" id="menu-title"><${Icon} n="person-circle" className="fs-4 me-2 align-middle" />${user ? "Hola, " + user.name.split(" ")[0] : "Bienvenido"}</h2>
          <button type="button" className="btn-close btn-close-white" aria-label="Cerrar" onClick=${close}></button>
        </div>
        <div className="offcanvas-body p-0">
          ${!user ? html`<div className="p-3 d-grid gap-2">
              <button className="btn btn-primary" onClick=${() => ui.set({ menuOpen: false, authOpen: true, authTab: "login" })}>Iniciar sesión</button>
              <button className="btn btn-outline-primary" onClick=${() => ui.set({ menuOpen: false, authOpen: true, authTab: "register" })}>Crear cuenta</button></div>`
            : html`<div className="p-3"><button className="btn btn-outline-secondary w-100" onClick=${() => { close(); T.logout(); }}>Cerrar sesión</button></div>`}
          <div className="list-group list-group-flush" onClick=${close}>
            <a className="list-group-item list-group-item-action fw-semibold text-danger" href="#/catalogo?oferta=1"><${Icon} n="fire" /> Ofertas</a>
            ${CATEGORIES.map((c) => html`<a key=${c.id} className="list-group-item list-group-item-action d-flex align-items-center gap-3" href=${"#/catalogo?cat=" + c.id}>
              <${Icon} n=${c.icon} className="text-primary" /> ${c.name}<${Icon} n="chevron-right" className="ms-auto text-body-tertiary" /></a>`)}
            <a className="list-group-item list-group-item-action" href="#/catalogo"><${Icon} n="grid-3x3-gap" /> Ver todo el catálogo</a>
            <a className="list-group-item list-group-item-action" href="#/favoritos"><${Icon} n="heart" /> Mis favoritos</a>
          </div>
        </div>
      </div>`;
  };

  /* ------------------------------ Carro lateral ----------------------------- */
  const FreeShipBar = ({ d }) => html`
    <div className="freeship">
      <div className="small mb-1">${d.missingForFree > 0
        ? html`Te faltan <strong>${fmt(d.missingForFree)}</strong> para <strong>envío gratis</strong>`
        : html`<${Icon} n="check-circle-fill" className="text-success" /> ¡Tienes <strong>envío gratis</strong>!`}</div>
      <div className="progress" role="progressbar" aria-label="Progreso hacia envío gratis" aria-valuenow=${Math.round(d.progress)} aria-valuemin="0" aria-valuemax="100">
        <div className="progress-bar" style=${{ width: d.progress + "%" }}></div></div>
    </div>`;

  const CartLine = ({ l, compact }) => {
    const p = l.product;
    return html`
      <li className="cline">
        <a href=${"#/producto/" + p.slug} className="cline-img"><${Img} src=${p.images[0]} alt="" /></a>
        <div className="cline-info">
          <a href=${"#/producto/" + p.slug} className="cline-name">${p.name}</a>
          <small className="text-body-secondary d-block">${[l.size && "Talla " + l.size, l.color].filter(Boolean).join(" · ")}</small>
          <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-2">
            <${QtyInput} small value=${l.qty} max=${Math.min(p.stock, CFG.maxQtyPerLine)} onChange=${(q) => T.setQty(l.key, q)} />
            <strong>${fmt(p.price * l.qty)}</strong>
          </div>
        </div>
        <button type="button" className="cline-remove" aria-label=${"Quitar " + p.name} onClick=${() => T.removeLine(l.key)}><${Icon} n="trash3" /></button>
      </li>`;
  };

  const CartDrawer = () => {
    const open = useStore(ui).cartOpen;
    const state = useStore(db);
    const d = T.cartDetail(state, "retiro");
    const ref = useOverlay(bootstrap.Offcanvas, "offcanvas", open, () => ui.set({ cartOpen: false }));
    const close = () => ui.set({ cartOpen: false });
    return html`
      <div className="offcanvas offcanvas-end cart-drawer" tabIndex="-1" id="cart" aria-labelledby="cart-title" ref=${ref}>
        <div className="offcanvas-header">
          <h2 className="offcanvas-title h5 mb-0" id="cart-title">Tu carro <span className="text-body-secondary fw-normal">(${d.units})</span></h2>
          <button type="button" className="btn-close" aria-label="Cerrar carro" onClick=${close}></button>
        </div>
        ${d.lines.length === 0
          ? html`<div className="offcanvas-body empty-state">
              <${Icon} n="bag" className="empty-ico" /><h3 className="h6">Tu carro está vacío</h3>
              <p className="text-body-secondary small">Explora nuestras categorías y encuentra algo que te guste.</p>
              <a href="#/catalogo" className="btn btn-primary" onClick=${close}>Ver productos</a></div>`
          : html`<div className="offcanvas-body pt-0">
              <${FreeShipBar} d=${d} />
              <ul className="clist">${d.lines.map((l) => html`<${CartLine} key=${l.key} l=${l} />`)}</ul></div>
            <div className="offcanvas-footer">
              <div className="d-flex justify-content-between mb-1"><span>Subtotal</span><strong>${fmt(d.subtotal)}</strong></div>
              ${d.savings > 0 && html`<div className="d-flex justify-content-between small text-success mb-2"><span>Estás ahorrando</span><span>${fmt(d.savings)}</span></div>`}
              <div className="d-grid gap-2">
                <a href="#/checkout" className="btn btn-primary btn-lg" onClick=${close}>Ir a pagar</a>
                <a href="#/carrito" className="btn btn-outline-primary" onClick=${close}>Ver carro completo</a></div>
            </div>`}
      </div>`;
  };

  /* ---------------------------- Vista rápida (modal) ------------------------ */
  const QuickView = () => {
    const id = useStore(ui).quick;
    const p = id ? byId(id) : null;
    const ref = useOverlay(bootstrap.Modal, "modal", !!id, () => ui.set({ quick: null }));
    const close = () => ui.set({ quick: null });
    return html`
      <div className="modal fade" tabIndex="-1" id="quick" aria-labelledby="quick-title" ref=${ref}>
        <div className="modal-dialog modal-dialog-centered modal-lg modal-fullscreen-sm-down">
          <div className="modal-content">
            <div className="modal-header border-0 pb-0">
              <h2 className="visually-hidden" id="quick-title">Vista rápida${p ? ": " + p.name : ""}</h2>
              <button type="button" className="btn-close ms-auto" aria-label="Cerrar" onClick=${close}></button>
            </div>
            ${p && html`<div className="modal-body">
              <div className="row g-4">
                <div className="col-md-5"><div className="quick-img"><${Img} src=${p.images[0]} alt=${p.name} /></div></div>
                <div className="col-md-7">
                  <small className="text-body-secondary">${p.brand}</small>
                  <h3 className="h4">${p.name}</h3>
                  <${Stars} rating=${p.rating} reviews=${p.reviews} />
                  <div className="my-3"><${Price} p=${p} large /></div>
                  <${BuyBox} p=${p} key=${p.id} onAdded=${{ done: close }} />
                  <a href=${"#/producto/" + p.slug} className="d-inline-block mt-3 small" onClick=${close}>Ver detalle completo <${Icon} n="arrow-right" /></a>
                </div>
              </div>
            </div>`}
          </div>
        </div>
      </div>`;
  };

  /* ---------------------------- Login / Registro --------------------------- */
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const Field = ({ id, label, error, children, hint }) => html`
    <div className="mb-3">
      <label htmlFor=${id} className="form-label fw-semibold small">${label}</label>
      ${children}
      ${error ? html`<div className="invalid-feedback d-block" id=${id + "-err"} role="alert">${error}</div>` : hint && html`<div className="form-text">${hint}</div>`}
    </div>`;

  const AuthModal = () => {
    const { authOpen, authTab } = useStore(ui);
    const ref = useOverlay(bootstrap.Modal, "modal", authOpen, () => ui.set({ authOpen: false }));
    const [f, setF] = useState({ name: "", email: "", phone: "", pass: "", terms: false });
    const [err, setErr] = useState({});
    const [showPass, setShowPass] = useState(false);
    useEffect(() => { setErr({}); }, [authTab, authOpen]);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
    const reg = authTab === "register";
    const submit = (e) => {
      e.preventDefault();
      const er = {};
      if (reg && f.name.trim().length < 3) er.name = "Ingresa tu nombre completo";
      if (!EMAIL_RE.test(f.email.trim())) er.email = "Ingresa un correo válido";
      if (reg && !/^9\d{8}$/.test(f.phone.trim())) er.phone = "Ingresa un celular de 9 dígitos que empiece con 9";
      if (f.pass.length < 8) er.pass = "La contraseña debe tener al menos 8 caracteres";
      if (reg && !f.terms) er.terms = "Debes aceptar los términos para continuar";
      setErr(er);
      if (Object.keys(er).length) return;
      const email = f.email.trim().toLowerCase();
      const name = reg ? f.name.trim() : (db.get().user && db.get().user.email === email ? db.get().user.name : email.split("@")[0]);
      T.login({ name, email, phone: reg ? f.phone.trim() : (db.get().user && db.get().user.phone) || "" });
      setF({ name: "", email: "", phone: "", pass: "", terms: false });
      ui.set({ authOpen: false });
      T.toast(reg ? "¡Cuenta creada! Bienvenido/a, " + name.split(" ")[0] : "¡Hola de nuevo, " + name.split(" ")[0] + "!");
    };
    const inv = (k) => "form-control" + (err[k] ? " is-invalid" : "");
    return html`
      <div className="modal fade" tabIndex="-1" id="auth" aria-labelledby="auth-title" ref=${ref}>
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content auth">
            <div className="modal-header border-0">
              <h2 className="modal-title h5" id="auth-title">${reg ? "Crea tu cuenta" : "Inicia sesión"}</h2>
              <button type="button" className="btn-close" aria-label="Cerrar" onClick=${() => ui.set({ authOpen: false })}></button>
            </div>
            <div className="modal-body pt-0">
              <div className="seg mb-3" role="tablist">
                <button type="button" role="tab" aria-selected=${!reg} className=${!reg ? "on" : ""} onClick=${() => ui.set({ authTab: "login" })}>Ingresar</button>
                <button type="button" role="tab" aria-selected=${reg} className=${reg ? "on" : ""} onClick=${() => ui.set({ authTab: "register" })}>Registrarme</button>
              </div>
              <form onSubmit=${submit} noValidate>
                ${reg && html`<${Field} id="a-name" label="Nombre y apellido" error=${err.name}>
                  <input id="a-name" className=${inv("name")} value=${f.name} onChange=${set("name")} autoComplete="name" /><//>`}
                <${Field} id="a-email" label="Correo electrónico" error=${err.email}>
                  <input id="a-email" type="email" className=${inv("email")} value=${f.email} onChange=${set("email")} autoComplete="email" inputMode="email" /><//>
                ${reg && html`<${Field} id="a-phone" label="Celular" error=${err.phone}>
                  <input id="a-phone" type="tel" className=${inv("phone")} value=${f.phone} maxLength="9" inputMode="numeric" onChange=${set("phone")} autoComplete="tel-national" /><//>`}
                <${Field} id="a-pass" label="Contraseña" error=${err.pass} hint=${reg ? "Mínimo 8 caracteres" : null}>
                  <div className="input-group has-validation">
                    <input id="a-pass" type=${showPass ? "text" : "password"} className=${inv("pass")} value=${f.pass} onChange=${set("pass")} autoComplete=${reg ? "new-password" : "current-password"} />
                    <button type="button" className="btn btn-outline-secondary" aria-label=${showPass ? "Ocultar contraseña" : "Mostrar contraseña"} onClick=${() => setShowPass(!showPass)}><${Icon} n=${showPass ? "eye-slash" : "eye"} /></button>
                  </div><//>
                ${reg && html`<div className="form-check mb-3">
                  <input id="a-terms" type="checkbox" className=${"form-check-input" + (err.terms ? " is-invalid" : "")} checked=${f.terms} onChange=${set("terms")} />
                  <label htmlFor="a-terms" className="form-check-label small">Acepto los términos y condiciones y la política de privacidad</label>
                  ${err.terms && html`<div className="invalid-feedback d-block" role="alert">${err.terms}</div>`}</div>`}
                <button type="submit" className="btn btn-primary w-100 btn-lg">${reg ? "Crear cuenta" : "Ingresar"}</button>
              </form>
              <p className="small text-body-secondary mt-3 mb-0"><${Icon} n="info-circle" /> Modo demostración: no hay servidor, tu contraseña no se guarda ni se envía a ningún lado.</p>
            </div>
          </div>
        </div>
      </div>`;
  };

  /* --------------------------------- Footer -------------------------------- */
  const Footer = () => {
    const [mail, setMail] = useState("");
    const [msg, setMsg] = useState(null);
    const sub = (e) => {
      e.preventDefault();
      if (!EMAIL_RE.test(mail.trim())) return setMsg({ ok: false, t: "Ingresa un correo válido" });
      db.set({ newsletter: true }); setMail(""); setMsg({ ok: true, t: "¡Listo! Te avisaremos de nuestras ofertas." });
    };
    return html`
      <footer className="site-footer">
        <section className="newsletter">
          <div className="container d-md-flex align-items-center justify-content-between gap-4 text-center text-md-start">
            <div><h2 className="h5 mb-1">Suscríbete y recibe 10% dto.</h2><p className="mb-3 mb-md-0 opacity-75">Ofertas exclusivas y novedades en tu correo.</p></div>
            <form onSubmit=${sub} className="nl-form" noValidate>
              <label htmlFor="nl" className="visually-hidden">Correo electrónico</label>
              <input id="nl" type="email" className="form-control" placeholder="tucorreo@ejemplo.com" value=${mail} onChange=${(e) => { setMail(e.target.value); setMsg(null); }} />
              <button className="btn btn-accent" type="submit">Suscribirme</button>
              ${msg && html`<div className=${"small w-100 mt-1 " + (msg.ok ? "text-white" : "text-warning")} role="status">${msg.t}</div>`}
            </form>
          </div>
        </section>
        <div className="container py-5">
          <div className="row g-4">
            <div className="col-12 col-lg-4">
              <img src="images/brand/logo-white.png" alt=${CFG.name} width="150" className="mb-3" />
              <p className="small opacity-75">Moda, calzado y más con envíos a todo Lima y retiro en tienda.</p>
              <div className="d-flex gap-3 fs-4">
                <a href="#/" aria-label="Facebook"><${Icon} n="facebook" /></a><a href="#/" aria-label="Instagram"><${Icon} n="instagram" /></a>
                <a href="#/" aria-label="TikTok"><${Icon} n="tiktok" /></a><a href="#/" aria-label="YouTube"><${Icon} n="youtube" /></a></div>
            </div>
            <div className="col-6 col-lg-2"><h3 className="h6">Categorías</h3>
              <ul className="list-unstyled small">${CATEGORIES.map((c) => html`<li key=${c.id}><a href=${"#/catalogo?cat=" + c.id}>${c.name}</a></li>`)}
              <li><a href="#/catalogo?oferta=1">Ofertas</a></li></ul></div>
            <div className="col-6 col-lg-3"><h3 className="h6">Ayuda</h3>
              <ul className="list-unstyled small">
                <li><a href="#/ayuda">Envíos y entregas</a></li><li><a href="#/ayuda">Cambios y devoluciones</a></li>
                <li><a href="#/ayuda">Medios de pago</a></li><li><a href="#/ayuda">Preguntas frecuentes</a></li></ul></div>
            <div className="col-12 col-lg-3"><h3 className="h6">Contáctanos</h3>
              <ul className="list-unstyled small">
                <li><${Icon} n="whatsapp" /> <a href=${"https://wa.me/" + CFG.whatsapp}>WhatsApp</a></li>
                <li><${Icon} n="envelope" /> ${CFG.email}</li><li><${Icon} n="clock" /> Lun a Dom · 9:00 – 21:00</li></ul>
              <div className="pay fs-3 d-flex gap-2 opacity-75" aria-label="Medios de pago"><${Icon} n="credit-card-2-front" /><${Icon} n="wallet2" /><${Icon} n="cash-coin" /><${Icon} n="phone" /></div></div>
          </div>
        </div>
        <div className="legal"><div className="container small">
          <span>© ${new Date().getFullYear()} ${CFG.name}. Todos los derechos reservados.</span>
          <span className="opacity-75">${CFG.disclaimer}</span></div></div>
      </footer>`;
  };

  /* --------------------------- Avisos y botón WhatsApp ---------------------- */
  const Toasts = () => {
    const toasts = useStore(ui).toasts;
    return html`
      <div className="toast-zone" role="region" aria-label="Notificaciones" aria-live="polite">
        ${toasts.map((t) => html`<div key=${t.id} className=${"toast show tv-toast t-" + t.type} role="status">
          <${Icon} n=${t.type === "success" ? "check-circle-fill" : t.type === "warning" ? "exclamation-triangle-fill" : "info-circle-fill"} />
          <span className="flex-fill">${t.message}</span>
          ${t.action && html`<a href=${t.action.href} className="toast-action">${t.action.label}</a>`}
          <button type="button" className="btn-close btn-close-white btn-sm" aria-label="Cerrar" onClick=${() => ui.set((s) => ({ toasts: s.toasts.filter((x) => x.id !== t.id) }))}></button>
        </div>`)}
      </div>`;
  };

  const WhatsApp = () => html`<a className="wa-float" href=${"https://wa.me/" + CFG.whatsapp + "?text=" + encodeURIComponent("Hola, necesito ayuda con mi compra")} target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp"><${Icon} n="whatsapp" /></a>`;

  Object.assign(T, { Icon, Img, Stars, Price, QtyInput, Breadcrumb, ProductCard, ProductGrid, WishButton, BuyBox, Header, MobileMenu, CartDrawer, QuickView, AuthModal, Footer, Toasts, WhatsApp, FreeShipBar, CartLine, EMAIL_RE, Field });
})();
