let map;
let geoJsonLayer;
let currentMode = '';
let savedStates = JSON.parse(localStorage.getItem('mapVisitedData')) || {};

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
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    if (map) map.remove();

    // Crear el mapa sin fondo de satélite para mantener la estética limpia
    map = L.map('map', { 
        zoomControl: false,
        attributionControl: false 
    });

    // IMPORTANTE: Esto arregla el mapa que no se ve al abrir
    setTimeout(() => { map.invalidateSize(); }, 200);

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
    if (currentMode === 'ar') {
        return feature.properties.NAME_1 ? feature.properties.NAME_1.toLowerCase() : "";
    } else {
        // En tu JSON de Tucumán, el ID está en 'departamen'
        return feature.properties.departamen ? feature.properties.departamen.toString() : "";
    }
}

function styleFeature(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    let color = '#E0E0E0'; // Gris neutral
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
        
        // Refrescar el estilo del elemento cliqueado
        geoJsonLayer.resetStyle(layer);

        let popupContent = `
            <div style="text-align:center; font-family: 'Quicksand', sans-serif;">
                <h3 style="margin:0">${info.name}</h3>
                <p><b>Cap:</b> ${info.cap}</p>
            </div>`;
        layer.bindPopup(popupContent).openPopup();
    });
}

function resetMap() {
    if(confirm("¿Seguro que quieres borrar todos los colores?")) {
        savedStates = {};
        localStorage.removeItem('mapVisitedData');
        // Esto obliga a la capa a repintarse con los colores neutros
        geoJsonLayer.eachLayer(layer => {
            geoJsonLayer.resetStyle(layer);
        });
    }
}

function backToMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
}
