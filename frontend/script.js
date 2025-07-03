// Variables globales para el tema
let currentTheme = localStorage.getItem("theme") || "light"

// Inicializar tema al cargar la página
document.addEventListener("DOMContentLoaded", () => {
  applyTheme(currentTheme)
})

// Función para alternar tema
function toggleTheme() {
  currentTheme = currentTheme === "light" ? "dark" : "light"
  applyTheme(currentTheme)
  localStorage.setItem("theme", currentTheme)
}

// Aplicar tema
function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme)
  const themeIcon = document.querySelector(".theme-toggle i")
  if (themeIcon) {
    themeIcon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun"
  }
}

// Función mejorada para alternar menús
function toggleMenu(num) {
  // Cerrar todos los menús
  for (let i = 1; i <= 6; i++) {
    const menu = document.getElementById(`menu${i}`)
    const card = document.querySelector(`[data-case="${i}"]`)

    if (i === num) {
      // Alternar el menú seleccionado
      const isCurrentlyOpen = menu.classList.contains("show")
      menu.classList.toggle("show")
      card.classList.toggle("active")

      // Animación suave
      if (!isCurrentlyOpen) {
        menu.style.display = "block"
        setTimeout(() => menu.classList.add("fade-in"), 10)
      } else {
        setTimeout(() => {
          menu.style.display = "none"
          menu.classList.remove("fade-in")
        }, 300)
      }
    } else {
      // Cerrar otros menús
      menu.classList.remove("show", "fade-in")
      card.classList.remove("active")
      setTimeout(() => {
        if (!menu.classList.contains("show")) {
          menu.style.display = "none"
        }
      }, 300)
    }
  }
}

// Función mejorada para mostrar estado de carga
function showLoading(containerId) {
  const container = document.getElementById(containerId)
  container.innerHTML = '<div class="loading">Cargando...</div>'
  container.classList.add("loading")
}

// Función para ocultar estado de carga
function hideLoading(containerId) {
  const container = document.getElementById(containerId)
  container.classList.remove("loading")
}

// Función mejorada para crear tablas
function createTable(data, containerId, columns) {
    const container = document.getElementById(containerId)
  
    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <div class="results-container">
          <i class="fas fa-info-circle" style="margin-right: 0.5rem; color: var(--warning-color);"></i>
          No se encontraron resultados
        </div>
      `
      return
    }
  
    let table = '<table class="results-table">'
  
    // Encabezados
    table += "<thead><tr>"
    columns.forEach((col) => {
      table += `<th>${col.label}</th>`
    })
    // Verificamos si hay acciones en el primer item
    const hayAcciones = data[0]?.actions && data[0].actions.length > 0
    if (hayAcciones) {
      table += "<th>Acciones</th>"
    }
    table += "</tr></thead>"
  
    // Filas de datos
    table += "<tbody>"
    data.forEach((item) => {
      table += "<tr>"
      columns.forEach((col) => {
        table += `<td>${item[col.key] || ""}</td>`
      })
  
      if (item.actions && item.actions.length > 0) {
        table += '<td><div class="table-actions">'
        item.actions.forEach((action) => {
          table += `<button class="btn btn-small ${action.class}" onclick="${action.onclick}" title="${action.title}">
            <i class="${action.icon}"></i>
          </button>`
        })
        table += "</div></td>"
      }
  
      table += "</tr>"
    })
    table += "</tbody></table>"
  
    container.innerHTML = table
  }  

// CASO 1 - Títulos más vistos (funcionalidad existente mejorada)
async function crearTitulo() {
  const semana = document.getElementById("inputSemana").value.trim()
  const titulo = document.getElementById("inputTitulo").value.trim()
  const vistas = document.getElementById("inputVistas").value.trim()
  const contenedor = document.getElementById("respuestaCaso1")

  if (!semana || !titulo || vistas === "") {
    showAlert("❌ Completá todos los campos correctamente.", "error")
    return
  }

  const vistasInt = Number(vistas)
  if (isNaN(vistasInt) || vistasInt < 0 || !Number.isInteger(vistasInt)) {
    showAlert("❌ El campo Vistas debe ser un número entero válido mayor o igual a 0.", "error")
    return
  }

  showLoading("respuestaCaso1")

  if (window.datosEdicion) {
    const { id_contenido, ano_semana: originalSemana } = window.datosEdicion

    if (semana !== originalSemana) {
      hideLoading("respuestaCaso1")
      showAlert(
        "❌ No se puede modificar el campo Año-Semana porque forma parte de la clave primaria compuesta.",
        "error",
      )
      return
    }

    try {
      const res = await fetch(`https://netflix-backend-qbml.onrender.com/caso1/${originalSemana}/${id_contenido}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ano_semana: semana, titulo, vistas: vistasInt }),
      })
      const respuesta = await res.json()

      hideLoading("respuestaCaso1")

      if (res.ok) {
        showAlert("✅ Registro modificado correctamente", "success")
        window.datosEdicion = null
        clearForm(["inputSemana", "inputTitulo", "inputVistas"])
        consultarTitulos()
      } else {
        contenedor.innerHTML = `<div class="results-container" style="color: var(--danger-color);">❌ Error al modificar: ${respuesta.detalle || respuesta.error}</div>`
      }
    } catch (error) {
      hideLoading("respuestaCaso1")
      contenedor.innerHTML =
        '<div class="results-container" style="color: var(--danger-color);">❌ Error al conectar con el backend.</div>'
      console.error(error)
    }
  } else {
    const data = { ano_semana: semana, titulo, vistas: vistasInt }
    try {
      const res = await fetch("https://netflix-backend-qbml.onrender.com/caso1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const respuesta = await res.json()
      hideLoading("respuestaCaso1")

      if (res.ok) {
        showAlert("✅ Registro agregado correctamente", "success")
        clearForm(["inputSemana", "inputTitulo", "inputVistas"])
        consultarTitulos()
      } else {
        contenedor.innerHTML = `<div class="results-container" style="color: var(--danger-color);">❌ Error: ${respuesta.detalle || respuesta.error}</div>`
      }
    } catch (error) {
      hideLoading("respuestaCaso1")
      contenedor.innerHTML =
        '<div class="results-container" style="color: var(--danger-color);">❌ Error al conectar con el backend.</div>'
      console.error(error)
    }
  }
}

async function consultarTitulos() {
  const semana = document.getElementById("inputSemanaConsulta").value.trim()
  showLoading("respuestaCaso1")

  let url = "https://netflix-backend-qbml.onrender.com/caso1"
  if (semana) {
    url += `/${semana}`
  }

  try {
    const res = await fetch(url)
    const datos = await res.json()
    hideLoading("respuestaCaso1")

    const columns = [
      { key: "ano_semana", label: "Año-Semana" },
      { key: "titulo", label: "Título" },
      { key: "vistas", label: "Vistas" },
    ]

    const actions = [
      {
        icon: "fas fa-edit",
        class: "btn-primary",
        title: "Editar",
        onclick: `cargarParaEditar('{{ano_semana}}', '{{id_contenido}}', '{{titulo}}', {{vistas}})`,
      },
      {
        icon: "fas fa-trash",
        class: "btn-danger",
        title: "Eliminar",
        onclick: `eliminarTitulo('{{ano_semana}}', '{{id_contenido}}')`,
      },
    ]

    // Procesar acciones con datos reales
    const processedData = datos.map((item) => ({
      ...item,
      actions: actions.map((action) => ({
        ...action,
        onclick: action.onclick
          .replace("{{ano_semana}}", item.ano_semana)
          .replace("{{id_contenido}}", item.id_contenido)
          .replace("{{titulo}}", item.titulo)
          .replace("{{vistas}}", item.vistas),
      })),
    }))

    createTable(processedData, "respuestaCaso1", columns)
  } catch (error) {
    hideLoading("respuestaCaso1")
    document.getElementById("respuestaCaso1").innerHTML =
      '<div class="results-container" style="color: var(--danger-color);">❌ Error al consultar.</div>'
    console.error(error)
  }
}

async function eliminarTitulo(ano_semana, id_contenido) {
  if (!showConfirm("¿Estás seguro de eliminar este registro?")) return

  try {
    const res = await fetch(`https://netflix-backend-qbml.onrender.com/caso1/${ano_semana}/${id_contenido}`, {
      method: "DELETE",
    })
    const resultado = await res.json()
    if (res.ok) {
      showAlert("🗑️ Registro eliminado correctamente", "success")
      consultarTitulos()
    } else {
      showAlert(`❌ Error al eliminar: ${resultado.detalle || resultado.error}`, "error")
    }
  } catch (error) {
    showAlert("❌ Error al eliminar", "error")
    console.error("❌ Error al eliminar:", error)
  }
}

function cargarParaEditar(ano_semana, id, titulo, vistas) {
  document.getElementById("inputSemana").value = ano_semana
  document.getElementById("inputTitulo").value = titulo
  document.getElementById("inputVistas").value = vistas
  window.datosEdicion = { id_contenido: id, ano_semana }

  // Scroll suave al formulario
  document.getElementById("inputSemana").scrollIntoView({ behavior: "smooth", block: "center" })
}

// CASO 2 - Géneros populares (funcionalidad existente mejorada)
async function crearGenero() {
  const pais = document.getElementById("inputPais").value.trim()
  const genero = document.getElementById("inputGenero").value.trim()
  const visualizaciones = document.getElementById("inputVisualizaciones").value.trim()

  if (!pais || !genero || visualizaciones === "") {
    showAlert("❌ Completá todos los campos correctamente.", "error")
    return
  }

  const visualizacionesInt = Number(visualizaciones)
  if (isNaN(visualizacionesInt) || visualizacionesInt < 0 || !Number.isInteger(visualizacionesInt)) {
    showAlert("❌ Visualizaciones debe ser un número entero mayor o igual a 0.", "error")
    return
  }

  showLoading("respuestaCaso2")

  if (window.edicionGenero) {
    const { pais: paisOriginal, genero: generoOriginal } = window.edicionGenero

    if (pais !== paisOriginal) {
      hideLoading("respuestaCaso2")
      showAlert("⚠️ No se puede modificar el país. Es parte de la clave primaria.", "warning")
      return
    }

    try {
      await fetch(`https://netflix-backend-qbml.onrender.com/caso2/${paisOriginal}/${generoOriginal}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ genero, visualizaciones: visualizacionesInt }),
      })
      hideLoading("respuestaCaso2")
      showAlert("✅ Registro actualizado correctamente", "success")
      window.edicionGenero = null
      clearForm(["inputPais", "inputGenero", "inputVisualizaciones"])
      consultarGeneros()
    } catch (error) {
      hideLoading("respuestaCaso2")
      showAlert("❌ Error al conectar con el backend.", "error")
    }
  } else {
    try {
      const res = await fetch("https://netflix-backend-qbml.onrender.com/caso2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pais, genero, visualizaciones: visualizacionesInt }),
      })
      const data = await res.json()
      hideLoading("respuestaCaso2")

      if (res.ok) {
        showAlert("✅ Registro agregado correctamente", "success")
        clearForm(["inputPais", "inputGenero", "inputVisualizaciones"])
        consultarGeneros()
      } else {
        document.getElementById("respuestaCaso2").innerHTML =
          `<div class="results-container" style="color: var(--danger-color);">❌ Error: ${data.detalle || data.error}</div>`
      }
    } catch (error) {
      hideLoading("respuestaCaso2")
      document.getElementById("respuestaCaso2").innerHTML =
        '<div class="results-container" style="color: var(--danger-color);">❌ Error al conectar con el backend.</div>'
    }
  }
}

async function consultarGeneros() {
  const pais = document.getElementById("inputPaisConsulta").value.trim()
  showLoading("respuestaCaso2")

  let url = "https://netflix-backend-qbml.onrender.com/caso2"
  if (pais) url += `/${pais}`

  try {
    const res = await fetch(url)
    const datos = await res.json()
    hideLoading("respuestaCaso2")

    const columns = [
      { key: "pais", label: "País" },
      { key: "genero", label: "Género" },
      { key: "visualizaciones", label: "Visualizaciones" },
    ]

    const actions = [
        {
          icon: "fas fa-trash",
          class: "btn-danger",
          title: "Eliminar",
          onclick: `eliminarGenero('{{pais}}', '{{genero}}', {{visualizaciones}})`,
        },
    ]

    const processedData = datos.map((item) => ({
      ...item,
      actions: actions.map((action) => ({
        ...action,
        onclick: action.onclick
          .replace("{{pais}}", item.pais)
          .replace("{{genero}}", encodeURIComponent(item.genero))
          .replace("{{visualizaciones}}", item.visualizaciones),
      })),
    }))

    createTable(processedData, "respuestaCaso2", columns)
  } catch (error) {
    hideLoading("respuestaCaso2")
    document.getElementById("respuestaCaso2").innerHTML =
      '<div class="results-container" style="color: var(--danger-color);">❌ Error al consultar.</div>'
  }
}

async function eliminarGenero(pais, genero, visualizaciones) {
    const confirmacion = confirm(`¿Eliminar el género "${genero}" del país "${pais}" con ${visualizaciones} visualizaciones?`);
    if (!confirmacion) return;
  
    try {
      const res = await fetch(`https://netflix-backend-qbml.onrender.com/caso2/${pais}/${visualizaciones}/${encodeURIComponent(genero)}`, {
        method: 'DELETE'
      });
      const resultado = await res.json();
      if (res.ok) {
        alert('🗑️ Registro eliminado correctamente');
        consultarGeneros(); // recarga la tabla
      } else {
        alert(`❌ Error al eliminar: ${resultado.detalle || resultado.error}`);
      }
    } catch (error) {
      console.error('❌ Error al eliminar:', error);
      alert('❌ Error al conectar con el servidor.');
    }
  }

function cargarGeneroParaEditar(pais, genero, visualizaciones) {
  document.getElementById("inputPais").value = pais
  document.getElementById("inputGenero").value = genero
  document.getElementById("inputVisualizaciones").value = visualizaciones
  window.edicionGenero = { pais, genero }

  // Scroll suave al formulario
  document.getElementById("inputPais").scrollIntoView({ behavior: "smooth", block: "center" })
}

// Funciones auxiliares mejoradas
function showAlert(message, type = "info") {
  // Crear elemento de alerta
  const alert = document.createElement("div")
  alert.className = `alert alert-${type}`
  alert.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 0.5rem;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 400px;
    box-shadow: var(--shadow-lg);
    animation: slideInRight 0.3s ease;
  `

  // Colores según el tipo
  const colors = {
    success: "#10b981",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  }

  alert.style.backgroundColor = colors[type] || colors.info
  alert.textContent = message

  document.body.appendChild(alert)

  // Remover después de 4 segundos
  setTimeout(() => {
    alert.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => alert.remove(), 300)
  }, 4000)
}

function showConfirm(message) {
  return confirm(message)
}

function clearForm(fieldIds) {
  fieldIds.forEach((id) => {
    const field = document.getElementById(id)
    if (field) field.value = ""
  })
}

// Agregar estilos para las animaciones de alertas
const alertStyles = document.createElement("style")
alertStyles.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOutRight {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
`
document.head.appendChild(alertStyles)
