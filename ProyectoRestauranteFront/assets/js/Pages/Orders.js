import { initOrdersPage } from '../Handlers/Orders/ordersHandler.js';
import { initNotificationModal } from '../notification.js';
import { getStatus } from '../APIs/StatusApi.js'; // <-- 1. Importar API

/**
 * Rellena el dropdown de filtros de estado
 */
function rellenarFiltroDeEstados(estados) {
    const selectFiltro = document.getElementById('order-status-filter');
    if (!selectFiltro) return;

    estados.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.name;
        selectFiltro.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initNotificationModal();
    
    // --- Carga de datos asíncrona ---
    const listaDeEstados = await getStatus(); // <-- 2. Llamar
    rellenarFiltroDeEstados(listaDeEstados);  // <-- 3. Rellenar
    
    initOrdersPage(); // <-- 4. Iniciar el handler (que ahora leerá los filtros)
});