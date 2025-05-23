const btn = document.getElementById("btn")
const container = document.querySelector(".container")

btn.addEventListener("click", () => {
  container.classList.toggle("toggle")

  // Cambiar el texto del botón según el estado
  if (container.classList.contains("toggle")) {
    btn.textContent = "Cambiar a Inicio de Sesión"
  } else {
    btn.textContent = "Cambiar a Registro"
  }
})
