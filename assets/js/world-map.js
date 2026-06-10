document.addEventListener("DOMContentLoaded", function () {
(function initWorldMapBackground() {
  const DATA_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
  const ISO_COUNTRY = { 792: "Turkey", 196: "Cyprus", 764: "Thailand" };

  const mapSvg = document.getElementById("world-map");
  const tooltipEl = document.getElementById("country-tooltip");
  if (!mapSvg || !window.d3 || !window.topojson) return;

  let resizeTimer = 0;
  let loadGen = 0;
  let features = [];
  let projection = null;
  let path = null;
  let countrySelection = null;
  let mapHiddenForTour = /#tur(-backpacking)?|#tomorrowland/.test(location.hash);
  let hoveredKey = null;
  let rafPick = 0;
  let pendingPick = null;

  document.addEventListener("gezeceyik-view", function (e) {
    mapHiddenForTour = !!(e.detail && e.detail.tour);
    clearHover();
  });

  function countryLabel(d) {
    const id = d.id != null ? Number(d.id) : NaN;
    if (ISO_COUNTRY[id]) return ISO_COUNTRY[id];
    const n = d.properties && (d.properties.name || d.properties.NAME);
    return n || "";
  }

  function countryKey(d) {
    return d && d.id != null ? String(d.id) : "";
  }

  function clearHover() {
    hoveredKey = null;
    if (countrySelection) countrySelection.classed("is-hovered", false);
    if (tooltipEl) {
      tooltipEl.classList.remove("visible");
      tooltipEl.textContent = "";
      tooltipEl.setAttribute("aria-hidden", "true");
    }
  }

  function pointerIsOverContent(clientX, clientY) {
    const el = document.elementFromPoint(clientX, clientY);
    if (!el) return false;
    return !!el.closest(".tour-card");
  }

  function featureForPoint(lonlat) {
    if (!lonlat || !path || !features.length) return null;
    let best = null;
    let bestArea = Infinity;
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      try {
        if (!d3.geoContains(f, lonlat)) continue;
      } catch (err) {
        continue;
      }
      const b = path.bounds(f);
      const area = Math.abs((b[1][0] - b[0][0]) * (b[1][1] - b[0][1]));
      if (area < bestArea) {
        bestArea = area;
        best = f;
      }
    }
    return best;
  }

  function clientToLonLat(clientX, clientY) {
    if (!projection) return null;
    const pt = mapSvg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = mapSvg.getScreenCTM();
    if (!ctm) return null;
    let svgPt;
    try {
      svgPt = pt.matrixTransform(ctm.inverse());
    } catch (err) {
      return null;
    }
    const ll = projection.invert([svgPt.x, svgPt.y]);
    if (!ll || !isFinite(ll[0]) || !isFinite(ll[1])) return null;
    return ll;
  }

  function applyHover(feature, clientX, clientY) {
    if (mapHiddenForTour || !countrySelection) return;
    const key = feature ? countryKey(feature) : "";
    if (key !== hoveredKey) {
      hoveredKey = key;
      countrySelection.classed("is-hovered", function (d) {
        return feature && countryKey(d) === key;
      });
    }
    if (feature && tooltipEl) {
      tooltipEl.textContent = countryLabel(feature) || "";
      tooltipEl.style.left = clientX + 15 + "px";
      tooltipEl.style.top = clientY + 15 + "px";
      tooltipEl.classList.add("visible");
      tooltipEl.setAttribute("aria-hidden", "false");
    } else if (tooltipEl) {
      tooltipEl.classList.remove("visible");
      tooltipEl.textContent = "";
      tooltipEl.setAttribute("aria-hidden", "true");
    }
  }

  function schedulePick(clientX, clientY) {
    pendingPick = { x: clientX, y: clientY };
    if (rafPick) return;
    rafPick = requestAnimationFrame(function () {
      rafPick = 0;
      const p = pendingPick;
      pendingPick = null;
      if (!p || mapHiddenForTour) return;
      if (pointerIsOverContent(p.x, p.y)) {
        clearHover();
        return;
      }
      const lonlat = clientToLonLat(p.x, p.y);
      const feature = lonlat ? featureForPoint(lonlat) : null;
      applyHover(feature, p.x, p.y);
    });
  }

  function onPointerMove(e) {
    if (!projection || mapHiddenForTour) return;
    const ev = e.touches && e.touches[0] ? e.touches[0] : e;
    if (!ev) return;
    schedulePick(ev.clientX, ev.clientY);
  }

  function onPointerLeave() {
    clearHover();
  }

  function updateProjectionSize(w, h) {
    if (!projection || !path || !countrySelection) return;
    projection.scale(w / 6.5).center([0, 20]).translate([w / 2, h / 2]);
    d3.select(mapSvg).attr("viewBox", "0 0 " + w + " " + h);
    countrySelection.attr("d", path);
    clearHover();
  }

  function build() {
    const myGen = ++loadGen;
    const w = window.innerWidth;
    const h = window.innerHeight;

    d3.select(mapSvg).selectAll("*").remove();
    features = [];
    countrySelection = null;

    projection = d3
      .geoMercator()
      .scale(w / 6.5)
      .center([0, 20])
      .translate([w / 2, h / 2]);
    path = d3.geoPath().projection(projection);

    const svg = d3
      .select(mapSvg)
      .attr("viewBox", "0 0 " + w + " " + h)
      .attr("preserveAspectRatio", "xMidYMid slice");

    d3.json(DATA_URL)
      .then(function (world) {
        if (myGen !== loadGen) return;
        if (!world || !world.objects || !world.objects.countries) return;

        features = topojson.feature(world, world.objects.countries).features;
        countrySelection = svg
          .selectAll("path.country")
          .data(features)
          .join("path")
          .attr("class", "country")
          .attr("data-country", function (d) {
            const v = countryLabel(d);
            return v || null;
          })
          .attr("d", path);
        clearHover();
      })
      .catch(function () {});
  }

  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        const w = window.innerWidth;
        const h = window.innerHeight;
        if (!countrySelection) {
          build();
          return;
        }
        updateProjectionSize(w, h);
      }, 160);
    },
    { passive: true }
  );

  window.addEventListener("mousemove", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onPointerMove, { passive: true });
  window.addEventListener("blur", onPointerLeave);

  build();
})();

(function initCityMarkers() {
  const flightSvg = document.getElementById("flight-path-svg");
  const originDot = document.getElementById("origin-dot");
  const destinationDot = document.getElementById("destination-dot");
  const originLabel = document.getElementById("origin-label");
  const destinationLabel = document.getElementById("destination-label");
  if (!flightSvg || !originDot || !destinationDot) return;

  let resizeTimer = 0;

  function setupCityMarkers() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    flightSvg.setAttribute("viewBox", "0 0 " + width + " " + height);
    flightSvg.setAttribute("preserveAspectRatio", "none");

    const istanbul = [28.9784, 41.0082];
    const bangkok = [100.5018, 13.7563];
    const projection = d3
      .geoMercator()
      .scale(width / 6.5)
      .center([0, 20])
      .translate([width / 2, height / 2]);

    const istanbulCoords = projection(istanbul);
    const bangkokCoords = projection(bangkok);
    if (!istanbulCoords || !bangkokCoords) return;

    originDot.setAttribute("cx", istanbulCoords[0]);
    originDot.setAttribute("cy", istanbulCoords[1]);
    destinationDot.setAttribute("cx", bangkokCoords[0]);
    destinationDot.setAttribute("cy", bangkokCoords[1]);
    if (originLabel) {
      originLabel.setAttribute("x", istanbulCoords[0] + 12);
      originLabel.setAttribute("y", istanbulCoords[1] - 8);
    }
    if (destinationLabel) {
      destinationLabel.setAttribute("x", bangkokCoords[0] + 12);
      destinationLabel.setAttribute("y", bangkokCoords[1] + 4);
    }
  }

  window.addEventListener(
    "resize",
    function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(setupCityMarkers, 160);
    },
    { passive: true }
  );

  setupCityMarkers();
})();

}); /* DOMContentLoaded: d3 map + city markers */
