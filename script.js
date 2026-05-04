let map = null;
let geoJsonLayer = null;
let currentMode = "";
let selectedLayer = null;
let selectedId = "";

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
    "ar-tucuman": { }
};

let savedStates = JSON.parse(localStorage.getItem('travelData')) || {};
let photoData = JSON.parse(localStorage.getItem('photoData')) || {};

function normalizeText(text) {
    if (!text) return "";
    return text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();
}

function getFeatureId(feature) {
    if (!feature.properties) return "";

    if (currentMode === 'ar') {
        return normalizeText(feature.properties.name);
    } else {
        return (
            feature.properties.departamen ||
            feature.properties.id ||
            feature.properties.ID ||
            ""
        ).toString();
    }
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

    return {
        fillColor: color,
        weight: 1.5,
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

            const flagEl = document.getElementById("popupFlag");
            flagEl.src = "flags/" + info.flag;
            flagEl.style.display = "block";
        } else {
            document.getElementById("popupName").textContent = feature.properties.name || selectedId;
            document.getElementById("popupCap").textContent = "Sin datos";
            document.getElementById("popupFlag").style.display = "none";
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
    closePopup();
}

function savePhoto() {
    const file = document.getElementById("photoInput").files[0];
    const city = document.getElementById("photoCity").value;
    const date = document.getElementById("photoDate").value;

    if (!file || !city || !date || !selectedId) {
        alert("Completá todos los campos");
        return;
    }

    const reader = new FileReader();

    reader.onload = function(e) {
        if (!photoData[selectedId]) {
            photoData[selectedId] = [];
        }

        photoData[selectedId].push({
            city,
            date,
            img: e.target.result
        });

        localStorage.setItem("photoData", JSON.stringify(photoData));

        renderGallery();
    };

    reader.readAsDataURL(file);
}

function renderGallery() {
    const container = document.getElementById("photoGallery");
    container.innerHTML = "";

    const photos = photoData[selectedId] || [];

    const grouped = {};

    photos.forEach(p => {
        const key = p.date + " - " + p.city;
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(p);
    });

    for (let group in grouped) {
        const title = document.createElement("h4");
        title.textContent = group;
        container.appendChild(title);

        grouped[group].forEach(p => {
            const img = document.createElement("img");
            img.src = p.img;
            img.style.width = "80px";
            img.style.margin = "5px";
            container.appendChild(img);
        });
    }
}

function closePopup() {
    document.getElementById("popup").classList.add("hidden");
}

function goHome() {
    document.getElementById('mapScreen').classList.remove('active');
    document.getElementById('mainMenu').classList.add('active');
}

function resetMap() {
    if (confirm("¿Borrar todo el progreso?")) {
        savedStates = {};
        photoData = {};
        localStorage.clear();

        geoJsonLayer.setStyle(styleFeature);
    }
}
