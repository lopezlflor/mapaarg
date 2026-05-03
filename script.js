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
    ar: {
        "buenos aires": { name: "Buenos Aires", cap: "La Plata", flag: "ar-buenosaires.png" },
        "caba": { name: "CABA", cap: "Capital Federal", flag: "ar-caba.png" },
        "catamarca": { name: "Catamarca", cap: "Catamarca", flag: "ar-catamarca.png" },
        "chaco": { name: "Chaco", cap: "Resistencia", flag: "ar-chaco.png" },
        "chubut": { name: "Chubut", cap: "Rawson", flag: "ar-chubut.png" },
        "cordoba": { name: "Córdoba", cap: "Córdoba", flag: "ar-cordoba.png" },
        "corrientes": { name: "Corrientes", cap: "Corrientes", flag: "ar-corrientes.png" },
        "entre rios": { name: "Entre Ríos", cap: "Paraná", flag: "ar-entrerios.png" },
        "formosa": { name: "Formosa", cap: "Formosa", flag: "ar-formosa.png" },
        "jujuy": { name: "Jujuy", cap: "S. S. de Jujuy", flag: "ar-jujuy.png" },
        "la pampa": { name: "La Pampa", cap: "Santa Rosa", flag: "ar-lapampa.png" },
        "la rioja": { name: "La Rioja", cap: "La Rioja", flag: "ar-larioja.png" },
        "mendoza": { name: "Mendoza", cap: "Mendoza", flag: "ar-mendoza.png" },
        "misiones": { name: "Misiones", cap: "Posadas", flag: "ar-misiones.png" },
        "neuquen": { name: "Neuquén", cap: "Neuquén", flag: "ar-neuquen.png" },
        "rio negro": { name: "Río Negro", cap: "Viedma", flag: "ar-rionegro.png" },
        "salta": { name: "Salta", cap: "Salta", flag: "ar-salta.png" },
        "san juan": { name: "San Juan", cap: "San Juan", flag: "ar-sanjuan.png" },
        "san luis": { name: "San Luis", cap: "San Luis", flag: "ar-sanluis.png" },
        "santa cruz": { name: "Santa Cruz", cap: "Río Gallegos", flag: "ar-santacruz.png" },
        "santa fe": { name: "Santa Fe", cap: "Santa Fe", flag: "ar-santafe.png" },
        "santiago del estero": { name: "Sgo. del Estero", cap: "Santiago del Estero", flag: "ar-santiago.png" },
        "tierra del fuego": { name: "Tierra del Fuego", cap: "Ushuaia", flag: "ar-tierra.png" },
        "tucuman": { name: "Tucumán", cap: "S. M. de Tucumán", flag: "ar-tucuman.png" }
    },
    "ar-tucuman": {
        "472": { name: "La Cocha", cap: "La Cocha" },
        "473": { name: "Graneros", cap: "Graneros" },
        "474": { name: "Juan Bautista Alberdi", cap: "Juan Bautista Alberdi" },
        "475": { name: "Río Chico", cap: "Aguilares" },
        "476": { name: "Chicligasta", cap: "Concepción" },
        "477": { name: "Simoca", cap: "Simoca" },
        "478": { name: "Lules", cap: "Lules" },
        "479": { name: "Monteros", cap: "Monteros" },
        "480": { name: "Leales", cap: "Bella Vista" },
        "481": { name: "Famaillá", cap: "Famaillá" },
        "482": { name: "Capital", cap: "San Miguel de Tucumán" },
        "483": { name: "Cruz Alta", cap: "Banda del Río Salí" },
        "484": { name: "Yerba Buena", cap: "Yerba Buena" },
        "485": { name: "Burruyacú", cap: "Burruyacú" },
        "486": { name: "Tafí Viejo", cap: "Tafí Viejo" },
        "487": { name: "Tafí del Valle", cap: "Tafí del Valle" },
        "490": { name: "Trancas", cap: "Trancas" }
    }
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
