// esta variable queda afuera para que sea global dentro de este archivo
// no tenemos que crear una nueva instancia del modal cada vez
let instanciaModalNotificacion;

/**
 * prepara el modal de notificación para ser usado
 */
export function initNotificationModal() {
    const elementoModal = document.getElementById('notification-modal');
    if (elementoModal) {
        instanciaModalNotificacion = new bootstrap.Modal(elementoModal);
    }
}

/**
 * muestra una notificación personalizada con un mensaje.
 * @param {string} mensaje texto que queremos mostrar en la notificacion 
 */
export function mostrarNot(mensaje) {
    // si por alguna razón el modal no se pudo inicializar volvemos al alert()
    if (!instanciaModalNotificacion) {
        alert(mensaje);
        return;
    }

    const tituloModal = document.getElementById('notification-modal-title');
    const cuerpoModal = document.getElementById('notification-modal-body');
    const cabeceraModal = document.getElementById('notification-modal-header');
    
    cabeceraModal.className = 'modal-header bg-dark text-white';
    tituloModal.textContent = 'Aviso del Sistema';
    cuerpoModal.textContent = mensaje;

    const otroModalAbierto = document.querySelector('.modal.show');

    if (otroModalAbierto) {
        // si encontramos uno primero lo cerramos
        const instanciaModalAbierto = bootstrap.Modal.getInstance(otroModalAbierto);

        otroModalAbierto.addEventListener('hidden.bs.modal', () => {
            // solo en ese momento mostramos nuestra noti
            instanciaModalNotificacion.show();
        }, { once: true }); // es para que este listener se ejecute una sola vez y no se acumule

        instanciaModalAbierto.hide();
    } else {
        // si no hay otros modales abiertos, la mostramos directamente
        instanciaModalNotificacion.show();
    }
}