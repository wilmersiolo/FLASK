const ingredientesHandler = {
    ingredientesSeleccionados: new Map(),

    async buscarIngrediente() {
        const input = document.getElementById("buscadorIngredientes").value.trim();
        const lista = document.getElementById("listaIngredientes");

        // Limpiar la lista si el input está vacío
        if (input.length === 0) {
            lista.innerHTML = "";
            return;
        }

        try {
            const response = await fetch(`/getIngrediente?search=${input}`);
            const ingredientes = await response.json();

            // Limpiar y mostrar resultados
            lista.innerHTML = "";
            const fragment = document.createDocumentFragment();

            ingredientes.forEach(({ id, nombre, unidadMedida }) => {
                const item = document.createElement("button");
                item.className = "list-group-item list-group-item-action";
                item.textContent = `${nombre} (${unidadMedida})`;
                item.onclick = () => ingredientesHandler.agregarIngrediente(id, nombre, unidadMedida);
                fragment.appendChild(item);
            });

            lista.appendChild(fragment);
        } catch (error) {
            console.error("Error al buscar ingredientes:", error);
        }
    },

    agregarIngrediente(id, nombre, unidadMedida) {
        if (!this.ingredientesSeleccionados.has(id)) {
            this.ingredientesSeleccionados.set(id, { nombre, unidadMedida, cantidad: 1 });

            this.renderIngredientes();
        }

        // Limpiar lista de búsqueda después de seleccionar
        document.getElementById("listaIngredientes").innerHTML = "";
    },

    actualizarCantidad(id, nuevaCantidad) {
        if (this.ingredientesSeleccionados.has(id)) {
            this.ingredientesSeleccionados.get(id).cantidad = nuevaCantidad;
        }
    },

    eliminarIngrediente(id) {
        this.ingredientesSeleccionados.delete(id);
        this.renderIngredientes();
    },

    renderIngredientes() {
        const contenedor = document.getElementById("ingredientesSeleccionados");
        contenedor.innerHTML = "";

        this.ingredientesSeleccionados.forEach(({ nombre, unidadMedida, cantidad }, id) => {
            const badge = document.createElement("span");
            badge.className = "badge bg-primary p-2 me-2 d-flex align-items-center";
            badge.dataset.id = id;

            badge.innerHTML = `
                ${nombre} (${unidadMedida}) 
                <input type="number" class="form-control ms-2 me-2" value="${cantidad}" min="1" style="width: 60px;" 
                    onchange="ingredientesHandler.actualizarCantidad(${id}, this.value)">
                <button type="button" class="btn-close btn-close-white" aria-label="Eliminar" 
                    onclick="ingredientesHandler.eliminarIngrediente(${id})">
                </button>
            `;

            contenedor.appendChild(badge);
        });
    }
};

// Evento de búsqueda en tiempo real
document.getElementById("buscadorIngredientes").addEventListener("input", () => ingredientesHandler.buscarIngrediente());
