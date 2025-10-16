import { getOrderById } from '../../APIs/OrderApi.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { showNotification } from '../../notification.js';

/**
 * Inicializa la lógica para abrir y poblar el modal "Ver Detalle" de una orden.
 * Esta función es reutilizable en cualquier página que muestre órdenes.
 */
export function initViewOrderDetails() {
    const mainContainer = document.querySelector('main');
    // Asegúrate de que el modal exista en el HTML de la página
    const modalElement = document.getElementById('order-details-modal'); 
    
    if (!mainContainer || !modalElement) return;

    const bootstrapModal = new bootstrap.Modal(modalElement);

    mainContainer.addEventListener('click', async (event) => {
        const button = event.target.closest('.view-details-btn');
        if (!button) return;

        const orderId = button.dataset.orderId;
        if (!orderId) return;

        const orderDetails = await getOrderById(orderId);
        
        if (orderDetails) {
            renderOrderModal(orderDetails);
            bootstrapModal.show();
        } else {
            showNotification('No se pudieron cargar los detalles de la orden.');
        }
    });
}