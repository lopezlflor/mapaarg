let map;
let geoJsonLayer;
let currentMode = '';
let savedStates = JSON.parse(localStorage.getItem('mapVisitedData')) || {};

const regionData = {
    ar: {
        "buenos aires": { name: "Buenos Aires", cap: "La Plata" },
        "caba": { name: "CABA", cap: "Capital Federal" },
        "catamarca": { name: "Catamarca", cap: "Catamarca" },
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
        "santiago del estero": { name: "Sgo. del Estero", cap: "Santiago del Estero" },
        "tierra del fuego": { name: "Tierra del Fuego", cap: "Ushuaia" },
        "tucuman": { name: "Tucumán", cap: "S. M. de Tucumán" }
    },
    "ar-tucuman": {
        "472": { name: "La Cocha", cap: "La Cocha" }, "473": { name: "Graneros", cap: "Graneros" },
        "474": { name: "Juan Bautista Alberdi", cap: "Juan Bautista Alberdi" }, "475": { name: "Río Chico", cap: "Aguilares" },
        "476": { name: "Chicligasta", cap: "Concepción" }, "477": { name: "Simoca", cap: "Simoca" },
        "478": { name: "Lules", cap: "Lules" }, "479": { name: "Monteros", cap: "Monteros" },
        "480": { name: "Leales", cap: "Bella Vista" }, "481": { name: "Famaillá", cap: "Famaillá" },
        "482": { name: "Capital", cap: "San Miguel de Tucumán" }, "483": { name: "Cruz Alta", cap: "Banda del Río Salí" },
        "484": { name: "Yerba Buena", cap: "Yerba Buena" }, "485": { name: "Burruyacú", cap: "Burruyacú" },
        "486": { name: "Tafí Viejo", cap: "Tafí Viejo" }, "487": { name: "Tafí del Valle", cap: "Tafí del Valle" },
        "490": { name: "Trancas", cap: "Trancas" }
    }
};

function initMap(mode) {
    currentMode = mode;
    
    // 1. Mostrar el contenedor ANTES de inicializar Leaflet
    document.getElementById('main-menu').style.display = 'none';
    const container = document.getElementById('map-container');
    container.classList.remove('hidden');

    // 2. Si ya existía un mapa, lo destruimos
    if (map) { map.remove(); }

    // 3. Crear instancia del mapa
    map = L.map('map', { 
        zoomControl: false, 
        attributionControl: false 
    });

    // 4. FIX VISIBILIDAD: Forzar a Leaflet a recalcular el tamaño del div
    setTimeout(() => { map.invalidateSize(); }, 250);

    const file = mode === 'ar' ? 'ar.json' : 'departamentos-tucuman.json';

    fetch(file)
        .then(res => res.json())
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: styleFeature,
                onEachFeature: onEachFeature
            }).addTo(map);
            map.fitBounds(geoJsonLayer.getBounds());
        })
        .catch(err => console.error("Error al cargar el JSON:", err));
}

function getFeatureId(feature) {
    if (currentMode === 'ar') {
        return feature.properties.NAME_1 ? feature.properties.NAME_1.toLowerCase() : "";
    } else {
        return feature.properties.departamen ? feature.properties.departamen.toString() : "";
    }
}

function styleFeature(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    let color = '#E0E0E0'; // Gris (Neutral)
    if (status === 'visited') color = '#A1887F'; // Marrón
    if (status === 'passed') color = '#FFF176';  // Amarillo

    return {
        fillColor: color,
        weight: 1.5,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.8
    };
}

function onEachFeature(feature, layer) {
    const id = getFeatureId(feature);
    const dataKey = currentMode === 'ar' ? 'ar' : 'ar-tucuman';
    const info = regionData[dataKey][id] || { name: "Desconocido", cap: "-" };

    layer.on('click', () => {
        const currentStatus = savedStates[id] || 'neutral';
        let nextStatus = 'visited';
        if (currentStatus === 'visited') nextStatus = 'passed';
        else if (currentStatus === 'passed') nextStatus = 'neutral';

        savedStates[id] = nextStatus;
        localStorage.setItem('mapVisitedData', JSON.stringify(savedStates));
        
        geoJsonLayer.resetStyle(layer);

        const popupHtml = `
            <div style="text-align:center; font-family: 'Quicksand', sans-serif;">
                <h3 style="margin:0">${info.name}</h3>
                <p style="margin:5px 0"><b>Cap:</b> ${info.cap}</p>
            </div>`;
        layer.bindPopup(popupHtml).openPopup();
    });
}

function resetMap() {
    if(confirm("¿Quieres limpiar todos los colores marcados?")) {
        savedStates = {}; // Limpiamos el objeto en memoria
        localStorage.removeItem('mapVisitedData'); // Borramos storage
        
        // Actualizamos visualmente todas las capas a su estado neutral (gris)
        if (geoJsonLayer) {
            geoJsonLayer.eachLayer(l => geoJsonLayer.resetStyle(l));
        }
    }
}

function backToMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('map-container').classList.add('hidden');
}
