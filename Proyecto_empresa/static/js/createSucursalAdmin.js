document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formSucursal").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        let formData = new FormData();
        formData.append("nombre", document.getElementById("nombreSucursal").value);
        formData.append("email", document.getElementById("emailSucursal").value);
        formData.append("telefono", document.getElementById("telefonoSucursal").value);
        formData.append("direccion", document.getElementById("direccionSucursalInput").value);
        formData.append("password", document.getElementById("passwordSucursal").value);
        formData.append("ciudad", document.getElementById("ciudadSucursal").value);
        formData.append("departamento", document.getElementById("departamentoSucursal").value);
        formData.append("codigo_postal", document.getElementById("codigoPostalSucursal").value);
        formData.append("pais", document.getElementById("paisSucursal").value);
        formData.append("activo", document.getElementById("activoSucursal").value);

        fetch("/registrarSucursal", {
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
                    let modal = bootstrap.Modal.getInstance(document.getElementById('modalSucursal'));
                    if (modal) {
                        modal.hide();
                    }
                    cargarSucursales(); // Recargar la tabla de sucursales
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
