import { state } from '../../state.js';
import { createOrder } from '../../APIs/OrderApi.js';
import { renderCart } from '../../Components/renderCart.js';

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

export function initCartHandlers() {
    initCartEvents();
    initOrderSubmission();
}