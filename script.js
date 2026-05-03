let map = null;
let currentMap = "";
let selectedRegion = "";

const mapFiles = {
  ar: "data/ar.json",
  "ar-tucuman": "data/departamentos-tucuman.json"
};

const statusColors = {
  visitado: "#b38b59",
  pasada: "#f4d03f",
  sinvisitar: "#bfc0c0"
};

const regionData = {
  // MANTENÉ TU regionData AQUÍ
};

function normalizeCode(code) {
  return String(code).trim().toLowerCase();
}

/* =========================
   CONVERTIR GEOJSON
========================= */
function convertGeoJSONToJSVectorMap(geojson) {
  if (!geojson.features) {
    throw new Error("El archivo no es GeoJSON válido.");
  }

  const paths = {};

  geojson.features.forEach((feature, index) => {
    const code =
      normalizeCode(
        feature.properties?.name ||
        feature.properties?.id ||
        feature.id ||
        index
      );

    paths[code] = {
      name: code,
      path: "M0,0" 
    };
  });

  return {
    width: 1000,
    height: 600,
    paths
  };
}

/* =========================
   CARGAR MAPA
========================= */
async function registerMapFromJSON(mapName, filePath) {
  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`No se encontró ${filePath}`);
  }

  const rawData = await response.json();

  let finalMapData;

  if (rawData.paths) {
    finalMapData = rawData;
  } else if (rawData.features) {
    finalMapData = convertGeoJSONToJSVectorMap(rawData);
  } else {
    throw new Error("Formato JSON no compatible.");
  }

  if (!jsVectorMap.maps[mapName]) {
    jsVectorMap.addMap(mapName, finalMapData);
  }
}

/* =========================
   MOSTRAR MAPA
========================= */
async function loadMap(mapCode) {
  currentMap = mapCode;

  document.getElementById("mainMenu").classList.remove("active");
  document.getElementById("mapScreen").classList.add("active");

  if (map) {
    map.destroy();
    map = null;
  }

  try {
    await registerMapFromJSON(mapCode, mapFiles[mapCode]);

    map = new jsVectorMap({
      selector: "#map",
      map: mapCode,
      zoomButtons: true,
      regionStyle: {
        initial: {
          fill: statusColors.sinvisitar,
          stroke: "#ffffff",
          strokeWidth: 1
        }
      },
      onRegionClick(event, code) {
        selectedRegion = normalizeCode(code);

        const data = regionData[currentMap]?.[selectedRegion];

        if (!data) {
          alert("No hay datos para esta región.");
          return;
        }

        document.getElementById("popupName").textContent = data.name;
        document.getElementById("popupCap").textContent = data.cap;
        document.getElementById("popupFlag").src = data.flag || "";
        document.getElementById("popup").classList.remove("hidden");
      }
    });

    restoreSavedColors();

  } catch (error) {
    console.error(error);
    alert(error.message);
  }
}

/* =========================
   ESTADOS
========================= */
function setStatus(status) {
  if (!selectedRegion || !map) return;

  map.setRegionStyle(selectedRegion, {
    fill: statusColors[status]
  });

  let saved = JSON.parse(localStorage.getItem(currentMap)) || {};
  saved[selectedRegion] = status;

  localStorage.setItem(currentMap, JSON.stringify(saved));

  closePopup();
}

function restoreSavedColors() {
  let saved = JSON.parse(localStorage.getItem(currentMap)) || {};

  Object.keys(saved).forEach(region => {
    map.setRegionStyle(region, {
      fill: statusColors[saved[region]]
    });
  });
}

function resetMap() {
  localStorage.removeItem(currentMap);
  loadMap(currentMap);
}

/* =========================
   UI
========================= */
function goHome() {
  if (map) {
    map.destroy();
    map = null;
  }

  document.getElementById("mapScreen").classList.remove("active");
  document.getElementById("mainMenu").classList.add("active");
}

function closePopup() {
  document.getElementById("popup").classList.add("hidden");
}
