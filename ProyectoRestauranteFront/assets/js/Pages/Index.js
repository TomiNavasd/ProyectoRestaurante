// Imports de datos y renderizado inicial
import { state } from '../state.js';

import { getCategories } from '../APIs/CategoryApi.js';
import { getDishes } from '../APIs/DishApi.js';
import { getDeliveryTypes } from '../APIs/DeliveryTypeApi.js';

import { renderCategories } from '../Components/renderCategories.js';
import { renderDishes } from '../Components/renderDishes.js';
import { renderCart, renderDeliveryTypes } from '../Components/renderCart.js';
// Imports de los INICIALIZADORES de cada Handler
import { initFilters } from '../Handlers/Menu/filterHandler.js';
import { initCartHandlers } from '../Handlers/Menu/cartHandler.js';
import { initMyOrders } from '../Handlers/Menu/myOrdersHandler.js';

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Carga de datos
    const [categories, dishes, deliveryTypes] = await Promise.all([
        getCategories(), getDishes(), getDeliveryTypes()
    ]);
    state.categories = categories;
    state.dishes = dishes;

    // 2. Renderizado inicial
    renderCategories(state.categories);
    renderDishes(state.dishes);
    renderCart(state.cart);
    renderDeliveryTypes(deliveryTypes);

    // 3. Activación de TODOS los Handlers
    initFilters();
    initCartHandlers();
    initMyOrders();
});