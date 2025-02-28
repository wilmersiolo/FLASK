document.addEventListener("DOMContentLoaded", async function () {
    mostrarSpinner(true);
    await cargarClientes();
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

async function cargarClientes() {
    try {
        const response = await fetch("/obtenerClientes");
        const Clientes = await response.json();
        mostrarClientesEnTabla(Clientes);
    } catch (error) {
        console.error("Error al obtener Clientes:", error);
    }
}

function mostrarClientesEnTabla(clientes) {
    const tabla = $("#tablaClientes").DataTable(); // Inicializar DataTables

    tabla.clear(); // Limpiar la tabla antes de agregar nuevos datos

    clientes.forEach((cliente, index) => {

        tabla.row.add([
            index + 1,
            cliente.nombre,
            cliente.apellido,
            cliente.email,
            cliente.telefono,
            cliente.direccion,
            cliente.ciudad,
            cliente.departamento,
            cliente.fecha_registro,
            `<button class="btn btn-outline-info btn-sm" onclick="editarCliente(${cliente.idCliente})">✏️</button>`
        ]);
    });

    tabla.draw(); // Redibujar DataTables con los nuevos datos
}


// Inicializar DataTables al cargar la página
$(document).ready(function () {
    $("#tablaClientes").DataTable({
        "responsive": true,
        "autoWidth": false,
        "pageLength": 10, // Mostrar 5 elementos por página
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No hay Clientes disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ productos",
            "infoEmpty": "No hay Clientes para mostrar",
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


async function obtenerClientes() {
    try {
        const response = await fetch('/obtenerClientes');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener Clientes:', error);
        return [];
    }
}
async function editarCliente(idCliente) {
    mostrarSpinner(true);
    let clientes = await obtenerClientes();

    if (!clientes) {
        console.error("Error: No se pudieron obtener Clientes.");
        return;
    }

    let cliente = clientes.find(i => i.idCliente === idCliente);

    if (!cliente) {
        console.error(`Error: No se encontró el Cliente con id ${idCliente}`);
        return;
    }

    // Llenar los campos del formulario con los datos del Cliente
    document.getElementById('editIdCliente').value = cliente.idCliente;
    document.getElementById('editNombreCliente').value = cliente.nombre;
    document.getElementById('editApellidoCliente').value = cliente.apellido;
    document.getElementById('editEmailCliente').value = cliente.email;
    document.getElementById('editTelefonoCliente').value = cliente.telefono;
    document.getElementById('editDireccionClienteInput').value = cliente.direccion;
    document.getElementById('editCiudadCliente').value = cliente.ciudad;
    document.getElementById('editDepartamentoCliente').value = cliente.departamento;


    mostrarSpinner(false);
    // Mostrar el modal
    let modal = new bootstrap.Modal(document.getElementById('modalEditarCliente'));
    modal.show();
}
async function guardarEdicionCliente() {
    let formData = {
        idCliente: document.getElementById("editIdCliente").value,
        nombre: document.getElementById("editNombreCliente").value,
        apellido: document.getElementById("editApellidoCliente").value,
        email: document.getElementById("editEmailCliente").value,
        telefono: document.getElementById("editTelefonoCliente").value,
        direccion: document.getElementById("editDireccionClienteInput").value,
        ciudad: document.getElementById("editCiudadCliente").value,
        departamento: document.getElementById("editDepartamentoCliente").value
    };

    try {
        // Mostrar un spinner con SweetAlert2 mientras se actualiza el Cliente
        Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera mientras se actualiza el Cliente.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await fetch('/updateCliente', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        let resultado = await response.json();
        
        if (resultado.success) {
            // Cerrar el modal después de la edición
            let modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarCliente'));
            if (modal) {
                modal.hide();
            }

            await cargarClientes(); // Recargar la tabla

            Swal.fire({
                icon: "success",
                title: "Cliente actualizado",
                text: "El Cliente ha sido actualizado correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: resultado.error || "Ocurrió un problema al actualizar el Cliente."
            });
        }
    } catch (error) {
        console.error("Error al actualizar el Cliente:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo actualizar el Cliente. Inténtalo nuevamente."
        });
    }
}
