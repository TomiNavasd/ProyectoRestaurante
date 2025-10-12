import { getOrders, updateOrderItemStatus } from '../APIs/OrderApi.js';
import { renderOrderPanel } from '../Components/renderOrderPanel.js';

/**
 * Busca todas las órdenes y vuelve a "dibujar" el panel completo.
 * Se usa para la carga inicial y para refrescar después de una acción.
 */
async function refreshPanel() {
    const orders = await getOrders();
    renderOrderPanel(orders);
}

/**
 * Activa los listeners para los botones de acción del panel ('Preparar', 'Terminar').
 * Usa delegación de eventos para escuchar clics en todo el panel.
 */
function initPanelActions() {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    mainContainer.addEventListener('click', async (event) => {
        const button = event.target;
        // Si el elemento presionado no es un botón de acción, no hacemos nada.
        if (!button.classList.contains('status-action-btn')) return;
        
        // Deshabilitamos el botón para feedback visual y evitar dobles clics
        button.disabled = true;
        button.textContent = '...';

        // 1. Obtenemos los datos desde los atributos data-* del botón.
        const { orderId, itemId, newStatus } = button.dataset;

        // 2. Llamamos a la API para actualizar el estado del ítem.
        const result = await updateOrderItemStatus(orderId, itemId, newStatus);
        
        // 3. Si la actualización fue exitosa, refrescamos todo el panel para ver el cambio.
        //    Si no, mostramos un error.
        if (result && !result.error) {
            await refreshPanel();
        } else {
            alert(result.error || 'Ocurrió un error inesperado.');
            // No es necesario rehabilitar el botón, el refresh lo re-creará.
        }
    });
}

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---

/**
 * Función principal que se exporta para inicializar todos los handlers de la página del panel.
 */
export function initPanelPage() {
    // Carga la vista inicial de datos
    refreshPanel();

    // Activa los manejadores de eventos para que los botones funcionen
    initPanelActions();
    
    // Opcional: Si quieres que el panel se refresque solo cada 30 segundos
    // setInterval(refreshPanel, 30000); 
}