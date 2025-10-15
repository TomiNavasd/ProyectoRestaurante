import { state } from '../../state.js';
import { createOrder } from '../../APIs/OrderApi.js';
import { renderCart } from '../../Components/renderCart.js';

// --- CORREGIDO ---
function addToCart(dish) {
    const existingItem = state.cart.find(item => item.id === dish.id);
    if (existingItem) {
        existingItem.quantity++;
    } else {
        // Se añade la propiedad 'notes' desde el principio para evitar que sea 'undefined'
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

function validateOrderForm() {
    const deliverySelect = document.getElementById('delivery-type');
    const addressInput = document.getElementById('delivery-address');
    addressInput.classList.remove('is-invalid');

    const isDelivery = deliverySelect.value === '1';
    const isAddressEmpty = addressInput.value.trim() === '';

    if (isDelivery && isAddressEmpty) {
        alert('Por favor, ingresa una dirección para el delivery.');
        addressInput.classList.add('is-invalid');
        return false;
    }
    return true;
}

// --- FUNCIÓN CORREGIDA Y DEFINITIVA ---
function initOrderSubmission() {
    const placeOrderBtn = document.getElementById('place-order-btn');
    if (!placeOrderBtn) return;

    placeOrderBtn.addEventListener('click', async () => {
        if (state.cart.length === 0) {
            alert('Tu comanda está vacía.');
            return;
        }

        if (!validateOrderForm()) {
            return;
        }

        placeOrderBtn.disabled = true;
        placeOrderBtn.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Creando...`;

        const deliveryTypeId = parseInt(document.getElementById('delivery-type').value, 10);
        const deliveryAddress = document.getElementById('delivery-address').value;
        const orderNotes = document.getElementById('order-notes').value;

        // --- LA SOLUCIÓN DEFINITIVA ESTÁ AQUÍ ---
        const deliveryPayload = {
            id: deliveryTypeId,
            // Si es delivery, usa la dirección; si no, envía un STRING VACÍO.
            to: deliveryTypeId === 1 ? deliveryAddress : "" 
        };

        const orderRequest = {
            items: state.cart.map(item => ({
                id: item.id,
                quantity: item.quantity,
                notes: item.notes || ''
            })),
            delivery: deliveryPayload,
            notes: orderNotes
        };
        
        const result = await createOrder(orderRequest);

        placeOrderBtn.disabled = false;
        placeOrderBtn.textContent = 'Realizar Pedido';

        if (result.error) {
            alert(`Error al crear la orden: ${result.error}`);
        } else {
            alert(`¡Orden #${result.orderNumber} creada con éxito!`);
            
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

function initDeliveryTypeHandler() {
    const deliverySelect = document.getElementById('delivery-type');
    const addressContainer = document.getElementById('address-input-container'); 
    const addressInput = document.getElementById('delivery-address');

    if (!deliverySelect || !addressContainer) {
        console.warn('Elementos del formulario de entrega no encontrados.');
        return;
    }

    const toggleAddressVisibility = () => {
        const isDeliverySelected = deliverySelect.value === '1';
        if (isDeliverySelected) {
            addressContainer.classList.remove('d-none');
        } else {
            addressContainer.classList.add('d-none');
            addressInput.value = ''; 
            addressInput.classList.remove('is-invalid');
        }
    };

    deliverySelect.addEventListener('change', toggleAddressVisibility);
    toggleAddressVisibility();

    addressInput.addEventListener('input', () => {
        if (addressInput.value.trim() !== '') {
            addressInput.classList.remove('is-invalid');
        }
    });
}

export function initCartHandlers() {
    initCartEvents();
    initOrderSubmission();
    initDeliveryTypeHandler();
}