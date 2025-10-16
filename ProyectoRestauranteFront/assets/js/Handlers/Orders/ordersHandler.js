// /assets/js/Handlers/Orders/ordersHandler.js

import { getDishes } from '../../APIs/DishApi.js';
import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';
import { showNotification } from '../../notification.js';

async function loadAndClassifyOrders() {
    const savedOrderNumbers = JSON.parse(localStorage.getItem('myOrders')) || [];
    if (savedOrderNumbers.length === 0) {
        renderOrders([], 'active-orders-container', 'No tienes pedidos en curso.');
        renderOrders([], 'history-orders-container', 'No tienes pedidos en tu historial.');
        return;
    }
    const orderPromises = savedOrderNumbers.map(id => getOrderById(id));
    const results = await Promise.allSettled(orderPromises);
    const validOrders = results
        .filter(result => result.status === 'fulfilled' && result.value !== null)
        .map(result => result.value);
    const activeOrders = validOrders.filter(order => order.status.id < 4);
    const historyOrders = validOrders.filter(order => order.status.id >= 4);
    renderOrders(activeOrders, 'active-orders-container', 'No tienes pedidos en curso.');
    renderOrders(historyOrders, 'history-orders-container', 'No tienes pedidos en tu historial.');
}

function initOrderDetails() {
    const mainContainer = document.querySelector('main');
    const orderDetailsModalElement = document.getElementById('order-details-modal');
    const addDishesModalElement = document.getElementById('add-dishes-modal');
    
    if (!mainContainer || !orderDetailsModalElement || !addDishesModalElement) return;

    const bootstrapOrderModal = new bootstrap.Modal(orderDetailsModalElement);
    const bootstrapAddDishesModal = new bootstrap.Modal(addDishesModalElement);
    let currentOrderForEditing = null;

    mainContainer.addEventListener('click', async (event) => {
        const targetButton = event.target.closest('.view-details-btn');
        if (!targetButton) return;
        
        const orderId = targetButton.dataset.orderId;
        const orderDetails = await getOrderById(orderId);

        if (!orderDetails) {
            showNotification("No se pudieron cargar los detalles de la orden.");
            return;
        }
        currentOrderForEditing = JSON.parse(JSON.stringify(orderDetails));
        renderOrderModal(orderDetails);
        bootstrapOrderModal.show();
    });
    
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
    
    // --- LÓGICA COMPLETA Y RESTAURADA ---
    orderDetailsModalElement.addEventListener('click', async (event) => {
        const target = event.target;

        if (target.matches('[data-bs-target="#add-dishes-modal"]')) {
            bootstrapOrderModal.hide();
        }

        // Lógica restaurada para botones +/-
        if (target.classList.contains('modal-quantity-btn')) {
            const listItem = target.closest('li');
            const dishId = listItem.dataset.itemId;
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (!itemInState) return;

            const action = target.dataset.action;
            if (action === 'increase') {
                itemInState.quantity++;
            } else if (action === 'decrease' && itemInState.quantity > 0) {
                itemInState.quantity--;
            }
            
            // Si la cantidad llega a cero, podrías optar por eliminar el item
            if (itemInState.quantity === 0) {
                currentOrderForEditing.items = currentOrderForEditing.items.filter(item => item.dish.id !== dishId);
                listItem.remove(); // Eliminamos el elemento del DOM
            } else {
                listItem.dataset.quantity = itemInState.quantity;
                listItem.querySelector('.item-quantity').textContent = itemInState.quantity;
            }
        }
        
        // Lógica restaurada para "Guardar Cambios"
        if (target.id === 'save-changes-btn') {
            const button = target;
            const orderId = button.dataset.orderId;
            
            const updateRequest = {
                items: currentOrderForEditing.items
                    .filter(item => item.quantity > 0)
                    .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }))
            };

            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;
            const result = await updateOrder(orderId, updateRequest);
            button.disabled = false;
            button.innerHTML = 'Guardar Cambios';

            if (result.error) {
                showNotification(`Error al guardar: ${result.error}`);
            } else {
                showNotification(`Orden #${orderId} actualizada con éxito.`);
                bootstrapOrderModal.hide();
                loadAndClassifyOrders();
            }
        }
    });

    orderDetailsModalElement.addEventListener('input', (event) => {
        if (event.target.classList.contains('modal-item-note')) {
            const input = event.target;
            const listItem = input.closest('li');
            const dishId = listItem.dataset.itemId;
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (itemInState) {
                itemInState.notes = input.value;
            }
        }
    });
}

export function initOrdersPage() {
    loadAndClassifyOrders();
    initOrderDetails();
}