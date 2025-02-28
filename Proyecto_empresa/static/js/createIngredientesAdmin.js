document.addEventListener("DOMContentLoaded", function () {
    cargarProveedores(); // Cargar proveedores en ambos selects

    document.getElementById("formIngrediente").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        let formData = new FormData();
        
        formData.append("nombreIngrediente", document.getElementById("nombreIngrediente").value);
        formData.append("unidadMedidaIngrediente", document.getElementById("unidadMedidaIngrediente").value);
        formData.append("PrecioIngrediente", document.getElementById("PrecioIngrediente").value);
        formData.append("proveedorIngrediente", document.getElementById("proveedorIngrediente").value);
        formData.append("fechaCompraIngrediente", document.getElementById("fechaCompraIngrediente").value);
        formData.append("fechaCaducidadIngrediente", document.getElementById("fechaCaducidadIngrediente").value);

        fetch("/registrarIngrediente", {
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

// Función para cargar proveedores en ambos selects
function cargarProveedores() {
    fetch("/getProveedores")
        .then(response => response.json())
        .then(proveedores => {
            let selects = [
                document.getElementById("proveedorIngrediente"),
                document.getElementById("editarProveedorIngrediente")
            ];

            selects.forEach(select => {
                if (select) { // Verifica que el select exista
                    select.innerHTML = '<option value="">Seleccione un proveedor</option>'; // Limpia opciones

                    proveedores.forEach(proveedor => {
                        let option = document.createElement("option");
                        option.value = proveedor.idProveedor; // Asigna el id como value
                        option.textContent = proveedor.nombre; // Muestra el nombre
                        select.appendChild(option);
                    });
                }
            });
        })
        .catch(error => {
            console.error("Error cargando proveedores:", error);
        });
}
