// /assets/js/Pages/History.js
import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initHistoryPage } from '../Handlers/Panel/historyHandler.js';
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav();
    initHistoryPage();
    initNotificationModal();
});