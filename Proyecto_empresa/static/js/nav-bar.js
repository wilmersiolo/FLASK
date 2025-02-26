function toggleSidebar() {
    const sidebar = document.getElementById("dashboard");
    const toggleBtn = document.querySelector(".toggle-btn");

    sidebar.classList.toggle("open");
    document.body.classList.toggle("collapsed"); // Para manejar el sidebar en PC

    // Solo aplica el cambio en móviles
    if (window.innerWidth <= 768) {
        if (sidebar.classList.contains("open")) {
            toggleBtn.style.left = "85px"; // Se mueve con el menú
        } else {
            toggleBtn.style.left = "10px"; // Regresa a la izquierda
        }
    }
}
