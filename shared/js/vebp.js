/*!
 * vebp.js — small shared helpers for the VEBP visualisation pages.
 * No dependencies. Load after shared/core/ebp-core.js and before page scripts.
 *
 *   VEBP.palette()              chart colours read from the --ebp-viz-* / --ebp-* CSS tokens
 *   VEBP.onThemeChange(fn)      fn(palette, theme) after every light/dark switch (ebp:themechange)
 *   VEBP.reducedMotion()        true when prefers-reduced-motion: reduce
 *   VEBP.alpha(color, a)        "#rrggbb" / "rgb()" -> "rgba(r,g,b,a)"
 *   VEBP.dialog(el)             wire a native <dialog>: Esc, backdrop click, return focus
 *   VEBP.openDialog(el, opener)
 *   VEBP.combobox(input, opts)  ARIA 1.2 combobox + listbox for autocomplete
 *   VEBP.disclosure(btn, panel) mobile show/hide panel with aria-expanded, Esc closes
 *   VEBP.announce(el, text)     update a polite live region
 */
(function (win, doc) {
  "use strict";
  var root = doc.documentElement;
  var mqReduce = win.matchMedia ? win.matchMedia("(prefers-reduced-motion: reduce)") : null;

  function cssVar(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function palette() {
    var p = {
      bg: cssVar("--ebp-bg"),
      surface: cssVar("--ebp-surface"),
      surface2: cssVar("--ebp-surface-2"),
      ink: cssVar("--ebp-ink"),
      ink2: cssVar("--ebp-ink-2"),
      border: cssVar("--ebp-border"),
      borderStrong: cssVar("--ebp-border-strong"),
      accent: cssVar("--ebp-accent"),
      onAccent: cssVar("--ebp-on-accent"),
      highlight: cssVar("--ebp-highlight"),
      band: cssVar("--ebp-viz-band"),
      member: cssVar("--ebp-viz-member"),
      edge: cssVar("--ebp-viz-edge"),
      edgeCross: cssVar("--ebp-viz-edge-cross"),
      path: cssVar("--ebp-viz-path"),
      selected: cssVar("--ebp-viz-selected"),
      neighbor: cssVar("--ebp-viz-neighbor"),
      dim: cssVar("--ebp-viz-dim"),
      label: cssVar("--ebp-viz-label"),
      halo: cssVar("--ebp-viz-halo"),
      markerFill: cssVar("--ebp-viz-marker-fill"),
      cat: []
    };
    for (var i = 1; i <= 8; i++) { p.cat.push(cssVar("--ebp-viz-" + i)); }
    return p;
  }

  function theme() {
    if (win.EBP && win.EBP.getTheme) { return win.EBP.getTheme(); }
    return root.getAttribute("data-theme") || root.getAttribute("data-default-theme") || "dark";
  }

  /* ---- theme change fan-out ------------------------------------------- */
  var listeners = [];
  var lastTheme = theme();
  var pending = false;
  function notify() {
    pending = false;
    var t = theme();
    if (t === lastTheme) { return; }
    lastTheme = t;
    var p = palette();
    for (var i = 0; i < listeners.length; i++) {
      try { listeners[i](p, t); } catch (e) { if (win.console) { console.error(e); } }
    }
  }
  function schedule() {
    if (pending) { return; }
    pending = true;
    (win.requestAnimationFrame || setTimeout)(notify);
  }
  doc.addEventListener("ebp:themechange", schedule);
  /* Belt and braces: also catch data-theme changes made without the event. */
  if (win.MutationObserver) {
    new MutationObserver(schedule).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
  }
  function onThemeChange(fn) { listeners.push(fn); }

  function reducedMotion() { return !!(mqReduce && mqReduce.matches); }

  /* ---- colour helper ---------------------------------------------------- */
  function alpha(color, a) {
    var c = String(color || "").trim(), r, g, b, m;
    if (c.charAt(0) === "#") {
      if (c.length === 4) { c = "#" + c[1] + c[1] + c[2] + c[2] + c[3] + c[3]; }
      r = parseInt(c.slice(1, 3), 16); g = parseInt(c.slice(3, 5), 16); b = parseInt(c.slice(5, 7), 16);
    } else if ((m = c.match(/\d+(\.\d+)?/g)) && m.length >= 3) {
      r = +m[0]; g = +m[1]; b = +m[2];
    } else {
      return c;
    }
    return "rgba(" + r + "," + g + "," + b + "," + a + ")";
  }

  /* ---- live region ------------------------------------------------------- */
  function announce(el, text) {
    if (!el) { return; }
    if (el.textContent === text) { el.textContent = ""; }
    el.textContent = text;
  }

  /* ---- dialogs (native <dialog>: modal = focus contained, Esc closes) ---- */
  function dialog(el) {
    if (!el || el._vebpDialog) { return el; }
    el._vebpDialog = true;
    el.addEventListener("close", function () {
      var o = el._opener;
      el._opener = null;
      if (o && doc.contains(o) && o.focus) { o.focus(); }
    });
    /* Click on the backdrop (outside the content box) closes. */
    el.addEventListener("click", function (e) {
      if (e.target === el) { closeDialog(el); }
    });
    var closers = el.querySelectorAll("[data-dialog-close]");
    for (var i = 0; i < closers.length; i++) {
      closers[i].addEventListener("click", function () { closeDialog(el); });
    }
    /* Fallback for browsers without <dialog>: Esc + simple focus wrap. */
    el.addEventListener("keydown", function (e) {
      if (typeof el.showModal === "function") { return; }
      if (e.key === "Escape") { closeDialog(el); }
      if (e.key === "Tab") {
        var f = el.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (!f.length) { return; }
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && doc.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && doc.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    return el;
  }
  function openDialog(el, opener) {
    dialog(el);
    el._opener = opener || doc.activeElement;
    if (typeof el.showModal === "function") {
      if (!el.open) { el.showModal(); }
    } else {
      el.setAttribute("open", "");
      var f = el.querySelector("[autofocus], button, a[href]");
      if (f) { f.focus(); }
    }
  }
  function closeDialog(el) {
    if (typeof el.close === "function" && el.open) { el.close(); return; }
    el.removeAttribute("open");
    var ev;
    try { ev = new Event("close"); } catch (e) { ev = doc.createEvent("Event"); ev.initEvent("close", false, false); }
    el.dispatchEvent(ev);
  }

  /* ---- combobox ------------------------------------------------------------
     opts.source(query) -> array of strings (already filtered/limited)
     opts.onSelect(value)      chosen from the list (click / Enter on an option)
     opts.onEnter(value)       Enter with no option active (optional)
     opts.minChars (1), opts.listLabel ("Suggestions"), opts.noun ("suggestion")
  ------------------------------------------------------------------------- */
  var comboCount = 0;
  function combobox(input, opts) {
    opts = opts || {};
    var min = opts.minChars || 1;
    var noun = opts.noun || "suggestion";
    var id = input.id || ("vebp-combo-" + (++comboCount));
    input.id = id;

    var wrap = input.parentNode;
    var list = doc.createElement("ul");
    list.id = id + "-listbox";
    list.className = "autocomplete-container";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", opts.listLabel || "Suggestions");
    list.hidden = true;
    input.insertAdjacentElement("afterend", list);

    var status = doc.createElement("p");
    status.className = "ebp-vh";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    wrap.appendChild(status);

    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", list.id);
    input.setAttribute("autocomplete", "off");

    var items = [], active = -1, statusTimer = null;

    function setStatus(text) {
      clearTimeout(statusTimer);
      statusTimer = setTimeout(function () { announce(status, text); }, 350);
    }
    function close() {
      list.hidden = true;
      input.setAttribute("aria-expanded", "false");
      input.removeAttribute("aria-activedescendant");
      active = -1;
    }
    function setActive(i) {
      var opts_ = list.children;
      if (active > -1 && opts_[active]) { opts_[active].setAttribute("aria-selected", "false"); opts_[active].classList.remove("is-active"); }
      active = i;
      if (i > -1 && opts_[i]) {
        opts_[i].setAttribute("aria-selected", "true");
        opts_[i].classList.add("is-active");
        input.setAttribute("aria-activedescendant", opts_[i].id);
        if (opts_[i].scrollIntoView) { opts_[i].scrollIntoView({ block: "nearest" }); }
      } else {
        input.removeAttribute("aria-activedescendant");
      }
    }
    function choose(i) {
      var v = items[i];
      if (v === undefined) { return; }
      input.value = v;
      close();
      setStatus(v + " selected.");
      if (opts.onSelect) { opts.onSelect(v); }
    }
    function render() {
      var q = input.value.trim();
      list.textContent = "";
      if (q.length < min) { items = []; close(); return; }
      items = opts.source(q) || [];
      if (!items.length) { close(); setStatus("No matches."); return; }
      items.forEach(function (text, i) {
        var li = doc.createElement("li");
        li.id = list.id + "-" + i;
        li.className = "autocomplete-item";
        li.setAttribute("role", "option");
        li.setAttribute("aria-selected", "false");
        li.textContent = text;
        li.addEventListener("mousedown", function (e) { e.preventDefault(); });
        li.addEventListener("click", function () { choose(i); });
        list.appendChild(li);
      });
      active = -1;
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      setStatus(items.length + " " + noun + (items.length === 1 ? "" : "s") + " available. Use the up and down arrow keys to review, Enter to choose.");
    }

    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      var open = !list.hidden;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (!open) { render(); if (list.hidden) { return; } }
        setActive(active + 1 >= items.length ? 0 : active + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!open) { render(); if (list.hidden) { return; } }
        setActive(active - 1 < 0 ? items.length - 1 : active - 1);
      } else if (e.key === "Enter") {
        if (open && active > -1) { e.preventDefault(); choose(active); }
        else {
          close();
          if (opts.onEnter) { e.preventDefault(); opts.onEnter(input.value.trim()); }
        }
      } else if (e.key === "Escape") {
        if (open) { e.preventDefault(); e.stopPropagation(); close(); }
      } else if (e.key === "Tab") {
        close();
      }
    });
    input.addEventListener("blur", function () { setTimeout(close, 150); });
    doc.addEventListener("pointerdown", function (e) {
      if (!list.hidden && !wrap.contains(e.target)) { close(); }
    });

    return { close: close, refresh: render, input: input, list: list };
  }

  /* ---- disclosure (mobile tool panels) ---------------------------------- */
  function disclosure(btn, panel, labels) {
    labels = labels || {};
    btn.setAttribute("aria-controls", panel.id);
    function set(open, focusBtn) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      panel.classList.toggle("is-open", open);
      if (labels.open && labels.closed) {
        var l = btn.querySelector(".vebp-toggle__label") || btn;
        l.textContent = open ? labels.open : labels.closed;
      }
      if (!open && focusBtn) { btn.focus(); }
    }
    set(btn.getAttribute("aria-expanded") === "true", false);
    btn.addEventListener("click", function () { set(btn.getAttribute("aria-expanded") !== "true", false); });
    panel.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true" && btn.offsetParent !== null) {
        if (e.defaultPrevented) { return; }
        set(false, true);
      }
    });
    return { set: set };
  }

  /* Header height for full-height visualisation layouts (set by components.js). */
  function headerHeight() {
    var h = doc.querySelector(".ebp-header");
    return h ? h.getBoundingClientRect().height : 0;
  }

  win.VEBP = {
    palette: palette,
    theme: theme,
    onThemeChange: onThemeChange,
    reducedMotion: reducedMotion,
    alpha: alpha,
    announce: announce,
    dialog: dialog,
    openDialog: openDialog,
    closeDialog: closeDialog,
    combobox: combobox,
    disclosure: disclosure,
    headerHeight: headerHeight
  };
})(window, document);
