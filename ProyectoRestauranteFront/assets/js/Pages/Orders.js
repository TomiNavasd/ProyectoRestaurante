import { initOrdersPage } from '../Handlers/Orders/ordersHandler.js';
import { initNotificationModal } from '../notification.js';
document.addEventListener('DOMContentLoaded', () => {
    initOrdersPage();
    initNotificationModal();
});