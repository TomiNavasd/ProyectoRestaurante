// /assets/js/Pages/Panel.js
import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initOrderStatusHandlers } from '../Handlers/Panel/panelOrdersHandler.js';
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav(); // Para la navegación superior
    initOrderStatusHandlers(); // Para el panel de órdenes y su modal "Ver Detalle"
    initNotificationModal();
});