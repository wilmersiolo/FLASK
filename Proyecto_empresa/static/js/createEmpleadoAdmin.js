document.addEventListener("DOMContentLoaded", function () {
    cargarSucursales(); // Cargar sucursales en ambos selects

    document.getElementById("formEmpleado").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        let formData = new FormData();
        
        formData.append("nombreEmpleado", document.getElementById("nombreEmpleado").value);
        formData.append("apellidoEmpleado", document.getElementById("apellidoEmpleado").value);
        formData.append("emailEmpleado", document.getElementById("emailEmpleado").value);
        formData.append("telefonoEmpleado", document.getElementById("telefonoEmpleado").value);
        formData.append("direccionEmpleado", document.getElementById("direccionEmpleado").value);
        formData.append("paisEmpleado", document.getElementById("paisEmpleado").value);
        formData.append("departamentoEmpleado", document.getElementById("departamentoEmpleado").value);
        formData.append("ciudadEmpleado", document.getElementById("ciudadEmpleado").value);
        formData.append("codigoPostalEmpleado", document.getElementById("codigoPostalEmpleado").value);
        formData.append("idSucursalEmpleado", document.getElementById("idSucursalEmpleado").value);
        formData.append("cargoEmpleado", document.getElementById("cargoEmpleado").value);
        formData.append("fechaContratacionEmpleado", document.getElementById("fechaContratacionEmpleado").value);
        formData.append("passwordEmpleado", document.getElementById("passwordEmpleado").value);
        formData.append("salarioEmpleado", document.getElementById("salarioEmpleado").value);
        formData.append("activoEmpleado", document.getElementById("activoEmpleado").value);

        fetch("/registrarEmpleado", {
            method: "POST",
            body: formData // Se envía como multipart/form-data
        })
        .then(response => response.json())
        .then(data => {
            if (data.mensaje) {
                Swal.fire({
                    title: "¡Registro Exitoso!",
                    text: data.mensaje,
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false
                }).then(() => {
                    let modal = bootstrap.Modal.getInstance(document.getElementById('modalIngrediente'));
                    if (modal) {
                        modal.hide();
                    }
                    cargarIngredientes(); // Recargar la tabla
                });
            } else {
                Swal.fire("Error", data.error, "error");
            }
        })
        .catch(error => {
            Swal.fire("Error", "Hubo un problema en el servidor", "error");
        });
    });
});

// Función para cargar sucursales en ambos selects
function cargarSucursales() {
    fetch("/obtenerSucursales")
        .then(response => response.json())
        .then(sucursales => {
            let selects = [
                document.getElementById("idSucursalEmpleado"),
                document.getElementById("editarIdSucursalEmpleado")
            ];

            selects.forEach(select => {
                if (select) { // Verifica que el select exista
                    select.innerHTML = '<option value="">Seleccione una sucursal</option>'; // Limpia opciones

                    sucursales.forEach(sucursal => {
                        let option = document.createElement("option");
                        option.value = sucursal.id; // Asigna el id como value
                        option.textContent = sucursal.nombre; // Muestra el nombre
                        select.appendChild(option);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error cargando sucursales:", error);
        });
}
