// /assets/js/Pages/MenuAdmin.js
import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initDishAdminHandlers } from '../Handlers/Panel/panelDishesHandler.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav();
    initDishAdminHandlers(); // Tu handler de platos que ya funcionaba
});