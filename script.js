const ctx = document.getElementById('myChart').getContext('2d');

// 1. Inicializamos el gráfico (Lo dejamos "vacío" o con datos base, 
// ya que actualizarGrafico() se encargará de sincronizarlo al final)
let myChart = new Chart(ctx, {
    type: 'radar',
    data: {
        labels: [], // Se llenará automáticamente
        datasets: [{
            label: 'Level skill',
            data: [], // Se llenará automáticamente
            backgroundColor: 'rgba(16, 185, 129, 0.2)',
            borderColor: '#10b981',
            borderWidth: 3,
            pointBackgroundColor: '#10b981',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: '#10b981'
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
                max: 10, // Valor inicial
                ticks: { 
                    stepSize: 2,
                    backdropColor: 'transparent', 
                    color: '#94a3b8' 
                }
            }
        },
        plugins: {
            legend: { labels: { color: '#f8fafc' } }
        }
    }
});


// 1.5 Dale nombre a tu spider chart
// Busca el input y, cada vez que el usuario escriba, ejecuta la función
document.getElementById('chart-title-input').addEventListener('input', actualizarGrafico);

// 2. Función maestra para capturar TODO

const maxScaleInput = document.getElementById('max-scale');
const titleInput = document.getElementById('chart-title-input');
titleInput.addEventListener('input', actualizarGrafico);

function actualizarGrafico() {
    const inputsLabels = document.querySelectorAll('.label-input');
    const inputsValues = document.querySelectorAll('.value-input');

    // 1. Obtenemos el nuevo máximo y el título
    const nuevoMaximo = Number(maxScaleInput.value) || 10;
    const textoTitulo = titleInput.value;

    // 2. Procesamos etiquetas y valores
    const etiquetas = Array.from(inputsLabels).map(input => input.value || "Habilidad");
    const valores = Array.from(inputsValues).map(input => {
        let val = Number(input.value);
        return val > nuevoMaximo ? nuevoMaximo : val;
    });

    // 3. ACTUALIZAMOS DATOS Y ESCALA
    myChart.data.labels = etiquetas;
    myChart.data.datasets[0].data = valores;
    myChart.options.scales.r.max = nuevoMaximo; 

    // 4. CONFIGURAMOS EL TÍTULO DINÁMICO
    // Usamos el plugin 'title' de Chart.js
    myChart.options.plugins.title = {
        display: textoTitulo !== "", // Si no hay texto, no ocupa espacio
        text: textoTitulo,
        color: '#f8fafc', // Color a juego con tu CSS
        font: {
            size: 20,
            weight: 'bold',
            family: "'Segoe UI', sans-serif"
        },
        padding: {
            top: 10,
            bottom: 20
        }
    };
    
    // 5. Renderizamos los cambios
    myChart.update();
}

// 3. Funciones de control
window.eliminarFila = function(boton) {
    boton.parentElement.remove();
    actualizarGrafico();
};

const skillsContainer = document.getElementById('skills-container');
const addBtn = document.getElementById('add-skill');

addBtn.addEventListener('click', () => {
    const newGroup = document.createElement('div');
    newGroup.className = 'input-group';
    
    // CORRECCIÓN: Leemos el máximo actual para que la nueva fila sea coherente
    const currentMax = maxScaleInput.value || 10;

    newGroup.innerHTML = `
        <input type="text" class="label-input" placeholder="Nueva Habilidad">
        <input type="number" class="value-input" value="0" min="0" max="${currentMax}">
        <button class="btn-remove" onclick="eliminarFila(this)">-</button>
    `;
    skillsContainer.appendChild(newGroup);
    actualizarGrafico(); 
});

// 4. Eventos de actualización
maxScaleInput.addEventListener('input', actualizarGrafico);
skillsContainer.addEventListener('input', actualizarGrafico);

// 5. Descarga
document.getElementById('download').addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'mi-perfil-tecnico.png';
    link.href = document.getElementById('myChart').toDataURL('image/png', 1.0);
    link.click();
});


// --- FUNCIONALIDAD DE GUARDADO ---

const saveBtn = document.getElementById('save-chart');
const savedList = document.getElementById('saved-list');

// 1. Función para Guardar
saveBtn.addEventListener('click', () => {
    const nombre = prompt("Dale un nombre a tu gráfico:", "Mi Perfil Técnico");
    if (!nombre) return;

    const chartData = {
        nombre: nombre,
        tituloGrafico: titleInput.value, // <--- Guardamos el texto del título
        labels: Array.from(document.querySelectorAll('.label-input')).map(i => i.value),
        values: Array.from(document.querySelectorAll('.value-input')).map(i => i.value),
        max: maxScaleInput.value,
        fecha: new Date().toLocaleDateString()
    };

    let historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    historico.push(chartData);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    renderizarLista();
});

// 2. Función para mostrar la lista en pantalla
function renderizarLista() {
    const historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    savedList.innerHTML = ''; // Limpiar lista actual

    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        div.style = "background: #334155; padding: 10px; border-radius: 8px; margin-bottom: 10px; display: flex; justify-content: space-between; align-items: center;";
        
        div.innerHTML = `
            <div>
                <strong>${item.nombre}</strong> <br>
                <small style="color: #94a3b8">${item.fecha} - ${item.labels.length} skills</small>
            </div>
            <div>
                <button onclick="cargarChart(${index})" style="background: #10b981; padding: 5px 10px; font-size: 12px;">Cargar</button>
                <button onclick="borrarGuardado(${index})" style="background: #ef4444; padding: 5px 10px; font-size: 12px;">X</button>
            </div>
        `;
        savedList.appendChild(div);
    });
}

// 3. Función para CARGAR un gráfico guardado
window.cargarChart = function(index) {
    const historico = JSON.parse(localStorage.getItem('misCharts'));
    const item = historico[index];

    // 1. Ajustar el Título y la Escala
    titleInput.value = item.tituloGrafico || ""; // <--- Recuperamos el título
    maxScaleInput.value = item.max;

    // 2. Limpiar el contenedor de skills y regenerar las filas
    skillsContainer.innerHTML = '';
    item.labels.forEach((label, i) => {
        const newGroup = document.createElement('div');
        newGroup.className = 'input-group';
        newGroup.innerHTML = `
            <input type="text" class="label-input" value="${label}">
            <input type="number" class="value-input" value="${item.values[i]}" min="0" max="${item.max}">
            <button class="btn-remove" onclick="eliminarFila(this)">-</button>
        `;
        skillsContainer.appendChild(newGroup);
    });

    // 3. ¡Vital! Sincronizar el gráfico
    actualizarGrafico();
};

// 4. Función para BORRAR de la lista
window.borrarGuardado = function(index) {
    let historico = JSON.parse(localStorage.getItem('misCharts'));
    historico.splice(index, 1);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    renderizarLista();
};

// Cargar la lista al iniciar la App
renderizarLista();




// 6. Sincronización inicial
actualizarGrafico();