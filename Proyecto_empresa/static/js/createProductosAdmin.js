function mostrarVistaPrevia() {
    const input = document.getElementById('imagenProducto');
    const imgPreview = document.getElementById('previewImagen');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            imgPreview.src = e.target.result;
            imgPreview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    } else {
        imgPreview.style.display = 'none';
    }
}

function togglePrecioOferta() {
    document.getElementById('precioOferta').disabled = !document.getElementById('ofertaProducto').checked;
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("formProducto").addEventListener("submit", function (event) {
        event.preventDefault(); // Evita el envío tradicional del formulario

        let formData = new FormData();
        let imagenInput = document.getElementById("imagenProducto");

        if (imagenInput.files.length > 0) {
            formData.append("imagenProducto", imagenInput.files[0]); // Agrega la imagen
        }

        formData.append("tituloProducto", document.getElementById("tituloProducto").value);
        formData.append("precioVenta", document.getElementById("precioVenta").value);
        formData.append("precioProduccion", document.getElementById("precioProduccion").value);
        formData.append("descripcionProducto", document.getElementById("descripcionProducto").value);
        formData.append("ofertaProducto", document.getElementById("ofertaProducto").checked ? 1 : 0);
        formData.append("precioOferta", document.getElementById("precioOferta").value);
        formData.append("estadoProducto", document.getElementById("estadoProducto").value);

        fetch("/registrarProducto", {
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
                    let modal = bootstrap.Modal.getInstance(document.getElementById('modalProducto'));
                    if (modal) {
                        modal.hide();
                    }
                    cargarProductos(); // Recargar la tabla
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
