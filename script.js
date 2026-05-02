let map;
let geoJsonLayer;
let currentMode = '';

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

let savedStates = JSON.parse(localStorage.getItem('mapVisitedData')) || {};

function initMap(mode) {
    currentMode = mode;
    document.getElementById('main-menu').classList.add('hidden');
    document.getElementById('map-container').classList.remove('hidden');

    if (map) {
        map.off();
        map.remove();
    }

    // Inicializar mapa
    map = L.map('map', { zoomControl: false });
    
    const fileName = mode === 'ar' ? 'ar.json' : 'departamentos-tucuman.json';

    fetch(fileName)
        .then(response => {
            if (!response.ok) throw new Error("No se pudo cargar el JSON");
            return response.json();
        })
        .then(data => {
            geoJsonLayer = L.geoJson(data, {
                style: feature => ({
                    fillColor: getColor(feature),
                    weight: 2,
                    opacity: 1,
                    color: 'white',
                    fillOpacity: 0.7
                }),
                onEachFeature: onEachFeature
            }).addTo(map);
            map.fitBounds(geoJsonLayer.getBounds());
        })
        .catch(err => alert("Error: Asegúrate de subir los archivos JSON a GitHub. " + err));
}

function getFeatureId(feature) {
    // Para Argentina usa NAME_1, para Tucumán usa departamen
    if (currentMode === 'ar') {
        return feature.properties.NAME_1 ? feature.properties.NAME_1.toLowerCase() : "";
    } else {
        return feature.properties.departamen ? feature.properties.departamen.toString() : "";
    }
}

function getColor(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    if (status === 'visited') return '#A1887F';
    if (status === 'passed') return '#FFF176';
    return '#E0E0E0';
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

        let popupContent = `
            <div style="text-align:center">
                <h3 style="margin:0">${info.name}</h3>
                <p style="margin:5px 0"><b>Capital:</b> ${info.cap}</p>
                ${info.flag ? `<img src="flags/${info.flag}" class="popup-flag" onerror="this.style.display='none'">` : ''}
            </div>
        `;
        layer.bindPopup(popupContent).openPopup();
    });
}

function backToMenu() {
    document.getElementById('main-menu').classList.remove('hidden');
    document.getElementById('map-container').classList.add('hidden');
}

function resetMap() {
    if(confirm("¿Reiniciar colores?")) {
        savedStates = {};
        localStorage.removeItem('mapVisitedData');
        if (geoJsonLayer) geoJsonLayer.eachLayer(layer => geoJsonLayer.resetStyle(layer));
    }
}
