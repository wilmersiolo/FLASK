document.addEventListener("DOMContentLoaded", async function () {
    mostrarSpinner(true);
    await cargarIngredientes();
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

async function cargarIngredientes() {
    try {
        const response = await fetch("/getIngredientes");
        const ingredientes = await response.json();
        mostrarIngredientesEnTabla(ingredientes);
    } catch (error) {
        console.error("Error al obtener ingredientes:", error);
    }
}

function mostrarIngredientesEnTabla(ingredientes) {
    const tabla = $("#tablaIngredientes").DataTable(); // Inicializar DataTables

    tabla.clear(); // Limpiar la tabla antes de agregar nuevos datos

    ingredientes.forEach((ingrediente, index) => {

        tabla.row.add([
            index + 1,
            ingrediente.nombre,
            ingrediente.unidad_medida,
            `$${ingrediente.precio_por_unidad.toFixed(2)}`,
            ingrediente.nombre_proveedor,
            ingrediente.fecha_compra,
            ingrediente.fecha_caducidad,
            `<button class="btn btn-outline-info btn-sm" onclick="editarIngrediente(${ingrediente.idIngrediente})">✏️</button>`
        ]);
    });

    tabla.draw(); // Redibujar DataTables con los nuevos datos
}


// Inicializar DataTables al cargar la página
$(document).ready(function () {
    $("#tablaIngredientes").DataTable({
        "responsive": true,
        "autoWidth": false,
        "pageLength": 10, // Mostrar 5 elementos por página
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No hay ingredientes disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ productos",
            "infoEmpty": "No hay ingredientes para mostrar",
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


async function obtenerIngredientes() {
    try {
        const response = await fetch('/getIngredientes');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener Ingredientes:', error);
        return [];
    }
}
async function editarIngrediente(idIngrediente) {
    mostrarSpinner(true);
    let ingredientes = await obtenerIngredientes();

    if (!ingredientes) {
        console.error("Error: No se pudieron obtener ingredientes.");
        return;
    }

    let ingrediente = ingredientes.find(i => i.idIngrediente === idIngrediente);

    if (!ingrediente) {
        console.error(`Error: No se encontró el ingrediente con id ${idIngrediente}`);
        return;
    }

    // Llenar los campos del formulario con los datos del ingrediente
    document.getElementById('idIngrediente').value = ingrediente.idIngrediente;
    document.getElementById('editarNombreIngrediente').value = ingrediente.nombre;
    document.getElementById('editarUnidadMedidaIngrediente').value = ingrediente.unidad_medida;
    document.getElementById('editarPrecioIngrediente').value = ingrediente.precio_por_unidad;
    document.getElementById('editarProveedorIngrediente').value = ingrediente.idProveedor;
    document.getElementById('editarFechaCompraIngrediente').value = ingrediente.fecha_compra;
    document.getElementById('editarFechaCaducidadIngrediente').value = ingrediente.fecha_caducidad;


    mostrarSpinner(false);
    // Mostrar el modal
    let modal = new bootstrap.Modal(document.getElementById('modalEditarIngrediente'));
    modal.show();
}

async function guardarEdicionIngrediente() {
    let formData = {
        idIngrediente: document.getElementById("idIngrediente").value,
        nombre: document.getElementById("editarNombreIngrediente").value,
        unidadMedida: document.getElementById("editarUnidadMedidaIngrediente").value,
        precio: document.getElementById("editarPrecioIngrediente").value,
        proveedor: document.getElementById("editarProveedorIngrediente").value,
        fechaCompra: document.getElementById("editarFechaCompraIngrediente").value,
        fechaCaducidad: document.getElementById("editarFechaCaducidadIngrediente").value
    };
    try {
        // Mostrar un spinner con SweetAlert2 mientras se actualiza el ingrediente
        Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera mientras se actualiza el ingrediente.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await fetch('/updateIngrediente', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        let resultado = await response.json();
        
        if (resultado.success) {
            // Cerrar el modal después de la edición
            let modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarIngrediente'));
            if (modal) {
                modal.hide();
            }

            await cargarIngredientes(); // Recargar la tabla

            Swal.fire({
                icon: "success",
                title: "Ingrediente actualizado",
                text: "El ingrediente ha sido actualizado correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: resultado.error || "Ocurrió un problema al actualizar el ingrediente."
            });
        }
    } catch (error) {
        console.error("Error al actualizar el ingrediente:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo actualizar el ingrediente. Inténtalo nuevamente."
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
            await cargarIngredientes(); // Recargar la tabla
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
