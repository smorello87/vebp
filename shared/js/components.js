/*!
 * VEBP shared components loader.
 * Injects the shared header (shared/components/nav.html) and footer
 * (shared/components/footer.html) — same-origin, trusted files — into
 *   <div id="nav-placeholder"> and <div id="footer-placeholder">.
 * - Height is reserved in CSS (.vebp-header-slot) so the page does not jump.
 * - Each placeholder holds a <noscript> copy; if a fetch fails (e.g. file://)
 *   that copy is rendered instead, so navigation is never lost.
 * - Marks the current page with aria-current, then calls window.EBP.init()
 *   so ebp-core.js wires the theme toggle and mobile menu.
 * - Publishes the header height as --vebp-header-h for full-height layouts
 *   and dispatches "vebp:components" on document when done.
 */
(function (win, doc) {
  "use strict";
  var page = (win.location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page.indexOf(".html") === -1) { page = "index.html"; }
  /* Sub-pages that belong to a section of the subnav. */
  var SECTION = { "missing-lyrics.html": "words.html" };

  function fallbackFrom(el) {
    var ns = el.querySelector("noscript");
    return ns ? ns.textContent : "";
  }

  function render(el, markup) {
    var range = doc.createRange();
    range.selectNodeContents(el);
    var frag = range.createContextualFragment(markup);
    el.textContent = "";
    el.appendChild(frag);
  }

  function load(url, id) {
    var el = doc.getElementById(id);
    if (!el) { return Promise.resolve(null); }
    var fallback = fallbackFrom(el);
    return fetch(url, { credentials: "same-origin" })
      .then(function (r) {
        if (!r.ok) { throw new Error("HTTP " + r.status); }
        return r.text();
      })
      .then(function (markup) { render(el, markup); return el; })
      .catch(function (err) {
        if (win.console) { console.warn("Component load failed, using fallback:", url, err); }
        if (fallback) { render(el, fallback); }
        return el;
      });
  }

  function markCurrent(scope) {
    if (!scope) { return; }
    var links = scope.querySelectorAll(".ebp-subnav a[href]");
    var section = SECTION[page];
    for (var i = 0; i < links.length; i++) {
      var href = (links[i].getAttribute("href") || "").toLowerCase();
      if (href === page) { links[i].setAttribute("aria-current", "page"); }
      else if (section && href === section) { links[i].setAttribute("aria-current", "true"); }
      else { links[i].removeAttribute("aria-current"); }
    }
  }

  function publishHeight() {
    var h = doc.querySelector(".ebp-header");
    if (!h) { return; }
    var px = Math.ceil(h.getBoundingClientRect().height);
    doc.documentElement.style.setProperty("--vebp-header-h", px + "px");
  }

  var header = load("shared/components/nav.html", "nav-placeholder").then(function (el) {
    markCurrent(el);
    if (el) { el.classList.add("is-loaded"); }
    if (win.EBP && typeof win.EBP.init === "function") { win.EBP.init(el || doc); }
    publishHeight();
    return el;
  });
  var footer = load("shared/components/footer.html", "footer-placeholder");

  Promise.all([header, footer]).then(function () {
    var ev;
    try { ev = new CustomEvent("vebp:components"); } catch (e) { ev = doc.createEvent("Event"); ev.initEvent("vebp:components", false, false); }
    doc.dispatchEvent(ev);
  });

  /* Header height changes (mobile menu opened, rotation, zoom). */
  var t = null;
  win.addEventListener("resize", function () { clearTimeout(t); t = setTimeout(publishHeight, 100); });
  if (win.ResizeObserver) {
    header.then(function () {
      var h = doc.querySelector(".ebp-header");
      if (h) { new ResizeObserver(publishHeight).observe(h); }
    });
  }
})(window, document);
