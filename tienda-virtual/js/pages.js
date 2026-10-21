/* ==========================================================================
   PÁGINAS
   ========================================================================== */
(function () {
  const T = window.TV;
  const { html, React, CFG, PRODUCTS, CATEGORIES, fmt, norm, discountPct, byId, bySlug, catById, db, ui, useStore,
    Icon, Img, Stars, Price, Breadcrumb, ProductCard, ProductGrid, BuyBox, QtyInput, CartLine, FreeShipBar, Field, EMAIL_RE } = T;
  const { useState, useEffect, useRef, useMemo } = React;

  const SectionHead = ({ title, href, linkText = "Ver todo", children }) => html`
    <div className="section-head">
      <h2>${title}</h2>${children}
      ${href && html`<a href=${href} className="see-all">${linkText} <${Icon} n="chevron-right" /></a>`}
    </div>`;

  /* Fila horizontal con botones (ofertas, vistos recientemente…) */
  const Rail = ({ items }) => {
    const ref = useRef(null);
    const by = (dir) => ref.current && ref.current.scrollBy({ left: dir * ref.current.clientWidth * 0.8, behavior: "smooth" });
    return html`<div className="rail-wrap">
      <button type="button" className="rail-btn prev d-none d-md-grid" aria-label="Anterior" onClick=${() => by(-1)}><${Icon} n="chevron-left" /></button>
      <div className="rail" ref=${ref} tabIndex="0" aria-label="Lista de productos desplazable">
        ${items.map((p) => html`<div className="rail-item" key=${p.id}><${ProductCard} p=${p} /></div>`)}</div>
      <button type="button" className="rail-btn next d-none d-md-grid" aria-label="Siguiente" onClick=${() => by(1)}><${Icon} n="chevron-right" /></button>
    </div>`;
  };

  /* ------------------------------- Carrusel hero ---------------------------- */
  const Hero = () => {
    const slides = T.SITE_BANNERS;
    const [i, setI] = useState(0);
    const [paused, setPaused] = useState(false);
    const x0 = useRef(null);
    const n = slides.length;
    useEffect(() => {
      if (paused || n < 2 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const t = setInterval(() => setI((v) => (v + 1) % n), 5500);
      return () => clearInterval(t);
    }, [paused, n]);
    const go = (v) => setI((v + n) % n);
    return html`
      <section className="hero" aria-roledescription="carousel" aria-label="Promociones"
        onMouseEnter=${() => setPaused(true)} onMouseLeave=${() => setPaused(false)} onFocus=${() => setPaused(true)} onBlur=${() => setPaused(false)}
        onPointerDown=${(e) => { x0.current = e.clientX; }}
        onPointerUp=${(e) => { if (x0.current != null && Math.abs(e.clientX - x0.current) > 50) go(i + (e.clientX < x0.current ? 1 : -1)); x0.current = null; }}>
        <div className="hero-track" style=${{ transform: `translateX(-${i * 100}%)` }}>
          ${slides.map((s, k) => html`
            <div className="hero-slide" key=${k} role="group" aria-roledescription="slide" aria-label=${`${k + 1} de ${n}`} aria-hidden=${k !== i}>
              ${s.type === "image"
                ? html`<a href=${s.href} className="slide slide-img" tabIndex=${k === i ? 0 : -1} draggable="false">
                    <span className="bg" style=${{ backgroundImage: `url(${s.src})` }}></span>
                    <img src=${s.src} alt=${s.alt} draggable="false" fetchpriority=${k === 0 ? "high" : "auto"} /></a>`
                : html`<a href=${s.href} className=${"slide promo theme-" + s.theme} tabIndex=${k === i ? 0 : -1} draggable="false">
                    <div className="promo-text">
                      <span className="kicker">${s.kicker}</span><h2>${s.title}</h2><p>${s.text}</p>
                      <span className="btn btn-accent btn-lg">${s.cta}</span></div>
                    <div className="promo-imgs" aria-hidden="true">${s.images.map((src, j) => html`<div className="pi" key=${j}><${Img} src=${src} alt="" /></div>`)}</div>
                  </a>`}
            </div>`)}
        </div>
        ${n > 1 && html`
          <button type="button" className="hero-arrow prev d-none d-md-grid" aria-label="Anterior" onClick=${() => go(i - 1)}><${Icon} n="chevron-left" /></button>
          <button type="button" className="hero-arrow next d-none d-md-grid" aria-label="Siguiente" onClick=${() => go(i + 1)}><${Icon} n="chevron-right" /></button>
          <div className="hero-dots" role="tablist" aria-label="Elegir banner">
            ${slides.map((_, k) => html`<button key=${k} type="button" role="tab" aria-selected=${k === i} aria-label=${"Ir al banner " + (k + 1)} className=${k === i ? "on" : ""} onClick=${() => setI(k)}></button>`)}</div>`}
      </section>`;
  };

  const secondsToMidnight = () => { const n = new Date(), e = new Date(n); e.setHours(24, 0, 0, 0); return Math.max(0, Math.floor((e - n) / 1000)); };
  const Countdown = () => {
    const [s, setS] = useState(secondsToMidnight());
    useEffect(() => { const id = setInterval(() => setS(secondsToMidnight()), 1000); return () => clearInterval(id); }, []);
    const p = (v) => String(v).padStart(2, "0");
    return html`<div className="countdown" role="timer" aria-label="Tiempo restante de las ofertas">
      <small>Terminan en</small>
      <span>${p(Math.floor(s / 3600))}</span>:<span>${p(Math.floor((s % 3600) / 60))}</span>:<span>${p(s % 60)}</span></div>`;
  };

  /* ---------------------------------- HOME ---------------------------------- */
  const Home = () => {
    T.useTitle("", "Moda, zapatillas, zapatos, camisas, vestidos y pantalones con envío a todo Lima.");
    const recent = useStore(db).recent;
    const deals = useMemo(() => PRODUCTS.filter((p) => discountPct(p) > 0).sort((a, b) => discountPct(b) - discountPct(a)).slice(0, 10), []);
    const best = useMemo(() => [...PRODUCTS].sort((a, b) => (b.tags.includes("masvendido") - a.tags.includes("masvendido")) || b.reviews - a.reviews).slice(0, 8), []);
    const fresh = useMemo(() => PRODUCTS.filter((p) => p.tags.includes("nuevo")).slice(0, 4), []);
    const seen = recent.map(byId).filter(Boolean);
    const perks = [
      ["truck", "Envío gratis", `Desde ${fmt(CFG.freeShippingFrom)}`],
      ["shop", "Retiro en tienda", "Gratis, listo en 24 h"],
      ["arrow-repeat", "Cambios fáciles", "30 días con boleta"],
      ["shield-check", "Compra segura", "Tus datos protegidos"],
    ];
    return html`
      <div>
        <div className="container-xl px-sm-3 px-0 mt-sm-3"><${Hero} /></div>
        <div className="container py-3 py-lg-4">
          <ul className="perks" aria-label="Beneficios">
            ${perks.map(([ic, t, s]) => html`<li key=${t}><${Icon} n=${ic} /><div><strong>${t}</strong><small>${s}</small></div></li>`)}</ul>

          <section className="mt-4 mt-lg-5">
            <${SectionHead} title="Compra por categoría" />
            <div className="cat-tiles">
              ${CATEGORIES.map((c) => html`<a key=${c.id} href=${"#/catalogo?cat=" + c.id} className="cat-tile" style=${{ "--tile": c.color }}>
                <span className="cat-img"><${Img} src=${c.image} alt="" /></span><span className="cat-name">${c.name}</span></a>`)}
            </div>
          </section>

          <section className="mt-4 mt-lg-5" aria-labelledby="h-deals">
            <div className="section-head deals-head">
              <h2 id="h-deals"><${Icon} n="fire" className="text-danger" /> Ofertas del día</h2><${Countdown} />
              <a href="#/catalogo?oferta=1" className="see-all">Ver todas <${Icon} n="chevron-right" /></a></div>
            <${Rail} items=${deals} />
          </section>

          <section className="promo-duo mt-4 mt-lg-5" aria-label="Promociones">
            ${T.SITE_PROMOS.map((p, k) => html`<a key=${k} href=${p.href} className=${"mini-promo theme-" + p.theme}>
              <div><h3>${p.title}</h3><p>${p.text}</p><span className="btn btn-light btn-sm">Comprar ahora</span></div>
              <div className="mp-img"><${Img} src=${p.image} alt="" /></div></a>`)}
          </section>

          <section className="mt-4 mt-lg-5">
            <${SectionHead} title="Los más vendidos" href="#/catalogo?sort=rating" />
            <${ProductGrid} items=${best} />
          </section>

          ${fresh.length > 0 && html`<section className="mt-4 mt-lg-5">
            <${SectionHead} title="Recién llegados" href="#/catalogo?sort=nuevo" />
            <${ProductGrid} items=${fresh} /></section>`}

          ${seen.length > 0 && html`<section className="mt-4 mt-lg-5">
            <${SectionHead} title="Vistos recientemente" /><${Rail} items=${seen} /></section>`}
        </div>
      </div>`;
  };

  /* -------------------------------- CATÁLOGO -------------------------------- */
  const PRICE_RANGES = [[0, 100, "Hasta S/ 100"], [100, 200, "S/ 100 – 200"], [200, 300, "S/ 200 – 300"], [300, 0, "Más de S/ 300"]];
  const SORTS = [["rel", "Más relevantes"], ["price-asc", "Menor precio"], ["price-desc", "Mayor precio"], ["dto", "Mayor descuento"], ["rating", "Mejor calificados"], ["nuevo", "Novedades"]];

  function applyFilters(f, skip) {
    return PRODUCTS.filter((p) => {
      if (f.q) { const n = norm(f.q); const hay = norm([p.name, p.brand, p.category, p.gender, p.description].join(" ")); if (!n.split(/\s+/).every((w) => hay.includes(w))) return false; }
      if (skip !== "cat" && f.cat && p.category !== f.cat) return false;
      if (skip !== "g" && f.g && p.gender !== f.g) return false;
      if (skip !== "size" && f.size && !p.sizes.includes(f.size)) return false;
      if (skip !== "price") { if (f.min && p.price < f.min) return false; if (f.max && p.price > f.max) return false; }
      if (f.oferta && !(p.oldPrice > p.price)) return false;
      return true;
    });
  }

  const FiltersPanel = ({ f, set, uid }) => {
    const [lo, setLo] = useState(f.min || "");
    const [hi, setHi] = useState(f.max || "");
    useEffect(() => { setLo(f.min || ""); setHi(f.max || ""); }, [f.min, f.max]);
    const sizes = useMemo(() => {
      const pool = f.cat ? PRODUCTS.filter((p) => p.category === f.cat) : PRODUCTS;
      return [...new Set(pool.flatMap((p) => p.sizes))];
    }, [f.cat]);
    const genders = [...new Set(PRODUCTS.map((p) => p.gender))];
    const Group = ({ title, children }) => html`<fieldset className="fgroup"><legend>${title}</legend>${children}</fieldset>`;
    return html`
      <div className="filters">
        <${Group} title="Categoría">
          <div className="form-check"><input className="form-check-input" type="radio" name=${uid + "cat"} id=${uid + "c-all"} checked=${!f.cat} onChange=${() => set({ cat: "" })} />
            <label className="form-check-label" htmlFor=${uid + "c-all"}>Todas <small className="text-body-secondary">(${applyFilters(f, "cat").length})</small></label></div>
          ${CATEGORIES.map((c) => html`<div className="form-check" key=${c.id}>
            <input className="form-check-input" type="radio" name=${uid + "cat"} id=${uid + "c-" + c.id} checked=${f.cat === c.id} onChange=${() => set({ cat: c.id })} />
            <label className="form-check-label" htmlFor=${uid + "c-" + c.id}>${c.name} <small className="text-body-secondary">(${applyFilters({ ...f, cat: c.id }).length})</small></label></div>`)}
        <//>
        <${Group} title="Precio">
          ${PRICE_RANGES.map(([a, b, label]) => html`<div className="form-check" key=${label}>
            <input className="form-check-input" type="radio" name=${uid + "pr"} id=${uid + "p" + a} checked=${f.min === a && f.max === b && (a || b)} onChange=${() => set({ min: a || "", max: b || "" })} />
            <label className="form-check-label" htmlFor=${uid + "p" + a}>${label}</label></div>`)}
          <form className="d-flex gap-2 align-items-center mt-2" onSubmit=${(e) => { e.preventDefault(); set({ min: lo || "", max: hi || "" }); }}>
            <input aria-label="Precio mínimo" className="form-control form-control-sm" type="number" min="0" inputMode="numeric" placeholder="Mín." value=${lo} onChange=${(e) => setLo(e.target.value)} />
            <span>–</span>
            <input aria-label="Precio máximo" className="form-control form-control-sm" type="number" min="0" inputMode="numeric" placeholder="Máx." value=${hi} onChange=${(e) => setHi(e.target.value)} />
            <button className="btn btn-sm btn-primary" type="submit" aria-label="Aplicar precio"><${Icon} n="arrow-right" /></button>
          </form>
        <//>
        <${Group} title="Para">
          <div className="chips">${genders.map((g) => html`<button key=${g} type="button" className=${"chip " + (f.g === g ? "on" : "")} aria-pressed=${f.g === g} onClick=${() => set({ g: f.g === g ? "" : g })}>${g}</button>`)}</div>
        <//>
        <${Group} title="Talla">
          <div className="chips">${sizes.map((s) => html`<button key=${s} type="button" className=${"chip " + (f.size === s ? "on" : "")} aria-pressed=${f.size === s} onClick=${() => set({ size: f.size === s ? "" : s })}>${s}</button>`)}</div>
        <//>
        <${Group} title="Ofertas">
          <div className="form-check form-switch"><input className="form-check-input" type="checkbox" role="switch" id=${uid + "of"} checked=${f.oferta} onChange=${(e) => set({ oferta: e.target.checked ? "1" : "" })} />
            <label className="form-check-label" htmlFor=${uid + "of"}>Solo productos en oferta</label></div>
        <//>
      </div>`;
  };

  const Catalog = ({ query }) => {
    const f = {
      q: query.q || "", cat: query.cat || "", g: query.g || "", size: query.size || "",
      min: Number(query.min) || 0, max: Number(query.max) || 0, oferta: query.oferta === "1",
    };
    const sort = query.sort || "rel";
    const shown = (Number(query.p) || 1) * CFG.itemsPerPage;
    const cat = catById(f.cat);
    const title = f.q ? `Resultados para “${f.q}”` : cat ? cat.name : f.oferta ? "Ofertas" : sort === "nuevo" && !f.cat ? "Novedades" : "Todos los productos";
    T.useTitle(title, `Compra ${title.toLowerCase()} en ${CFG.name}.`);
    const open = useStore(ui).filtersOpen;
    const canvas = useRef(null);
    useEffect(() => {
      const el = canvas.current;
      const h = () => ui.set({ filtersOpen: false });
      el.addEventListener("hidden.bs.offcanvas", h);
      return () => el.removeEventListener("hidden.bs.offcanvas", h);
    }, []);
    useEffect(() => { const i = bootstrap.Offcanvas.getOrCreateInstance(canvas.current); open ? i.show() : i.hide(); }, [open]);
    useEffect(() => () => ui.set({ filtersOpen: false }), []);

    const set = (patch) => T.go("/catalogo", { ...query, ...patch, p: undefined });
    const items = useMemo(() => {
      const r = applyFilters(f).slice();
      const cmp = {
        "price-asc": (a, b) => a.price - b.price, "price-desc": (a, b) => b.price - a.price,
        dto: (a, b) => discountPct(b) - discountPct(a), rating: (a, b) => b.rating - a.rating || b.reviews - a.reviews,
        nuevo: (a, b) => (b.tags.includes("nuevo") - a.tags.includes("nuevo")) || b.id - a.id,
        rel: (a, b) => (b.tags.includes("masvendido") - a.tags.includes("masvendido")) || b.reviews - a.reviews,
      }[sort];
      return r.sort(cmp);
    }, [query.q, query.cat, query.g, query.size, query.min, query.max, query.oferta, sort]);

    const chips = [
      f.q && ["q", `“${f.q}”`], f.cat && ["cat", cat ? cat.name : f.cat], f.g && ["g", f.g], f.size && ["size", "Talla " + f.size],
      (f.min || f.max) && ["price", f.min && f.max ? `${fmt(f.min)} – ${fmt(f.max)}` : f.min ? `Desde ${fmt(f.min)}` : `Hasta ${fmt(f.max)}`],
      f.oferta && ["oferta", "En oferta"],
    ].filter(Boolean);
    const clearChip = (k) => (k === "price" ? set({ min: "", max: "" }) : set({ [k]: "" }));

    const crumbs = [{ label: "Inicio", href: "#/" }, { label: "Catálogo", href: cat || f.q ? "#/catalogo" : undefined }];
    if (cat) crumbs.push({ label: cat.name }); else if (f.q) crumbs.push({ label: "Búsqueda" });

    return html`
      <div className="container py-3 py-lg-4">
        <${Breadcrumb} items=${crumbs} />
        <div className="cat-head">
          <div><h1 className="h3 mb-0">${title}</h1><small className="text-body-secondary" aria-live="polite">${items.length} producto${items.length === 1 ? "" : "s"}</small></div>
          <div className="d-flex gap-2 align-items-center">
            <button type="button" className="btn btn-outline-primary d-lg-none" onClick=${() => ui.set({ filtersOpen: true })}><${Icon} n="sliders" /> Filtros${chips.length ? ` (${chips.length})` : ""}</button>
            <label className="visually-hidden" htmlFor="sort">Ordenar por</label>
            <select id="sort" className="form-select" value=${sort} onChange=${(e) => set({ sort: e.target.value === "rel" ? "" : e.target.value })}>
              ${SORTS.map(([v, l]) => html`<option key=${v} value=${v}>${l}</option>`)}</select>
          </div>
        </div>
        ${chips.length > 0 && html`<div className="active-chips">
          ${chips.map(([k, l]) => html`<button type="button" key=${k} className="achip" onClick=${() => clearChip(k)} aria-label=${"Quitar filtro " + l}>${l} <${Icon} n="x-lg" /></button>`)}
          <button type="button" className="btn btn-link btn-sm" onClick=${() => T.go("/catalogo", {})}>Limpiar todo</button></div>`}
        <div className="row g-4">
          <aside className="col-lg-3 d-none d-lg-block" aria-label="Filtros"><${FiltersPanel} f=${f} set=${set} uid="d-" /></aside>
          <div className="col-lg-9">
            ${items.length === 0
              ? html`<div className="empty-state big">
                  <${Icon} n="search" className="empty-ico" /><h2 className="h5">No encontramos resultados</h2>
                  <p className="text-body-secondary">Prueba con otras palabras o quita algunos filtros.</p>
                  <button className="btn btn-primary" onClick=${() => T.go("/catalogo", {})}>Ver todos los productos</button></div>`
              : html`<${ProductGrid} items=${items.slice(0, shown)} className="row-cols-xl-3" />
                  <div className="text-center mt-4">
                    <p className="small text-body-secondary mb-2">Mostrando ${Math.min(shown, items.length)} de ${items.length}</p>
                    ${shown < items.length && html`<button className="btn btn-outline-primary btn-lg px-5" onClick=${() => T.go("/catalogo", { ...query, p: (Number(query.p) || 1) + 1 })}>Ver más productos</button>`}</div>`}
          </div>
        </div>
        <div className="offcanvas offcanvas-start" tabIndex="-1" id="filters-canvas" aria-labelledby="filters-title" ref=${canvas}>
          <div className="offcanvas-header"><h2 className="offcanvas-title h5" id="filters-title">Filtros</h2>
            <button type="button" className="btn-close" aria-label="Cerrar" onClick=${() => ui.set({ filtersOpen: false })}></button></div>
          <div className="offcanvas-body"><${FiltersPanel} f=${f} set=${set} uid="m-" /></div>
          <div className="offcanvas-footer"><button className="btn btn-primary w-100 btn-lg" onClick=${() => ui.set({ filtersOpen: false })}>Ver ${items.length} resultado${items.length === 1 ? "" : "s"}</button></div>
        </div>
      </div>`;
  };

  /* --------------------------- DETALLE DE PRODUCTO -------------------------- */
  const Gallery = ({ p, idx, setIdx }) => {
    const [zoom, setZoom] = useState(null);
    const move = (e) => {
      const r = e.currentTarget.getBoundingClientRect();
      setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
    };
    return html`
      <div className="gallery">
        ${p.images.length > 1 && html`<div className="thumbs" role="tablist" aria-label="Miniaturas">
          ${p.images.map((src, i) => html`<button key=${i} type="button" role="tab" aria-selected=${i === idx} className=${i === idx ? "on" : ""} aria-label=${"Ver imagen " + (i + 1)} onClick=${() => setIdx(i)}><${Img} src=${src} alt="" /></button>`)}</div>`}
        <div className=${"gallery-main " + (zoom ? "zooming" : "")} onMouseMove=${move} onMouseLeave=${() => setZoom(null)}>
          <${Img} src=${p.images[idx]} alt=${p.name} style=${zoom ? { transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} loading="eager" />
          <${T.WishButton} id=${p.id} className="gallery-wish" />
          ${discountPct(p) > 0 && html`<span className="badge-off big">-${discountPct(p)}%</span>`}
        </div>
      </div>`;
  };

  const ProductPage = ({ slug }) => {
    const p = bySlug(slug);
    const [idx, setIdx] = useState(0);
    const [tab, setTab] = useState("desc");
    const recent = useStore(db).recent;
    useEffect(() => { setIdx(0); setTab("desc"); if (p) T.pushRecent(p.id); }, [slug]);
    T.useTitle(p ? p.name : "Producto no encontrado", p ? p.description : "");
    /* Datos estructurados para buscadores (SEO) */
    useEffect(() => {
      if (!p) return;
      const s = document.createElement("script");
      s.type = "application/ld+json";
      s.textContent = JSON.stringify({
        "@context": "https://schema.org", "@type": "Product", name: p.name, image: p.images, description: p.description,
        brand: { "@type": "Brand", name: p.brand },
        aggregateRating: { "@type": "AggregateRating", ratingValue: p.rating, reviewCount: p.reviews },
        offers: { "@type": "Offer", priceCurrency: "PEN", price: p.price, availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock" },
      });
      document.head.appendChild(s);
      return () => s.remove();
    }, [slug]);
    if (!p) return html`<${NotFound} />`;
    const cat = catById(p.category);
    const related = [...PRODUCTS.filter((x) => x.category === p.category && x.id !== p.id), ...PRODUCTS.filter((x) => x.category !== p.category)].slice(0, 4);
    const seen = recent.filter((id) => id !== p.id).map(byId).filter(Boolean).slice(0, 6);
    const tabs = [["desc", "Descripción"], ["feat", "Características"], ["ship", "Envíos y cambios"]];
    const inst = p.price / CFG.installments;
    return html`
      <${React.Fragment}>
      <div className="container py-3 py-lg-4">
        <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: cat ? cat.name : "Catálogo", href: "#/catalogo?cat=" + p.category }, { label: p.name }]} />
        <div className="row g-4 g-xl-5">
          <div className="col-lg-7"><${Gallery} p=${p} idx=${idx} setIdx=${setIdx} /></div>
          <div className="col-lg-5">
            <div className="pinfo">
              <small className="text-body-secondary text-uppercase fw-semibold">${p.brand}</small>
              <h1 className="h3 mb-2">${p.name}</h1>
              <div className="d-flex align-items-center gap-3 flex-wrap mb-3">
                <${Stars} rating=${p.rating} reviews=${p.reviews} /><small className="text-body-secondary">SKU: ${String(p.id).padStart(6, "0")}</small></div>
              <${Price} p=${p} large />
              <p className="installments"><${Icon} n="credit-card" /> o ${CFG.installments} cuotas sin interés de <strong>${fmt(inst)}</strong> con tarjeta</p>
              <hr />
              <div id="buybox"><${BuyBox} p=${p} key=${p.id} showBuyNow=${true} onAdded=${{ onColor: (i) => setIdx(i || 0) }} /></div>
              <ul className="assure">
                <li><${Icon} n="truck" /> ${p.price >= CFG.freeShippingFrom ? html`<strong>Envío gratis</strong> a todo Lima` : `Envío a domicilio ${fmt(CFG.shippingCost)} · gratis desde ${fmt(CFG.freeShippingFrom)}`}</li>
                <li><${Icon} n="shop" /> Retiro gratis en tienda en 24 horas</li>
                <li><${Icon} n="arrow-repeat" /> 30 días para cambios y devoluciones</li></ul>
            </div>
          </div>
        </div>

        <section className="ptabs mt-5" aria-label="Información del producto">
          <ul className="nav nav-tabs" role="tablist">
            ${tabs.map(([k, l]) => html`<li className="nav-item" role="presentation" key=${k}>
              <button type="button" role="tab" className=${"nav-link " + (tab === k ? "active" : "")} aria-selected=${tab === k} onClick=${() => setTab(k)}>${l}</button></li>`)}</ul>
          <div className="tab-body" role="tabpanel">
            ${tab === "desc" && html`<p>${p.description}</p>`}
            ${tab === "feat" && html`<ul className="feat">${p.features.map((x) => html`<li key=${x}><${Icon} n="check2-circle" /> ${x}</li>`)}
              <li><${Icon} n="gender-ambiguous" /> Para: ${p.gender}</li></ul>`}
            ${tab === "ship" && html`<p>${p.delivery}</p>`}
          </div>
        </section>

        <section className="mt-5"><${SectionHead} title="También te puede interesar" href=${"#/catalogo?cat=" + p.category} /><${ProductGrid} items=${related} /></section>
        ${seen.length > 0 && html`<section className="mt-5"><${SectionHead} title="Vistos recientemente" /><${Rail} items=${seen} /></section>`}
      </div>
      <div className="sticky-buy d-lg-none">
        <div><strong>${fmt(p.price)}</strong>${discountPct(p) > 0 && html` <small className="text-decoration-line-through text-body-secondary">${fmt(p.oldPrice)}</small>`}</div>
        <button type="button" className="btn btn-primary" onClick=${() => document.getElementById("buybox").scrollIntoView({ behavior: "smooth", block: "center" })}>Elegir talla y agregar</button>
      </div>
      <//>`;
  };

  /* ---------------------------------- CARRO --------------------------------- */
  const CouponBox = () => {
    const state = useStore(db);
    const [code, setCode] = useState("");
    const [msg, setMsg] = useState(null);
    const apply = (e) => {
      e.preventDefault();
      const r = T.applyCoupon(code);
      setMsg(r.ok ? { ok: true, t: `Cupón aplicado: ${r.coupon.label}` } : { ok: false, t: r.error });
      if (r.ok) setCode("");
    };
    if (state.coupon) return html`<div className="coupon applied"><${Icon} n="tag-fill" /> <span><strong>${state.coupon}</strong> · ${CFG.coupons[state.coupon].label}</span>
      <button type="button" className="btn btn-link btn-sm ms-auto" onClick=${() => db.set({ coupon: null })}>Quitar</button></div>`;
    return html`<form className="coupon" onSubmit=${apply}>
      <label htmlFor="coupon" className="visually-hidden">Cupón de descuento</label>
      <input id="coupon" className="form-control" placeholder="Código de cupón" value=${code} onChange=${(e) => { setCode(e.target.value); setMsg(null); }} />
      <button className="btn btn-outline-primary" type="submit" disabled=${!code.trim()}>Aplicar</button>
      ${msg && html`<div className=${"small w-100 " + (msg.ok ? "text-success" : "text-danger")} role="status">${msg.t}</div>`}</form>`;
  };

  const Totals = ({ d }) => html`
    <dl className="totals">
      <div><dt>Subtotal (${d.units} ${d.units === 1 ? "producto" : "productos"})</dt><dd>${fmt(d.subtotal)}</dd></div>
      ${d.discount > 0 && html`<div className="text-success"><dt>Cupón ${d.couponCode}</dt><dd>- ${fmt(d.discount)}</dd></div>`}
      <div><dt>Envío</dt><dd>${d.shipping > 0 ? fmt(d.shipping) : html`<span className="text-success">Gratis</span>`}</dd></div>
      <div className="grand"><dt>Total</dt><dd>${fmt(d.total)}</dd></div>
    </dl>`;

  const EmptyCart = () => html`<div className="empty-state big">
    <${Icon} n="bag" className="empty-ico" /><h2 className="h4">Tu carro está vacío</h2>
    <p className="text-body-secondary">Agrega productos y aparecerán aquí.</p>
    <a href="#/catalogo" className="btn btn-primary btn-lg">Descubrir productos</a></div>`;

  const CartPage = () => {
    T.useTitle("Carro de compras");
    const state = useStore(db);
    const d = T.cartDetail(state, "domicilio");
    return html`
      <div className="container py-3 py-lg-4">
        <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: "Carro" }]} />
        <h1 className="h3 mb-4">Carro de compras</h1>
        ${d.lines.length === 0 ? html`<${EmptyCart} />` : html`
          <div className="row g-4">
            <div className="col-lg-8">
              <${FreeShipBar} d=${d} />
              <ul className="clist page">${d.lines.map((l) => html`<${CartLine} key=${l.key} l=${l} />`)}</ul>
              <div className="d-flex justify-content-between mt-3">
                <a href="#/catalogo" className="btn btn-link"><${Icon} n="arrow-left" /> Seguir comprando</a>
                <button className="btn btn-link text-danger" onClick=${() => { T.clearCart(); T.toast("Carro vaciado", "secondary"); }}>Vaciar carro</button></div>
            </div>
            <div className="col-lg-4"><div className="summary">
              <h2 className="h5">Resumen del pedido</h2>
              <${CouponBox} /><${Totals} d=${d} />
              ${d.savings > 0 && html`<p className="small text-success mb-3"><${Icon} n="piggy-bank" /> Ahorras ${fmt(d.savings + d.discount)} en esta compra</p>`}
              <a href="#/checkout" className="btn btn-primary btn-lg w-100">Continuar con la compra</a>
              <p className="small text-body-secondary text-center mt-2 mb-0"><${Icon} n="lock" /> Compra protegida</p>
            </div></div>
          </div>`}
      </div>`;
  };

  /* -------------------------------- CHECKOUT -------------------------------- */
  const PAYMENTS = [
    ["tarjeta", "credit-card", "Tarjeta de crédito o débito", `Hasta ${CFG.installments} cuotas sin interés (simulado)`],
    ["yape", "phone", "Yape / Plin", "Paga con tu billetera digital (simulado)"],
    ["contraentrega", "cash-coin", "Pago contra entrega", "Paga en efectivo al recibir (solo envío a domicilio)"],
  ];

  const Checkout = () => {
    T.useTitle("Finalizar compra");
    const state = useStore(db);
    const u = state.user || {};
    const [f, setF] = useState({ name: u.name || "", email: u.email || "", phone: u.phone || "", method: "domicilio", address: "", district: "", ref: "", store: CFG.stores[0], pay: "tarjeta", terms: false });
    const [err, setErr] = useState({});
    const d = T.cartDetail(state, f.method);
    const set = (k) => (e) => setF({ ...f, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });
    const inv = (k) => "form-control" + (err[k] ? " is-invalid" : "");
    useEffect(() => { if (f.method === "retiro" && f.pay === "contraentrega") setF((x) => ({ ...x, pay: "tarjeta" })); }, [f.method]);

    if (d.lines.length === 0) return html`<div className="container py-5"><${EmptyCart} /></div>`;

    const submit = (e) => {
      e.preventDefault();
      const er = {};
      if (f.name.trim().length < 3) er.name = "Ingresa tu nombre completo";
      if (!EMAIL_RE.test(f.email.trim())) er.email = "Ingresa un correo válido";
      if (!/^9\d{8}$/.test(f.phone.trim())) er.phone = "Ingresa un celular de 9 dígitos que empiece con 9";
      if (f.method === "domicilio") {
        if (f.address.trim().length < 6) er.address = "Ingresa tu dirección completa";
        if (!f.district) er.district = "Elige tu distrito";
      }
      if (!f.terms) er.terms = "Debes aceptar los términos para finalizar";
      setErr(er);
      const first = Object.keys(er)[0];
      if (first) { const el = document.getElementById("c-" + first); el && el.focus(); return; }
      const order = {
        id: "RP-" + Date.now().toString(36).toUpperCase(),
        date: new Date().toISOString(),
        items: d.lines.map((l) => ({ id: l.id, name: l.product.name, image: l.product.images[0], size: l.size, color: l.color, qty: l.qty, price: l.product.price })),
        subtotal: d.subtotal, discount: d.discount, shipping: d.shipping, total: d.total, coupon: d.couponCode,
        customer: { name: f.name.trim(), email: f.email.trim(), phone: f.phone.trim() },
        delivery: f.method === "domicilio" ? { method: "domicilio", address: f.address.trim(), district: f.district, ref: f.ref.trim() } : { method: "retiro", store: f.store },
        pay: f.pay,
      };
      db.set({ orders: [order, ...state.orders].slice(0, 20), cart: [], coupon: null });
      T.go("/pedido/" + order.id);
    };

    const Radio = ({ name, value, title, sub, icon, disabled }) => html`
      <label className=${"opt " + (f[name] === value ? "on" : "") + (disabled ? " disabled" : "")}>
        <input type="radio" name=${name} value=${value} checked=${f[name] === value} disabled=${disabled} onChange=${set(name)} />
        <${Icon} n=${icon} /><span><strong>${title}</strong><small>${sub}</small></span></label>`;

    return html`
      <div className="container py-3 py-lg-4">
        <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: "Carro", href: "#/carrito" }, { label: "Finalizar compra" }]} />
        <h1 className="h3 mb-4">Finalizar compra</h1>
        <form onSubmit=${submit} noValidate>
          <div className="row g-4">
            <div className="col-lg-8">
              <section className="panel">
                <h2><span className="step">1</span> Tus datos</h2>
                <div className="row g-3">
                  <div className="col-12"><${Field} id="c-name" label="Nombre y apellido" error=${err.name}><input id="c-name" className=${inv("name")} value=${f.name} onChange=${set("name")} autoComplete="name" /><//></div>
                  <div className="col-md-7"><${Field} id="c-email" label="Correo electrónico" error=${err.email}><input id="c-email" type="email" className=${inv("email")} value=${f.email} onChange=${set("email")} autoComplete="email" /><//></div>
                  <div className="col-md-5"><${Field} id="c-phone" label="Celular" error=${err.phone}><input id="c-phone" type="tel" maxLength="9" inputMode="numeric" className=${inv("phone")} value=${f.phone} onChange=${set("phone")} autoComplete="tel-national" /><//></div>
                </div>
              </section>
              <section className="panel">
                <h2><span className="step">2</span> Entrega</h2>
                <div className="opts mb-3">
                  <${Radio} name="method" value="domicilio" icon="truck" title="Envío a domicilio" sub=${d.missingForFree <= 0 || (d.coupon && d.coupon.type === "ship") ? "Gratis · 2 a 4 días hábiles" : `${fmt(CFG.shippingCost)} · 2 a 4 días hábiles`} />
                  <${Radio} name="method" value="retiro" icon="shop" title="Retiro en tienda" sub="Gratis · listo en 24 horas" />
                </div>
                ${f.method === "domicilio" ? html`<div className="row g-3">
                  <div className="col-12"><${Field} id="c-address" label="Dirección" error=${err.address}><input id="c-address" className=${inv("address")} value=${f.address} onChange=${set("address")} autoComplete="street-address" placeholder="Av. / Calle, número, dpto." /><//></div>
                  <div className="col-md-6"><${Field} id="c-district" label="Distrito" error=${err.district}>
                    <select id="c-district" className=${"form-select" + (err.district ? " is-invalid" : "")} value=${f.district} onChange=${set("district")}>
                      <option value="">Selecciona…</option>${CFG.districts.map((x) => html`<option key=${x}>${x}</option>`)}</select><//></div>
                  <div className="col-md-6"><${Field} id="c-ref" label="Referencia (opcional)"><input id="c-ref" className="form-control" value=${f.ref} onChange=${set("ref")} placeholder="Frente al parque…" /><//></div>
                </div>` : html`<${Field} id="c-store" label="Tienda de retiro"><select id="c-store" className="form-select" value=${f.store} onChange=${set("store")}>${CFG.stores.map((x) => html`<option key=${x}>${x}</option>`)}</select><//>`}
              </section>
              <section className="panel">
                <h2><span className="step">3</span> Pago</h2>
                <div className="opts vertical">
                  ${PAYMENTS.map(([v, ic, t, s]) => html`<${Radio} key=${v} name="pay" value=${v} icon=${ic} title=${t} sub=${s} disabled=${v === "contraentrega" && f.method === "retiro"} />`)}</div>
                <p className="small text-body-secondary mt-3 mb-0"><${Icon} n="info-circle" /> Demostración: no se solicitan ni procesan datos de tarjeta ni se realiza ningún cobro.</p>
              </section>
            </div>
            <div className="col-lg-4">
              <div className="summary sticky">
                <h2 className="h5">Tu pedido</h2>
                <ul className="mini-lines">${d.lines.map((l) => html`<li key=${l.key}>
                  <div className="ml-img"><${Img} src=${l.product.images[0]} alt="" /><span>${l.qty}</span></div>
                  <div className="flex-fill"><small className="d-block lh-sm">${l.product.name}</small><small className="text-body-secondary">${l.size ? "Talla " + l.size : ""}</small></div>
                  <strong className="small">${fmt(l.product.price * l.qty)}</strong></li>`)}</ul>
                <${CouponBox} /><${Totals} d=${d} />
                <div className="form-check mb-3">
                  <input id="c-terms" type="checkbox" className=${"form-check-input" + (err.terms ? " is-invalid" : "")} checked=${f.terms} onChange=${set("terms")} />
                  <label className="form-check-label small" htmlFor="c-terms">Acepto los términos y condiciones y la política de privacidad</label>
                  ${err.terms && html`<div className="invalid-feedback d-block" role="alert">${err.terms}</div>`}</div>
                <button type="submit" className="btn btn-accent btn-lg w-100">Confirmar pedido · ${fmt(d.total)}</button>
              </div>
            </div>
          </div>
        </form>
      </div>`;
  };

  /* --------------------------- PEDIDO / CUENTA / VARIOS --------------------- */
  const OrderPage = ({ id }) => {
    T.useTitle("Pedido " + id);
    const o = useStore(db).orders.find((x) => x.id === id);
    if (!o) return html`<${NotFound} />`;
    const eta = o.delivery.method === "retiro" ? "Listo para recoger en 24 horas" : "Llegará en 2 a 4 días hábiles";
    return html`
      <div className="container py-4 py-lg-5" style=${{ maxWidth: "860px" }}>
        <div className="text-center mb-4">
          <div className="success-ico"><${Icon} n="check-lg" /></div>
          <h1 className="h3">¡Gracias por tu compra, ${o.customer.name.split(" ")[0]}!</h1>
          <p className="text-body-secondary mb-1">Tu pedido <strong>${o.id}</strong> fue registrado (demostración).</p>
          <p className="text-body-secondary">Enviamos el detalle a <strong>${o.customer.email}</strong>.</p>
        </div>
        <div className="panel">
          <div className="row g-3 mb-3">
            <div className="col-md-6"><h2 className="h6">${o.delivery.method === "retiro" ? "Retiro en tienda" : "Envío a domicilio"}</h2>
              <p className="mb-1 small">${o.delivery.method === "retiro" ? o.delivery.store : `${o.delivery.address}, ${o.delivery.district}`}</p><p className="small text-success mb-0"><${Icon} n="clock" /> ${eta}</p></div>
            <div className="col-md-6"><h2 className="h6">Método de pago</h2><p className="small mb-0">${(PAYMENTS.find((x) => x[0] === o.pay) || [])[2]}</p></div></div>
          <ul className="mini-lines">${o.items.map((l, i) => html`<li key=${i}><div className="ml-img"><${Img} src=${l.image} alt="" /><span>${l.qty}</span></div>
            <div className="flex-fill"><small className="d-block">${l.name}</small><small className="text-body-secondary">${l.size ? "Talla " + l.size : ""}</small></div><strong className="small">${fmt(l.price * l.qty)}</strong></li>`)}</ul>
          <dl className="totals">
            <div><dt>Subtotal</dt><dd>${fmt(o.subtotal)}</dd></div>
            ${o.discount > 0 && html`<div className="text-success"><dt>Cupón ${o.coupon}</dt><dd>- ${fmt(o.discount)}</dd></div>`}
            <div><dt>Envío</dt><dd>${o.shipping > 0 ? fmt(o.shipping) : "Gratis"}</dd></div>
            <div className="grand"><dt>Total</dt><dd>${fmt(o.total)}</dd></div></dl>
        </div>
        <div className="text-center mt-4"><a href="#/catalogo" className="btn btn-primary btn-lg">Seguir comprando</a></div>
      </div>`;
  };

  const Wishlist = () => {
    T.useTitle("Mis favoritos");
    const wish = useStore(db).wish;
    const items = wish.map(byId).filter(Boolean);
    return html`<div className="container py-3 py-lg-4">
      <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: "Favoritos" }]} />
      <h1 className="h3 mb-4">Mis favoritos <small className="text-body-secondary fs-6">(${items.length})</small></h1>
      ${items.length === 0
        ? html`<div className="empty-state big"><${Icon} n="heart" className="empty-ico" /><h2 className="h5">Aún no tienes favoritos</h2>
            <p className="text-body-secondary">Toca el corazón en cualquier producto para guardarlo aquí.</p><a href="#/catalogo" className="btn btn-primary">Explorar productos</a></div>`
        : html`<${ProductGrid} items=${items} />`}</div>`;
  };

  const Account = () => {
    T.useTitle("Mi cuenta");
    const { user, orders } = useStore(db);
    if (!user) return html`<div className="container py-5"><div className="empty-state big"><${Icon} n="person-circle" className="empty-ico" /><h2 className="h5">Inicia sesión para ver tu cuenta</h2>
      <button className="btn btn-primary" onClick=${() => ui.set({ authOpen: true, authTab: "login" })}>Iniciar sesión</button></div></div>`;
    return html`<div className="container py-3 py-lg-4" style=${{ maxWidth: "960px" }}>
      <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: "Mi cuenta" }]} />
      <div className="panel d-flex align-items-center gap-3 flex-wrap">
        <div className="avatar">${user.name.charAt(0).toUpperCase()}</div>
        <div className="flex-fill"><h1 className="h5 mb-0">${user.name}</h1><small className="text-body-secondary">${user.email}${user.phone ? " · " + user.phone : ""}</small></div>
        <button className="btn btn-outline-secondary" onClick=${() => { T.logout(); T.go("/"); }}>Cerrar sesión</button></div>
      <h2 className="h5 mt-4">Mis pedidos</h2>
      ${orders.length === 0 ? html`<p className="text-body-secondary">Todavía no tienes pedidos.</p>`
        : html`<div className="list-group">${orders.map((o) => html`<a key=${o.id} className="list-group-item list-group-item-action d-flex justify-content-between align-items-center" href=${"#/pedido/" + o.id}>
          <span><strong>${o.id}</strong><small className="d-block text-body-secondary">${new Date(o.date).toLocaleDateString(CFG.locale)} · ${o.items.reduce((a, x) => a + x.qty, 0)} producto(s)</small></span><strong>${fmt(o.total)}</strong></a>`)}</div>`}
    </div>`;
  };

  const Help = () => {
    T.useTitle("Ayuda");
    const faq = [
      ["¿Cuánto demora mi pedido?", "Envío a domicilio en Lima Metropolitana: 2 a 4 días hábiles. Retiro en tienda: listo en 24 horas."],
      ["¿Cuánto cuesta el envío?", `${fmt(CFG.shippingCost)}; gratis en compras desde ${fmt(CFG.freeShippingFrom)} o con el cupón ENVIOGRATIS.`],
      ["¿Cómo hago un cambio o devolución?", "Tienes 30 días desde la compra. Lleva el producto sin uso, con etiquetas y boleta a cualquier tienda."],
      ["¿Qué medios de pago aceptan?", "Tarjetas de crédito y débito, Yape/Plin y pago contra entrega en envíos a domicilio."],
      ["¿Cómo uso un cupón?", "Escribe el código en el carro o en el checkout y presiona Aplicar. Prueba con BIENVENIDO10."],
    ];
    return html`<div className="container py-3 py-lg-4" style=${{ maxWidth: "820px" }}>
      <${Breadcrumb} items=${[{ label: "Inicio", href: "#/" }, { label: "Ayuda" }]} />
      <h1 className="h3 mb-4">Centro de ayuda</h1>
      <div className="faq">${faq.map(([q, a], i) => html`<details key=${i} open=${i === 0}><summary>${q}</summary><p>${a}</p></details>`)}</div>
      <p className="mt-4">¿Necesitas más ayuda? Escríbenos por <a href=${"https://wa.me/" + CFG.whatsapp}>WhatsApp</a> o a ${CFG.email}.</p></div>`;
  };

  const NotFound = () => {
    T.useTitle("Página no encontrada");
    return html`<div className="container py-5"><div className="empty-state big"><${Icon} n="emoji-frown" className="empty-ico" />
      <h1 className="h4">No encontramos esta página</h1><p className="text-body-secondary">Puede que el enlace haya cambiado o el producto ya no esté disponible.</p>
      <a href="#/" className="btn btn-primary">Ir al inicio</a></div></div>`;
  };

  Object.assign(T, { Home, Catalog, ProductPage, CartPage, Checkout, OrderPage, Wishlist, Account, Help, NotFound });
})();
