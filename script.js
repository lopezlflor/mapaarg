let map = null;
let geoJsonLayer = null;
let currentMode = "";
let selectedLayer = null;
let selectedId = "";

const regionData = {
    ar: {
        "buenos aires": { name: "Buenos Aires", cap: "La Plata" },
        "caba": { name: "CABA", cap: "Capital Federal" },
        "catamarca": { name: "Catamarca", cap: "San Fernando del Valle" },
        "chaco": { name: "Chaco", cap: "Resistencia" },
        "chubut": { name: "Chubut", cap: "Rawson" },
        "cordoba": { name: "Córdoba", cap: "Córdoba" },
        "corrientes": { name: "Corrientes", cap: "Corrientes" },
        "entre rios": { name: "Entre Ríos", cap: "Paraná" },
        "formosa": { name: "Formosa", cap: "Formosa" },
        "jujuy": { name: "Jujuy", cap: "S. S. de Jujuy" },
        "la pampa": { name: "La Pampa", cap: "Santa Rosa" },
        "la rioja": { name: "La Rioja", cap: "La Rioja" },
        "mendoza": { name: "Mendoza", cap: "Mendoza" },
        "misiones": { name: "Misiones", cap: "Posadas" },
        "neuquen": { name: "Neuquén", cap: "Neuquén" },
        "rio negro": { name: "Río Negro", cap: "Viedma" },
        "salta": { name: "Salta", cap: "Salta" },
        "san juan": { name: "San Juan", cap: "San Juan" },
        "san luis": { name: "San Luis", cap: "San Luis" },
        "santa cruz": { name: "Santa Cruz", cap: "Río Gallegos" },
        "santa fe": { name: "Santa Fe", cap: "Santa Fe" },
        "santiago del estero": { name: "Santiago del Estero", cap: "Santiago del Estero" },
        "tierra del fuego": { name: "Tierra del Fuego", cap: "Ushuaia" },
        "tucuman": { name: "Tucumán", cap: "S. M. de Tucumán" }
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

let savedStates = JSON.parse(localStorage.getItem('travelData')) || {};

function normalizeText(text) {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function initMap(mode) {
    currentMode = mode;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('mapScreen').classList.add('active');

    if (map) map.remove();
    map = L.map('map', { zoomControl: false, attributionControl: false });

    setTimeout(() => { map.invalidateSize(); }, 500);

    const fileName = mode === 'ar' ? 'ar.json' : 'departamentos-tucuman.json';

    fetch(fileName)
        .then(res => res.json())
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: styleFeature,
                onEachFeature: onEachFeature
            }).addTo(map);
            map.fitBounds(geoJsonLayer.getBounds());
        });
}

function getFeatureId(feature) {
    if (!feature.properties) return "";
    if (currentMode === 'ar') {
        // MUY IMPORTANTE: Tu ar.json usa NAME_1 para las provincias
        return normalizeText(feature.properties.NAME_1 || "");
    } else {
        // Tu departamentos-tucuman.json usa departamen (código numérico)
        return feature.properties.departamen ? feature.properties.departamen.toString() : "";
    }
}

function styleFeature(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    
    let color = '#E0E0E0';
    if (status === 'visited') color = '#A1887F';
    if (status === 'passed') color = '#FFF176';

    return {
        fillColor: color,
        weight: 1.5,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.8
    };
}

function onEachFeature(feature, layer) {
    layer.on('click', (e) => {
        selectedLayer = layer;
        selectedId = getFeatureId(feature);
        
        const dataKey = currentMode === 'ar' ? 'ar' : 'ar-tucuman';
        const info = regionData[dataKey][selectedId];

        if (info) {
            document.getElementById("popupName").textContent = info.name;
            document.getElementById("popupCap").textContent = info.cap;
        } else {
            // Si no encuentra la info, mostramos lo que viene en el JSON para depurar
            document.getElementById("popupName").textContent = feature.properties.NAME_1 || selectedId;
            document.getElementById("popupCap").textContent = "Sin datos";
        }

        document.getElementById("popup").classList.remove("hidden");
        L.DomEvent.stopPropagation(e);
    });
}

// ESTA ES LA FUNCIÓN QUE CAMBIA EL COLOR
function setStatus(status) {
    if (!selectedId || !selectedLayer) return;

    // 1. Guardamos el estado
    savedStates[selectedId] = status;
    localStorage.setItem('travelData', JSON.stringify(savedStates));

    // 2. FORZAMOS el cambio de estilo en la capa seleccionada
    geoJsonLayer.resetStyle(selectedLayer); 
    
    // 3. Cerramos el popup
    closePopup();
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

function goHome() {
    document.getElementById('mapScreen').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
}

function resetMap() {
    if(confirm("¿Borrar todo el progreso?")) {
        savedStates = {};
        localStorage.removeItem('travelData');
        geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
    }
}
