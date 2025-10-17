import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initOrderStatusHandlers } from '../Handlers/Panel/panelOrdersHandler.js';
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav();
    initOrderStatusHandlers();
    initNotificationModal();
});