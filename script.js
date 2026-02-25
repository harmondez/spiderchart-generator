const ctx = document.getElementById('myChart').getContext('2d');
let indiceProyectoActual = null; 
let puntoSeleccionado = null;
let datasetIndexSeleccionado = null;
let estaArrastrando = false;

// 1. Inicializamos el gráfico
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
            angleLines: { color: '#e2e8f0' }, 
            grid: { color: '#e2e8f0' },
            // --- ESTA ES LA PARTE QUE DEBES CAMBIAR ---
            pointLabels: { 
                color: '#000000',             // CAMBIADO A NEGRO
                font: { 
                    size: 14, 
                    weight: 'bold',
                    family: "'Segoe UI', sans-serif" 
                } 
            },
            // -----------------------------------------
            min: 0,
            max: 10,
            ticks: { 
                stepSize: 2,
                backdropColor: 'transparent', 
                color: '#64748b' 
            }
        }
    },
    plugins: {
        legend: { display: false }
    }
}
});

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

    const etiquetas = Array.from(inputsLabels).map(input => input.value || "Skill");
    const valores = Array.from(inputsValues).map(input => {
        let val = Number(input.value);
        return val > nuevoMaximo ? nuevoMaximo : val;
    });

    // --- LÓGICA DE TAMAÑO DINÁMICO PARA ETIQUETAS ---
    // Buscamos la etiqueta más larga para determinar el tamaño general
    const longitudMaxima = etiquetas.reduce((max, str) => Math.max(max, str.length), 0);
    
    let fontSizeDinamico = 14; // Tamaño base
    if (longitudMaxima > 12) fontSizeDinamico = 12;
    if (longitudMaxima > 17) fontSizeDinamico = 12;
    if (longitudMaxima > 12) fontSizeDinamico = 12;
    // -----------------------------------------------

    myChart.data.labels = etiquetas;
    myChart.data.datasets[0].data = valores;
    myChart.options.scales.r.max = nuevoMaximo; 

    // Aplicamos el tamaño dinámico a las etiquetas de las puntas
    myChart.options.scales.r.pointLabels.font.size = fontSizeDinamico;

    myChart.options.plugins.title = {
        display: textoRaw.trim() !== "", 
        text: lineasTitulo,
        color: '#0f172a',
        font: { size: 30, weight: 'bold', family: "'Segoe UI', sans-serif" },
        padding: { top: 10, bottom: 20 }
    };
    
    myChart.update();

    if (indiceProyectoActual !== null) {
        guardarAutomatico();
    }
}



// INTERACTIVIDAD

const canvas = document.getElementById('myChart');

// Detectar cuando pulsamos un punto
canvas.onmousedown = (e) => {
    const puntos = myChart.getElementsAtEventForMode(e, 'nearest', { intersect: true }, Array);
    if (puntos.length > 0) {
        puntoSeleccionado = puntos[0].index;
        datasetIndexSeleccionado = puntos[0].datasetIndex;
        estaArrastrando = true;
        canvas.style.cursor = 'grabbing';
    }
};

// Detectar el movimiento y calcular el nuevo valor
window.onmousemove = (e) => {
    if (!estaArrastrando) return;

    // 1. Obtener coordenadas del ratón relativas al canvas
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 2. Obtener el centro del gráfico y la escala
    const scale = myChart.scales.r;
    const centroX = scale.xCenter;
    const centroY = scale.yCenter;

    // 3. Calcular distancia desde el centro al ratón (Teorema de Pitágoras)
    const distanciaPixeles = Math.sqrt(Math.pow(x - centroX, 2) + Math.pow(y - centroY, 2));

    // 4. Convertir píxeles a valor de la escala (0 a Max)
    const valorMax = scale.max;
    const radioMax = scale.drawingArea; // El radio máximo en píxeles del círculo
    
    let nuevoValor = (distanciaPixeles / radioMax) * valorMax;

    // Limitar entre 0 y el máximo definido
    nuevoValor = Math.max(0, Math.min(valorMax, nuevoValor));
    nuevoValor = parseFloat(nuevoValor.toFixed(1)); // Redondear a 1 decimal para precisión

    // 5. Actualizar el gráfico
    myChart.data.datasets[datasetIndexSeleccionado].data[puntoSeleccionado] = nuevoValor;
    myChart.update('none'); // 'none' para que no haya animaciones lentas mientras arrastras

    // 6. ¡IMPORTANTE! Sincronizar con el input de texto de la izquierda
    const inputsValues = document.querySelectorAll('.value-input');
    if (inputsValues[puntoSeleccionado]) {
        inputsValues[puntoSeleccionado].value = nuevoValor;
    }
};

// Soltar el punto
window.onmouseup = () => {
    if (estaArrastrando) {
        estaArrastrando = false;
        puntoSeleccionado = null;
        canvas.style.cursor = 'default';
        actualizarGrafico(); // Para asegurar que todo se guarde y sincronice
    }
};








// 3. PERSISTENCIA
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
            dash: ds.borderDash || [],
            radius: ds.pointRadius || 5,
            width: ds.borderWidth || 3
        },
        fecha: new Date().toLocaleDateString()
    };

    let historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    historico.push(chartData);
    localStorage.setItem('misCharts', JSON.stringify(historico));
    
    indiceProyectoActual = historico.length - 1; 
    renderizarLista();
});

window.cargarChart = function(index) {
    const historico = JSON.parse(localStorage.getItem('misCharts'));
    const item = historico[index];
    indiceProyectoActual = index; 

    titleInput.value = item.tituloGrafico || "";
    maxScaleInput.value = item.max;

    const ds = myChart.data.datasets[0];
    if (item.estilo) {
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
    renderizarLista(); // Para resaltar el seleccionado
};

function renderizarLista() {
    const historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    savedList.innerHTML = '';

    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        
        // Estilo especial si es el proyecto seleccionado
        const esActivo = (indiceProyectoActual === index) ? "border: 1px solid #10b981; background: #1e293b;" : "border: 1px solid transparent;";

        // REDUCCIÓN DE TAMAÑO: Padding de 10px a 6px, margin-bottom de 10px a 5px
        div.style = `padding: 6px 10px; border-radius: 8px; margin-bottom: 5px; display: flex; justify-content: space-between; align-items: center; color: white; transition: 0.3s; ${esActivo}`;
        
        div.innerHTML = `
            <div style="flex: 1; line-height: 1.1;">
                <strong style="font-size: 0.8rem;">${item.nombre}</strong><br>
                <small style="color: #94a3b8; font-size: 0.6rem;">${item.fecha}</small>
            </div>
            <div style="display: flex; gap: 4px;">
                <button onclick="cargarChart(${index})" style="background: #10b981; color: white; border: none; padding: 3px 8px; cursor: pointer; border-radius: 4px; font-size: 0.7rem;">Cargar</button>
                <button onclick="borrarGuardado(${index})" style="background: #ef4444; color: white; border: none; padding: 3px 8px; cursor: pointer; border-radius: 4px; font-size: 0.7rem;">X</button>
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

function crearFilaSkill(label = "", value = 0, max = 10) {
    const newGroup = document.createElement('div');
    newGroup.className = 'input-group';
    newGroup.innerHTML = `
        <input type="text" class="label-input" placeholder="Habilidad" value="${label}" style="color: #000000;">
        <input type="number" class="value-input" value="${value}" min="0" max="${max}" style="color: #000000;">
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

titleInput.addEventListener('input', actualizarGrafico);
maxScaleInput.addEventListener('input', actualizarGrafico);
skillsContainer.addEventListener('input', actualizarGrafico);

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
    ghost: { 
        bg: 'rgba(203, 213, 225, 0.4)', // Gris muy suave para el relleno
        border: '#475569',             // Gris oscuro para el borde (ahora se verá)
        point: '#1e293b'               // Puntos en azul casi negro para contraste
    }
};

const formas = {
    normal: { dash: [], radius: 5, width: 3 },
    bolas:  { dash: [], radius: 10, width: 3 },
    rayas:  { dash: [5, 5], radius: 5, width: 2 }
};

const themeModal = document.getElementById('theme-modal');
document.getElementById('open-themes').addEventListener('click', () => themeModal.style.display = 'block');
window.cerrarTemas = () => themeModal.style.display = 'none';

window.aplicarColor = function(nombreColor) {
    const p = paletas[nombreColor];
    if (!p) return;
    const ds = myChart.data.datasets[0];
    ds.backgroundColor = p.bg;
    ds.borderColor = p.border;
    ds.pointBackgroundColor = p.point;
    ds.pointBorderColor = "#fff";
    actualizarGrafico();
};

window.aplicarEstilo = function(nombreEstilo) {
    const f = formas[nombreEstilo];
    if (!f) return;
    const ds = myChart.data.datasets[0];
    ds.borderDash = f.dash;
    ds.pointRadius = f.radius;
    ds.pointHoverRadius = f.radius + 3;
    ds.borderWidth = f.width;
    actualizarGrafico();
};



// Referencia al nuevo modal de descarga
const downloadModal = document.getElementById('download-modal');

// Cambiamos el comportamiento del botón principal
document.getElementById('download').addEventListener('click', () => {
    // En lugar de descargar, mostramos el modal
    downloadModal.style.display = 'block';
});

// Función para cerrar el modal de descarga
window.cerrarDownload = function() {
    downloadModal.style.display = 'none';
};

// Función para exportar PNG (ahora llamada desde el modal)
window.exportarImagen = function() {
    const link = document.createElement('a');
    const titulo = titleInput.value.trim() || "spider-chart";
    link.download = `${titulo.replace(/\s+/g, '_')}.png`;
    link.href = document.getElementById('myChart').toDataURL('image/png', 1.0);
    link.click();
    cerrarDownload(); // Cerramos el popup tras descargar
};




window.nuevoProyecto = function() {
    indiceProyectoActual = null; 
    titleInput.value = "";
    maxScaleInput.value = 10;
    skillsContainer.innerHTML = '';
    crearFilaSkill("Nueva Habilidad", 0, 10); 
    const ds = myChart.data.datasets[0];
    ds.backgroundColor = 'rgba(16, 185, 129, 0.2)';
    ds.borderColor = '#10b981';
    ds.pointBackgroundColor = '#10b981';
    ds.borderDash = [];
    ds.pointRadius = 5;
    actualizarGrafico();
    renderizarLista();
};


window.exportarPDF = function() {
    // 1. Instanciamos jsPDF desde el espacio de nombres global
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4'); // Formato A4 en vertical

    // 2. Obtenemos el canvas y el título
    const canvas = document.getElementById('myChart');
    const titulo = titleInput.value.trim() || "Spider Chart Profile";

    // 3. Convertimos el gráfico en una imagen PNG de alta calidad
    const imgData = canvas.toDataURL('image/png', 1.0);

    // 4. Añadimos el título al PDF
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(15, 23, 42); // Color oscuro (#0f172a)
    doc.text(titulo, 105, 20, { align: "center" });

    // 5. Calculamos dimensiones para que el gráfico encaje bien centrado
    const pageWidth = doc.internal.pageSize.getWidth();
    const imgWidth = pageWidth - 40; // Margen de 20mm a cada lado
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // 6. Añadimos la imagen del gráfico al PDF
    doc.addImage(imgData, 'PNG', 20, 40, imgWidth, imgHeight);

    // 7. Añadimos una marca de tiempo opcional al pie de página
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // Color gris (#94a3b8)
    doc.text(`Generado el: ${new Date().toLocaleString()}`, 105, 280, { align: "center" });

    // 8. Descargamos el archivo y cerramos el modal
    doc.save(`${titulo.replace(/\s+/g, '_')}.pdf`);
    
    if (typeof cerrarDownload === "function") {
        cerrarDownload();
    }
};


// COMBINE

// Cambiar entre el Editor y el modo Combine
function cambiarSeccion(seccion) {
    const editor = document.querySelector('.main-content');
    const combine = document.getElementById('combine-section');
    const btnEditor = document.getElementById('nav-editor');
    const btnCombine = document.getElementById('nav-combine');

    if (seccion === 'combine') {
        // Mostrar vista de comparación
        if (editor) editor.style.display = 'none';
        if (combine) combine.style.display = 'block';
        
        // Actualizar estados del Nav (solo si los IDs existen)
        btnCombine?.classList.add('active');
        btnEditor?.classList.remove('active');
        
        // Llenar la biblioteca lateral de Combine
        renderizarListaCombine();
    } else {
        // Volver al editor principal
        if (editor) editor.style.display = 'grid'; // Asegúrate que coincida con tu CSS
        if (combine) combine.style.display = 'none';
        
        btnEditor?.classList.add('active');
        btnCombine?.classList.remove('active');
        
        // Forzar redibujado del gráfico principal por si acaso
        actualizarGrafico();
    }
}

// Renderizar la lista en el lateral de Combine
function renderizarListaCombine() {
    const historico = JSON.parse(localStorage.getItem('misCharts')) || [];
    const container = document.getElementById('combine-list');
    
    // Seguridad: si el contenedor no existe en el DOM, no hacemos nada
    if (!container) return;
    
    container.innerHTML = '';

    if (historico.length === 0) {
        container.innerHTML = '<p style="color: #94a3b8; font-size: 0.8rem; text-align: center; padding: 20px;">No hay perfiles guardados aún.</p>';
        return;
    }

    historico.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'saved-item';
        
        // Añadimos estilos inline para asegurar que se vea bien en el sidebar estrecho
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.padding = "10px";
        div.style.marginBottom = "8px";

        div.innerHTML = `
            <div style="display: flex; flex-direction: column; overflow: hidden;">
                <span style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                    ${item.nombre}
                </span>
                <small style="font-size: 0.7rem; color: #94a3b8;">${item.labels.length} Skills</small>
            </div>
            <button onclick="anadirAComparacion(${index})" 
                    style="background: #10b981; color: white; border: none; border-radius: 4px; padding: 4px 10px; cursor: pointer; font-weight: bold;">
                +
            </button>
        `;
        container.appendChild(div);
    });
}

// Añadir un gráfico a la hoja en blanco
window.anadirAComparacion = function(index) {
    const historico = JSON.parse(localStorage.getItem('misCharts'));
    const item = historico[index];
    const grid = document.getElementById('comparison-grid');

    if (!grid) return;

    // Crear el contenedor
    const card = document.createElement('div');
    card.className = 'comparison-card';
    const canvasId = `chart-compare-${Date.now()}`;
    
    card.innerHTML = `
        <h4 style="margin: 0 0 10px 0; font-size: 1rem; color: #0f172a;">${item.nombre}</h4>
        <canvas id="${canvasId}"></canvas>
    `;
    grid.appendChild(card);

    // Extraer el estilo guardado o usar uno por defecto si no existe
    const estilo = item.estilo || {
        bg: 'rgba(16, 185, 129, 0.2)',
        border: '#10b981',
        point: '#10b981',
        dash: [],
        radius: 5,
        width: 3
    };

    // Dibujar el gráfico con SU estilo propio
    const ctx = document.getElementById(canvasId).getContext('2d');
    new Chart(ctx, {
        type: 'radar',
        data: {
            labels: item.labels,
            datasets: [{
                data: item.values,
                // --- AQUÍ USAMOS LOS DATOS DEL OBJETO ESTILO ---
                backgroundColor: estilo.bg,
                borderColor: estilo.border,
                pointBackgroundColor: estilo.point,
                borderDash: estilo.dash,
                pointRadius: estilo.radius,
                borderWidth: estilo.width,
                pointBorderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            scales: {
                r: {
                    min: 0,
                    max: Number(item.max) || 10,
                    ticks: { display: false },
                    grid: { color: '#e2e8f0' },
                    angleLines: { color: '#e2e8f0' },
                    pointLabels: { 
                        font: { size: 9, weight: '600' },
                        color: '#64748b'
                    }
                }
            },
            plugins: {
                legend: { display: false },
                // Si guardaste el título del gráfico, también lo podemos poner aquí
                title: {
                    display: item.tituloGrafico ? true : false,
                    text: item.tituloGrafico,
                    font: { size: 12 }
                }
            }
        }
    });
};

function limpiarComparacion() {
    document.getElementById('comparison-grid').innerHTML = '';
}





// Inicio
renderizarLista();
actualizarGrafico();