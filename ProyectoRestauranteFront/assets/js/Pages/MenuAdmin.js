import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initDishAdminHandlers } from '../Handlers/Panel/panelDishesHandler.js';
import { initNotificationModal } from '../notification.js';
import { initConfirmationModal } from '../confirmation.js';


document.addEventListener('DOMContentLoaded', () => {
    initAdminNav();
    initDishAdminHandlers();
    initNotificationModal();
    initConfirmationModal();
});