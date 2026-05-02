let map;
let geoJsonLayer;
let currentMode = ''; // 'ar' o 'tucuman'

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

// Guardar estados en LocalStorage
let savedStates = JSON.parse(localStorage.getItem('mapVisitedData')) || {};

function initMap(mode) {
    currentMode = mode;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    if (map) map.remove();

    map = L.map('map', { zoomControl: false }).setView([-38, -63], 4);
    if (mode === 'tucuman') map.setView([-27, -65.5], 8);

    const file = mode === 'ar' ? 'ar.json' : 'departamentos-tucuman.json';

    fetch(file)
        .then(res => res.json())
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: feature => ({
                    fillColor: getColor(feature),
                    weight: 1.5,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.8
                }),
                onEachFeature: onEachFeature
            }).addTo(map);
            map.fitBounds(geoJsonLayer.getBounds());
        });
}

function getColor(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    if (status === 'visited') return '#A1887F';
    if (status === 'passed') return '#FFF176';
    return '#E0E0E0';
}

function getFeatureId(feature) {
    // Adaptar según cómo vengan las IDs en tus JSONs
    return feature.properties.name?.toLowerCase() || feature.properties.id || feature.id;
}

function onEachFeature(feature, layer) {
    const id = getFeatureId(feature);
    const dataKey = currentMode === 'ar' ? 'ar' : 'ar-tucuman';
    const info = regionData[dataKey][id] || { name: id, cap: "No disponible" };

    layer.on('click', (e) => {
        // Ciclo de estados: neutral -> visited -> passed -> neutral
        const currentStatus = savedStates[id] || 'neutral';
        let nextStatus = 'visited';
        if (currentStatus === 'visited') nextStatus = 'passed';
        else if (currentStatus === 'passed') nextStatus = 'neutral';

        savedStates[id] = nextStatus;
        localStorage.setItem('mapVisitedData', JSON.stringify(savedStates));
        geoJsonLayer.resetStyle(layer);

        // Pop-up informativo
        let popupContent = `<b>${info.name}</b><br>Capital: ${info.cap}`;
        if (info.flag) popupContent += `<br><img src="flags/${info.flag}" class="popup-flag" alt="Bandera">`;
        
        layer.bindPopup(popupContent).openPopup();
    });
}

function backToMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
}

function resetMap() {
    if(confirm("¿Seguro que quieres borrar todos tus viajes marcados?")) {
        savedStates = {};
        localStorage.removeItem('mapVisitedData');
        geoJsonLayer.eachLayer(layer => geoJsonLayer.resetStyle(layer));
    }
}

