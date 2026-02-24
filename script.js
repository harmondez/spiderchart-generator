const ctx = document.getElementById('myChart').getContext('2d');
let indiceProyectoActual = null; 

// 1. Inicializamos el gráfico (Igual que el tuyo)
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
            legend: { display: false }
        }
    }
});

// Referencias (Igual que el tuyo)
const maxScaleInput = document.getElementById('max-scale');
const titleInput = document.getElementById('chart-title-input');
const skillsContainer = document.getElementById('skills-container');
const addBtn = document.getElementById('add-skill');
const saveBtn = document.getElementById('save-chart');
const savedList = document.getElementById('saved-list');

// 2. FUNCIÓN MAESTRA
function actualizarGrafico() {
    const inputsLabels = document.querySelectorAll('.label-input');
    const inputsValues = document.querySelectorAll('.value-input');
    const nuevoMaximo = Number(maxScaleInput.value) || 10;
    const textoRaw = titleInput.value;
    const lineasTitulo = textoRaw.split('\n');

    const etiquetas = Array.from(inputsLabels).map(input => input.value || "Habilidad");
    const valores = Array.from(inputsValues).map(input => {
        let val = Number(input.value);
        return val > nuevoMaximo ? nuevoMaximo : val;
    });

    myChart.data.labels = etiquetas;
    myChart.data.datasets[0].data = valores;
    myChart.options.scales.r.max = nuevoMaximo; 

    myChart.options.plugins = {
        legend: { display: false },
        title: {
            display: textoRaw.trim() !== "", 
            text: lineasTitulo,
            color: '#f8fafc',
            font: { size: 20, weight: 'bold', family: "'Segoe UI', sans-serif" },
            padding: { top: 10, bottom: 20 }
        }
    };
    
    myChart.update();

    if (indiceProyectoActual !== null) {
        guardarAutomatico();
    }
}

// 3. PERSISTENCIA Y GUARDADO
function guardarAutomatico() {
    if (indiceProyectoActual === null) return;

    let historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    if (!historico[indiceProyectoActual]) return;

    const ds = myChart.data.datasets[0];

    historico[indiceProyectoActual] = {
        ...historico[indiceProyectoActual], 
        tituloGrafico: titleInput.value,
        labels: Array.from(document.querySelectorAll('.label-input')).map(i => i.value),
        values: Array.from(document.querySelectorAll('.value-input')).map(i => i.value),
        max: maxScaleInput.value,
        estilo: {
            bg: ds.backgroundColor,
            border: ds.borderColor,
            point: ds.pointBackgroundColor,
            dash: ds.borderDash || [],
            radius: ds.pointRadius || 5,
            width: ds.borderWidth || 3
        },
        fecha: new Date().toLocaleDateString()
    };

    localStorage.setItem('misCharts', JSON.stringify(historico));
}

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
    
    // ¡IMPORTANTE!: Sincronizamos el índice con el nuevo guardado
    indiceProyectoActual = historico.length - 1; 
    
    renderizarLista();
});

window.cargarChart = function(index) {
    const historico = JSON.parse(localStorage.getItem('misCharts'));
    const item = historico[index];
    indiceProyectoActual = index; 

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
    const savedList = document.getElementById('saved-list');
    savedList.innerHTML = '';

    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        // Estilo igual al que tienes, pero controlado para el scroll
        div.style = "background: #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center; color: white; border: 1px solid transparent; transition: 0.3s;";
        
        div.innerHTML = `
            <div style="flex: 1;">
                <strong style="font-size: 0.9rem;">${item.nombre}</strong><br>
                <small style="color: #94a3b8; font-size: 0.75rem;">${item.fecha}</small>
            </div>
            <div style="display: flex; gap: 5px;">
                <button onclick="cargarChart(${index})" style="background: #10b981; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.8rem;">Cargar</button>
                <button onclick="borrarGuardado(${index})" style="background: #ef4444; color: white; border: none; padding: 5px 10px; cursor: pointer; border-radius: 4px; font-size: 0.8rem;">X</button>
            </div>`;
        savedList.appendChild(div);
    });
}

window.borrarGuardado = function(index) {
    let historico = JSON.parse(localStorage.getItem('misCharts'));
    historico.splice(index, 1);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    
    if (indiceProyectoActual === index) {
        indiceProyectoActual = null;
    } else if (indiceProyectoActual > index) {
        indiceProyectoActual--;
    }
    
    renderizarLista();
};

// 4. RESTO DE FUNCIONES (Igual que el tuyo)
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

// Listeners
titleInput.addEventListener('input', actualizarGrafico);
maxScaleInput.addEventListener('input', actualizarGrafico);
skillsContainer.addEventListener('input', actualizarGrafico);

// Modal y Temas (Igual que el tuyo)

const paletas = {
    emerald: { bg: 'rgba(16, 185, 129, 0.2)', border: '#10b981', point: '#10b981' },
    ocean:   { bg: 'rgba(59, 130, 246, 0.3)', border: '#3b82f6', point: '#3b82f6' },
    sunset:  { bg: 'rgba(249, 115, 22, 0.3)',  border: '#f97316', point: '#f97316' },
    neon:    { bg: 'rgba(236, 72, 153, 0.2)', border: '#ec4899', point: '#fb7185' },
    slate:   { bg: 'rgba(148, 163, 184, 0.2)', border: '#94a3b8', point: '#475569' },
    volcano: { bg: 'rgba(239, 68, 68, 0.3)',  border: '#b91c1c', point: '#f87171' },
    royal:   { bg: 'rgba(139, 92, 246, 0.3)', border: '#8b5cf6', point: '#ddd6fe' },
    forest:  { bg: 'rgba(34, 197, 94, 0.15)', border: '#14532d', point: '#15803d' },
    gold:    { bg: 'rgba(234, 179, 8, 0.2)',  border: '#ca8a04', point: '#fef08a' },
    ghost:   { bg: 'rgba(255, 255, 255, 0.05)', border: 'rgba(255,255,255,0.6)', point: '#fff' }
};

const formas = {
    normal: { dash: [], radius: 5, width: 3 },
    bolas:  { dash: [], radius: 10, width: 3 },
    rayas:  { dash: [5, 5], radius: 5, width: 2 }
};




const themeModal = document.getElementById('theme-modal');
document.getElementById('open-themes').addEventListener('click', () => themeModal.style.display = 'block');
window.cerrarTemas = () => themeModal.style.display = 'none';




// ... (Aquí van tus funciones aplicarColor, aplicarEstilo y tus objetos paletas/formas) ...

window.aplicarColor = function(nombreColor) {
    console.log("Cambiando a color:", nombreColor);
    const p = paletas[nombreColor];
    if (!p) {
        console.error("La paleta no existe:", nombreColor);
        return;
    }
    
    const ds = myChart.data.datasets[0];
    ds.backgroundColor = p.bg;
    ds.borderColor = p.border;
    ds.pointBackgroundColor = p.point;
    ds.pointBorderColor = "#fff"; // Asegura que los puntos se vean bien
    
    myChart.update();
    
    // Si hay un proyecto cargado, esto guardará el color automáticamente
    if (typeof guardarAutomatico === "function") {
        guardarAutomatico();
    }
};

window.aplicarEstilo = function(nombreEstilo) {
    console.log("Cambiando a estilo:", nombreEstilo);
    const f = formas[nombreEstilo];
    if (!f) {
        console.error("El estilo no existe:", nombreEstilo);
        return;
    }
    
    const ds = myChart.data.datasets[0];
    ds.borderDash = f.dash;
    ds.pointRadius = f.radius;
    ds.pointHoverRadius = f.radius + 3;
    ds.borderWidth = f.width;
    
    myChart.update();

    if (typeof guardarAutomatico === "function") {
        guardarAutomatico();
    }
};













// Descarga
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'spider-chart.png';
    link.href = document.getElementById('myChart').toDataURL('image/png', 1.0);
    link.click();
});



// Función para limpiar todo y empezar de cero
// Función para limpiar el editor y empezar un proyecto desde cero
window.nuevoProyecto = function() {
    // 1. IMPORTANTE: Ponemos el índice en null para que el Autosave no afecte a los proyectos viejos
    indiceProyectoActual = null; 

    // 2. Limpiamos los campos de texto
    titleInput.value = "";
    maxScaleInput.value = 10;

    // 3. Reseteamos las filas de habilidades (dejamos una vacía por defecto)
    skillsContainer.innerHTML = '';
    crearFilaSkill("Nueva Habilidad", 0, 10); 

    // 4. Opcional: Resetear el estilo visual a Emerald (por defecto)
    const ds = myChart.data.datasets[0];
    ds.backgroundColor = 'rgba(16, 185, 129, 0.2)';
    ds.borderColor = '#10b981';
    ds.pointBackgroundColor = '#10b981';
    ds.borderDash = [];
    ds.pointRadius = 5;

    // 5. Actualizamos el gráfico visualmente
    actualizarGrafico();
    
    alert("Editor reiniciado. Ahora puedes crear un nuevo gráfico sin sobreescribir los anteriores.");
};






// Inicio
renderizarLista();
actualizarGrafico();