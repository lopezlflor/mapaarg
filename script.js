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

let map = L.map('map', { zoomControl: false }).setView([-38.4161, -63.6167], 4);
let geojsonLayer;
let currentMode = '';

// Función auxiliar para normalizar texto (quita tildes y pone en minúscula)
function normalizeString(str) {
    if (!str) return "";
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function loadMap(mode) {
    currentMode = mode;
    document.getElementById('main-menu').style.display = 'none';
    document.getElementById('toolbar').classList.remove('hidden');

    const fileName = mode === 'argentina' ? 'ar.json' : 'departamentos-tucuman.json';

    fetch(fileName)
        .then(res => res.json())
        .then(data => {
            if (geojsonLayer) map.removeLayer(geojsonLayer);

            geojsonLayer = L.geoJSON(data, {
                style: featureStyle,
                onEachFeature: onEachFeature
            }).addTo(map);

            map.fitBounds(geojsonLayer.getBounds());
        })
        .catch(err => alert("Error al cargar el archivo JSON. Asegúrate de que los archivos estén en la misma carpeta."));
}

function featureStyle(feature) {
    let id;
    if (currentMode === 'argentina') {
        id = normalizeString(feature.properties.name);
    } else {
        // En Tucumán buscamos por el ID numérico (ej: 482)
        id = feature.properties.id || feature.properties.ID_DEPTO; 
    }

    const status = localStorage.getItem(`${currentMode}-${id}`) || 'none';
    
    let color = '#e9ecef'; // Sin visitar
    if (status === 'visited') color = '#a7c957';
    if (status === 'passed') color = '#ffdd85';

    return {
        fillColor: color,
        weight: 1.5,
        opacity: 1,
        color: 'white',
        fillOpacity: 0.8
    };
}

function onEachFeature(feature, layer) {
    layer.on('click', function (e) {
        let key;
        if (currentMode === 'argentina') {
            key = normalizeString(feature.properties.name);
        } else {
            key = feature.properties.id || feature.properties.ID_DEPTO;
        }

        const info = regionData[currentMode === 'argentina' ? 'ar' : 'ar-tucuman'][key] || 
                     { name: feature.properties.name || "Desconocido", cap: "No disponible" };

        let popupContent = `
            <div class="popup-card">
                <h3>${info.name}</h3>
                <p><b>Capital:</b> ${info.cap}</p>
                ${info.flag ? `<img src="flags/${info.flag}" style="width:100px; border-radius:5px">` : ''}
                <div style="margin-top:10px">
                    <button class="btn-status" style="background:#a7c957; color:white" onclick="setStatus('${key}', 'visited')">Visitado</button>
                    <button class="btn-status" style="background:#ffdd85" onclick="setStatus('${key}', 'passed')">De pasada</button>
                    <button class="btn-status" style="background:#e9ecef" onclick="setStatus('${key}', 'none')">Limpiar</button>
                </div>
            </div>
        `;
        layer.bindPopup(popupContent).openPopup();
    });
}

window.setStatus = function(id, status) {
    localStorage.setItem(`${currentMode}-${id}`, status);
    geojsonLayer.setStyle(featureStyle);
    map.closePopup();
};

function backToMenu() {
    document.getElementById('main-menu').style.display = 'flex';
    document.getElementById('toolbar').classList.add('hidden');
}

function resetMap() {
    if(confirm("¿Reiniciar colores de este mapa?")) {
        Object.keys(localStorage).forEach(key => {
            if(key.startsWith(currentMode)) localStorage.removeItem(key);
        });
        geojsonLayer.setStyle(featureStyle);
    }
}
