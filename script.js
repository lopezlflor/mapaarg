let map = null;
let geoJsonLayer = null;
let currentMode = "";
let selectedLayer = null;
let selectedId = "";

const regionData = {
    ar: {
        "buenos aires": { name: "Buenos Aires", cap: "La Plata", flag: "ar-buenosaires.png", cities: ["La Plata", "Mar del Plata", "Tandil", "Bahía Blanca", "Tigre"] },
        "caba": { name: "CABA", cap: "Capital Federal", flag: "ar-caba.png", cities: ["Palermo", "Recoleta", "San Telmo", "Puerto Madero"] },
        "catamarca": { name: "Catamarca", cap: "Catamarca", flag: "ar-catamarca.png", cities: ["SFV de Catamarca", "Belén", "Antofagasta"] },
        "cordoba": { name: "Córdoba", cap: "Córdoba", flag: "ar-cordoba.png", cities: ["Córdoba Capital", "Villa Carlos Paz", "Villa General Belgrano", "La Cumbrecita"] },
        "mendoza": { name: "Mendoza", cap: "Mendoza", flag: "ar-mendoza.png", cities: ["Mendoza Capital", "San Rafael", "Luján de Cuyo", "Uspallata"] },
        "salta": { name: "Salta", cap: "Salta", flag: "ar-salta.png", cities: ["Salta Capital", "Cafayate", "Cachi", "Iruya"] },
        "jujuy": { name: "Jujuy", cap: "S. S. de Jujuy", flag: "ar-jujuy.png", cities: ["Purmamarca", "Tilcara", "Humahuaca", "S.S. de Jujuy"] },
        "tucuman": { name: "Tucumán", cap: "S. M. de Tucumán", flag: "ar-tucuman.png", cities: ["San Miguel", "Tafí del Valle", "Yerba Buena", "San Javier"] }
        // Puedes seguir agregando ciudades a las demás provincias aquí...
    },
    "ar-tucuman": {
        "482": { name: "Capital", cities: ["San Miguel", "Barrio Norte", "Barrio Sur"] },
        "487": { name: "Tafí del Valle", cities: ["Tafí del Valle", "El Mollar", "Amaicha"] },
        "484": { name: "Yerba Buena", cities: ["Yerba Buena", "San Pablo"] }
        // Los IDs de los departamentos de Tucumán...
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
    setTimeout(() => { map.invalidateSize(); }, 400);

    const fileName = mode === 'ar' ? 'ar.json' : 'departamentos-tucuman.json';
    fetch(fileName).then(res => res.json()).then(data => {
        geoJsonLayer = L.geoJson(data, {
            style: styleFeature,
            onEachFeature: onEachFeature
        }).addTo(map);
        map.fitBounds(geoJsonLayer.getBounds());
    });
}

function getFeatureId(feature) {
    if (currentMode === 'ar') return normalizeText(feature.properties.NAME_1 || "");
    return feature.properties.departamen ? feature.properties.departamen.toString() : "";
}

function styleFeature(feature) {
    const id = getFeatureId(feature);
    const status = savedStates[id] || 'neutral';
    const colors = { visited: '#A1887F', passed: '#FFF176', neutral: '#E0E0E0' };
    return { fillColor: colors[status], weight: 1.5, opacity: 1, color: 'white', fillOpacity: 0.8 };
}

function onEachFeature(feature, layer) {
    layer.on('click', (e) => {
        selectedLayer = layer;
        selectedId = getFeatureId(feature);
        const dataKey = currentMode === 'ar' ? 'ar' : 'ar-tucuman';
        const info = regionData[dataKey][selectedId] || { name: selectedId, cities: ["General"] };

        document.getElementById("popupName").textContent = info.name;
        
        // Cargar Selector de Ciudades
        const citySelect = document.getElementById("citySelect");
        citySelect.innerHTML = "";
        info.cities.forEach(city => {
            const opt = document.createElement("option");
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });

        const flagEl = document.getElementById("popupFlag");
        if (info.flag) { flagEl.src = `flags/${info.flag}`; flagEl.style.display = "block"; }
        else { flagEl.style.display = "none"; }

        displayPhotos();
        document.getElementById("popup").classList.remove("hidden");
        L.DomEvent.stopPropagation(e);
    });
}

function handleFiles(files) {
    const city = document.getElementById("citySelect").value;
    for (let file of files) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const key = `photos_${selectedId}`;
            let allPhotos = JSON.parse(localStorage.getItem(key)) || {}; // Estructura: { "Ciudad": [fotos...] }
            if (!allPhotos[city]) allPhotos[city] = [];
            allPhotos[city].push(e.target.result);
            localStorage.setItem(key, JSON.stringify(allPhotos));
            displayPhotos();
        };
        reader.readAsDataURL(file);
    }
}

function displayPhotos() {
    const gallery = document.getElementById("photoGallery");
    gallery.innerHTML = "";
    const allPhotos = JSON.parse(localStorage.getItem(`photos_${selectedId}`)) || {};
    
    if (Object.keys(allPhotos).length === 0) {
        gallery.innerHTML = "<p style='font-size:0.7rem; text-align:center;'>No hay fotos aún.</p>";
        return;
    }

    for (const city in allPhotos) {
        const group = document.createElement("div");
        group.innerHTML = `<div class="city-group-title">📍 ${city}</div>`;
        const grid = document.createElement("div");
        grid.className = "photo-grid";
        
        allPhotos[city].forEach(src => {
            const img = document.createElement("img");
            img.src = src;
            grid.appendChild(img);
        });
        
        group.appendChild(grid);
        gallery.appendChild(group);
    }
}

function setStatus(status) {
    savedStates[selectedId] = status;
    localStorage.setItem('travelData', JSON.stringify(savedStates));
    geoJsonLayer.resetStyle(selectedLayer);
    closePopup();
}

function closePopup() { document.getElementById("popup").classList.add("hidden"); }
function goHome() { document.getElementById('mapScreen').classList.remove('active'); document.getElementById('mainMenu').classList.add('active'); }
function resetMap() { if(confirm("¿Borrar todo?")) { localStorage.clear(); location.reload(); } }
