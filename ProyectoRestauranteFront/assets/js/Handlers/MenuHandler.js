// Importamos el estado central
import { state } from '../state.js';

// Importamos todas las funciones de API que necesitamos para esta página
import { getCategories } from '../APIs/CategoryApi.js';
import { getDishes } from '../APIs/DishApi.js';
import { getDeliveryTypes } from '../APIs/DeliveryTypeApi.js';
import { createOrder } from '../APIs/OrderApi.js';
import { getOrderById } from '../APIs/OrderApi.js';
import { updateOrder } from '../APIs/OrderApi.js';

// Importamos todas las funciones de renderizado que necesitamos
import { renderCategories } from '../Components/renderCategories.js';
import { renderDishes } from '../Components/renderDishes.js';
import { renderCart, renderDeliveryTypes } from '../Components/renderCart.js';
import { renderActiveOrders } from '../Components/renderMyOrders.js';
import { renderOrderModal } from '../Components/renderOrderModal.js';


// --- LÓGICA DE NEGOCIO DEL CARRITO ---

function addToCart(dish) {
    const existingItem = state.cart.find(item => item.id === dish.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({ id: dish.id, name: dish.name, price: dish.price, quantity: 1 });
    }
    renderCart(state.cart);
}

function increaseQuantity(dishId) {
    const item = state.cart.find(i => i.id === dishId);
    if (item) {
        item.quantity++;
        renderCart(state.cart);
    }
}

function decreaseQuantity(dishId) {
    const item = state.cart.find(i => i.id === dishId);
    if (item && item.quantity > 1) {
        item.quantity--;
        renderCart(state.cart);
    } else if (item && item.quantity === 1) {
        removeFromCart(dishId);
    }
}

function removeFromCart(dishId) {
    state.cart = state.cart.filter(item => item.id !== dishId);
    renderCart(state.cart);
}


// --- INICIALIZADORES DE MANEJADORES DE EVENTOS ---

function initFilters() {
    const filtersContainer = document.getElementById('filters-container');
    const searchInput = document.getElementById('search-input');
    let debounceTimeout;

    filtersContainer.addEventListener('click', async (event) => {
        if (event.target.tagName !== 'BUTTON') return;
        
        const categoryId = event.target.dataset.categoryId;
        state.currentFilter.category = categoryId;
        
        const currentActive = filtersContainer.querySelector('.active');
        if (currentActive) currentActive.classList.remove('active');
        event.target.classList.add('active');
        
        const dishes = await getDishes(state.currentFilter.name, state.currentFilter.category);
        renderDishes(dishes);
    });

    searchInput.addEventListener('input', (event) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const searchText = event.target.value;
            state.currentFilter.name = searchText;
            const dishes = await getDishes(state.currentFilter.name, state.currentFilter.category);
            renderDishes(dishes);
        }, 300);
    });
}

function initCartEvents() {
    const dishListContainer = document.getElementById('dish-list-container');
    const cartContainer = document.getElementById('cart-items-container');

    dishListContainer.addEventListener('click', (event) => {
        if (!event.target.classList.contains('add-to-cart-btn')) return;
        const dishId = event.target.dataset.dishId;
        const dishToAdd = state.dishes.find(dish => dish.id === dishId);
        if (dishToAdd) addToCart(dishToAdd);
    });

    cartContainer.addEventListener('click', (event) => {
        const target = event.target;
        if (!target.classList.contains('cart-action-btn')) return;
        
        const { dishId, action } = target.dataset;

        if (action === 'increase') increaseQuantity(dishId);
        if (action === 'decrease') decreaseQuantity(dishId);
        if (action === 'remove') removeFromCart(dishId);
    });
}

function initOrderSubmission() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (!placeOrderBtn) return;

    placeOrderBtn.addEventListener('click', async () => {
        if (state.cart.length === 0) {
            alert('Tu comanda está vacía.');
            return;
        }

        const deliveryTypeId = document.getElementById('delivery-type').value;
        const deliveryAddress = document.getElementById('delivery-address').value;
        const orderNotes = document.getElementById('order-notes').value;

        const orderRequest = {
            items: state.cart.map(item => ({ id: item.id, quantity: item.quantity, notes: item.notes || '' })),
            delivery: { id: parseInt(deliveryTypeId), to: deliveryAddress },
            notes: orderNotes
        };

        const result = await createOrder(orderRequest);

        if (result.error) {
            alert(`Error: ${result.error}`);
        } else {
            alert(`¡Orden #${result.orderNumber} creada con éxito!`);
            
            // Lógica para guardar la orden en localStorage
            const savedOrders = JSON.parse(localStorage.getItem('myOrders')) || [];
            savedOrders.push(result.orderNumber);
            localStorage.setItem('myOrders', JSON.stringify(savedOrders));
            
            // Limpiamos el carrito y la UI
            state.cart = [];
            renderCart(state.cart);
            document.getElementById('delivery-address').value = '';
            document.getElementById('order-notes').value = '';

            // Refrescamos la lista de "Mis Pedidos"
            loadActiveOrders();
        }
    });
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
            alert("No se pudieron cargar los detalles de la orden.");
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
        if (target.id === 'save-changes-btn') { // Asegúrate que tu botón de guardar tenga id="save-changes-btn"
            const orderId = target.dataset.orderId;
            
            const itemsToUpdate = [];
            document.querySelectorAll('#modal-item-list li').forEach(item => {
                const quantity = parseInt(item.dataset.quantity);
                // Solo incluimos items con cantidad mayor a 0
                if (quantity > 0) {
                    itemsToUpdate.push({
                        id: item.dataset.itemId,
                        quantity: quantity
                    });
                }
            });

            const updateRequest = { items: itemsToUpdate };
            const result = await updateOrder(orderId, updateRequest);

            if (result.error) {
                alert(`Error al guardar: ${result.error}`);
            } else {
                alert(`Orden #${result.orderNumber} actualizada con éxito.`);
                bootstrapModal.hide();
                loadActiveOrders(); // Refrescamos la lista de "Mis Pedidos"
            }
        }
    });
}

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

// --- FUNCIÓN PRINCIPAL DE INICIALIZACIÓN ---

/**
 * Función principal que se exporta para inicializar todos los handlers de la página del menú.
 */
export async function initMenuPage() {
    // Carga de datos inicial
    const [categories, dishes, deliveryTypes] = await Promise.all([
        getCategories(), 
        getDishes(), 
        getDeliveryTypes()
    ]);

    // Guardado en el estado
    state.categories = categories;
    state.dishes = dishes;

    // Renderizado inicial
    renderCategories(state.categories);
    renderDishes(state.dishes);
    renderCart(state.cart);
    renderDeliveryTypes(deliveryTypes);

    // Activación de eventos
    initFilters();
    initCartEvents();
    initOrderSubmission();
    initMyOrdersActions();

    loadActiveOrders();
}
