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

const modal = document.getElementById("modal");
const spanClose = document.getElementsByClassName("close")[0];

// Cerrar modal
spanClose.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; }

// Función para manejar el clic en una región
function setupMapInteractions() {
    const allPaths = document.querySelectorAll('path');

    allPaths.forEach(path => {
        path.addEventListener('click', function() {
            const id = this.id.toLowerCase();
            const parentId = this.closest('.svg-map').id;
            
            // Lógica de 3 estados
            if (!this.classList.contains('is-passing') && !this.classList.contains('is-visited')) {
                this.classList.add('is-passing');
            } else if (this.classList.contains('is-passing')) {
                this.classList.remove('is-passing');
                this.classList.add('is-visited');
            } else {
                this.classList.remove('is-visited');
            }

            // Mostrar Info en Pop-up
            showInfo(id, parentId, this.classList);
        });
    });
}

function showInfo(id, mapType, classList) {
    const dataSet = mapType === 'map-argentina' ? regionData.ar : regionData['ar-tucuman'];
    const info = dataSet[id];

    if (info) {
        document.getElementById("region-name").innerText = info.name;
        document.getElementById("region-cap").innerText = info.cap;
        
        let status = "Sin visitar";
        if (classList.contains('is-passing')) status = "De paso";
        if (classList.contains('is-visited')) status = "Visitado";
        document.getElementById("region-status").innerText = status;

        const flagContainer = document.getElementById("region-flag-container");
        flagContainer.innerHTML = info.flag ? `<img src="flags/${info.flag}" alt="Bandera">` : "";

        modal.style.display = "block";
    }
}

// Ejecutar cuando el SVG esté cargado
window.onload = setupMapInteractions;
