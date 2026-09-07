/*!
 * Catalogue Filter UX — active-filter chips, result counter, colour swatch picker
 * For WordPress + Impreza / UpSolution (us-core) grid filters.
 *
 * Paste into: Theme Options -> Custom CSS/JS -> Custom JS
 * Companion stylesheet: catalogue-filter-ux.css
 *
 * MIT Licensed.
 */

/* ============================================================
   1) ACTIVE FILTER CHIPS
   Renders a removable chip per active facet, plus "Clear All".
   Handles BOTH radio facets and <select> dropdown facets.
   ============================================================ */
(function () {
  "use strict";

  var ALL = "%2A"; // us-core encodes the "All" option as an encoded asterisk

  /* Add or remove facets here. `cls` maps to a colour in the stylesheet. */
  var FACETS = [
    { name: "vehicle_territory", prefix: "Region", cls: "kgm-region" },
    { name: "vehicle_tech",      prefix: "Engine", cls: "kgm-engine" }
  ];

  function isAll(v) {
    if (v == null) return true;
    if (v === ALL || v === "*") return true;
    try { if (decodeURIComponent(v) === "*") return true; } catch (e) {}
    return false;
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  /**
   * Resolve a facet to its control, whichever type the theme rendered.
   * us-core renders a facet as radios or as a <select> depending on how the
   * filter element is configured, so each type is read and reset differently.
   */
  function getControl(name) {
    var form = document.querySelector("form.w-filter") || document.querySelector(".w-filter");
    if (!form) return null;

    var select = form.querySelector('select[name="' + name + '"]');
    if (select) return { kind: "select", el: select };

    var radios = [].slice.call(
      form.querySelectorAll('input[type=radio][name="' + name + '"]')
    );
    if (radios.length) return { kind: "radio", els: radios };

    return null;
  }

  /** Human-readable current value of a facet, or null when set to "All". */
  function readFacet(name) {
    var c = getControl(name);
    if (!c) return null;

    if (c.kind === "select") {
      var opt = c.el.options[c.el.selectedIndex];
      if (!opt || isAll(opt.value)) return null;
      return opt.textContent.trim();
    }

    var checked = c.els.filter(function (r) { return r.checked; })[0];
    if (!checked || isAll(checked.value)) return null;

    var label = checked.closest("label");
    var lbl = label && label.querySelector(".w-filter-item-value-label");
    if (lbl) return lbl.textContent.trim();
    try { return decodeURIComponent(checked.value); } catch (e) { return checked.value; }
  }

  /**
   * Wait for the theme's AJAX to land before touching the next facet.
   * The theme rebuilds the query string on each change, so resets run
   * one at a time.
   */
  function waitForSettle(urlBefore, done) {
    var waited = 0;
    var iv = setInterval(function () {
      waited += 100;
      if (location.href !== urlBefore || waited >= 2500) {
        clearInterval(iv);
        setTimeout(done, 250);
      }
    }, 100);
  }

  /** Reset one facet to "All", then invoke done(). */
  function clearFacet(name, done) {
    done = done || function () {};
    var c = getControl(name);
    if (!c) return done();

    var urlBefore = location.href;

    if (c.kind === "select") {
      if (isAll(c.el.value)) return done();
      c.el.value = ALL;
      c.el.dispatchEvent(new Event("change", { bubbles: true }));
    } else {
      var checked = c.els.filter(function (r) { return r.checked; })[0];
      if (checked && isAll(checked.value)) return done();

      var all = c.els.filter(function (r) { return isAll(r.value); })[0];
      if (!all) return done();

      // Clicking the <label> is the theme's own interaction path.
      var label = all.closest("label");
      if (label) label.click();
      else { all.checked = true; all.click(); }
    }

    waitForSettle(urlBefore, done);
  }

  /**
   * Reset every facet, strictly one at a time.
   * The queue holds facet names rather than element references, so it stays
   * valid while the chip bar re-renders between steps.
   */
  function clearAllFacets() {
    var queue = FACETS.map(function (f) { return f.name; });
    (function next() {
      if (!queue.length) return;
      clearFacet(queue.shift(), next);
    })();
  }

  function render() {
    var row = document.getElementById("active-filter");
    if (!row) return;

    var col = row.querySelector(".wpb_column .vc_column-inner")
           || row.querySelector(".wpb_column")
           || row.firstElementChild;
    if (!col) return;

    var active = [];
    FACETS.forEach(function (f) {
      var text = readFacet(f.name);
      if (text) active.push({ facet: f, text: text });
    });

    var wrap = col.querySelector(".kgm-af-wrap");

    if (!active.length) {
      if (wrap) wrap.remove();
      row.classList.add("kgm-af-empty");
      return;
    }

    row.classList.remove("kgm-af-empty");

    if (!wrap) {
      wrap = document.createElement("div");
      wrap.className = "kgm-af-wrap";
      col.appendChild(wrap);
    }

    var html = '<span class="kgm-af-label">Active Filters:</span>';
    active.forEach(function (a) {
      html += '<span class="kgm-af-tag ' + a.facet.cls + '">'
            +   esc(a.facet.prefix + ": " + a.text)
            +   '<span class="kgm-af-x" data-facet="' + a.facet.name
            +   '" title="Remove">&#10005;</span>'
            + '</span>';
    });
    html += '<button type="button" class="kgm-af-clear">Clear All</button>';
    wrap.innerHTML = html;

    wrap.querySelectorAll(".kgm-af-x").forEach(function (x) {
      x.addEventListener("click", function (ev) {
        ev.preventDefault();
        ev.stopPropagation();
        clearFacet(x.getAttribute("data-facet"));
      });
    });

    wrap.querySelector(".kgm-af-clear").addEventListener("click", function (ev) {
      ev.preventDefault();
      clearAllFacets();
    });
  }

  var timer;
  function scheduleRender() {
    clearTimeout(timer);
    timer = setTimeout(render, 120);
  }

  function init() {
    render();

    var form = document.querySelector("form.w-filter") || document.querySelector(".w-filter");
    if (!form) return; // no filter on this page

    form.addEventListener("change", scheduleRender);

    new MutationObserver(scheduleRender).observe(form, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["checked", "selected", "class"]
    });

    window.addEventListener("popstate", scheduleRender);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init);
})();


/* ============================================================
   2) RESULT COUNTER  —  "Showing X of Y available models"
   Requires the markup in snippets/catalogue-counter.html
   ============================================================ */
(function () {
  "use strict";

  function init() {
    var module = document.getElementById("catalogue-counter");
    var grid = document.querySelector(".us_post_list");
    if (!module || !grid) return false;

    var shownEl = document.getElementById("catalogue-count-shown");
    var totalEl = document.getElementById("catalogue-count-total");
    if (!shownEl || !totalEl) return false;

    function countVisible() {
      return [].slice.call(grid.querySelectorAll(".w-grid-item"))
        .filter(function (c) { return /\bpost-\d+/.test(c.className); })
        .filter(function (it) {
          var s = getComputedStyle(it);
          return it.offsetParent !== null && s.display !== "none" && s.visibility !== "hidden";
        }).length;
    }

    function update() {
      var shown = countVisible();
      var total = parseInt(grid.getAttribute("data-total-models") || "0", 10);
      if (shown > total) {
        total = shown;
        grid.setAttribute("data-total-models", String(total));
      }
      shownEl.textContent = shown;
      totalEl.textContent = total;
    }

    update();

    // The theme mutates this node in place on filter, so the observer survives.
    new MutationObserver(update).observe(grid, {
      childList: true, subtree: true,
      attributes: true, attributeFilter: ["style", "class"]
    });
    return true;
  }

  var tries = 0;
  var iv = setInterval(function () {
    tries++;
    if (init() || tries > 60) clearInterval(iv);
  }, 250);
})();


/* ============================================================
   3) COLOUR SWATCH PICKER  (single product/vehicle pages)
   Clicking a swatch activates the matching tab and prints its name.
   Runs only on pages that have a swatch group.
   ============================================================ */
(function () {
  "use strict";

  function init() {
    var tabWrapper    = document.getElementById("tab-vehicle");
    var colourWrapper = document.getElementById("wrapper_colours");

    // Only run where the swatch markup exists.
    if (!tabWrapper || !colourWrapper) return;

    var boxes            = tabWrapper.getElementsByClassName("w-tabs-section");
    var tabs_title       = tabWrapper.getElementsByClassName("w-tabs-item-title");
    var output_container = document.getElementById("vehicle-colour-name");

    for (var b = 0; b < boxes.length; b++) {
      boxes[b].classList.add("tabs-section-vehicle");
    }

    var tabs_section    = document.querySelectorAll(".w-tabs-section.tabs-section-vehicle");
    var wrapper_buttons = colourWrapper.querySelectorAll("a");
    var wrapper_img     = colourWrapper.querySelectorAll(".w-image");

    for (let i = 0; i < wrapper_buttons.length; i++) {
      wrapper_buttons[i].addEventListener("click", function (e) {
        e.preventDefault();
        if (!tabs_section[i]) return;

        var colour_title = tabs_title[i] ? tabs_title[i].textContent.trim() : "";

        var tabButton = document.querySelector("#" + tabs_section[i].id + " button");
        if (tabButton) tabButton.click();

        for (let n = 0; n < wrapper_img.length; n++) {
          wrapper_img[n].classList.remove("active");
        }
        if (wrapper_img[i]) wrapper_img[i].classList.add("active");

        // Optional label element.
        if (output_container) output_container.textContent = colour_title;
      });
    }
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
