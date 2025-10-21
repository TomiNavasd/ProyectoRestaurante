// Variable para guardar la instancia del modal y no recrearla cada vez.
let instanciaModalConfirmacion;

// Variable para la función 'resolve' de la promesa, para acceder a ella desde los listeners.
let resolverPromesa;

/**
 * Inicializa el modal de confirmación de Bootstrap.
 * Debe llamarse una vez al cargar la página.
 */
export function initConfirmationModal() {
    const elementoModal = document.getElementById('confirmation-modal');
    if (elementoModal) {
        instanciaModalConfirmacion = new bootstrap.Modal(elementoModal);

        const btnConfirmar = document.getElementById('confirm-modal-btn-confirmar');
        const btnCancelar = document.getElementById('confirm-modal-btn-cancelar');

        // Cuando se haga clic en confirmar, cerramos el modal y resolvemos la promesa con 'true'.
        btnConfirmar.addEventListener('click', () => {
            instanciaModalConfirmacion.hide();
            if (resolverPromesa) resolverPromesa(true);
        });

        // Cuando se haga clic en cancelar, cerramos el modal y resolvemos con 'false'.
        btnCancelar.addEventListener('click', () => {
            instanciaModalConfirmacion.hide();
            if (resolverPromesa) resolverPromesa(false);
        });
    }
}

/**
 * Muestra un modal de confirmación y devuelve una Promesa que se resuelve a 'true' o 'false'.
 * @param {string} mensaje El texto a mostrar en el cuerpo del modal.
 * @returns {Promise<boolean>} Resuelve 'true' si el usuario confirma, 'false' si cancela.
 */
export function mostrarConfirm(mensaje) {
    return new Promise((resolve) => {
        if (!instanciaModalConfirmacion) {
            console.error("El modal de confirmación no está inicializado.");
            // Como fallback, usamos el confirm nativo si algo falló.
            resolve(confirm(mensaje));
            return;
        }
        
        // Guardamos la función 'resolve' para usarla en los listeners.
        resolverPromesa = resolve;

        const cuerpoModal = document.getElementById('confirmation-modal-body');
        cuerpoModal.textContent = mensaje;
        
        instanciaModalConfirmacion.show();
    });
}