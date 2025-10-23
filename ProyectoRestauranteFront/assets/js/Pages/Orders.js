import { initOrdersPage } from '../Handlers/Orders/ordersHandler.js';
import { initNotificationModal } from '../notification.js';
import { getStatus } from '../APIs/StatusApi.js';

/**
 * rellena el selectorde filtros de estado
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
    const listaDeEstados = await getStatus(); //llamar
    rellenarFiltroDeEstados(listaDeEstados);  //rellenar
    
    initOrdersPage();
});