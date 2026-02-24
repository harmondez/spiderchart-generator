const ctx = document.getElementById('myChart').getContext('2d');

// 1. Inicializamos el gráfico con estructura limpia
let myChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: [],
        datasets: [{
            label: '',
            data: [],
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#10b981',
        }]
    },
    options: {
        responsive: true,
        scales: {
            r: {
                angleLines: { color: '#475569' },
                grid: { color: '#475569' },
                pointLabels: { color: '#f8fafc', font: { size: 14 } },
                min: 0,
                max: 10,
                ticks: { 
                    stepSize: 2,
                    backdropColor: 'transparent', 
                    color: '#94a3b8' 
                }
            }
        },
        plugins: {
            legend: { display: false } // Cuadrado de leyenda oculto por defecto
        }
    }
});

// Referencias globales
const maxScaleInput = document.getElementById('max-scale');
const titleInput = document.getElementById('chart-title-input');
const skillsContainer = document.getElementById('skills-container');
const addBtn = document.getElementById('add-skill');
const saveBtn = document.getElementById('save-chart');
const savedList = document.getElementById('saved-list');

// 2. FUNCIÓN MAESTRA DE ACTUALIZACIÓN
function actualizarGrafico() {
    const inputsLabels = document.querySelectorAll('.label-input');
    const inputsValues = document.querySelectorAll('.value-input');

    const nuevoMaximo = Number(maxScaleInput.value) || 10;
    
    // 1. Capturamos el texto y lo dividimos por saltos de línea
    const textoRaw = titleInput.value;
    const lineasTitulo = textoRaw.split('\n'); // Crea un array: ["Línea 1", "Línea 2"]

    const etiquetas = Array.from(inputsLabels).map(input => input.value || "Habilidad");
    const valores = Array.from(inputsValues).map(input => {
        let val = Number(input.value);
        return val > nuevoMaximo ? nuevoMaximo : val;
    });

    myChart.data.labels = etiquetas;
    myChart.data.datasets[0].data = valores;
    myChart.options.scales.r.max = nuevoMaximo; 

    // 2. CONFIGURAMOS EL TÍTULO MULTILÍNEA
    myChart.options.plugins = {
        legend: { display: false },
        title: {
            display: textoRaw.trim() !== "", 
            text: lineasTitulo, // <--- Chart.js dibuja una línea por cada elemento del array
            color: '#f8fafc',
            font: {
                size: 20,
                weight: 'bold',
                family: "'Segoe UI', sans-serif"
            },
            padding: {
                top: 10,
                bottom: 20
            }
        }
    };
    
    myChart.update();
}

// 3. SISTEMA DE PERSONALIZACIÓN (COLORES Y FORMAS)
const paletas = {
    emerald: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', point: '#10b981' },
    ocean:   { bg: 'rgba(59, 130, 246, 0.3)', border: '#3b82f6', point: '#3b82f6' },
    sunset:  { bg: 'rgba(249, 115, 22, 0.3)', border: '#f97316', point: '#f97316' },
    neon:    { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', point: '#fb7185' },
    slate:   { bg: 'rgba(148, 163, 184, 0.2)', border: '#94a3b8', point: '#475569' },
    volcano: { bg: 'rgba(239, 68, 68, 0.3)', border: '#b91c1c', point: '#f87171' },
    royal:   { bg: 'rgba(139, 92, 246, 0.3)', border: '#8b5cf6', point: '#ddd6fe' },
    forest:  { bg: 'rgba(34, 197, 94, 0.15)', border: '#14532d', point: '#15803d' },
    gold:    { bg: 'rgba(234, 179, 8, 0.2)', border: '#ca8a04', point: '#fef08a' },
    ghost:   { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.6)', point: '#fff' }
};

const formas = {
    normal: { dash: [], radius: 5, width: 3 },
    bolas:  { dash: [], radius: 10, width: 3 },
    rayas:  { dash: [5, 5], radius: 5, width: 2 }
};

window.aplicarColor = function(nombreColor) {
    const p = paletas[nombreColor];
    const ds = myChart.data.datasets[0];
    ds.backgroundColor = p.bg;
    ds.borderColor = p.border;
    ds.pointBackgroundColor = p.point;
    myChart.update();
};

window.aplicarEstilo = function(nombreEstilo) {
    const f = formas[nombreEstilo];
    const ds = myChart.data.datasets[0];
    ds.borderDash = f.dash;
    ds.pointRadius = f.radius;
    ds.pointHoverRadius = f.radius + 3;
    ds.borderWidth = f.width;
    myChart.update();
};

// 4. FUNCIONALIDAD DE GUARDADO Y CARGA (CON MEMORIA DE ESTILO)
saveBtn.addEventListener('click', () => {
    const nombre = prompt("Dale un nombre a tu gráfico:", "Mi Perfil Técnico");
    if (!nombre) return;

    const ds = myChart.data.datasets[0]; 
    const chartData = {
        nombre: nombre,
        tituloGrafico: titleInput.value,
        labels: Array.from(document.querySelectorAll('.label-input')).map(i => i.value),
        values: Array.from(document.querySelectorAll('.value-input')).map(i => i.value),
        max: maxScaleInput.value,
        estilo: {
            bg: ds.backgroundColor,
            border: ds.borderColor,
            point: ds.pointBackgroundColor,
            dash: ds.borderDash,
            radius: ds.pointRadius,
            width: ds.borderWidth
        },
        fecha: new Date().toLocaleDateString()
    };

    let historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    historico.push(chartData);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    renderizarLista();
});

window.cargarChart = function(index) {
    const historico = JSON.parse(localStorage.getItem('misCharts'));
    const item = historico[index];

    titleInput.value = item.tituloGrafico || "";
    maxScaleInput.value = item.max;

    if (item.estilo) {
        const ds = myChart.data.datasets[0];
        ds.backgroundColor = item.estilo.bg;
        ds.borderColor = item.estilo.border;
        ds.pointBackgroundColor = item.estilo.point;
        ds.borderDash = item.estilo.dash || [];
        ds.pointRadius = item.estilo.radius || 5;
        ds.borderWidth = item.estilo.width || 3;
    }

    skillsContainer.innerHTML = '';
    item.labels.forEach((label, i) => {
        crearFilaSkill(label, item.values[i], item.max);
    });
    actualizarGrafico();
};

function renderizarLista() {
    const historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    savedList.innerHTML = '';
    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.style = "background: #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; color: white;";
        div.innerHTML = `
            <div><strong>${item.nombre}</strong><br><small style="color: #94a3b8">${item.fecha}</small></div>
            <div>
                <button onclick="cargarChart(${index})" style="background: #10b981; color: white; border: none; padding: 5px 10px; cursor: pointer;">Cargar</button>
                <button onclick="borrarGuardado(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; cursor: pointer;">X</button>
            </div>`;
        savedList.appendChild(div);
    });
}

window.borrarGuardado = function(index) {
    let historico = JSON.parse(localStorage.getItem('misCharts'));
    historico.splice(index, 1);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    renderizarLista();
};

// 5. CONTROL DE INPUTS Y EVENTOS
function crearFilaSkill(label = "", value = 0, max = 10) {
    const newGroup = document.createElement('div');
    newGroup.className = 'input-group';
    newGroup.innerHTML = `
        <input type="text" class="label-input" placeholder="Habilidad" value="${label}">
        <input type="number" class="value-input" value="${value}" min="0" max="${max}">
        <button class="btn-remove" onclick="eliminarFila(this)">-</button>
    `;
    skillsContainer.appendChild(newGroup);
}

window.eliminarFila = function(boton) {
    boton.parentElement.remove();
    actualizarGrafico();
};

addBtn.addEventListener('click', () => {
    crearFilaSkill("", 0, maxScaleInput.value);
    actualizarGrafico();
});

// Listeners de reactividad
titleInput.addEventListener('input', actualizarGrafico);
maxScaleInput.addEventListener('input', actualizarGrafico);
skillsContainer.addEventListener('input', actualizarGrafico);

// Modal
const themeModal = document.getElementById('theme-modal');
document.getElementById('open-themes').addEventListener('click', () => themeModal.style.display = 'block');
window.cerrarTemas = () => themeModal.style.display = 'none';

// Descarga
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'spider-chart.png';
    link.href = document.getElementById('myChart').toDataURL('image/png', 1.0);
    link.click();
});

// Inicio
renderizarLista();
actualizarGrafico();