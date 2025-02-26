document.addEventListener("DOMContentLoaded", async function () {
    mostrarSpinner(true);
    await cargarProductos();
    mostrarSpinner(false);
});

function mostrarSpinner(mostrar) {
    let spinnerOverlay = document.getElementById("spinnerOverlay");

    if (mostrar) {
        if (!spinnerOverlay) {
            spinnerOverlay = document.createElement("div");
            spinnerOverlay.id = "spinnerOverlay";
            spinnerOverlay.innerHTML = `
                <div class="spinner-container">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Cargando...</span>
                    </div>
                </div>`;
            document.body.appendChild(spinnerOverlay);
        }
        spinnerOverlay.style.display = "flex";
    } else {
        if (spinnerOverlay) {
            spinnerOverlay.style.display = "none";
        }
    }
}

async function cargarProductos() {
    try {
        const response = await fetch("/getProductos");
        const productos = await response.json();
        mostrarProductosEnTabla(productos);
    } catch (error) {
        console.error("Error al obtener productos:", error);
    }
}

function mostrarProductosEnTabla(productos) {
    const tabla = $("#tablaProductos").DataTable(); // Inicializar DataTables

    tabla.clear(); // Limpiar la tabla antes de agregar nuevos datos

    productos.forEach((producto, index) => {
        const estadoTexto = producto.estado === "Inactivo" ? "Inactivo" : "Activo";

        // Determinar el botón según el estado, enviando también el estado actual
        const botonEstado = producto.estado === "Inactivo"
            ? `<button class="btn btn-success btn-sm" onclick="cambiarEstado(${producto.idProducto}, '${estadoTexto}')">✔️</button>`
            : `<button class="btn btn-danger btn-sm" onclick="cambiarEstado(${producto.idProducto}, '${estadoTexto}')">❌</button>`;

        tabla.row.add([
            index + 1,
            producto.titulo,
            producto.descripcion,
            `$${producto.precioVenta.toFixed(2)}`,
            producto.oferta ? `$${producto.precioOferta.toFixed(2)}` : `$${producto.precioVenta.toFixed(2)}`,
            estadoTexto, // Estado visible en la tabla
            `<button class="btn btn-warning btn-sm" onclick="editarProducto(${producto.idProducto})">✏️</button>
             ${botonEstado}` // Botón dinámico con estado incluido
        ]);
    });

    tabla.draw(); // Redibujar DataTables con los nuevos datos
}


// Inicializar DataTables al cargar la página
$(document).ready(function () {
    $("#tablaProductos").DataTable({
        "responsive": true,
        "autoWidth": false,
        "pageLength": 10,
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No hay productos disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ productos",
            "infoEmpty": "No hay productos para mostrar",
            "infoFiltered": "(filtrado de _MAX_ registros en total)",
            "search": "Buscar:",
            "paginate": {
                "first": "Primero",
                "last": "Último",
                "next": "Siguiente",
                "previous": "Anterior"
            }
        }
    });

    // Agregar margen inferior al input de búsqueda
    $('.dataTables_filter').addClass('mb-3');
});



async function obtenerProductos() {
    try {
        const response = await fetch('/getProductos');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}
async function editarProducto(idProducto) {
    mostrarSpinner(true);
    let productos = await obtenerProductos();

    if (!productos) {
        console.error("Error: No se pudieron obtener productos.");
        return;
    }

    let producto = productos.find(p => p.idProducto === idProducto);

    if (!producto) {
        console.error(`Error: No se encontró el producto con id ${idProducto}`);
        return;
    }

    // Obtener la ruta de la imagen
    let rutaImagen = `../static/img/productos/${producto.img.split('/').pop()}`;

    // Llenar los campos del formulario con los datos del producto
    document.getElementById('editIdProducto').value = producto.idProducto;
    document.getElementById('editTitulo').value = producto.titulo;
    document.getElementById('editDescripcion').value = producto.descripcion;
    document.getElementById('editPrecioVenta').value = producto.precioVenta;
    document.getElementById('editPrecioProduccion').value = producto.precioProduccion;
    document.getElementById('editOferta').checked = producto.oferta;
    document.getElementById('editPrecioOferta').value = producto.precioOferta || '';
    document.getElementById('editFecha').value = producto.fechaCreat;
    document.getElementById('editImagen').src = rutaImagen;

    // Manejar la vista previa de la nueva imagen
    document.getElementById('editNuevaImagen').addEventListener('change', (event) => {
        let file = event.target.files[0];
        if (file) {
            let reader = new FileReader();
            reader.onload = function (e) {
                document.getElementById('editImagen').src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    mostrarSpinner(false);
    // Mostrar el modal
    let modal = new bootstrap.Modal(document.getElementById('modalEditarProducto'));
    modal.show();
}

async function guardarEdicionProducto() {
    let formDataa = new FormData();
    
    formDataa.append("idProducto", document.getElementById('editIdProducto').value);
    formDataa.append("titulo", document.getElementById('editTitulo').value);
    formDataa.append("descripcion", document.getElementById('editDescripcion').value);
    formDataa.append("precioVenta", document.getElementById('editPrecioVenta').value);
    formDataa.append("precioProduccion", document.getElementById('editPrecioProduccion').value);
    formDataa.append("oferta", document.getElementById('editOferta').checked ? 1 : 0);
    formDataa.append("precioOferta", document.getElementById('editPrecioOferta').value);
    formDataa.append("fechaCreacion", document.getElementById('editFecha').value);

    let nuevaImagen = document.getElementById('editNuevaImagen').files[0];
    if (nuevaImagen) {
        formDataa.append("nuevaImagen", nuevaImagen);
    }

    try {
        // Mostrar un spinner con SweetAlert2 mientras se actualiza el producto
        Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera mientras se actualiza el producto.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await fetch('/updateProducto', {
            method: "POST",
            body: formDataa
        });

        let resultado = await response.json();
        
        if (resultado.success) {
            // Cerrar el modal después de la edición
            let modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarProducto'));
            if (modal) {
                modal.hide();
            }

            await cargarProductos(); // Recargar la tabla

            Swal.fire({
                icon: "success",
                title: "Producto actualizado",
                text: "El producto ha sido actualizado correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: resultado.error || "Ocurrió un problema al actualizar el producto."
            });
        }
    } catch (error) {
        console.error("Error al actualizar el producto:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo actualizar el producto. Inténtalo nuevamente."
        });
    }
}

async function cambiarEstado(idProducto, estadoActual) {
    const nuevoEstado = estadoActual === "Activo" ? "Inactivo" : "Activo";

    const confirmacion = await Swal.fire({
        title: `¿Seguro que deseas cambiar el estado?`,
        text: `El producto pasará a estado ${nuevoEstado}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Sí, cambiar a ${nuevoEstado}`,
        cancelButtonText: "Cancelar"
    });

    if (!confirmacion.isConfirmed) return;

    try {
        const respuesta = await fetch("/cambiarEstado", {
            method: "POST",  
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idProducto, nuevoEstado }) // Enviamos también el nuevo estado
        });

        const resultado = await respuesta.json();

        if (resultado.success) {
            await Swal.fire({
                title: "Estado actualizado",
                text: `El producto ahora está ${nuevoEstado}.`,
                icon: "success",
                timer: 2000,
                showConfirmButton: false
            });
            mostrarSpinner(true);
            await cargarProductos(); // Recargar la tabla
            mostrarSpinner(false);

        } else {
            throw new Error(resultado.error);
        }
    } catch (error) {
        await Swal.fire({
            title: "Error",
            text: "No se pudo cambiar el estado: " + error.message,
            icon: "error"
        });
    }
}
