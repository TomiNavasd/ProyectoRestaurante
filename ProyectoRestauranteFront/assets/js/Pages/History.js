// /assets/js/Pages/History.js
import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initHistoryPage } from '../Handlers/Panel/historyHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav();
    initHistoryPage();
});