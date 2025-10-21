import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initHistoryPage } from '../Handlers/Panel/historyHandler.js';
import { initNotificationModal } from '../notification.js';
import { getStatus } from '../APIs/StatusApi.js';

/**
 * Rellena el dropdown de filtros de estado SOLO con estados de historial
 */
function rellenarFiltroDeEstados(estados) {
    const selectFiltro = document.getElementById('history-status-filter');
    if (!selectFiltro) return;

    // ===== ¡LÓGICA CORREGIDA! =====
    // Filtramos SOLO los estados que pertenecen al historial (ID 4 y 5)
    // (Asumiendo 4='Entregado/Delivery', 5='Cerrado/Closed')
    const estadosDelHistorial = estados.filter(estado => estado.id === 4 || estado.id === 5);

    estadosDelHistorial.forEach(estado => {
        const option = document.createElement('option');
        option.value = estado.id;
        option.textContent = estado.name;
        selectFiltro.appendChild(option);
    });
}

document.addEventListener('DOMContentLoaded', async () => {
    initAdminNav();
    initNotificationModal();
    
    // Cargar datos de estados
    const listaDeEstados = await getStatus();
    rellenarFiltroDeEstados(listaDeEstados); // Rellenar solo con 4 y 5
    
    initHistoryPage(); 
});