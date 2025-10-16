
// Imports con rutas corregidas (subimos un nivel con '../')
import { state } from '../state.js';
import { getCategories } from '../APIs/CategoryApi.js';
import { getDishes } from '../APIs/DishApi.js';
import { getDeliveryTypes } from '../APIs/DeliveryTypeApi.js';

import { renderCategories } from '../Components/renderCategories.js';
import { renderDishes } from '../Components/renderDishes.js';
import { renderCart, renderDeliveryTypes } from '../Components/renderCart.js';
import { renderActiveOrders } from '../Components/renderMyOrders.js';

import { initFilters } from '../Handlers/Menu/filterHandler.js';
import { initCartHandlers } from '../Handlers/Menu/cartHandler.js';
import { initMyOrders } from '../Handlers/Menu/myOrdersHandler.js';
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', async () => {

    initNotificationModal();
    // Carga de datos
    const [categories, dishes, deliveryTypes] = await Promise.all([
        getCategories(), 
        getDishes(), 
        getDeliveryTypes()
    ]);
    state.categories = categories;
    state.dishes = dishes;

    // Renderizado inicial
    renderCategories(state.categories);
    renderDishes(state.dishes.filter(d => d.isActive));
    renderCart(state.cart);
    renderDeliveryTypes(deliveryTypes);

    // Activación de Handlers
    initFilters();
    initCartHandlers();
    initMyOrders();
});