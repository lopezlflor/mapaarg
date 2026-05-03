let map = null;
let currentMap = "";
let selectedRegion = "";

/* =========================
   ARCHIVOS JSON
========================= */
const mapFiles = {
  ar: "data/ar.json",
  "ar-tucuman": "data/departamentos-tucuman.json"
};

/* =========================
   DATOS DE REGIONES
========================= */
const regionData = {
  ar: {
    "buenos aires": { name: "Buenos Aires", cap: "La Plata", flag: "flags/ar-buenosaires.png" },
    "caba": { name: "CABA", cap: "Capital Federal", flag: "flags/ar-caba.png" },
    "catamarca": { name: "Catamarca", cap: "Catamarca", flag: "flags/ar-catamarca.png" },
    "chaco": { name: "Chaco", cap: "Resistencia", flag: "flags/ar-chaco.png" },
    "chubut": { name: "Chubut", cap: "Rawson", flag: "flags/ar-chubut.png" },
    "cordoba": { name: "Córdoba", cap: "Córdoba", flag: "flags/ar-cordoba.png" },
    "corrientes": { name: "Corrientes", cap: "Corrientes", flag: "flags/ar-corrientes.png" },
    "entre rios": { name: "Entre Ríos", cap: "Paraná", flag: "flags/ar-entrerios.png" },
    "formosa": { name: "Formosa", cap: "Formosa", flag: "flags/ar-formosa.png" },
    "jujuy": { name: "Jujuy", cap: "S. S. de Jujuy", flag: "flags/ar-jujuy.png" },
    "la pampa": { name: "La Pampa", cap: "Santa Rosa", flag: "flags/ar-lapampa.png" },
    "la rioja": { name: "La Rioja", cap: "La Rioja", flag: "flags/ar-larioja.png" },
    "mendoza": { name: "Mendoza", cap: "Mendoza", flag: "flags/ar-mendoza.png" },
    "misiones": { name: "Misiones", cap: "Posadas", flag: "flags/ar-misiones.png" },
    "neuquen": { name: "Neuquén", cap: "Neuquén", flag: "flags/ar-neuquen.png" },
    "rio negro": { name: "Río Negro", cap: "Viedma", flag: "flags/ar-rionegro.png" },
    "salta": { name: "Salta", cap: "Salta", flag: "flags/ar-salta.png" },
    "san juan": { name: "San Juan", cap: "San Juan", flag: "flags/ar-sanjuan.png" },
    "san luis": { name: "San Luis", cap: "San Luis", flag: "flags/ar-sanluis.png" },
    "santa cruz": { name: "Santa Cruz", cap: "Río Gallegos", flag: "flags/ar-santacruz.png" },
    "santa fe": { name: "Santa Fe", cap: "Santa Fe", flag: "flags/ar-santafe.png" },
    "santiago del estero": { name: "Sgo. del Estero", cap: "Santiago del Estero", flag: "flags/ar-santiago.png" },
    "tierra del fuego": { name: "Tierra del Fuego", cap: "Ushuaia", flag: "flags/ar-tierra.png" },
    "tucuman": { name: "Tucumán", cap: "S. M. de Tucumán", flag: "flags/ar-tucuman.png" }
  },

  "ar-tucuman": {
    "472": { name: "La Cocha", cap: "La Cocha", flag: "flags/tucuman.png" },
    "473": { name: "Graneros", cap: "Graneros", flag: "flags/tucuman.png" },
    "474": { name: "Juan Bautista Alberdi", cap: "Juan Bautista Alberdi", flag: "flags/tucuman.png" },
    "475": { name: "Río Chico", cap: "Aguilares", flag: "flags/tucuman.png" },
    "476": { name: "Chicligasta", cap: "Concepción", flag: "flags/tucuman.png" },
    "477": { name: "Simoca", cap: "Simoca", flag: "flags/tucuman.png" },
    "478": { name: "Lules", cap: "Lules", flag: "flags/tucuman.png" },
    "479": { name: "Monteros", cap: "Monteros", flag: "flags/tucuman.png" },
    "480": { name: "Leales", cap: "Bella Vista", flag: "flags/tucuman.png" },
    "481": { name: "Famaillá", cap: "Famaillá", flag: "flags/tucuman.png" },
    "482": { name: "Capital", cap: "San Miguel de Tucumán", flag: "flags/tucuman.png" },
    "483": { name: "Cruz Alta", cap: "Banda del Río Salí", flag: "flags/tucuman.png" },
    "484": { name: "Yerba Buena", cap: "Yerba Buena", flag: "flags/tucuman.png" },
    "485": { name: "Burruyacú", cap: "Burruyacú", flag: "flags/tucuman.png" },
    "486": { name: "Tafí Viejo", cap: "Tafí Viejo", flag: "flags/tucuman.png" },
    "487": { name: "Tafí del Valle", cap: "Tafí del Valle", flag: "flags/tucuman.png" },
    "490": { name: "Trancas", cap: "Trancas", flag: "flags/tucuman.png" }
  }
};

/* =========================
   COLORES
========================= */
const statusColors = {
  visitado: "#b38b59",
  pasada: "#f4d03f",
  sinvisitar: "#bfc0c0"
};

/* =========================
   UTILIDADES
========================= */
function normalizeCode(code) {
  return String(code).trim().toLowerCase();
}

/* =========================
   CARGAR Y REGISTRAR MAPA
========================= */
async function registerMapFromJSON(mapName, filePath) {
  const response = await fetch(filePath);

  if (!response.ok) {
    throw new Error(`No se encontró el archivo: ${filePath}`);
  }

  const mapData = await response.json();

  if (!mapData.paths) {
    throw new Error(`El JSON no contiene 'paths'`);
  }

  if (!jsVectorMap.maps[mapName]) {
    jsVectorMap.addMap(mapName, mapData);
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
          alert("No hay datos para esta región: " + selectedRegion);
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
    alert("Error cargando el mapa:\n" + error.message);
  }
}

/* =========================
   ESTADO DE REGIONES
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
