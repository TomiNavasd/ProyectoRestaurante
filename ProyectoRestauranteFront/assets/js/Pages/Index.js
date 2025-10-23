import { state } from '../state.js';
import { getCategories } from '../APIs/CategoryApi.js';
import { getDishes } from '../APIs/DishApi.js';
import { getDeliveryTypes } from '../APIs/DeliveryTypeApi.js';

import { renderCategories } from '../Components/renderCategories.js';
import { renderDishes } from '../Components/renderDishes.js';
import { renderCart, renderDeliveryTypes } from '../Components/renderCart.js';

import { initFilters } from '../Handlers/Menu/filterHandler.js';
import { initCartHandlers } from '../Handlers/Menu/cartHandler.js';
import { initMyOrders } from '../Handlers/Menu/myOrdersHandler.js';
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', async () => {

    initNotificationModal();

    if (!state.currentFilter) {
        state.currentFilter = {
            category: null,
            name: null,
            sortByPrice: null,
        };
    }
    // seteo del estado inicial. sw apagado asi se ve solo activos
    state.currentFilter.onlyActive = true; 
    const [categories, dishes, deliveryTypes] = await Promise.all([
        getCategories(), 
        getDishes(),
        getDeliveryTypes()
    ]);
    
    state.categories = categories;
    state.dishes = dishes; 

    // render inicial
    renderCategories(state.categories);
    
    // render solo activos
    renderDishes(state.dishes.filter(d => d.isActive));
    
    renderCart(state.cart);
    renderDeliveryTypes(deliveryTypes);


    initFilters();
    initCartHandlers();
    initMyOrders();
});