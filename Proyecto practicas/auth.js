// Función para encriptar contraseñas (simulación simple)
function encryptPassword(password) {
  // En una aplicación real, usaríamos bcrypt o similar
  // Esta es una simulación simple para el propósito de la demo
  return btoa(password + "salt123")
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

// Función para registrar un usuario
function registerUser(name, email, password) {
  // Verificar si el usuario ya existe
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const userExists = users.some((user) => user.email === email)

  if (userExists) {
    showToast("Este correo ya está registrado", "error")
    return false
  }

  // Encriptar contraseña y guardar usuario
  const encryptedPassword = encryptPassword(password)
  const newUser = {
    name,
    email,
    password: encryptedPassword,
    reservations: [],
    purchases: [],
  }

  users.push(newUser)
  localStorage.setItem("users", JSON.stringify(users))
  showToast("Registro exitoso. Ahora puede iniciar sesión", "success")
  return true
}

// Función para iniciar sesión
function loginUser(email, password) {
  const users = JSON.parse(localStorage.getItem("users") || "[]")
  const encryptedPassword = encryptPassword(password)

  const user = users.find((user) => user.email === email && user.password === encryptedPassword)

  if (user) {
    // Guardar sesión del usuario
    const session = {
      user: {
        name: user.name,
        email: user.email,
      },
      lastActivity: new Date().getTime(),
      isActive: true,
    }

    localStorage.setItem("currentSession", JSON.stringify(session))
    return true
  }

  showToast("Correo o contraseña incorrectos", "error")
  return false
}

// Manejador para el formulario de registro
document.getElementById("register-form").addEventListener("submit", function (e) {
  e.preventDefault()

  const name = document.getElementById("register-name").value
  const email = document.getElementById("register-email").value
  const password = document.getElementById("register-password").value

  if (registerUser(name, email, password)) {
    // Limpiar formulario
    this.reset()

    // Cambiar a la vista de inicio de sesión
    document.querySelector(".container").classList.remove("toggle")
    document.getElementById("btn").textContent = "Cambiar a Registro"
  }
})

// Manejador para el formulario de inicio de sesión
document.getElementById("login-form").addEventListener("submit", (e) => {
  e.preventDefault()

  const email = document.getElementById("login-email").value
  const password = document.getElementById("login-password").value

  if (loginUser(email, password)) {
    // Redirigir a la página principal
    window.location.href = "dashboard.html"
  }
})

// Modificar la inicialización de vuelos para asegurar que se carguen correctamente
// Inicializar datos de vuelos si no existen
if (!localStorage.getItem("flights")) {
  const flights = [
    {
      id: "VL001",
      airline: "AeroLatino",
      origin: "Bogotá",
      destination: "Medellín",
      departureDate: "2024-05-25",
      departureTime: "08:30",
      arrivalTime: "09:45",
      price: 250000,
      availableSeats: 45,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "A12",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL002",
      airline: "AeroLatino",
      origin: "Bogotá",
      destination: "Medellín",
      departureDate: "2024-05-25",
      departureTime: "14:15",
      arrivalTime: "15:30",
      price: 280000,
      availableSeats: 32,
      class: "Económica",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "B5",
      terminal: "T2",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL003",
      airline: "AeroLatino",
      origin: "Bogotá",
      destination: "Cali",
      departureDate: "2024-05-26",
      departureTime: "10:00",
      arrivalTime: "11:15",
      price: 320000,
      availableSeats: 28,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "C8",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL004",
      airline: "AeroLatino",
      origin: "Medellín",
      destination: "Cartagena",
      departureDate: "2024-05-27",
      departureTime: "07:45",
      arrivalTime: "09:30",
      price: 380000,
      availableSeats: 52,
      class: "Económica",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "D3",
      terminal: "T2",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL005",
      airline: "ColombiaAir",
      origin: "Bogotá",
      destination: "Medellín",
      departureDate: "2024-05-25",
      departureTime: "11:30",
      arrivalTime: "12:45",
      price: 270000,
      availableSeats: 38,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A319",
      gate: "A8",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL006",
      airline: "ColombiaAir",
      origin: "Cali",
      destination: "Bogotá",
      departureDate: "2024-05-26",
      departureTime: "16:20",
      arrivalTime: "17:35",
      price: 310000,
      availableSeats: 42,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "B12",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL007",
      airline: "ColombiaAir",
      origin: "Cartagena",
      destination: "Bogotá",
      departureDate: "2024-05-27",
      departureTime: "19:00",
      arrivalTime: "20:45",
      price: 420000,
      availableSeats: 25,
      class: "Económica",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "C5",
      terminal: "T2",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL008",
      airline: "SkyHigh",
      origin: "Bogotá",
      destination: "Barranquilla",
      departureDate: "2024-05-28",
      departureTime: "09:15",
      arrivalTime: "11:00",
      price: 350000,
      availableSeats: 36,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "D9",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL009",
      airline: "SkyHigh",
      origin: "Bogotá",
      destination: "Cartagena",
      departureDate: "2024-05-25",
      departureTime: "12:30",
      arrivalTime: "15:45",
      price: 290000,
      availableSeats: 22,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "A5",
      terminal: "T1",
      connections: [
        {
          airport: "Medellín",
          arrivalTime: "13:45",
          departureTime: "14:30",
          duration: "45min",
        },
      ],
      isDirectFlight: false,
    },
    {
      id: "VL010",
      airline: "AeroLatino",
      origin: "Bogotá",
      destination: "Barranquilla",
      departureDate: "2024-05-26",
      departureTime: "08:00",
      arrivalTime: "12:15",
      price: 320000,
      availableSeats: 18,
      class: "Económica",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "B7",
      terminal: "T2",
      connections: [
        {
          airport: "Cartagena",
          arrivalTime: "10:30",
          departureTime: "11:00",
          duration: "30min",
        },
      ],
      isDirectFlight: false,
    },
    {
      id: "VL011",
      airline: "ColombiaAir",
      origin: "Medellín",
      destination: "Cali",
      departureDate: "2024-05-27",
      departureTime: "15:45",
      arrivalTime: "19:30",
      price: 340000,
      availableSeats: 28,
      class: "Económica",
      status: "En hora",
      aircraft: "Airbus A319",
      gate: "C3",
      terminal: "T1",
      connections: [
        {
          airport: "Bogotá",
          arrivalTime: "16:45",
          departureTime: "17:30",
          duration: "45min",
        },
      ],
      isDirectFlight: false,
    },
    {
      id: "VL012",
      airline: "SkyHigh",
      origin: "Cali",
      destination: "Cartagena",
      departureDate: "2024-05-28",
      departureTime: "10:15",
      arrivalTime: "14:45",
      price: 410000,
      availableSeats: 15,
      class: "Ejecutiva",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "D1",
      terminal: "T2",
      connections: [
        {
          airport: "Bogotá",
          arrivalTime: "11:30",
          departureTime: "12:15",
          duration: "45min",
        },
      ],
      isDirectFlight: false,
    },
    {
      id: "VL013",
      airline: "AeroLatino",
      origin: "Bogotá",
      destination: "Medellín",
      departureDate: "2024-05-25",
      departureTime: "16:30",
      arrivalTime: "17:45",
      price: 320000,
      availableSeats: 12,
      class: "Ejecutiva",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "A10",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL014",
      airline: "ColombiaAir",
      origin: "Bogotá",
      destination: "Cali",
      departureDate: "2024-05-26",
      departureTime: "07:15",
      arrivalTime: "08:30",
      price: 380000,
      availableSeats: 8,
      class: "Ejecutiva",
      status: "En hora",
      aircraft: "Airbus A319",
      gate: "B3",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL015",
      airline: "SkyHigh",
      origin: "Bogotá",
      destination: "Cartagena",
      departureDate: "2024-05-27",
      departureTime: "09:45",
      arrivalTime: "11:30",
      price: 450000,
      availableSeats: 6,
      class: "Primera",
      status: "En hora",
      aircraft: "Boeing 737",
      gate: "C7",
      terminal: "T2",
      connections: [],
      isDirectFlight: true,
    },
    {
      id: "VL016",
      airline: "AeroLatino",
      origin: "Medellín",
      destination: "Barranquilla",
      departureDate: "2024-05-28",
      departureTime: "14:00",
      arrivalTime: "15:45",
      price: 520000,
      availableSeats: 4,
      class: "Primera",
      status: "En hora",
      aircraft: "Airbus A320",
      gate: "D5",
      terminal: "T1",
      connections: [],
      isDirectFlight: true,
    },
  ]

  localStorage.setItem("flights", JSON.stringify(flights))
  console.log("Vuelos inicializados:", flights.length)
} else {
  console.log("Vuelos ya existentes en localStorage")
}
