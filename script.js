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

// 2. Función maestra para capturar TODO
const maxScaleInput = document.getElementById('max-scale');

function actualizarGrafico() {
    const inputsLabels = document.querySelectorAll('.label-input');
    const inputsValues = document.querySelectorAll('.value-input');

    const nuevoMaximo = Number(maxScaleInput.value) || 10;

    const etiquetas = Array.from(inputsLabels).map(input => input.value || "Habilidad");
    const valores = Array.from(inputsValues).map(input => {
        let val = Number(input.value);
        return val > nuevoMaximo ? nuevoMaximo : val;
    });

    myChart.data.labels = etiquetas;
    myChart.data.datasets[0].data = valores;
    myChart.options.scales.r.max = nuevoMaximo; 
    
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

// 6. Sincronización inicial
actualizarGrafico();