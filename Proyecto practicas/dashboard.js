// Verificar si hay una sesión activa
function checkSession() {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")

  if (!session.isActive) {
    // Redirigir al login si no hay sesión activa
    window.location.href = "index.html"
    return false
  }

  // Verificar tiempo de inactividad (15 minutos = 900000 ms)
  const currentTime = new Date().getTime()
  const lastActivity = session.lastActivity || 0

  if (currentTime - lastActivity > 900000) {
    // Cerrar sesión por inactividad
    logout()
    return false
  }

  // Actualizar tiempo de última actividad
  session.lastActivity = currentTime
  localStorage.setItem("currentSession", JSON.stringify(session))

  // Mostrar información del usuario
  document.getElementById("user-name").textContent = session.user.name
  document.getElementById("profile-name").textContent = session.user.name
  document.getElementById("profile-email").textContent = session.user.email

  return true
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("currentSession")
  window.location.href = "index.html"
}

// Función para mostrar notificaciones toast
function showToast(message, type = "") {
  const toast = document.getElementById("toast")
  toast.textContent = message
  toast.className = "toast show " + type

  setTimeout(() => {
    toast.className = toast.className.replace("show", "")
  }, 3000)
}

// Función para cambiar entre secciones - CORREGIDA
function switchSection(sectionId) {
  console.log("Cambiando a sección:", sectionId) // Para depuración

  // Ocultar todas las secciones
  document.querySelectorAll("section").forEach((section) => {
    section.classList.remove("active-section")
  })

  // Mostrar la sección seleccionada
  const targetSection = document.getElementById(sectionId + "-section")
  if (targetSection) {
    targetSection.classList.add("active-section")
    console.log("Sección activada:", sectionId) // Para depuración
  } else {
    console.error("Sección no encontrada:", sectionId + "-section")
  }

  // Actualizar navegación
  document.querySelectorAll("nav a").forEach((link) => {
    link.classList.remove("active")
  })

  const activeLink = document.querySelector(`nav a[data-section="${sectionId}"]`)
  if (activeLink) {
    activeLink.classList.add("active")
  }
}

// Función para cambiar entre tipos de búsqueda
function switchSearchType(type) {
  document.querySelectorAll(".search-tab").forEach((tab) => {
    tab.classList.remove("active")
  })

  document.querySelector(`.search-tab[data-type="${type}"]`).classList.add("active")

  // Recargar vuelos con el nuevo tipo de búsqueda
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  displayFlightResults(flights)
}

// Modificar la función searchFlights para mejorar la búsqueda
function searchFlights(criteria) {
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  console.log("Vuelos disponibles:", flights) // Para depuración

  const searchType = document.querySelector(".search-tab.active").dataset.type

  // Filtrar vuelos según criterios
  const results = flights.filter((flight) => {
    // Si no hay criterios, mostrar todos los vuelos
    if (
      !criteria.origin &&
      !criteria.destination &&
      !criteria.date &&
      !criteria.airline &&
      !criteria.class &&
      !criteria.directOnly
    ) {
      return true
    }

    const matchesOrigin = !criteria.origin || flight.origin === criteria.origin
    const matchesDestination = !criteria.destination || flight.destination === criteria.destination
    const matchesDate = !criteria.date || flight.departureDate === criteria.date
    const matchesAirline = !criteria.airline || flight.airline === criteria.airline
    const matchesClass = !criteria.class || flight.class === criteria.class
    const matchesDirectOnly = !criteria.directOnly || flight.isDirectFlight

    return matchesOrigin && matchesDestination && matchesDate && matchesAirline && matchesClass && matchesDirectOnly
  })

  console.log("Resultados de búsqueda:", results) // Para depuración

  // Ordenar según tipo de búsqueda
  if (searchType === "price") {
    results.sort((a, b) => a.price - b.price)
  } else if (searchType === "schedule") {
    results.sort((a, b) => {
      if (a.departureDate === b.departureDate) {
        return a.departureTime.localeCompare(b.departureTime)
      }
      return a.departureDate.localeCompare(b.departureDate)
    })
  }

  return results
}

// Función para mostrar resultados de búsqueda
function displayFlightResults(flights) {
  const container = document.getElementById("flights-container")
  container.innerHTML = ""

  if (flights.length === 0) {
    container.innerHTML = '<p class="empty-message">No se encontraron vuelos que coincidan con tu búsqueda.</p>'
    return
  }

  const searchType = document.querySelector(".search-tab.active").dataset.type

  flights.forEach((flight) => {
    const card = document.createElement("div")
    card.className = "flight-card"

    // Contenido base del vuelo
    let cardContent = `
      <div class="flight-header">
        <span class="flight-airline">${flight.airline}</span>
        <span class="flight-id">${flight.id}</span>
      </div>
      <div class="flight-route">
        <span class="flight-city">${flight.origin}</span>
        <span class="flight-arrow">→</span>
        <span class="flight-city">${flight.destination}</span>
      </div>
      <div class="flight-details">
        <div class="flight-time">
          <span class="detail-label">Horario</span>
          <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
        </div>
        <div class="flight-date">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${formatDate(flight.departureDate)}</span>
        </div>
    `

    // Mostrar información específica según el tipo de búsqueda
    if (searchType === "price") {
      cardContent += `
        <div class="flight-price">
          <span class="detail-label">Precio</span>
          <span class="detail-value">$${formatPrice(flight.price)}</span>
        </div>
        <div class="flight-class">
          <span class="detail-label">Clase</span>
          <span class="detail-value">${flight.class}</span>
        </div>
      `
    } else if (searchType === "schedule") {
      cardContent += `
        <div class="flight-price">
          <span class="detail-label">Precio</span>
          <span class="detail-value">$${formatPrice(flight.price)}</span>
        </div>
        <div class="flight-duration">
          <span class="detail-label">Duración</span>
          <span class="detail-value">${calculateFlightDuration(flight.departureTime, flight.arrivalTime)}</span>
        </div>
      `
    } else if (searchType === "info") {
      cardContent += `
        <div class="flight-status">
          <span class="detail-label">Estado</span>
          <span class="detail-value">${flight.status}</span>
        </div>
        <div class="flight-aircraft">
          <span class="detail-label">Aeronave</span>
          <span class="detail-value">${flight.aircraft}</span>
        </div>
        <div class="flight-gate">
          <span class="detail-label">Puerta</span>
          <span class="detail-value">${flight.gate}</span>
        </div>
      `
    }

    cardContent += `</div>`

    // Información de conexiones si no es vuelo directo
    if (!flight.isDirectFlight && flight.connections.length > 0) {
      cardContent += `
        <div class="flight-connections">
          <span class="detail-label">Conexiones:</span>
          <ul class="connections-list">
      `

      flight.connections.forEach((connection) => {
        cardContent += `
          <li>${connection.airport} (Escala: ${connection.duration})</li>
        `
      })

      cardContent += `
          </ul>
        </div>
      `
    }

    // Acciones disponibles
    cardContent += `
      <div class="flight-actions">
        <span class="detail-label">Asientos: ${flight.availableSeats}</span>
        <div>
    `

    // Botones según el tipo de búsqueda
    if (searchType === "price" || searchType === "schedule") {
      cardContent += `
          <button class="btn primary-btn seat-select-btn" data-flight-id="${flight.id}">Seleccionar Asientos</button>
      `
    } else if (searchType === "info") {
      cardContent += `
          <button class="btn secondary-btn info-btn" data-flight-id="${flight.id}">Ver Detalles</button>
          <button class="btn primary-btn seat-select-btn" data-flight-id="${flight.id}">Reservar</button>
      `
    }

    cardContent += `
        </div>
      </div>
    `

    card.innerHTML = cardContent
    container.appendChild(card)
  })

  // Agregar event listeners a los botones
  document.querySelectorAll(".seat-select-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const flightId = this.dataset.flightId
      openSeatSelectionModal(flightId)
    })
  })

  document.querySelectorAll(".info-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const flightId = this.dataset.flightId
      openFlightInfoModal(flightId)
    })
  })
}

// Función para calcular la duración del vuelo
function calculateFlightDuration(departureTime, arrivalTime) {
  const departure = new Date(`2000-01-01 ${departureTime}`)
  const arrival = new Date(`2000-01-01 ${arrivalTime}`)

  // Si la hora de llegada es menor que la de salida, asumimos que es al día siguiente
  if (arrival < departure) {
    arrival.setDate(arrival.getDate() + 1)
  }

  const diffMs = arrival - departure
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60))

  return `${diffHours}h ${diffMinutes}m`
}

// Función para abrir modal de información detallada del vuelo
function openFlightInfoModal(flightId) {
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  const flight = flights.find((f) => f.id === flightId)

  if (!flight) {
    showToast("Vuelo no encontrado", "error")
    return
  }

  const modal = document.getElementById("flight-info-modal")
  const details = document.getElementById("flight-info-details")

  let detailsHTML = `
    <div class="flight-header">
      <span class="flight-airline">${flight.airline}</span>
      <span class="flight-id">${flight.id}</span>
    </div>
    <div class="flight-route">
      <span class="flight-city">${flight.origin}</span>
      <span class="flight-arrow">→</span>
      <span class="flight-city">${flight.destination}</span>
    </div>
    <div class="flight-info-grid">
      <div class="info-item">
        <span class="detail-label">Fecha:</span>
        <span class="detail-value">${formatDate(flight.departureDate)}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Horario:</span>
        <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Estado:</span>
        <span class="detail-value">${flight.status}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Aeronave:</span>
        <span class="detail-value">${flight.aircraft}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Puerta:</span>
        <span class="detail-value">${flight.gate}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Terminal:</span>
        <span class="detail-value">${flight.terminal}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Clase:</span>
        <span class="detail-value">${flight.class}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Precio:</span>
        <span class="detail-value">$${formatPrice(flight.price)}</span>
      </div>
      <div class="info-item">
        <span class="detail-label">Asientos disponibles:</span>
        <span class="detail-value">${flight.availableSeats}</span>
      </div>
    </div>
  `

  // Información de conexiones si no es vuelo directo
  if (!flight.isDirectFlight && flight.connections.length > 0) {
    detailsHTML += `
      <div class="flight-connections">
        <h4>Conexiones:</h4>
        <ul class="connections-list">
    `

    flight.connections.forEach((connection) => {
      detailsHTML += `
        <li>
          <strong>${connection.airport}</strong><br>
          Llegada: ${connection.arrivalTime} - Salida: ${connection.departureTime}<br>
          Tiempo de escala: ${connection.duration}
        </li>
      `
    })

    detailsHTML += `
        </ul>
      </div>
    `
  }

  details.innerHTML = detailsHTML

  // Mostrar modal
  modal.style.display = "flex"

  // Event listener para cerrar modal
  document.getElementById("close-info-btn").addEventListener("click", () => {
    modal.style.display = "none"
  })
}

// Función para abrir modal de selección de asientos
function openSeatSelectionModal(flightId) {
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  const flight = flights.find((f) => f.id === flightId)

  if (!flight) {
    showToast("Vuelo no encontrado", "error")
    return
  }

  const modal = document.getElementById("seat-selection-modal")
  const flightInfo = document.getElementById("seat-flight-info")
  const seatMap = document.getElementById("seat-map")

  // Mostrar información del vuelo
  flightInfo.innerHTML = `
    <div class="flight-header">
      <span class="flight-airline">${flight.airline}</span>
      <span class="flight-id">${flight.id}</span>
    </div>
    <div class="flight-route">
      <span class="flight-city">${flight.origin}</span>
      <span class="flight-arrow">→</span>
      <span class="flight-city">${flight.destination}</span>
    </div>
    <div class="flight-details">
      <span>Fecha: ${formatDate(flight.departureDate)}</span>
      <span>Horario: ${flight.departureTime} - ${flight.arrivalTime}</span>
      <span>Precio: $${formatPrice(flight.price)}</span>
      <span>Clase: ${flight.class}</span>
    </div>
  `

  // Generar mapa de asientos
  generateSeatMap(flightId, seatMap)

  // Guardar ID del vuelo en el formulario
  document.getElementById("seat-selection-form").dataset.flightId = flightId

  // Mostrar modal
  modal.style.display = "flex"
}

// Función para crear el modal de selección de asientos
function createSeatSelectionModal() {
  const modalHTML = `
    <div id="seat-selection-modal" class="modal">
      <div class="modal-content seat-modal">
        <span class="close-modal">&times;</span>
        <h3>Selección de Asientos</h3>
        <div id="seat-flight-info" class="modal-details"></div>
        
        <div class="seat-legend">
          <div class="legend-item">
            <div class="seat available"></div>
            <span>Disponible</span>
          </div>
          <div class="legend-item">
            <div class="seat occupied"></div>
            <span>Ocupado</span>
          </div>
          <div class="legend-item">
            <div class="seat selected"></div>
            <span>Seleccionado</span>
          </div>
        </div>
        
        <div id="seat-map" class="seat-map"></div>
        
        <form id="seat-selection-form">
          <div class="form-group">
            <label for="seat-passengers">Número de pasajeros</label>
            <input type="number" id="seat-passengers" min="1" max="10" value="1" required>
          </div>
          <div class="selected-seats-info">
            <span>Asientos seleccionados: </span>
            <span id="selected-seats-list">Ninguno</span>
          </div>
          <div class="form-actions">
            <button type="submit" class="btn primary-btn">Confirmar Reserva</button>
          </div>
        </form>
      </div>
    </div>
  `

  document.body.insertAdjacentHTML("beforeend", modalHTML)

  // Agregar event listener para cerrar modal
  document.querySelector("#seat-selection-modal .close-modal").addEventListener("click", () => {
    document.getElementById("seat-selection-modal").style.display = "none"
  })

  // Event listener para cambio en número de pasajeros
  document.getElementById("seat-passengers").addEventListener("change", () => {
    const flightId = document.getElementById("seat-selection-form").dataset.flightId
    const seatMap = document.getElementById("seat-map")
    generateSeatMap(flightId, seatMap)
  })

  // Event listener para el formulario de selección de asientos
  document.getElementById("seat-selection-form").addEventListener("submit", function (e) {
    e.preventDefault()

    const flightId = this.dataset.flightId
    const passengers = Number.parseInt(document.getElementById("seat-passengers").value)
    const selectedSeats = Array.from(document.querySelectorAll(".seat.selected")).map((seat) => seat.dataset.seatNumber)

    if (selectedSeats.length !== passengers) {
      showToast(`Debe seleccionar exactamente ${passengers} asiento(s)`, "error")
      return
    }

    if (createReservationWithSeats(flightId, passengers, selectedSeats)) {
      showToast("Reserva creada correctamente", "success")
      document.getElementById("seat-selection-modal").style.display = "none"

      // Si estamos en la sección de reservas, actualizar la lista
      if (document.getElementById("reservations-section").classList.contains("active-section")) {
        displayUserReservations()
      }
    }
  })
}

// Función para generar el mapa de asientos
function generateSeatMap(flightId, container) {
  const totalSeats = 60 // Avión de 60 asientos
  const seatsPerRow = 6 // 3 asientos por lado (A, B, C | D, E, F)
  const rows = Math.ceil(totalSeats / seatsPerRow)

  // Obtener asientos ocupados para este vuelo
  const occupiedSeats = getOccupiedSeats(flightId)
  const passengers = Number.parseInt(document.getElementById("seat-passengers").value) || 1

  container.innerHTML = ""

  // Crear encabezado con letras de asientos
  const header = document.createElement("div")
  header.className = "seat-header"
  header.innerHTML = `
    <span class="row-number"></span>
    <span class="seat-letter">A</span>
    <span class="seat-letter">B</span>
    <span class="seat-letter">C</span>
    <span class="aisle"></span>
    <span class="seat-letter">D</span>
    <span class="seat-letter">E</span>
    <span class="seat-letter">F</span>
  `
  container.appendChild(header)

  // Generar filas de asientos
  for (let row = 1; row <= rows; row++) {
    const rowElement = document.createElement("div")
    rowElement.className = "seat-row"

    // Número de fila
    const rowNumber = document.createElement("span")
    rowNumber.className = "row-number"
    rowNumber.textContent = row
    rowElement.appendChild(rowNumber)

    // Asientos A, B, C
    for (const seatLetter of ["A", "B", "C"]) {
      const seatNumber = `${row}${seatLetter}`
      const seat = createSeatElement(seatNumber, occupiedSeats.includes(seatNumber))
      rowElement.appendChild(seat)
    }

    // Pasillo
    const aisle = document.createElement("span")
    aisle.className = "aisle"
    rowElement.appendChild(aisle)

    // Asientos D, E, F
    for (const seatLetter of ["D", "E", "F"]) {
      const seatNumber = `${row}${seatLetter}`
      const seat = createSeatElement(seatNumber, occupiedSeats.includes(seatNumber))
      rowElement.appendChild(seat)
    }

    container.appendChild(rowElement)
  }

  // Agregar event listeners para selección de asientos
  addSeatSelectionListeners(passengers)
}

// Función para crear un elemento de asiento
function createSeatElement(seatNumber, isOccupied) {
  const seat = document.createElement("div")
  seat.className = isOccupied ? "seat occupied" : "seat available"
  seat.dataset.seatNumber = seatNumber
  seat.textContent = seatNumber

  if (isOccupied) {
    seat.title = "Asiento ocupado"
  } else {
    seat.title = `Seleccionar asiento ${seatNumber}`
  }

  return seat
}

// Función para obtener asientos ocupados de un vuelo
function getOccupiedSeats(flightId) {
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const occupiedSeats = []

  users.forEach((user) => {
    if (user.reservations) {
      user.reservations.forEach((reservation) => {
        if (reservation.flightId === flightId && reservation.seats) {
          occupiedSeats.push(...reservation.seats)
        }
      })
    }
  })

  return occupiedSeats
}

// Función para agregar event listeners de selección de asientos
function addSeatSelectionListeners(maxSeats) {
  const seats = document.querySelectorAll(".seat.available")

  seats.forEach((seat) => {
    seat.addEventListener("click", function () {
      const selectedSeats = document.querySelectorAll(".seat.selected")

      if (this.classList.contains("selected")) {
        // Deseleccionar asiento
        this.classList.remove("selected")
        this.classList.add("available")
      } else if (selectedSeats.length < maxSeats) {
        // Seleccionar asiento
        this.classList.remove("available")
        this.classList.add("selected")
      } else {
        showToast(`Solo puede seleccionar ${maxSeats} asiento(s)`, "error")
      }

      updateSelectedSeatsList()
    })
  })
}

// Función para actualizar la lista de asientos seleccionados
function updateSelectedSeatsList() {
  const selectedSeats = Array.from(document.querySelectorAll(".seat.selected")).map((seat) => seat.dataset.seatNumber)
  const listElement = document.getElementById("selected-seats-list")

  if (selectedSeats.length === 0) {
    listElement.textContent = "Ninguno"
  } else {
    listElement.textContent = selectedSeats.join(", ")
  }
}

// Función para crear reserva con asientos
function createReservationWithSeats(flightId, passengers, selectedSeats) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario y vuelo
  const userIndex = users.findIndex((u) => u.email === session.user.email)
  const flight = flights.find((f) => f.id === flightId)

  if (userIndex === -1 || !flight) {
    showToast("Error al crear la reserva", "error")
    return false
  }

  // Verificar que los asientos no estén ocupados
  const occupiedSeats = getOccupiedSeats(flightId)
  const conflictSeats = selectedSeats.filter((seat) => occupiedSeats.includes(seat))

  if (conflictSeats.length > 0) {
    showToast(`Los asientos ${conflictSeats.join(", ")} ya están ocupados`, "error")
    return false
  }

  // Crear reserva
  const reservationId = "R" + Date.now().toString().slice(-6)
  const reservation = {
    id: reservationId,
    flightId: flightId,
    passengers: passengers,
    seats: selectedSeats,
    date: new Date().toISOString(),
    totalPrice: flight.price * passengers,
    status: "Reservado",
  }

  // Actualizar usuario
  if (!users[userIndex].reservations) {
    users[userIndex].reservations = []
  }

  users[userIndex].reservations.push(reservation)
  localStorage.setItem("users", JSON.stringify(users))

  return reservationId
}

// Función para crear itinerario múltiple
function openItineraryModal() {
  const modal = document.getElementById("itinerary-modal")
  const flightsContainer = document.getElementById("itinerary-flights")

  // Cargar vuelos disponibles
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  flightsContainer.innerHTML = ""

  flights.forEach((flight) => {
    const flightItem = document.createElement("div")
    flightItem.className = "itinerary-flight-item"
    flightItem.innerHTML = `
      <div class="itinerary-flight-info">
        <div class="flight-header">
          <span class="flight-airline">${flight.airline}</span>
          <span class="flight-id">${flight.id}</span>
        </div>
        <div class="flight-route">
          <span class="flight-city">${flight.origin}</span>
          <span class="flight-arrow">→</span>
          <span class="flight-city">${flight.destination}</span>
        </div>
        <div class="flight-time">
          <span>${flight.departureDate} | ${flight.departureTime} - ${flight.arrivalTime}</span>
        </div>
      </div>
      <div class="itinerary-flight-actions">
        <input type="checkbox" class="itinerary-flight-checkbox" data-flight-id="${flight.id}">
      </div>
    `
    flightsContainer.appendChild(flightItem)
  })

  // Mostrar modal
  modal.style.display = "flex"
}

// Función para crear itinerario múltiple
function createItinerary(flightIds, passengers) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario
  const userIndex = users.findIndex((u) => u.email === session.user.email)

  if (userIndex === -1) {
    showToast("Error al crear el itinerario", "error")
    return false
  }

  // Verificar que los vuelos existan y tengan asientos disponibles
  const selectedFlights = []
  let totalPrice = 0

  for (const flightId of flightIds) {
    const flight = flights.find((f) => f.id === flightId)

    if (!flight) {
      showToast(`Vuelo ${flightId} no encontrado`, "error")
      return false
    }

    if (flight.availableSeats < passengers) {
      showToast(`El vuelo ${flightId} no tiene suficientes asientos disponibles`, "error")
      return false
    }

    selectedFlights.push(flight)
    totalPrice += flight.price * passengers
  }

  // Crear itinerario
  const itineraryId = "I" + Date.now().toString().slice(-6)
  const itinerary = {
    id: itineraryId,
    flightIds: flightIds,
    passengers: passengers,
    date: new Date().toISOString(),
    totalPrice: totalPrice,
    status: "Reservado",
  }

  // Actualizar usuario
  if (!users[userIndex].itineraries) {
    users[userIndex].itineraries = []
  }

  users[userIndex].itineraries.push(itinerary)
  localStorage.setItem("users", JSON.stringify(users))

  // Actualizar asientos disponibles en los vuelos
  for (const flightId of flightIds) {
    const flightIndex = flights.findIndex((f) => f.id === flightId)
    flights[flightIndex].availableSeats -= passengers
  }

  localStorage.setItem("flights", JSON.stringify(flights))

  return itineraryId
}

// Función para abrir modal de reserva
function openReservationModal(flightId) {
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  const flight = flights.find((f) => f.id === flightId)

  if (!flight) {
    showToast("Vuelo no encontrado", "error")
    return
  }

  const modal = document.getElementById("reservation-modal")
  const details = document.getElementById("reservation-details")

  details.innerHTML = `
    <div class="flight-header">
      <span class="flight-airline">${flight.airline}</span>
      <span class="flight-id">${flight.id}</span>
    </div>
    <div class="flight-route">
      <span class="flight-city">${flight.origin}</span>
      <span class="flight-arrow">→</span>
      <span class="flight-city">${flight.destination}</span>
    </div>
    <div class="flight-details">
      <div class="flight-time">
        <span class="detail-label">Horario</span>
        <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
      </div>
      <div class="flight-date">
        <span class="detail-label">Fecha</span>
        <span class="detail-value">${formatDate(flight.departureDate)}</span>
      </div>
      <div class="flight-price">
        <span class="detail-label">Precio</span>
        <span class="detail-value">$${formatPrice(flight.price)}</span>
      </div>
    </div>
  `

  // Guardar ID del vuelo en el formulario
  document.getElementById("reservation-form").dataset.flightId = flightId

  // Mostrar modal
  modal.style.display = "flex"
}

// Función para crear una reserva
function createReservation(flightId, passengers) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario y vuelo
  const userIndex = users.findIndex((u) => u.email === session.user.email)
  const flight = flights.find((f) => f.id === flightId)

  if (userIndex === -1 || !flight) {
    showToast("Error al crear la reserva", "error")
    return false
  }

  // Verificar asientos disponibles
  if (flight.availableSeats < passengers) {
    showToast(`Solo hay ${flight.availableSeats} asientos disponibles`, "error")
    return false
  }

  // Crear reserva
  const reservationId = "R" + Date.now().toString().slice(-6)
  const reservation = {
    id: reservationId,
    flightId: flightId,
    passengers: passengers,
    date: new Date().toISOString(),
    totalPrice: flight.price * passengers,
    status: "Reservado",
  }

  // Actualizar usuario
  if (!users[userIndex].reservations) {
    users[userIndex].reservations = []
  }

  users[userIndex].reservations.push(reservation)
  localStorage.setItem("users", JSON.stringify(users))

  // Actualizar asientos disponibles
  const flightIndex = flights.findIndex((f) => f.id === flightId)
  flights[flightIndex].availableSeats -= passengers
  localStorage.setItem("flights", JSON.stringify(flights))

  return reservationId
}

// Función para mostrar reservas del usuario
function displayUserReservations() {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario
  const user = users.find((u) => u.email === session.user.email)
  const container = document.getElementById("reservations-container")

  container.innerHTML = ""

  if (!user || !user.reservations || user.reservations.length === 0) {
    container.innerHTML = '<p class="empty-message">No tienes reservas activas.</p>'
    return
  }

  user.reservations.forEach((reservation) => {
    const flight = flights.find((f) => f.id === reservation.flightId)

    if (!flight) return

    const card = document.createElement("div")
    card.className = "reservation-card"
    card.innerHTML = `
      <div class="flight-header">
        <span class="flight-airline">${flight.airline}</span>
        <span class="flight-id">Reserva: ${reservation.id}</span>
      </div>
      <div class="flight-route">
        <span class="flight-city">${flight.origin}</span>
        <span class="flight-arrow">→</span>
        <span class="flight-city">${flight.destination}</span>
      </div>
      <div class="flight-details">
        <div class="flight-time">
          <span class="detail-label">Horario</span>
          <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
        </div>
        <div class="flight-date">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${formatDate(flight.departureDate)}</span>
        </div>
      </div>
      <div class="reservation-details">
        <div class="detail-item">
          <span class="detail-label">Pasajeros</span>
          <span class="detail-value">${reservation.passengers}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Precio Total</span>
          <span class="detail-value">$${formatPrice(reservation.totalPrice)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Estado</span>
          <span class="detail-value">${reservation.status}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Asientos</span>
          <span class="detail-value">${reservation.seats ? reservation.seats.join(", ") : "No especificados"}</span>
        </div>
      </div>
      <div class="flight-actions">
        <button class="btn primary-btn purchase-btn" data-reservation-id="${reservation.id}">Comprar</button>
        <button class="btn secondary-btn cancel-btn" data-reservation-id="${reservation.id}">Cancelar</button>
      </div>
    `
    container.appendChild(card)
  })

  // Agregar event listeners a los botones
  document.querySelectorAll(".purchase-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const reservationId = this.dataset.reservationId
      openPurchaseModal(reservationId)
    })
  })

  document.querySelectorAll(".cancel-btn").forEach((button) => {
    button.addEventListener("click", function () {
      const reservationId = this.dataset.reservationId
      cancelReservation(reservationId)
    })
  })
}

// Función para abrir modal de compra
function openPurchaseModal(reservationId) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario y reserva
  const user = users.find((u) => u.email === session.user.email)

  if (!user || !user.reservations) {
    showToast("Error al procesar la compra", "error")
    return
  }

  const reservation = user.reservations.find((r) => r.id === reservationId)

  if (!reservation) {
    showToast("Reserva no encontrada", "error")
    return
  }

  const flight = flights.find((f) => f.id === reservation.flightId)

  if (!flight) {
    showToast("Vuelo no encontrado", "error")
    return
  }

  const modal = document.getElementById("purchase-modal")
  const details = document.getElementById("purchase-details")

  details.innerHTML = `
    <div class="flight-header">
      <span class="flight-airline">${flight.airline}</span>
      <span class="flight-id">Reserva: ${reservation.id}</span>
    </div>
    <div class="flight-route">
      <span class="flight-city">${flight.origin}</span>
      <span class="flight-arrow">→</span>
      <span class="flight-city">${flight.destination}</span>
    </div>
    <div class="flight-details">
      <div class="flight-time">
        <span class="detail-label">Horario</span>
        <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
      </div>
      <div class="flight-date">
        <span class="detail-label">Fecha</span>
        <span class="detail-value">${formatDate(flight.departureDate)}</span>
      </div>
    </div>
    <div class="reservation-details">
      <div class="detail-item">
        <span class="detail-label">Pasajeros</span>
        <span class="detail-value">${reservation.passengers}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Precio Total</span>
        <span class="detail-value">$${formatPrice(reservation.totalPrice)}</span>
      </div>
      <div class="detail-item">
        <span class="detail-label">Asientos</span>
        <span class="detail-value">${reservation.seats ? reservation.seats.join(", ") : "No especificados"}</span>
      </div>
    </div>
  `

  // Guardar ID de la reserva en el formulario
  document.getElementById("purchase-form").dataset.reservationId = reservationId

  // Mostrar modal
  modal.style.display = "flex"
}

// Función para procesar compra
function processPurchase(reservationId, cardDetails, deliveryMethod) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Buscar usuario y reserva
  const userIndex = users.findIndex((u) => u.email === session.user.email)

  if (userIndex === -1 || !users[userIndex].reservations) {
    showToast("Error al procesar la compra", "error")
    return false
  }

  const reservationIndex = users[userIndex].reservations.findIndex((r) => r.id === reservationId)

  if (reservationIndex === -1) {
    showToast("Reserva no encontrada", "error")
    return false
  }

  // Crear compra
  const purchaseId = "P" + Date.now().toString().slice(-6)
  const reservation = users[userIndex].reservations[reservationIndex]

  const purchase = {
    id: purchaseId,
    reservationId: reservationId,
    flightId: reservation.flightId,
    passengers: reservation.passengers,
    seats: reservation.seats,
    totalPrice: reservation.totalPrice,
    date: new Date().toISOString(),
    cardLast4: cardDetails.number.slice(-4),
    deliveryMethod: deliveryMethod,
    status: "Completado",
  }

  // Actualizar usuario
  if (!users[userIndex].purchases) {
    users[userIndex].purchases = []
  }

  users[userIndex].purchases.push(purchase)

  // Actualizar estado de la reserva
  users[userIndex].reservations[reservationIndex].status = "Comprado"

  // Guardar tarjeta (solo últimos 4 dígitos por seguridad)
  users[userIndex].cardLast4 = cardDetails.number.slice(-4)

  localStorage.setItem("users", JSON.stringify(users))

  // Simular envío de correo
  simulateEmailConfirmation(session.user.email, purchase)

  return purchaseId
}

// Función para simular envío de correo de confirmación
function simulateEmailConfirmation(email, purchase) {
  console.log(`Enviando confirmación de compra a ${email}`)
  console.log(`Detalles de la compra: ${JSON.stringify(purchase)}`)

  // En una aplicación real, aquí se enviaría un correo electrónico
  showToast(`Se ha enviado una confirmación a ${email}`, "success")
}

// Función para cancelar reserva
function cancelReservation(reservationId) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario y reserva
  const userIndex = users.findIndex((u) => u.email === session.user.email)

  if (userIndex === -1 || !users[userIndex].reservations) {
    showToast("Error al cancelar la reserva", "error")
    return false
  }

  const reservationIndex = users[userIndex].reservations.findIndex((r) => r.id === reservationId)

  if (reservationIndex === -1) {
    showToast("Reserva no encontrada", "error")
    return false
  }

  const reservation = users[userIndex].reservations[reservationIndex]

  // Devolver asientos al vuelo
  const flightIndex = flights.findIndex((f) => f.id === reservation.flightId)

  if (flightIndex !== -1) {
    flights[flightIndex].availableSeats += reservation.passengers
    localStorage.setItem("flights", JSON.stringify(flights))
  }

  // Eliminar reserva
  users[userIndex].reservations.splice(reservationIndex, 1)
  localStorage.setItem("users", JSON.stringify(users))

  showToast("Reserva cancelada correctamente", "success")
  displayUserReservations()

  return true
}

// Función para mostrar compras del usuario
function displayUserPurchases() {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")

  // Buscar usuario
  const user = users.find((u) => u.email === session.user.email)
  const container = document.getElementById("purchases-container")

  container.innerHTML = ""

  if (!user || !user.purchases || user.purchases.length === 0) {
    container.innerHTML = '<p class="empty-message">No tienes compras realizadas.</p>'
    return
  }

  user.purchases.forEach((purchase) => {
    const flight = flights.find((f) => f.id === purchase.flightId)

    if (!flight) return

    const card = document.createElement("div")
    card.className = "purchase-card"
    card.innerHTML = `
      <div class="flight-header">
        <span class="flight-airline">${flight.airline}</span>
        <span class="flight-id">Compra: ${purchase.id}</span>
      </div>
      <div class="flight-route">
        <span class="flight-city">${flight.origin}</span>
        <span class="flight-arrow">→</span>
        <span class="flight-city">${flight.destination}</span>
      </div>
      <div class="flight-details">
        <div class="flight-time">
          <span class="detail-label">Horario</span>
          <span class="detail-value">${flight.departureTime} - ${flight.arrivalTime}</span>
        </div>
        <div class="flight-date">
          <span class="detail-label">Fecha</span>
          <span class="detail-value">${formatDate(flight.departureDate)}</span>
        </div>
      </div>
      <div class="purchase-details">
        <div class="detail-item">
          <span class="detail-label">Pasajeros</span>
          <span class="detail-value">${purchase.passengers}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Asientos</span>
          <span class="detail-value">${purchase.seats ? purchase.seats.join(", ") : "No especificados"}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Precio Total</span>
          <span class="detail-value">$${formatPrice(purchase.totalPrice)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Fecha de Compra</span>
          <span class="detail-value">${formatDateTime(purchase.date)}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Tarjeta</span>
          <span class="detail-value">**** **** **** ${purchase.cardLast4}</span>
        </div>
        <div class="detail-item">
          <span class="detail-label">Entrega</span>
          <span class="detail-value">${purchase.deliveryMethod === "email" ? "Correo electrónico" : "Recoger en aeropuerto"}</span>
        </div>
      </div>
    `
    container.appendChild(card)
  })
}

// Función para actualizar tarjeta de crédito
function updateCreditCard(cardDetails) {
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")

  // Buscar usuario
  const userIndex = users.findIndex((u) => u.email === session.user.email)

  if (userIndex === -1) {
    showToast("Error al actualizar la tarjeta", "error")
    return false
  }

  // Actualizar tarjeta (solo últimos 4 dígitos por seguridad)
  users[userIndex].cardLast4 = cardDetails.number.slice(-4)
  localStorage.setItem("users", JSON.stringify(users))

  // Actualizar perfil
  document.getElementById("profile-card").textContent = `**** **** **** ${cardDetails.number.slice(-4)}`

  showToast("Tarjeta actualizada correctamente", "success")
  return true
}

// Añadir una función para cargar vuelos iniciales al cargar la página
function loadInitialFlights() {
  const flights = JSON.parse(localStorage.getItem("flights") || "[]")
  if (flights.length > 0) {
    displayFlightResults(flights)
  }
}

// Funciones de utilidad
function formatDate(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

function formatDateTime(dateString) {
  const options = { year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }
  return new Date(dateString).toLocaleDateString("es-ES", options)
}

function formatPrice(price) {
  return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
}

// Modificar el event listener DOMContentLoaded para cargar vuelos iniciales
document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión
  if (!checkSession()) return

  // Actualizar información de perfil
  const session = JSON.parse(localStorage.getItem("currentSession") || "{}")
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const user = users.find((u) => u.email === session.user.email)

  if (user && user.cardLast4) {
    document.getElementById("profile-card").textContent = `**** **** **** ${user.cardLast4}`
  }

  // Cargar vuelos iniciales
  loadInitialFlights()

  // Navegación - CORREGIDO
  document.querySelectorAll("nav a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const section = this.dataset.section

      console.log("Navegando a sección:", section) // Para depuración

      switchSection(section)

      // Cargar datos específicos de la sección
      if (section === "search") {
        loadInitialFlights()
      } else if (section === "reservations") {
        displayUserReservations()
      } else if (section === "purchases") {
        displayUserPurchases()
      } else if (section === "profile") {
        // La sección de perfil ya está cargada
        console.log("Sección de perfil cargada")
      }
    })
  })

  // Cerrar sesión
  document.getElementById("logout-btn").addEventListener("click", logout)

  // Cambiar tipo de búsqueda - CORREGIDO
  document.querySelectorAll(".search-tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const type = this.dataset.type
      console.log("Cambiando a tipo de búsqueda:", type) // Para depuración
      switchSearchType(type)
    })
  })

  // Búsqueda de vuelos
  document.getElementById("flight-search-form").addEventListener("submit", (e) => {
    e.preventDefault()

    const criteria = {
      origin: document.getElementById("origin").value,
      destination: document.getElementById("destination").value,
      date: document.getElementById("date").value,
      airline: document.getElementById("airline").value,
      class: document.getElementById("class").value,
      directOnly: document.getElementById("direct-only").checked,
    }

    console.log("Criterios de búsqueda:", criteria) // Para depuración

    const results = searchFlights(criteria)
    displayFlightResults(results)
  })

  // Cerrar modales
  document.querySelectorAll(".close-modal").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  // Compra de billetes
  if (document.getElementById("purchase-form")) {
    document.getElementById("purchase-form").addEventListener("submit", function (e) {
      e.preventDefault()

      const reservationId = this.dataset.reservationId
      const cardDetails = {
        number: document.getElementById("card-number").value,
        expiry: document.getElementById("card-expiry").value,
        cvv: document.getElementById("card-cvv").value,
        name: document.getElementById("card-name").value,
      }
      const deliveryMethod = document.getElementById("delivery-method").value

      if (processPurchase(reservationId, cardDetails, deliveryMethod)) {
        showToast("Compra realizada correctamente", "success")
        document.getElementById("purchase-modal").style.display = "none"

        // Actualizar listas
        displayUserReservations()

        // Si estamos en la sección de compras, actualizar la lista
        if (document.getElementById("purchases-section").classList.contains("active-section")) {
          displayUserPurchases()
        }
      }
    })
  }

  // Actualizar tarjeta
  if (document.getElementById("update-card-btn")) {
    document.getElementById("update-card-btn").addEventListener("click", () => {
      document.getElementById("card-modal").style.display = "flex"
    })
  }

  if (document.getElementById("card-form")) {
    document.getElementById("card-form").addEventListener("submit", (e) => {
      e.preventDefault()

      const cardDetails = {
        number: document.getElementById("update-card-number").value,
        expiry: document.getElementById("update-card-expiry").value,
        cvv: document.getElementById("update-card-cvv").value,
        name: document.getElementById("update-card-name").value,
      }

      if (updateCreditCard(cardDetails)) {
        document.getElementById("card-modal").style.display = "none"
      }
    })
  }

  // Verificar inactividad cada minuto
  setInterval(checkSession, 60000)
})

// Cerrar modales al hacer clic fuera de ellos
window.addEventListener("click", (e) => {
  document.querySelectorAll(".modal").forEach((modal) => {
    if (e.target === modal) {
      modal.style.display = "none"
    }
  })
})
