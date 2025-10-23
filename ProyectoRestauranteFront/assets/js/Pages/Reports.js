import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js';
import { initReportsPage } from '../Handlers/Panel/reportsHandler.js'; 
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav(); //para resaltar el link activo
    initNotificationModal(); //para mostrar mensajes
    initReportsPage();
});