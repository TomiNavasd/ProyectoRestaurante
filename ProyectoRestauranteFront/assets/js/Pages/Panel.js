import { initOrderStatusHandlers } from '../Handlers/Panel/panelOrdersHandler.js';
import { initDishAdminHandlers } from '../Handlers/Panel/panelDishesHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    // Inicia la lógica para el panel de órdenes
    initOrderStatusHandlers();
    
    // Inicia la lógica para la administración de platos
    initDishAdminHandlers();
});