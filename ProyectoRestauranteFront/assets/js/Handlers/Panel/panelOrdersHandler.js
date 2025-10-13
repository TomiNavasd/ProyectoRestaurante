import { getOrders, updateOrderItemStatus } from '../../APIs/OrderApi.js';
import { renderOrderPanel } from '../../Components/renderOrderPanel.js';

async function refreshOrderPanel() {
    const orders = await getOrders();
    renderOrderPanel(orders);
}

function initOrderActions() {
    const mainContainer = document.querySelector('main');
    if (!mainContainer) return;

    mainContainer.addEventListener('click', async (event) => {
        const button = event.target;
        if (!button.classList.contains('status-action-btn')) return;
        
        button.disabled = true;
        button.textContent = '...';

        const { orderId, itemId, newStatus } = button.dataset;
        const result = await updateOrderItemStatus(orderId, itemId, newStatus);
        
        if (result && !result.error) {
            await refreshOrderPanel(); // Refresca solo el panel de órdenes
        } else {
            alert(result.error || 'Ocurrió un error inesperado.');
        }
    });
}

// Exportamos una única función que inicia la lógica de esta "feature"
export function initOrderStatusHandlers() {
    refreshOrderPanel();
    initOrderActions();
}