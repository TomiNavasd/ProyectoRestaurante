// /assets/js/notification.js

let notificationModal;

/**
 * Inicializa el modal de notificación. Debe ser llamado después de que el DOM cargue.
 */
export function initNotificationModal() {
    const modalElement = document.getElementById('notification-modal');
    if (modalElement) {
        notificationModal = new bootstrap.Modal(modalElement);
    }
}

/**
 * Muestra una notificación personalizada. Solo necesita el mensaje.
 * Cierra automáticamente cualquier otro modal que esté abierto.
 * @param {string} message - El mensaje a mostrar.
 */
export function showNotification(message) {
    if (!notificationModal) {
        // Si algo falla, volvemos al alert nativo.
        alert(message);
        return;
    }

    const modalTitle = document.getElementById('notification-modal-title');
    const modalBody = document.getElementById('notification-modal-body');
    const modalHeader = document.getElementById('notification-modal-header');
    
    // Estilo genérico y elegante para todas las notificaciones
    modalHeader.className = 'modal-header bg-dark text-white';
    modalTitle.textContent = 'Aviso del Sistema';
    modalBody.textContent = message;

    // --- LÓGICA CLAVE PARA EVITAR MODALES SUPERPUESTOS ---
    const anyOpenModal = document.querySelector('.modal.show');
    if (anyOpenModal) {
        const bootstrapModal = bootstrap.Modal.getInstance(anyOpenModal);
        
        // Esperamos a que el modal actual se cierre por completo...
        anyOpenModal.addEventListener('hidden.bs.modal', () => {
            // ...y solo entonces mostramos nuestra notificación.
            notificationModal.show();
        }, { once: true }); // 'once: true' asegura que esto solo se ejecute una vez.

        bootstrapModal.hide();
    } else {
        // Si no hay otros modales abiertos, simplemente la mostramos.
        notificationModal.show();
    }
}