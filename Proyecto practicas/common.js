// Funciones comunes para todas las páginas

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
  const userNameElement = document.getElementById("user-name")
  if (userNameElement) {
    userNameElement.textContent = session.user.name
  }

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

// Funciones de utilidad para formateo
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

// Inicializar la página
document.addEventListener("DOMContentLoaded", () => {
  // Verificar sesión
  if (!checkSession()) return

  // Cerrar sesión
  const logoutBtn = document.getElementById("logout-btn")
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout)
  }

  // Cerrar modales al hacer clic fuera de ellos
  window.addEventListener("click", (e) => {
    document.querySelectorAll(".modal").forEach((modal) => {
      if (e.target === modal) {
        modal.style.display = "none"
      }
    })
  })

  // Cerrar modales con el botón de cerrar
  document.querySelectorAll(".close-modal").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").style.display = "none"
    })
  })

  // Verificar inactividad cada minuto
  setInterval(checkSession, 60000)
})
