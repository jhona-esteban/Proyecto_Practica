// Variables globales
let vuelosDisponibles = [];
let asientosSeleccionados = [];
let vueloActual = null;

// Aerolíneas disponibles
const aerolineas = ["AeroLatino", "ColombiaAir", "SkyHigh"];
const clases = ["Económica", "Ejecutiva", "Primera"];

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('Página cargada correctamente');
    
    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').min = today;
    document.getElementById('date').value = today;

    // Mostrar nombre de usuario
    document.getElementById('user-name').textContent = 'Jhonatan';

    // Event listeners
    document.getElementById('flight-search-form').addEventListener('submit', handleSearchSubmit);
    document.getElementById('origin').addEventListener('change', validateOriginDestination);
    document.getElementById('destination').addEventListener('change', validateOriginDestination);
    
    // Event listeners para cerrar modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            document.getElementById('seat-selection-modal').style.display = 'none';
            document.getElementById('flight-info-modal').style.display = 'none';
        });
    });

    document.getElementById('close-info-btn').addEventListener('click', function() {
        document.getElementById('flight-info-modal').style.display = 'none';
    });

    document.getElementById('seat-selection-form').addEventListener('submit', handleSeatSelection);
});

// Validar que origen y destino no sean iguales
function validateOriginDestination() {
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const searchBtn = document.getElementById('search-btn');
    
    if (origin && destination && origin === destination) {
        showToast('Error: El origen y destino no pueden ser iguales', 'error');
        searchBtn.disabled = true;
    } else {
        searchBtn.disabled = false;
    }
}

// Manejar envío del formulario de búsqueda
function handleSearchSubmit(event) {
    event.preventDefault();
    console.log('Formulario enviado');
    
    const origin = document.getElementById('origin').value;
    const destination = document.getElementById('destination').value;
    const date = document.getElementById('date').value;
    const airline = document.getElementById('airline').value;
    const travelClass = document.getElementById('class').value;
    const directOnly = document.getElementById('direct-only').checked;
    
    console.log('Datos del formulario:', { origin, destination, date, airline, travelClass, directOnly });
    
    // Validar que origen y destino sean diferentes
    if (origin === destination) {
        showToast('Error: El origen y destino no pueden ser iguales', 'error');
        return;
    }
    
    // Mostrar indicador de carga
    document.getElementById('flights-container').innerHTML = '<div class="loading">Buscando vuelos...</div>';
    
    // Simular búsqueda en el servidor
    setTimeout(() => {
        vuelosDisponibles = generarVuelos(origin, destination, date, airline, travelClass, directOnly);
        console.log('Vuelos generados:', vuelosDisponibles);
        mostrarResultados(vuelosDisponibles);
    }, 1500);
}

// Generar vuelos ficticios
function generarVuelos(origen, destino, fecha, aerolinea, clase, soloDirectos) {
    if (origen === destino) {
        return [];
    }
    
    const numeroVuelos = Math.floor(Math.random() * 6) + 2; // Entre 2 y 7 vuelos
    const vuelos = [];
    
    for (let i = 0; i < numeroVuelos; i++) {
        const esDirecto = Math.random() > 0.3;
        
        if (soloDirectos && !esDirecto) {
            continue;
        }
        
        const aerolineaVuelo = aerolinea || aerolineas[Math.floor(Math.random() * aerolineas.length)];
        const claseVuelo = clase || clases[Math.floor(Math.random() * clases.length)];
        
        const hora = `${Math.floor(Math.random() * 17) + 6}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
        const duracionMinutos = Math.floor(Math.random() * 105) + 45;
        const duracion = `${Math.floor(duracionMinutos / 60)}h ${duracionMinutos % 60}min`;
        const precio = Math.floor(Math.random() * 650000) + 150000;
        
        vuelos.push({
            id: `VL-${Math.floor(Math.random() * 10000)}`,
            origen,
            destino,
            fecha,
            hora,
            duracion,
            precio,
            aerolinea: aerolineaVuelo,
            clase: claseVuelo,
            directo: esDirecto
        });
    }
    
    return vuelos.sort((a, b) => a.precio - b.precio);
}

// Mostrar resultados de búsqueda
function mostrarResultados(vuelos) {
    const container = document.getElementById('flights-container');
    
    if (vuelos.length === 0) {
        container.innerHTML = '<p class="empty-message">No se encontraron vuelos para la búsqueda realizada.</p>';
        return;
    }
    
    let html = '';
    
    vuelos.forEach(vuelo => {
        const fechaFormateada = formatearFecha(vuelo.fecha);
        const horaLlegada = calcularHoraLlegada(vuelo.hora, vuelo.duracion);
        
        html += `
            <div class="flight-card" data-id="${vuelo.id}">
                <div class="flight-header">
                    <div class="flight-airline">
                        <ion-icon name="airplane"></ion-icon>
                        <span>${vuelo.aerolinea}</span>
                    </div>
                    <div class="flight-id">${vuelo.id}</div>
                </div>
                <div class="flight-body">
                    <div class="flight-route">
                        <div class="flight-time">
                            <div class="time">${vuelo.hora}</div>
                            <div class="city">${vuelo.origen}</div>
                        </div>
                        <div class="flight-duration">
                            <div class="duration-line ${vuelo.directo ? 'direct' : ''}"></div>
                            <div class="duration-text">${vuelo.duracion}</div>
                            <div class="flight-type">${vuelo.directo ? 'Directo' : 'Con escala'}</div>
                        </div>
                        <div class="flight-time">
                            <div class="time">${horaLlegada}</div>
                            <div class="city">${vuelo.destino}</div>
                        </div>
                    </div>
                    <div class="flight-details">
                        <div class="flight-date">${fechaFormateada}</div>
                        <div class="flight-class">${vuelo.clase}</div>
                    </div>
                </div>
                <div class="flight-footer">
                    <div class="flight-price">$${vuelo.precio.toLocaleString('es-CO')}</div>
                    <div class="flight-actions">
                        <button class="btn info-btn" onclick="mostrarInfoVuelo('${vuelo.id}')">
                            <ion-icon name="information-circle-outline"></ion-icon>
                        </button>
                        <button class="btn primary-btn" onclick="seleccionarVuelo('${vuelo.id}')">Seleccionar</button>
                    </div>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Calcular hora de llegada
function calcularHoraLlegada(horaSalida, duracion) {
    const [horas, minutos] = horaSalida.split(':').map(Number);
    const durMatch = duracion.match(/(\d+)h\s+(\d+)min/);
    if (!durMatch) return horaSalida;
    
    const [, durHoras, durMinutos] = durMatch.map(Number);
    let totalMinutos = (horas * 60 + minutos) + (durHoras * 60 + durMinutos);
    totalMinutos = totalMinutos % (24 * 60);
    
    const horaLlegada = Math.floor(totalMinutos / 60);
    const minutosLlegada = totalMinutos % 60;
    
    return `${horaLlegada.toString().padStart(2, '0')}:${minutosLlegada.toString().padStart(2, '0')}`;
}

// Formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
}

// Mostrar información detallada del vuelo
function mostrarInfoVuelo(vueloId) {
    const vuelo = vuelosDisponibles.find(v => v.id === vueloId);
    if (!vuelo) return;
    
    const infoDetails = document.getElementById('flight-info-details');
    const fechaFormateada = formatearFecha(vuelo.fecha);
    const horaLlegada = calcularHoraLlegada(vuelo.hora, vuelo.duracion);
    
    infoDetails.innerHTML = `
        <div style="margin-bottom: 20px;">
            <h4>Vuelo ${vuelo.id}</h4>
            <p><strong>Aerolínea:</strong> ${vuelo.aerolinea}</p>
            <p><strong>Ruta:</strong> ${vuelo.origen} → ${vuelo.destino}</p>
            <p><strong>Fecha:</strong> ${fechaFormateada}</p>
            <p><strong>Hora de salida:</strong> ${vuelo.hora}</p>
            <p><strong>Hora de llegada:</strong> ${horaLlegada}</p>
            <p><strong>Duración:</strong> ${vuelo.duracion}</p>
            <p><strong>Tipo:</strong> ${vuelo.directo ? 'Directo' : 'Con escala'}</p>
            <p><strong>Clase:</strong> ${vuelo.clase}</p>
            <p><strong>Precio:</strong> $${vuelo.precio.toLocaleString('es-CO')}</p>
        </div>
    `;
    
    document.getElementById('flight-info-modal').style.display = 'block';
}

// Seleccionar vuelo
function seleccionarVuelo(vueloId) {
    const vuelo = vuelosDisponibles.find(v => v.id === vueloId);
    if (!vuelo) return;
    
    vueloActual = vuelo;
    asientosSeleccionados = [];
    
    const seatFlightInfo = document.getElementById('seat-flight-info');
    seatFlightInfo.innerHTML = `
        <div style="margin-bottom: 15px;">
            <h4>Vuelo ${vuelo.id} - ${vuelo.aerolinea}</h4>
            <p>${vuelo.origen} → ${vuelo.destino}</p>
            <p>${formatearFecha(vuelo.fecha)} - ${vuelo.hora}</p>
            <p>Clase: ${vuelo.clase}</p>
        </div>
    `;
    
    generarMapaAsientos();
    document.getElementById('selected-seats-list').textContent = 'Ninguno';
    document.getElementById('seat-selection-modal').style.display = 'block';
}

// Generar mapa de asientos
function generarMapaAsientos() {
    const seatMap = document.getElementById('seat-map');
    const filas = 10;
    const columnas = 6;
    const letrasColumnas = ['A', 'B', 'C', 'D', 'E', 'F'];
    
    let html = '<div class="seat-map-container">';
    
    // Cabecera con letras
    html += '<div class="seat-row seat-header">';
    html += '<div class="seat-number"></div>';
    
    for (let j = 0; j < columnas; j++) {
        html += `<div class="seat-letter">${letrasColumnas[j]}</div>`;
    }
    html += '</div>';
    
    // Filas de asientos
    for (let i = 1; i <= filas; i++) {
        html += `<div class="seat-row">`;
        html += `<div class="seat-number">${i}</div>`;
        
        for (let j = 0; j < columnas; j++) {
            const asientoId = `${i}${letrasColumnas[j]}`;
            const ocupado = Math.random() < 0.3;
            
            if (ocupado) {
                html += `<div class="seat occupied" data-id="${asientoId}"></div>`;
            } else {
                html += `<div class="seat available" data-id="${asientoId}" onclick="toggleAsiento('${asientoId}')"></div>`;
            }
        }
        html += '</div>';
    }
    
    html += '</div>';
    seatMap.innerHTML = html;
}

// Seleccionar/deseleccionar asiento
function toggleAsiento(asientoId) {
    const asiento = document.querySelector(`.seat[data-id="${asientoId}"]`);
    
    if (asiento.classList.contains('occupied')) {
        return;
    }
    
    const pasajeros = parseInt(document.getElementById('seat-passengers').value);
    
    if (asiento.classList.contains('selected')) {
        asiento.classList.remove('selected');
        asientosSeleccionados = asientosSeleccionados.filter(id => id !== asientoId);
    } else {
        if (asientosSeleccionados.length >= pasajeros) {
            showToast(`Solo puede seleccionar ${pasajeros} asiento(s)`, 'warning');
            return;
        }
        
        asiento.classList.add('selected');
        asientosSeleccionados.push(asientoId);
    }
    
    const selectedSeatsList = document.getElementById('selected-seats-list');
    if (asientosSeleccionados.length === 0) {
        selectedSeatsList.textContent = 'Ninguno';
    } else {
        selectedSeatsList.textContent = asientosSeleccionados.join(', ');
    }
}

// Manejar selección de asientos
function handleSeatSelection(event) {
    event.preventDefault();
    
    const pasajeros = parseInt(document.getElementById('seat-passengers').value);
    
    if (asientosSeleccionados.length !== pasajeros) {
        showToast(`Debe seleccionar exactamente ${pasajeros} asiento(s)`, 'error');
        return;
    }
    
    // Crear nueva reserva
    const nuevaReserva = {
        id: `RES-${Date.now()}`,
        vuelo: vueloActual,
        asientos: asientosSeleccionados,
        fechaReserva: new Date().toISOString(),
        estado: 'pendiente',
        pasajeros: pasajeros
    };
    
    // Guardar reserva en localStorage
    guardarReserva(nuevaReserva);
    
    // Mostrar mensaje de éxito
    showToast(`Reserva confirmada para el vuelo ${vueloActual.id}`, 'success');
    document.getElementById('seat-selection-modal').style.display = 'none';
    
    // Redirigir a página de reservas (simulado)
    setTimeout(() => {
        showToast('Redirigiendo a Mis Reservas...', 'info');
        setTimeout(() => {
            window.location.href = 'reservations.html';
        }, 1500);
    }, 1500);
}

// Guardar reserva en localStorage
function guardarReserva(nuevaReserva) {
    try {
        // Obtener reservas existentes
        let reservas = [];
        const reservasGuardadas = localStorage.getItem('aeroreserva_reservas');
        
        if (reservasGuardadas) {
            reservas = JSON.parse(reservasGuardadas);
        }
        
        // Añadir nueva reserva
        reservas.push(nuevaReserva);
        
        // Guardar en localStorage
        localStorage.setItem('aeroreserva_reservas', JSON.stringify(reservas));
        console.log('Reserva guardada correctamente:', nuevaReserva);
    } catch (error) {
        console.error('Error al guardar la reserva:', error);
        showToast('Error al guardar la reserva', 'error');
    }
}

// Mostrar notificación toast
function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = 'toast';
    toast.classList.add(type);
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Hacer funciones disponibles globalmente
window.mostrarInfoVuelo = mostrarInfoVuelo;
window.seleccionarVuelo = seleccionarVuelo;
window.toggleAsiento = toggleAsiento;