
import { getDishes } from '../../APIs/DishApi.js';
import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';

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
            alert("No se pudieron cargar los detalles de la orden.");
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
                currentOrderForEditing.items.push({
                    dish: { id: dishId, name: dishName },
                    quantity: 1, notes: ''
                });
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
    
    // Controla todos los clics DENTRO del modal "Detalles de la Orden"
    orderDetailsModalElement.addEventListener('click', async (event) => {
        if (event.target.matches('[data-bs-target="#add-dishes-modal"]')) {
            bootstrapOrderModal.hide();
        }

        if (event.target.classList.contains('modal-quantity-btn')) {
            const listItem = event.target.closest('li');
            const dishId = listItem.dataset.itemId;
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);
            if (!itemInState) return;

            const action = event.target.dataset.action;
            if (action === 'increase') {
                itemInState.quantity++;
            } else if (action === 'decrease' && itemInState.quantity > 0) {
                itemInState.quantity--;
            }
            
            listItem.dataset.quantity = itemInState.quantity;
            listItem.querySelector('.item-quantity').textContent = itemInState.quantity;
        }
        
        if (event.target.id === 'save-changes-btn') {
            const button = event.target;
            const orderId = button.dataset.orderId;
            const itemsToUpdate = currentOrderForEditing.items
                .filter(item => item.quantity > 0)
                .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }));
            
            button.disabled = true;
            button.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;
            const result = await updateOrder(orderId, { items: itemsToUpdate });
            button.disabled = false;
            button.innerHTML = 'Guardar Cambios';

            if (result.error) {
                alert(`Error al guardar: ${result.error}`);
            } else {
                alert(`Orden #${orderId} actualizada con éxito.`);
                bootstrapOrderModal.hide();
                loadAndClassifyOrders();
            }
        }
    });

    // --- LA SOLUCIÓN ESTÁ AQUÍ ---
    // Añadimos un listener para el evento 'input' en el modal de detalles.
    orderDetailsModalElement.addEventListener('input', (event) => {
        // Se activa cada vez que se escribe en un campo de nota.
        if (event.target.classList.contains('modal-item-note')) {
            const input = event.target;
            const listItem = input.closest('li');
            const dishId = listItem.dataset.itemId;

            // Buscamos el ítem correspondiente en nuestra variable de estado.
            const itemInState = currentOrderForEditing.items.find(item => item.dish.id === dishId);

            // Actualizamos la nota en el estado con el valor del input.
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