document.addEventListener("DOMContentLoaded", async function () {
    mostrarSpinner(true);
    await cargarEmpleados();
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

async function cargarEmpleados() {
    try {
        const response = await fetch("/obtenerEmpleados");
        const Empleados = await response.json();
        mostrarEmpleadosEnTabla(Empleados);
    } catch (error) {
        console.error("Error al obtener Empleados:", error);
    }
}
function mostrarEmpleadosEnTabla(empleados) {
    const tabla = $("#tablaEmpleados").DataTable(); // Inicializar DataTables

    tabla.clear(); // Limpiar la tabla antes de agregar nuevos datos

    empleados.forEach((empleado, index) => {
        let estado = empleado.activo == 1 ? "Sí" : "No";

        tabla.row.add([
            index + 1, // #
            empleado.nombres + " " + empleado.apellidos, // Nombre completo
            empleado.email, // Correo
            empleado.telefono, // Teléfono
            empleado.sucursal_nombre, // Sucursal
            empleado.cargo, // Cargo
            estado, // Estado (Activo o No)
            empleado.fecha_contratacion, // Fecha de contratación
            `<button class="btn btn-outline-primary btn-sm" onclick="editarEmpleado(${empleado.idEmpleado})">
                <i class="fas fa-edit"></i> Editar
            </button>`
        ]);
    });

    tabla.draw(); // Redibujar DataTables con los nuevos datos
}



// Inicializar DataTables al cargar la página
$(document).ready(function () {
    $("#tablaEmpleados").DataTable({
        "responsive": true,
        "autoWidth": false,
        "pageLength": 10, // Mostrar 5 elementos por página
        "language": {
            "lengthMenu": "Mostrar _MENU_ registros por página",
            "zeroRecords": "No hay Empleados disponibles",
            "info": "Mostrando _START_ a _END_ de _TOTAL_ productos",
            "infoEmpty": "No hay Empleados para mostrar",
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


async function obtenerEmpleados() {
    try {
        const response = await fetch('/obtenerEmpleados');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener Empleados:', error);
        return [];
    }
}
async function editarEmpleado(idEmpleado) {
    mostrarSpinner(true);

    try {
        let empleados = await obtenerEmpleados();
        if (!empleados) throw new Error("No se pudieron obtener empleados.");

        let empleado = empleados.find(i => i.idEmpleado === idEmpleado);
        if (!empleado) throw new Error(`No se encontró el empleado con id ${idEmpleado}`);

        // Llenar los campos del formulario con los datos del empleado
        document.getElementById('editIdEmpleado').value = empleado.idEmpleado;
        document.getElementById('editNombreEmpleado').value = empleado.nombres;
        document.getElementById('editApellidoEmpleado').value = empleado.apellidos;
        document.getElementById('editEmailEmpleado').value = empleado.email;
        document.getElementById('editTelefonoEmpleado').value = empleado.telefono;
        document.getElementById('editActivoEmpleado').value = empleado.activo;

        // Dirección
        document.getElementById('editDireccionEmpleado').value = empleado.direccion;
        document.getElementById('editCiudadEmpleado').value = empleado.ciudad;
        document.getElementById('editDepartamentoEmpleado').value = empleado.departamento;
        document.getElementById('editCodigoPostalEmpleado').value = empleado.codigo_postal;
        document.getElementById('editPaisEmpleado').value = empleado.pais;

        // Detalles del empleo
        document.getElementById('editarIdSucursalEmpleado').value = empleado.idSucursal;
        document.getElementById('editCargoEmpleado').value = empleado.cargo;
        document.getElementById('editSalarioEmpleado').value = empleado.salario;
        document.getElementById('editFechaContratacion').value = empleado.fecha_contratacion;

        mostrarSpinner(false);

        // Mostrar el modal de edición
        let modal = new bootstrap.Modal(document.getElementById('modalEditarEmpleado'));
        modal.show();
    } catch (error) {
        console.error("Error en editarEmpleado:", error);
        mostrarSpinner(false);
    }
}
async function guardarEdicionEmpleado() {
    let formData = {
        idEmpleado: document.getElementById("editIdEmpleado").value,
        nombre: document.getElementById("editNombreEmpleado").value,
        apellido: document.getElementById("editApellidoEmpleado").value,
        email: document.getElementById("editEmailEmpleado").value,
        telefono: document.getElementById("editTelefonoEmpleado").value,
        activo: parseInt(document.getElementById("editActivoEmpleado").value), // Convertir a número

        // Dirección
        direccion: document.getElementById("editDireccionEmpleado").value,
        ciudad: document.getElementById("editCiudadEmpleado").value,
        departamento: document.getElementById("editDepartamentoEmpleado").value,
        codigo_postal: document.getElementById("editCodigoPostalEmpleado").value,
        pais: document.getElementById("editPaisEmpleado").value,

        // Detalles del empleo
        idSucursal: document.getElementById("editarIdSucursalEmpleado").value,
        cargo: document.getElementById("editCargoEmpleado").value,
        salario: parseFloat(document.getElementById("editSalarioEmpleado").value), // Convertir a número
        fecha_contratacion: document.getElementById("editFechaContratacion").value
    };

    console.log("Enviando datos para actualizar el empleado:", formData);

    try {
        // Mostrar SweetAlert2 con Spinner
        Swal.fire({
            title: "Actualizando...",
            text: "Por favor, espera mientras se actualiza el empleado.",
            allowOutsideClick: false,
            allowEscapeKey: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        let response = await fetch('/updateEmpleado', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData)
        });

        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);

        let resultado = await response.json();

        if (resultado.success) {
            // Cerrar el modal después de la edición
            let modal = bootstrap.Modal.getInstance(document.getElementById('modalEditarEmpleado'));
            if (modal) modal.hide();

            await cargarEmpleados(); // Recargar la tabla

            Swal.fire({
                icon: "success",
                title: "Empleado actualizado",
                text: "El empleado ha sido actualizado correctamente.",
                timer: 2000,
                showConfirmButton: false
            });
        } else {
            throw new Error(resultado.error || "Ocurrió un problema al actualizar el empleado.");
        }
    } catch (error) {
        console.error("Error al actualizar el empleado:", error);
        Swal.fire({
            icon: "error",
            title: "Error de conexión",
            text: error.message || "No se pudo actualizar el empleado. Inténtalo nuevamente."
        });
    }
}
