import { getOrders, updateOrderItemStatus, getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { getDishes } from '../../APIs/DishApi.js';
import { renderOrderPanel } from '../../Components/renderOrderPanel.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';

async function refreshPanel() {
    const orders = await getOrders();
    renderOrderPanel(orders);
}

// --- FUNCIÓN COMPLETA Y DEFINITIVA ---
function initOrderActions() {
    const mainContainer = document.querySelector('main');
    const orderDetailsModalElement = document.getElementById('order-details-modal');
    const addDishesModalElement = document.getElementById('add-dishes-modal');

    if (!mainContainer || !orderDetailsModalElement || !addDishesModalElement) return;

    const bootstrapOrderModal = new bootstrap.Modal(orderDetailsModalElement);
    const bootstrapAddDishesModal = new bootstrap.Modal(addDishesModalElement);
    let currentOrderForEditing = null;

    // Listener para todas las acciones del panel
    mainContainer.addEventListener('click', async (event) => {
        const button = event.target.closest('.view-details-btn, .status-action-btn, .order-action-btn');
        if (!button) return;

        // Lógica para "Ver Detalle"
        if (button.classList.contains('view-details-btn')) {
            const orderId = button.dataset.orderId;
            const orderDetails = await getOrderById(orderId);
            if (orderDetails) {
                currentOrderForEditing = JSON.parse(JSON.stringify(orderDetails));
                renderOrderModal(orderDetails);
                bootstrapOrderModal.show();
            } else {
                alert('No se pudieron cargar los detalles.');
            }
        }

        // --- LÓGICA RESTAURADA PARA "PREPARAR" Y "TERMINAR" ---
        if (button.classList.contains('status-action-btn')) {
            button.disabled = true;
            button.textContent = '...';
            const { orderId, itemId, newStatus } = button.dataset;
            const result = await updateOrderItemStatus(orderId, itemId, newStatus);
            if (!result || result.error) {
                alert(result?.error || 'Ocurrió un error al actualizar el ítem.');
            }
            await refreshPanel();
        }

        // --- LÓGICA RESTAURADA PARA "ENTREGAR" ---
        if (button.classList.contains('order-action-btn')) {
            button.disabled = true;
            button.textContent = '...';
            const orderId = button.dataset.orderId;
            const newStatusId = button.dataset.newStatusId;

            const orderCard = button.closest('.card');
            const itemElements = orderCard.querySelectorAll('.list-group-item');
            
            // Bucle secuencial para evitar errores de concurrencia
            for (const itemEl of itemElements) {
                const itemId = itemEl.dataset.itemId;
                if (itemId) {
                    await updateOrderItemStatus(orderId, itemId, newStatusId);
                }
            }
            alert(`¡Orden #${orderId} marcada como entregada!`);
            await refreshPanel();
        }
    });

    // --- El resto del código para manejar los modales anidados no cambia ---
    addDishesModalElement.addEventListener('show.bs.modal', async () => {
        const currentItemIds = new Set(currentOrderForEditing.items.map(item => item.dish.id));
        const allDishes = await getDishes();
        renderDishesToModal(allDishes, currentItemIds);
    });

    addDishesModalElement.addEventListener('click', (event) => {
        const addButton = event.target.closest('.add-dish-to-order-btn');
        if (addButton && !addButton.disabled) {
            const { dishId, dishName } = addButton.dataset;
            const existingItem = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (existingItem) {
                existingItem.quantity++;
            } else {
                currentOrderForEditing.items.push({ dish: { id: dishId, name: dishName }, quantity: 1, notes: '' });
            }
            addButton.disabled = true;
            addButton.textContent = 'Agregado';
        }
        if (event.target.id === 'confirm-dishes-btn') {
            bootstrapAddDishesModal.hide();
        }
    });

    addDishesModalElement.addEventListener('hidden.bs.modal', () => {
        renderOrderModal(currentOrderForEditing);
        bootstrapOrderModal.show();
    });
    
    orderDetailsModalElement.addEventListener('click', async (event) => {
        const target = event.target;
        if (target.matches('[data-bs-target="#add-dishes-modal"]')) {
            bootstrapOrderModal.hide();
        }
        if (target.classList.contains('modal-quantity-btn')) {
            const listItem = target.closest('li');
            const dishId = listItem.dataset.itemId;
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (!itemInState) return;
            if (target.dataset.action === 'increase') {
                itemInState.quantity++;
            } else if (target.dataset.action === 'decrease' && itemInState.quantity > 0) {
                itemInState.quantity--;
            }
            listItem.dataset.quantity = itemInState.quantity;
            listItem.querySelector('.item-quantity').textContent = itemInState.quantity;
        }
        if (target.id === 'save-changes-btn') {
            const orderId = target.dataset.orderId;
            const itemsToUpdate = currentOrderForEditing.items
                .filter(item => item.quantity > 0)
                .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }));
            await updateOrder(orderId, { items: itemsToUpdate });
            bootstrapOrderModal.hide();
            await refreshPanel();
        }
    });

    orderDetailsModalElement.addEventListener('input', (event) => {
        if (event.target.classList.contains('modal-item-note')) {
            const dishId = event.target.closest('li').dataset.itemId;
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (itemInState) {
                itemInState.notes = event.target.value;
            }
        }
    });
}

export function initOrderStatusHandlers() {
    refreshPanel();
    initOrderActions();
}