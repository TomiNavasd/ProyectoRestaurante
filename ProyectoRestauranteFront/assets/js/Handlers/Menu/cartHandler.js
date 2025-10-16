import { state } from '../../state.js';
import { createOrder } from '../../APIs/OrderApi.js';
import { renderCart } from '../../Components/renderCart.js';
import { showNotification } from '../../notification.js';

function addToCart(dish) {
    const existingItem = state.cart.find(item => item.id === dish.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        state.cart.push({ id: dish.id, name: dish.name, price: dish.price, quantity: 1, notes: '' });
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

function initCartEvents() {
    const dishListContainer = document.getElementById('dish-list-container');
    const cartContainer = document.getElementById('cart-items-container');

    dishListContainer.addEventListener('click', (event) => {
        if (!event.target.classList.contains('add-to-cart-btn')) return;
        const dishId = event.target.dataset.dishId;
        const dishToAdd = state.dishes.find(dish => dish.id === dishId);
        if (dishToAdd) addToCart(dishToAdd);
    });

    cartContainer.addEventListener('input', (event) => {
        if (event.target.classList.contains('item-note-input')) {
            const dishId = event.target.dataset.dishId;
            const itemInState = state.cart.find(item => item.id === dishId);
            if (itemInState) {
                itemInState.notes = event.target.value;
            }
        }
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

// --- FUNCIÓN DE VALIDACIÓN ACTUALIZADA ---
function validateOrderForm() {
    const deliverySelect = document.getElementById('delivery-type');
    const deliveryDetailInput = document.getElementById('delivery-address');
    const deliveryTypeId = deliverySelect.value;
    const detailValue = deliveryDetailInput.value.trim();

    deliveryDetailInput.classList.remove('is-invalid');

    let errorMessage = '';

    // Aplicamos la regla de validación según el tipo de entrega
    switch (deliveryTypeId) {
        case '1': // Delivery
            if (detailValue === '') {
                errorMessage = 'Por favor, ingresa una dirección para el delivery.';
            }
            break;
        case '2': // Take away
            if (detailValue === '') {
                errorMessage = 'Por favor, ingresa un nombre para el retiro.';
            }
            break;
        case '3': // Dine in
            if (detailValue === '') {
                errorMessage = 'Por favor, ingresa el número de mesa.';
            }
            break;
    }

    if (errorMessage) {
        showNotification(errorMessage);
        deliveryDetailInput.classList.add('is-invalid');
        return false; // La validación falla
    }

    return true; // La validación es exitosa
}

// --- FUNCIÓN DE SUBMISIÓN (SIN CAMBIOS EN LA LÓGICA DE ENVÍO) ---
function initOrderSubmission() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (!placeOrderBtn) return;

    placeOrderBtn.addEventListener('click', async () => {
        if (state.cart.length === 0) {
            showNotification('Tu comanda está vacía.');
            return;
        }

        if (!validateOrderForm()) { // Ahora usa la nueva lógica de validación
            return;
        }
        
        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Creando...`;

        const deliveryTypeId = parseInt(document.getElementById('delivery-type').value, 10);
        const deliveryAddress = document.getElementById('delivery-address').value;
        const orderNotes = document.getElementById('order-notes').value;

        // La lógica de envío es correcta
        const deliveryPayload = {
            id: deliveryTypeId,
            to: deliveryTypeId === 1 ? deliveryAddress : (deliveryAddress || "") 
        };
        const orderRequest = {
            items: state.cart.map(item => ({ id: item.id, quantity: item.quantity, notes: item.notes || '' })),
            delivery: deliveryPayload,
            notes: orderNotes
        };
        
        const result = await createOrder(orderRequest);

        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Realizar Pedido';

        if (result.error) {
            showNotification(`Error al crear la orden: ${result.error}`);
        } else {
            showNotification(`¡Orden #${result.orderNumber} creada con éxito!`);
            
            const savedOrders = JSON.parse(localStorage.getItem('myOrders')) || [];
            savedOrders.push(result.orderNumber);
            localStorage.setItem('myOrders', JSON.stringify(savedOrders));
            
            state.cart = [];
            renderCart(state.cart);
            document.getElementById('delivery-address').value = '';
            document.getElementById('order-notes').value = '';
        }
    });
}

// --- FUNCIÓN DE UI ACTUALIZADA ---
function initDeliveryTypeHandler() {
    const deliverySelect = document.getElementById('delivery-type');
    const detailContainer = document.getElementById('address-input-container'); 
    const detailLabel = detailContainer.querySelector('label');
    const detailInput = document.getElementById('delivery-address');

    if (!deliverySelect || !detailContainer || !detailLabel || !detailInput) return;

    const updateDeliveryUI = () => {
        const selectedId = deliverySelect.value;
        
        // El campo de detalle es visible para todos los tipos de entrega
        detailContainer.classList.remove('d-none');
        detailInput.value = '';
        detailInput.classList.remove('is-invalid');

        // Cambiamos el texto del label y el placeholder según la selección
        switch (selectedId) {
            case '1': // Delivery
                detailLabel.textContent = 'Dirección';
                detailInput.placeholder = 'Ingresa la dirección de entrega';
                break;
            case '2': // Take away
                detailLabel.textContent = 'Nombre';
                detailInput.placeholder = 'Ingresa el nombre para el retiro';
                break;
            case '3': // Dine in
                detailLabel.textContent = 'N° de Mesa';
                detailInput.placeholder = 'Ingresa el número de mesa';
                break;
            default:
                // Si no hay selección, ocultamos el campo
                detailContainer.classList.add('d-none');
        }
    };

    deliverySelect.addEventListener('change', updateDeliveryUI);
    updateDeliveryUI(); // Llamada inicial para establecer el estado correcto
}

export function initCartHandlers() {
    initCartEvents();
    initOrderSubmission();
    initDeliveryTypeHandler();
}