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

$(document).ready(function() {
    $('#ordersTable').DataTable();
});
const ordersChartCtx = document.getElementById('ordersChart').getContext('2d');
new Chart(ordersChartCtx, {
    type: 'bar',
    data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        datasets: [{
            label: 'Pedidos',
            data: [10, 15, 8, 12, 20],
            backgroundColor: '#1e2a38'
        }]
    }
});
const revenueChartCtx = document.getElementById('revenueChart').getContext('2d');
new Chart(revenueChartCtx, {
    type: 'line',
    data: {
        labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'],
        datasets: [{
            label: 'Ingresos ($)',
            data: [200, 250, 180, 220, 300],
            borderColor: '#17a2b8',
            fill: false
        }]
    }
});