let map = null;
let geoJsonLayer = null;
let currentMode = "";
let selectedLayer = null;
let selectedId = "";

const regionData = {
    ar: {
        "buenos aires": { name: "Buenos Aires", cap: "La Plata", flag: "ar-buenosaires.png" },
        "caba": { name: "CABA", cap: "Capital Federal", flag: "ar-caba.png" },
        "catamarca": { name: "Catamarca", cap: "San Fernando del Valle", flag: "ar-catamarca.png" },
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
    "tucuman": { // Cambiado para coincidir con el botón
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
let photoData = JSON.parse(localStorage.getItem('photoData')) || {};

function normalizeText(text) {
    if (!text) return "";
    return text.toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function getFeatureId(feature) {
    if (!feature.properties) return "";
    if (currentMode === 'ar') return normalizeText(feature.properties.name);
    return (feature.properties.departamen || feature.properties.id || feature.properties.ID || "").toString();
}

function initMap(mode) {
    currentMode = mode;
    document.getElementById('mainMenu').classList.remove('active');
    document.getElementById('mapScreen').classList.add('active');

    if (map) map.remove();
    map = L.map('map', { zoomControl: false, attributionControl: false });
    setTimeout(() => map.invalidateSize(), 400);

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

function styleFeature(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    let color = '#E0E0E0';
    if (status === 'visited') color = '#A1887F';
    if (status === 'passed') color = '#FFF176';
    return { fillColor: color, weight: 1.5, color: 'white', fillOpacity: 0.8 };
}

function onEachFeature(feature, layer) {
    layer.on('click', (e) => {
        selectedLayer = layer;
        selectedId = getFeatureId(feature);
        const info = regionData[currentMode][selectedId];

        document.getElementById("popupName").textContent = info ? info.name : (feature.properties.name || selectedId);
        document.getElementById("popupCap").textContent = info ? info.cap : "Sin datos";
        
        const flagEl = document.getElementById("popupFlag");
        if (info && info.flag) {
            flagEl.src = "flags/" + info.flag;
            flagEl.style.display = "inline-block";
        } else {
            flagEl.style.display = "none";
        }

        renderGallery();
        document.getElementById("popup").classList.remove("hidden");
        L.DomEvent.stopPropagation(e);
    });
}

function setStatus(status) {
    if (!selectedId) return;
    savedStates[selectedId] = status;
    localStorage.setItem('travelData', JSON.stringify(savedStates));
    geoJsonLayer.setStyle(styleFeature);
}

function savePhoto() {
    const file = document.getElementById("photoInput").files[0];
    const city = document.getElementById("photoCity").value;
    const date = document.getElementById("photoDate").value;

    if (!file || !selectedId) return alert("Selecciona una foto");

    const reader = new FileReader();
    reader.onload = function(e) {
        if (!photoData[selectedId]) photoData[selectedId] = [];
        photoData[selectedId].push({ city, date, img: e.target.result });
        localStorage.setItem("photoData", JSON.stringify(photoData));
        renderGallery();
        // Limpiar inputs
        document.getElementById("photoInput").value = "";
        document.getElementById("photoCity").value = "";
    };
    reader.readAsDataURL(file);
}

function renderGallery() {
    const container = document.getElementById("photoGallery");
    container.innerHTML = "";
    const photos = photoData[selectedId] || [];
    photos.forEach(p => {
        const div = document.createElement("div");
        div.className = "gallery-item";
        div.innerHTML = `<img src="${p.img}" title="${p.city} - ${p.date}">`;
        container.appendChild(div);
    });
}

function closePopup() { document.getElementById("popup").classList.add("hidden"); }
function goHome() { 
    document.getElementById('mapScreen').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
}
function resetMap() {
    if (confirm("¿Reiniciar todo?")) {
        localStorage.clear();
        savedStates = {};
        photoData = {};
        if (geoJsonLayer) geoJsonLayer.setStyle(styleFeature);
    }
}
