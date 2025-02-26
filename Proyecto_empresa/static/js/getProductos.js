document.addEventListener("DOMContentLoaded", function () {
    actualizarCantidadCarrito();
});

function actualizarCantidadCarrito() {
    let productos = localStorage.getItem("carrito");
    let totalCantidad = 0;

    if (productos) {
        productos = JSON.parse(productos);
        totalCantidad = productos.reduce((total, producto) => total + producto.cantidad, 0);
    }

    let badge = document.querySelector(".cantidadCarrito");
    if (badge) {
        badge.textContent = totalCantidad;
        badge.style.display = "inline-block"; // Siempre visible
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    // Mostrar el spinner
    document.getElementById('loadingOverlay').style.display = 'flex';

    try {
        const response = await fetch('/getProductos');
        const data = await response.json();
        mostrarProductosEnCarrusel(data);
    } catch (error) {
        console.error('Error al obtener productos:', error);
    } finally {
        // Ocultar el spinner después de cargar los datos
        document.getElementById('loadingOverlay').style.display = 'none';
    }
});
document.addEventListener('DOMContentLoaded', function () {
    fetch('/getProductos')
        .then(response => response.json())
        .then(data => {
            mostrarProductosEnCarrusel(data);
        })
        .catch(error => console.error('Error al obtener productos:', error));
});

function mostrarProductosEnCarrusel(productos) {
    const carouselProductos = document.getElementById('carouselProductos');
    carouselProductos.innerHTML = ''; // Limpiar carrusel

    let totalProductos = productos.length;
    let numPorGrupo = 3; // Mostrar 3 productos a la vez

    for (let i = 0; i < totalProductos; i += numPorGrupo) {
        // Crear el contenedor del slide
        const carouselItem = document.createElement('div');
        carouselItem.classList.add('carousel-item');
        if (i === 0) carouselItem.classList.add('active'); // Activar el primer grupo

        // Crear fila de productos
        const row = document.createElement('div');
        row.classList.add('row', 'justify-content-center');

        for (let j = i; j < i + numPorGrupo && j < totalProductos; j++) {
            const producto = productos[j];

            // Crear la card
            const col = document.createElement('div');
            col.classList.add('col-md-4'); // Cada producto ocupa 4 columnas

            col.innerHTML = `
                <div class="card shadow-lg" style="border-radius: 15px;">
                    <img src="${producto.img}" class="card-img-top" alt="${producto.titulo}">
                    <div class="card-body text-center">
                        <h5 class="card-title">${producto.titulo}</h5>
                        <p class="card-text">${producto.descripcion}</p>
                        <h4 class="text-success">
                            ${producto.oferta  
                                ? `<span class="text-muted text-decoration-line-through">$${producto.precioVenta}</span> 
                                <span class="text-danger fw-bold ms-2">$${producto.precioOferta}</span>` 
                                : `$${producto.precioVenta}`
                            }
                        </h4>
                        <a href="#" class="btn btn-warning w-100 mt-2" style="border-radius: 10px;" 
                        onclick="agregarAlCarrito(${producto.idProducto})">¡Ordena Ahora!</a>
                    </div>
                </div>
            `;
            row.appendChild(col);
        }

        carouselItem.appendChild(row);
        carouselProductos.appendChild(carouselItem);
    }
}
async function obtenerProductos() {
    try {
        const response = await fetch('/getProductos');
        return await response.json();
    } catch (error) {
        console.error('Error al obtener productos:', error);
        return [];
    }
}

async function agregarAlCarrito(idProducto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    let productoExistente = carrito.find(p => p.id === idProducto);
    if (productoExistente) {
        productoExistente.cantidad++;
    } else {
        carrito.push({ id: idProducto, cantidad: 1 });
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito();

    // Mostrar el modal del carrito después de agregar el producto
    let modal = new bootstrap.Modal(document.getElementById('modalCarrito'));
    modal.show();
}

async function actualizarCarrito() {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    const productos = await obtenerProductos();
    const tablaCarrito = document.getElementById('tablaCarrito');
    const totalCarrito = document.getElementById('totalCarrito');

    tablaCarrito.innerHTML = "";
    let total = 0;

    carrito.forEach(item => {
        let producto = productos.find(p => p.idProducto === item.id);
        if (producto) {
            let precio = producto.oferta ? parseFloat(producto.precioOferta) : parseFloat(producto.precioVenta);
            let subtotal = precio * item.cantidad;
            total += subtotal;
    
            let fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${producto.titulo}</td>
                <td>
                    <input type="number" min="1" value="${item.cantidad}" 
                        class="form-control cantidad-carrito" data-id="${item.id}">
                </td>
                <td>$${precio.toFixed(2)}</td>
                <td>$${subtotal.toFixed(2)}</td>
                <td>
                    <button class="btn btn-danger btn-sm" onclick="eliminarDelCarrito(${item.id})">❌</button>
                </td>
            `;
            tablaCarrito.appendChild(fila);
        }
    });
    

    totalCarrito.textContent = total.toFixed(2);

    // Agregar eventos a los inputs para modificar cantidades
    document.querySelectorAll('.cantidad-carrito').forEach(input => {
        input.addEventListener('change', (e) => {
            modificarCantidad(parseInt(e.target.dataset.id), parseInt(e.target.value));
        });
    });
    actualizarCantidadCarrito();
}
function modificarCantidad(idProducto, nuevaCantidad) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];

    let producto = carrito.find(p => p.id === idProducto);
    if (producto) {
        producto.cantidad = nuevaCantidad > 0 ? nuevaCantidad : 1;
    }

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito(); // Refrescar el carrito en la vista
    actualizarCantidadCarrito();
}
function eliminarDelCarrito(idProducto) {
    let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
    carrito = carrito.filter(p => p.id !== idProducto);

    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarCarrito(); // Actualizar vista
    actualizarCantidadCarrito();
}
function vaciarCarrito() {
    localStorage.removeItem('carrito');
    actualizarCarrito();
    actualizarCantidadCarrito();

    // Cerrar el modal después de vaciar el carrito
    let modal = bootstrap.Modal.getInstance(document.getElementById('modalCarrito'));
    if (modal) {
        modal.hide();
    }
}
