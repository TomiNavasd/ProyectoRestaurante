import { getOrders, getOrderById } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { showNotification } from '../../notification.js';

// Función para cargar las órdenes con filtros
async function loadHistory(filters = {}) {
    const container = document.getElementById('history-orders-container');
    container.innerHTML = `<p class="text-center">Cargando...</p>`;
    
    const allOrders = await getOrders(filters);
    
    // Mostramos solo órdenes ya entregadas (ID 4) o cerradas (ID 5)
    const historyOrders = allOrders.filter(order => order.status.id >= 4);

    // Reutilizamos el componente para renderizar, indicando que NO muestre botones de modificar
    renderOrders(historyOrders, 'history-orders-container', 'No se encontraron órdenes.', false);
}

// Lógica completa para manejar el modal "Ver Detalle"
function initViewDetailsModal() {
    const mainContainer = document.querySelector('main');
    const modalElement = document.getElementById('order-details-modal');
    if (!mainContainer || !modalElement) return;

    const bootstrapModal = new bootstrap.Modal(modalElement);
    
    mainContainer.addEventListener('click', async (event) => {
        const button = event.target.closest('.view-details-btn');
        if (!button) return;
        
        const orderId = button.dataset.orderId;
        const orderDetails = await getOrderById(orderId);
        
        if (orderDetails) {
            renderOrderModal(orderDetails);
            // Ocultamos el botón "Agregar Platos" ya que en el historial no se puede modificar
            const addButtonContainer = document.querySelector('#order-details-modal .d-grid');
            if(addButtonContainer) addButtonContainer.style.display = 'none';

            bootstrapModal.show();
        } else {
            showNotification('No se pudieron cargar los detalles de la orden.');
        }
    });
}

export function initHistoryPage() {
    const filterBtn = document.getElementById('filter-btn');
    
    filterBtn.addEventListener('click', () => {
        const filters = {
            from: document.getElementById('date-from').value ? `${document.getElementById('date-from').value}T00:00:00` : null,
            to: document.getElementById('date-to').value ? `${document.getElementById('date-to').value}T23:59:59` : null
        };
        loadHistory(filters);
    });

    loadHistory(); // Carga inicial
    initViewDetailsModal(); // Activamos la lógica del modal
}