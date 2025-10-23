import { initAdminNav } from '../Handlers/Panel/adminNavHandler.js'; // Reutiliza el handler de nav
import { initReportsPage } from '../Handlers/Panel/reportsHandler.js'; // Importa el nuevo handler
import { initNotificationModal } from '../notification.js';

document.addEventListener('DOMContentLoaded', () => {
    initAdminNav(); // Para resaltar el link activo
    initNotificationModal(); // Para mostrar mensajes
    initReportsPage(); // Inicializa la lógica de la página de reportes
});