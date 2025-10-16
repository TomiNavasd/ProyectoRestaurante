import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderActiveOrders } from '../../Components/renderMyOrders.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { showNotification } from '../../notification.js';

async function loadActiveOrders() {
    const savedOrderNumbers = JSON.parse(localStorage.getItem('myOrders')) || [];
    if (savedOrderNumbers.length === 0) {
        renderActiveOrders([]);
        return;
    }

    const orderPromises = savedOrderNumbers.map(id => getOrderById(id));
    const orders = await Promise.all(orderPromises);

    const activeOrders = orders.filter(order => order && order.status.id < 4);
    renderActiveOrders(activeOrders);
}

function initMyOrdersActions() {
    const activeOrdersContainer = document.getElementById('active-orders-container');
    const modalElement = document.getElementById('order-details-modal');
    const bootstrapModal = new bootstrap.Modal(modalElement);

    // Listener para abrir el modal
    activeOrdersContainer.addEventListener('click', async (event) => {
        const targetButton = event.target.closest('.btn-outline-primary');
        if (!targetButton) return;

        const orderId = targetButton.dataset.orderId;
        if (!orderId) return;

        const orderDetails = await getOrderById(orderId);
        if (!orderDetails) {
            showNotification("No se pudieron cargar los detalles de la orden.");
            return;
        }

        renderOrderModal(orderDetails);
        bootstrapModal.show();
    });

    // Listener para las acciones DENTRO del modal
    modalElement.addEventListener('click', async (event) => {
        const target = event.target;

        // Lógica para botones + y -
        if (target.classList.contains('modal-quantity-btn')) {
            const action = target.dataset.action;
            const listItem = target.closest('li');
            const quantitySpan = listItem.querySelector('.item-quantity');
            let quantity = parseInt(listItem.dataset.quantity);

            if (action === 'increase') {
                quantity++;
            } else if (action === 'decrease' && quantity > 0) {
                quantity--;
            }

            listItem.dataset.quantity = quantity;
            quantitySpan.textContent = quantity;
        }

        // Lógica para el botón "Guardar Cambios"
        if (target.id === 'save-changes-btn') {
            const button = target;

            // ¡LA CORRECCIÓN ESTÁ AQUÍ! Obtenemos el orderId desde el botón de guardar,
            // donde lo pusimos en el renderOrderModal.
            const orderId = button.dataset.orderId;

            // Verificación extra para asegurarnos de que tenemos el ID
            if (!orderId) {
                showNotification("Error crítico: No se pudo identificar el número de orden.");
                return;
            }

            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;

            const itemsToUpdate = [];
            document.querySelectorAll('#modal-item-list li').forEach(item => {
                const quantity = parseInt(item.dataset.quantity);
                if (quantity > 0) {
                    itemsToUpdate.push({
                        id: item.dataset.itemId,
                        quantity: quantity
                    });
                }
            });

            const updateRequest = { items: itemsToUpdate };
            const result = await updateOrder(orderId, updateRequest);

            button.disabled = false;
            button.innerHTML = 'Guardar Cambios';

            if (result.error) {
                showNotification(`Error al guardar: ${result.error}`);
            } else {
                showNotification(`Orden #${orderId} actualizada con éxito.`);
                bootstrapModal.hide();
                loadActiveOrders();
            }
        }
    });
}
export function initMyOrders() {
    // 1. Carga las órdenes guardadas al iniciar la página.
    loadActiveOrders();

    // 2. Activa los listeners para los botones "Ver Detalle" y las acciones del modal.
    initMyOrdersActions();
}