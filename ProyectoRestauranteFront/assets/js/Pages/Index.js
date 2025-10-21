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

    // --- IMPORTANTE: Definir el estado inicial del filtro ---
    // (Asumo que state.js puede no tener currentFilter)
    if (!state.currentFilter) {
        state.currentFilter = {
            category: null,
            name: null,
            sortByPrice: null,
        };
    }
    // Seteamos el estado inicial. El switch está APAGADO (checked: false),
    // por lo que SÓLO vemos los activos (onlyActive: true).
    state.currentFilter.onlyActive = true; 

    // --- LÓGICA DE CARGA ORIGINAL (CORREGIDA) ---
    // 1. Llamamos a getDishes() SIN argumentos, como en tu código original.
    const [categories, dishes, deliveryTypes] = await Promise.all([
        getCategories(), 
        getDishes(), // <-- ARREGLO: Sin argumentos
        getDeliveryTypes()
    ]);
    
    // 2. Guardamos TODOS los platos en el estado (como en tu original)
    state.categories = categories;
    state.dishes = dishes; 

    // Renderizado inicial
    renderCategories(state.categories);
    
    // 3. Renderizamos SÓLO los activos, para que coincida con el estado
    //    inicial del filtro (onlyActive: true).
    renderDishes(state.dishes.filter(d => d.isActive)); // <-- ARREGLO: Filtramos aquí
    
    renderCart(state.cart);
    renderDeliveryTypes(deliveryTypes);

    // Activación de Handlers
    initFilters(); // initFilters ahora funcionará bien porque state.currentFilter está listo
    initCartHandlers();
    initMyOrders();
});