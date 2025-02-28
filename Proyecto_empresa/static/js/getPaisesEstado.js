const usuarioGeoNames = "alejandrocossi"; // Usuario de Geonames

document.addEventListener("DOMContentLoaded", function () {
    inicializarFormularioEmpleado();
});

// Función para inicializar el formulario de empleados
function inicializarFormularioEmpleado() {
    cargarPaises();

    document.getElementById("paisEmpleado").addEventListener("change", function () {
        cargarEstados(this.value);
        limpiarSelect("departamentoEmpleado", "Seleccione un departamento");
        limpiarSelect("ciudadEmpleado", "Seleccione una ciudad");
    });

    document.getElementById("departamentoEmpleado").addEventListener("change", function () {
        cargarCiudades(this.value);
        limpiarSelect("ciudadEmpleado", "Seleccione una ciudad");
    });

}

// Función para limpiar y reiniciar un select
function limpiarSelect(selectId, mensajeDefault) {
    const select = document.getElementById(selectId);
    select.innerHTML = `<option value="">${mensajeDefault}</option>`;
}

// Función para cargar países
async function cargarPaises() {
    try {
        const respuesta = await fetch(`http://api.geonames.org/countryInfoJSON?username=${usuarioGeoNames}`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const datos = await respuesta.json();
        console.log("Países cargados:", datos);

        if (!datos.geonames || datos.geonames.length === 0) {
            throw new Error("No se encontraron países");
        }

        const selectPais = document.getElementById("paisEmpleado");
        limpiarSelect("paisEmpleado", "Seleccione un país");

        datos.geonames.forEach(pais => {
            const option = document.createElement("option");
            option.value = pais.geonameId;
            option.textContent = pais.countryName;
            selectPais.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar países:", error);
    }
}

// Función para cargar estados (departamentos) según el país seleccionado
async function cargarEstados(paisGeonameId) {
    if (!paisGeonameId) return;
    try {
        const respuesta = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${paisGeonameId}&username=${usuarioGeoNames}`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const datos = await respuesta.json();
        console.log("Estados cargados:", datos);

        if (!datos.geonames || datos.geonames.length === 0) {
            throw new Error("No se encontraron estados");
        }

        const selectEstado = document.getElementById("departamentoEmpleado");
        limpiarSelect("departamentoEmpleado", "Seleccione un departamento");

        datos.geonames.forEach(estado => {
            const option = document.createElement("option");
            option.value = estado.geonameId;
            option.textContent = estado.name;
            selectEstado.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar estados:", error);
    }
}

// Función para cargar ciudades según el estado seleccionado
async function cargarCiudades(estadoGeonameId) {
    if (!estadoGeonameId) return;
    try {
        const respuesta = await fetch(`http://api.geonames.org/childrenJSON?geonameId=${estadoGeonameId}&username=${usuarioGeoNames}`);
        if (!respuesta.ok) throw new Error(`Error HTTP: ${respuesta.status}`);

        const datos = await respuesta.json();
        console.log("Ciudades cargadas:", datos);

        if (!datos.geonames || datos.geonames.length === 0) {
            throw new Error("No se encontraron ciudades");
        }

        const selectCiudad = document.getElementById("ciudadEmpleado");
        limpiarSelect("ciudadEmpleado", "Seleccione una ciudad");

        datos.geonames.forEach(ciudad => {
            const option = document.createElement("option");
            option.value = ciudad.geonameId;
            option.textContent = ciudad.name;
            selectCiudad.appendChild(option);
        });
    } catch (error) {
        console.error("Error al cargar ciudades:", error);
    }
}
