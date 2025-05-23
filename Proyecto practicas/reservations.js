// Variables globales
let reservas = [];
let reservaActual = null;

// Elementos DOM
const reservationsContainer = document.getElementById('reservations-container');
const reservationFilter = document.getElementById('reservation-filter');
const reservationSort = document.getElementById('reservation-sort');
const purchaseModal = document.getElementById('purchase-modal');
const cancelModal = document.getElementById('cancel-modal');
const toast = document.getElementById('toast');

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    console.log('Página de reservas cargada');
    
    // Mostrar nombre de usuario
    document.getElementById('user-name').textContent = 'Jhonatan';
    
    // Cargar reservas desde localStorage
    cargarReservas();
    
    // Event listeners para filtros y ordenamiento
    reservationFilter.addEventListener('change', filtrarYOrdenarReservas);
    reservationSort.addEventListener('change', filtrarYOrdenarReservas);
    
    // Event listeners para modales
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            purchaseModal.style.display = 'none';
            cancelModal.style.display = 'none';
        });
    });
    
    // Event listener para formulario de compra
    document.getElementById('purchase-form').addEventListener('submit', handlePurchase);
    
    // Event listeners para botones de cancelación
    document.getElementById('confirm-cancel-btn').addEventListener('click', confirmarCancelacion);
    document.getElementById('back-cancel-btn').addEventListener('click', () => {
        cancelModal.style.display = 'none';
    });
});

// Cargar reservas desde localStorage
function cargarReservas() {
    try {
        const reservasGuardadas = localStorage.getItem('aeroreserva_reservas');
        if (reservasGuardadas) {
            reservas = JSON.parse(reservasGuardadas);
            console.log('Reservas cargadas:', reservas);
            filtrarYOrdenarReservas();
        } else {
            mostrarMensajeVacio();
        }
    } catch (error) {
        console.error('Error al cargar reservas:', error);
        mostrarMensajeVacio();
    }
}

// Mostrar mensaje cuando no hay reservas
function mostrarMensajeVacio() {
    reservationsContainer.innerHTML = '<p class="empty-message">No tienes reservas activas.</p>';
}

// Filtrar y ordenar reservas
function filtrarYOrdenarReservas() {
    if (reservas.length === 0) {
        mostrarMensajeVacio();
        return;
    }
    
    // Filtrar reservas
    const filtro = reservationFilter.value;
    let reservasFiltradas = [...reservas];
    
    if (filtro === 'pending') {
        reservasFiltradas = reservasFiltradas.filter(r => r.estado === 'pendiente');
    } else if (filtro === 'confirmed') {
        reservasFiltradas = reservasFiltradas.filter(r => r.estado === 'confirmada');
    }
    
    // Ordenar reservas
    const orden = reservationSort.value;
    
    switch (orden) {
        case 'date-desc':
            reservasFiltradas.sort((a, b) => new Date(b.fechaReserva) - new Date(a.fechaReserva));
            break;
        case 'date-asc':
            reservasFiltradas.sort((a, b) => new Date(a.fechaReserva) - new Date(b.fechaReserva));
            break;
        case 'price-asc':
            reservasFiltradas.sort((a, b) => a.vuelo.precio - b.vuelo.precio);
            break;
        case 'price-desc':
            reservasFiltradas.sort((a, b) => b.vuelo.precio - a.vuelo.precio);
            break;
    }
    
    // Mostrar reservas filtradas y ordenadas
    mostrarReservas(reservasFiltradas);
}

// Mostrar reservas en el contenedor
function mostrarReservas(reservasMostrar) {
    if (reservasMostrar.length === 0) {
        mostrarMensajeVacio();
        return;
    }
    
    let html = '';
    
    reservasMostrar.forEach(reserva => {
        const vuelo = reserva.vuelo;
        const fechaVuelo = formatearFecha(vuelo.fecha);
        const fechaReserva = formatearFecha(reserva.fechaReserva);
        const horaLlegada = calcularHoraLlegada(vuelo.hora, vuelo.duracion);
        
        html += `
            <div class="reservation-card ${reserva.estado === 'confirmada' ? 'confirmed' : 'pending'}" data-id="${reserva.id}">
                <div class="reservation-status">
                    <span class="status-badge ${reserva.estado === 'confirmada' ? 'confirmed' : 'pending'}">
                        ${reserva.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}
                    </span>
                    <span class="reservation-date">Reservado el ${fechaReserva}</span>
                </div>
                
                <div class="reservation-flight">
                    <div class="flight-header">
                        <div class="flight-airline">
                            <ion-icon name="airplane"></ion-icon>
                            <span>${vuelo.aerolinea}</span>
                        </div>
                        <div class="flight-id">${vuelo.id}</div>
                    </div>
                    
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
                        <div class="flight-date">${fechaVuelo}</div>
                        <div class="flight-class">${vuelo.clase}</div>
                        <div class="flight-seats">
                            <ion-icon name="person"></ion-icon>
                            <span>Asientos: ${reserva.asientos.join(', ')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="reservation-footer">
                    <div class="reservation-price">
                        <div class="price-label">Precio total:</div>
                        <div class="price-amount">$${(vuelo.precio * reserva.asientos.length).toLocaleString('es-CO')}</div>
                    </div>
                    <div class="reservation-actions">
                        ${reserva.estado === 'pendiente' ? `
                            <button class="btn primary-btn" onclick="comprarReserva('${reserva.id}')">
                                Comprar
                            </button>
                        ` : `
                            <button class="btn secondary-btn" onclick="verBoleto('${reserva.id}')">
                                Ver Boleto
                            </button>
                        `}
                        <button class="btn danger-btn" onclick="cancelarReserva('${reserva.id}')">
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        `;
    });
    
    reservationsContainer.innerHTML = html;
}

// Formatear fecha
function formatearFecha(fechaStr) {
    const fecha = new Date(fechaStr);
    const opciones = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' };
    return fecha.toLocaleDateString('es-ES', opciones);
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

// Comprar reserva
function comprarReserva(reservaId) {
    reservaActual = reservas.find(r => r.id === reservaId);
    if (!reservaActual) return;
    
    const purchaseDetails = document.getElementById('purchase-details');
    const vuelo = reservaActual.vuelo;
    const fechaVuelo = formatearFecha(vuelo.fecha);
    const precioTotal = vuelo.precio * reservaActual.asientos.length;
    
    purchaseDetails.innerHTML = `
        <div class="purchase-summary">
            <h4>Resumen de la Reserva</h4>
            <p><strong>Vuelo:</strong> ${vuelo.id} - ${vuelo.aerolinea}</p>
            <p><strong>Ruta:</strong> ${vuelo.origen} → ${vuelo.destino}</p>
            <p><strong>Fecha:</strong> ${fechaVuelo} - ${vuelo.hora}</p>
            <p><strong>Clase:</strong> ${vuelo.clase}</p>
            <p><strong>Asientos:</strong> ${reservaActual.asientos.join(', ')}</p>
            <p><strong>Pasajeros:</strong> ${reservaActual.asientos.length}</p>
            <div class="purchase-total">
                <span>Total a pagar:</span>
                <span class="purchase-amount">$${precioTotal.toLocaleString('es-CO')}</span>
            </div>
        </div>
    `;
    
    purchaseModal.style.display = 'block';
}

// Manejar compra
function handlePurchase(event) {
    event.preventDefault();
    
    if (!reservaActual) return;
    
    // Actualizar estado de la reserva
    reservaActual.estado = 'confirmada';
    reservaActual.fechaCompra = new Date().toISOString();
    reservaActual.metodoPago = 'tarjeta';
    reservaActual.metodoEntrega = document.getElementById('delivery-method').value;
    
    // Guardar cambios en localStorage
    localStorage.setItem('aeroreserva_reservas', JSON.stringify(reservas));
    
    // Cerrar modal y mostrar mensaje
    purchaseModal.style.display = 'none';
    showToast('¡Compra realizada con éxito! Tu boleto ha sido emitido.', 'success');
    
    // Actualizar vista
    filtrarYOrdenarReservas();
}

// Ver boleto
function verBoleto(reservaId) {
    const reserva = reservas.find(r => r.id === reservaId);
    if (!reserva || reserva.estado !== 'confirmada') return;
    
    showToast('Función de visualización de boleto en desarrollo', 'info');
}

// Cancelar reserva
function cancelarReserva(reservaId) {
    reservaActual = reservas.find(r => r.id === reservaId);
    if (!reservaActual) return;
    
    const cancelDetails = document.getElementById('cancel-details');
    const vuelo = reservaActual.vuelo;
    const fechaVuelo = formatearFecha(vuelo.fecha);
    
    cancelDetails.innerHTML = `
        <div class="cancel-summary">
            <h4>Detalles de la Reserva</h4>
            <p><strong>Vuelo:</strong> ${vuelo.id} - ${vuelo.aerolinea}</p>
            <p><strong>Ruta:</strong> ${vuelo.origen} → ${vuelo.destino}</p>
            <p><strong>Fecha:</strong> ${fechaVuelo} - ${vuelo.hora}</p>
            <p><strong>Asientos:</strong> ${reservaActual.asientos.join(', ')}</p>
            <p><strong>Estado:</strong> ${reservaActual.estado === 'confirmada' ? 'Confirmada' : 'Pendiente'}</p>
        </div>
    `;
    
    cancelModal.style.display = 'block';
}

// Confirmar cancelación
function confirmarCancelacion() {
    if (!reservaActual) return;
    
    // Eliminar reserva
    reservas = reservas.filter(r => r.id !== reservaActual.id);
    
    // Guardar cambios en localStorage
    localStorage.setItem('aeroreserva_reservas', JSON.stringify(reservas));
    
    // Cerrar modal y mostrar mensaje
    cancelModal.style.display = 'none';
    showToast('Reserva cancelada correctamente', 'success');
    
    // Actualizar vista
    filtrarYOrdenarReservas();
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
window.comprarReserva = comprarReserva;
window.verBoleto = verBoleto;
window.cancelarReserva = cancelarReserva;