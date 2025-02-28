document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formCliente").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        let formData = new FormData();
        formData.append("nombre", document.getElementById("nombreCliente").value);
        formData.append("apellido", document.getElementById("apellidoCliente").value);
        formData.append("email", document.getElementById("emailCliente").value);
        formData.append("telefono", document.getElementById("telefonoCliente").value);
        formData.append("direccion", document.getElementById("direccionClienteInput").value);
        formData.append("departamento", document.getElementById("departamentoCliente").value);
        formData.append("ciudad", document.getElementById("ciudadCliente").value);
        

        fetch("/registrarCliente", {
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
                    let modal = bootstrap.Modal.getInstance(document.getElementById('modalCliente'));
                    if (modal) {
                        modal.hide();
                    }
                    cargarClientes(); // Recargar la tabla
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