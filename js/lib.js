/* ==========================================================================
   NÚCLEO: utilidades, estado global (carrito/favoritos/sesión) y router
   ========================================================================== */
(function () {
  const { useState, useEffect, useRef, useSyncExternalStore } = React;
  const html = htm.bind(React.createElement);
  const CFG = window.SITE_CONFIG;
  const PRODUCTS = window.CATALOG;
  const CATEGORIES = window.SITE_CATEGORIES;

  /* ------------------------------- Utilidades ------------------------------- */
  const fmt = (n) =>
    CFG.currency + " " + Number(n).toLocaleString(CFG.locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const norm = (s) => String(s || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  const discountPct = (p) => (p.oldPrice && p.oldPrice > p.price ? Math.round((1 - p.price / p.oldPrice) * 100) : 0);
  const byId = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const bySlug = (slug) => PRODUCTS.find((p) => p.slug === slug);
  const catById = (id) => CATEGORIES.find((c) => c.id === id);
  const PLACEHOLDER = "images/placeholder.svg";

  /* ------------------------------ Store genérico ----------------------------- */
  function createStore(initial, persistKey) {
    let state = initial;
    if (persistKey) {
      try {
        const raw = localStorage.getItem(persistKey);
        if (raw) state = { ...initial, ...JSON.parse(raw) };
      } catch (e) { /* localStorage no disponible: seguimos en memoria */ }
    }
    const listeners = new Set();
    return {
      get: () => state,
      set(patch) {
        state = { ...state, ...(typeof patch === "function" ? patch(state) : patch) };
        if (persistKey) {
          try { localStorage.setItem(persistKey, JSON.stringify(state)); } catch (e) { /* ignorar */ }
        }
        listeners.forEach((l) => l());
      },
      subscribe(l) { listeners.add(l); return () => listeners.delete(l); },
    };
  }
  const useStore = (store) => useSyncExternalStore(store.subscribe, store.get);

  /* Datos persistentes (se guardan en el navegador) */
  const db = createStore(
    { cart: [], wish: [], user: null, coupon: null, orders: [], recent: [], newsletter: false },
    "tv:data:v1"
  );
  /* Estado de interfaz (no persiste) */
  const ui = createStore({ cartOpen: false, authOpen: false, authTab: "login", menuOpen: false, filtersOpen: false, quick: null, toasts: [] });

  /* ------------------------------- Notificaciones ---------------------------- */
  let toastId = 0;
  function toast(message, type = "success", action) {
    const id = ++toastId;
    ui.set((s) => ({ toasts: [...s.toasts, { id, message, type, action }] }));
    setTimeout(() => ui.set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3800);
  }

  /* --------------------------------- Carrito -------------------------------- */
  const lineKey = (l) => [l.id, l.size || "", l.color || ""].join("|");

  function addToCart(product, { size, color, qty = 1 } = {}, silent) {
    const cart = db.get().cart.slice();
    const key = lineKey({ id: product.id, size, color });
    const i = cart.findIndex((l) => lineKey(l) === key);
    const max = Math.min(product.stock, CFG.maxQtyPerLine);
    if (i >= 0) {
      const next = Math.min(cart[i].qty + qty, max);
      if (next === cart[i].qty) { toast("Ya tienes el máximo disponible de este producto", "warning"); return false; }
      cart[i] = { ...cart[i], qty: next };
    } else cart.push({ id: product.id, size, color, qty: Math.min(qty, max) });
    db.set({ cart });
    if (!silent) toast(`Agregaste “${product.name}” al carro`, "success", { label: "Ver carro", href: "#/carrito" });
    return true;
  }
  function setQty(key, qty) {
    const cart = db.get().cart.map((l) => {
      if (lineKey(l) !== key) return l;
      const p = byId(l.id);
      return { ...l, qty: Math.max(1, Math.min(qty, Math.min(p.stock, CFG.maxQtyPerLine))) };
    });
    db.set({ cart });
  }
  const removeLine = (key) => db.set({ cart: db.get().cart.filter((l) => lineKey(l) !== key) });
  const clearCart = () => db.set({ cart: [], coupon: null });

  function toggleWish(id) {
    const w = db.get().wish;
    const has = w.includes(id);
    db.set({ wish: has ? w.filter((x) => x !== id) : [...w, id] });
    toast(has ? "Quitado de favoritos" : "Agregado a favoritos", has ? "secondary" : "success");
  }

  function applyCoupon(code) {
    const c = CFG.coupons[String(code || "").trim().toUpperCase()];
    if (!c) return { ok: false, error: "Cupón no válido" };
    db.set({ coupon: String(code).trim().toUpperCase() });
    return { ok: true, coupon: c };
  }

  /* Totales: se calculan siempre desde el catálogo (nunca confiamos en lo guardado) */
  function cartDetail(state, shippingMethod = "domicilio") {
    const lines = state.cart
      .map((l) => ({ ...l, key: lineKey(l), product: byId(l.id) }))
      .filter((l) => l.product);
    const units = lines.reduce((a, l) => a + l.qty, 0);
    const subtotal = lines.reduce((a, l) => a + l.product.price * l.qty, 0);
    const savings = lines.reduce((a, l) => a + Math.max(0, (l.product.oldPrice || l.product.price) - l.product.price) * l.qty, 0);
    const cp = state.coupon ? CFG.coupons[state.coupon] : null;
    const discount = cp && cp.type === "pct" ? +(subtotal * cp.value / 100).toFixed(2) : 0;
    const afterDiscount = subtotal - discount;
    const freeByAmount = afterDiscount >= CFG.freeShippingFrom;
    const freeByCoupon = cp && cp.type === "ship";
    let shipping = 0;
    if (lines.length && shippingMethod === "domicilio" && !freeByAmount && !freeByCoupon) shipping = CFG.shippingCost;
    return {
      lines, units, subtotal, savings, discount, shipping,
      total: afterDiscount + shipping,
      missingForFree: Math.max(0, CFG.freeShippingFrom - afterDiscount),
      progress: Math.min(100, (afterDiscount / CFG.freeShippingFrom) * 100),
      coupon: cp, couponCode: state.coupon,
    };
  }

  /* ---------------------------- Sesión (simulada) --------------------------- */
  // OJO: sin servidor no hay autenticación real. Solo guardamos nombre y correo.
  // Nunca se guarda ni se imprime la contraseña.
  const login = (user) => db.set({ user });
  const logout = () => { db.set({ user: null }); toast("Cerraste sesión", "secondary"); };

  function pushRecent(id) {
    const r = [id, ...db.get().recent.filter((x) => x !== id)].slice(0, 8);
    db.set({ recent: r });
  }

  /* --------------------------------- Router --------------------------------- */
  function parseHash() {
    const h = (location.hash || "").replace(/^#/, "") || "/";
    const [path, qs] = h.split("?");
    const query = {};
    new URLSearchParams(qs || "").forEach((v, k) => (query[k] = v));
    return { path: path || "/", query };
  }
  function buildHash(path, query) {
    const q = new URLSearchParams();
    Object.entries(query || {}).forEach(([k, v]) => { if (v !== "" && v != null && v !== false) q.set(k, v); });
    const s = q.toString();
    return "#" + path + (s ? "?" + s : "");
  }
  const go = (path, query) => { location.hash = buildHash(path, query); };
  function useRoute() {
    const [route, setRoute] = useState(parseHash());
    const last = useRef(route.path);
    useEffect(() => {
      const on = () => {
        const r = parseHash();
        if (r.path !== last.current) { window.scrollTo({ top: 0 }); last.current = r.path; }
        setRoute(r);
      };
      window.addEventListener("hashchange", on);
      return () => window.removeEventListener("hashchange", on);
    }, []);
    return route;
  }

  /* ----------------------------- Hooks varios ------------------------------ */
  function useTitle(title, description) {
    useEffect(() => {
      document.title = title ? `${title} | ${CFG.name}` : `${CFG.name} | ${CFG.tagline}`;
      const m = document.querySelector('meta[name="description"]');
      if (m && description) m.setAttribute("content", description);
    }, [title, description]);
  }

  window.TV = {
    React, html, CFG, PRODUCTS, CATEGORIES, fmt, norm, discountPct, byId, bySlug, catById, PLACEHOLDER,
    db, ui, useStore, toast, addToCart, setQty, removeLine, clearCart, toggleWish, applyCoupon, cartDetail, lineKey,
    login, logout, pushRecent, parseHash, buildHash, go, useRoute, useTitle,
    SITE_BANNERS: window.SITE_BANNERS, SITE_PROMOS: window.SITE_PROMOS,
  };
})();
