document.addEventListener("DOMContentLoaded", async function () {
    mostrarSpinner(true);
    await cargarSucursales();
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

async function cargarSucursales() {
    try {
        const response = await fetch("/obtenerSucursales");
        const Sucursales = await response.json();
        mostrarSucursalesEnTabla(Sucursales);
    } catch (error) {
        console.error("Error al obtener Sucursales:", error);
    }
}

function mostrarSucursalesEnTabla(sucursales) {
    const tabla = $("#tablaSucursales").DataTable(); // Inicializar DataTables

    tabla.clear(); // Limpiar la tabla antes de agregar nuevos datos

    sucursales.forEach((sucursal, index) => {

        let estado = sucursal.activo == 1 ? "Sí" : "No"; // Corrección del operador de asignación a comparación

        tabla.row.add([
            index + 1,
            sucursal.nombre,
            sucursal.direccion,
            sucursal.telefono,
            sucursal.email,
            sucursal.ciudad,
            sucursal.pais,
            sucursal.departamento,
            estado,
            sucursal.fecha_creacion,
            `<button class="btn btn-outline-info btn-sm" onclick="editarSucursal(${sucursal.id})">✏️</button>`
        ]);
    });

    tabla.draw(); // Redibujar DataTables con los nuevos datos
}


// Inicializar DataTables al cargar la página
$(document).ready(function () {
    $("#tablaSucursales").DataTable({
        "responsive": true,
        "autoWidth": false,
        "pageLength": 10, // Mostrar 5 elementos por página
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No hay Sucursales disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ productos",
            "infoEmpty": "No hay Sucursales para mostrar",
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


async function obtenerSucursales() {
    try {
        const response = await fetch('/obtenerSucursales');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener Sucursales:', error);
        return [];
    }
}
async function editarSucursal(idSucursal) {
    mostrarSpinner(true);
    let sucursales = await obtenerSucursales();

    if (!sucursales) {
        console.error("Error: No se pudieron obtener sucursales.");
        return;
    }

    let sucursal = sucursales.find(i => i.id === idSucursal);

    if (!sucursal) {
        console.error(`Error: No se encontró la sucursal con id ${idSucursal}`);
        return;
    }
    // Llenar los campos del formulario con los datos de la Sucursal
    document.getElementById('editIdSucursal').value = sucursal.id;
    document.getElementById('editNombreSucursal').value = sucursal.nombre;
    document.getElementById('editEmailSucursal').value = sucursal.email;
    document.getElementById('editTelefonoSucursal').value = sucursal.telefono;
    document.getElementById('editActivoSucursal').value = sucursal.activo; // Nuevo campo agregado

    // Dirección
    document.getElementById('editDireccionSucursalInput').value = sucursal.direccion;
    document.getElementById('editCiudadSucursal').value = sucursal.ciudad;
    document.getElementById('editEstadoSucursal').value = sucursal.departamento; // Reemplaza departamento
    document.getElementById('editCodigoPostalSucursal').value = sucursal.codigo_postal; // Nuevo campo agregado
    document.getElementById('editPaisSucursal').value = sucursal.pais; // Nuevo campo agregado



    mostrarSpinner(false);
    // Mostrar el modal
    let modal = new bootstrap.Modal(document.getElementById('modalEditarSucursal'));
    modal.show();
}
async function guardarEdicionSucursal() {
    let formData = {
        idSucursal: document.getElementById("editIdSucursal").value,
        nombre: document.getElementById("editNombreSucursal").value,
        email: document.getElementById("editEmailSucursal").value,
        telefono: document.getElementById("editTelefonoSucursal").value,
        activo: document.getElementById("editActivoSucursal").value, // Nuevo campo agregado
    
        // Dirección
        direccion: document.getElementById("editDireccionSucursalInput").value,
        ciudad: document.getElementById("editCiudadSucursal").value,
        departamento: document.getElementById("editEstadoSucursal").value, // Reemplaza departamento
        codigo_postal: document.getElementById("editCodigoPostalSucursal").value, // Nuevo campo agregado
        pais: document.getElementById("editPaisSucursal").value // Nuevo campo agregado
    };
    console.log("Error al actualizar la Sucursal:", formData);

    try {
        // Mostrar un spinner con SweetAlert2 mientras se actualiza la Sucursal
        Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera mientras se actualiza la sucursal.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await fetch('/updateSucursal', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        let resultado = await response.json();
        
        if (resultado.success) {
            // Cerrar el modal después de la edición
            let modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarSucursal'));
            if (modal) {
                modal.hide();
            }

            await cargarSucursales(); // Recargar la tabla

            Swal.fire({
                icon: "success",
                title: "Sucursal actualizado",
                text: "El Sucursal ha sido actualizado correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            Swal.fire({
                icon: "error",
                title: "Error al actualizar",
                text: resultado.error || "Ocurrió un problema al actualizar la sucursal."
            });
        }
    } catch (error) {
        console.error("Error al actualizar la Sucursal:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: "No se pudo actualizar la sucursal. Inténtalo nuevamente."
        });
    }
}
