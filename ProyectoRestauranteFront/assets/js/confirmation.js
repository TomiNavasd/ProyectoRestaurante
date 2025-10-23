let instanciaModalConfirmacion;
let resolverPromesa;

/**
 * inicializa el modal de confirmacion de bootstrap
 * debe llamarse una vez al cargar la pgina.
 */
export function initConfirmationModal() {
    const elementoModal = document.getElementById('confirmation-modal');
    if (elementoModal) {
        instanciaModalConfirmacion = new bootstrap.Modal(elementoModal);

        const btnConfirmar = document.getElementById('confirm-modal-btn-confirmar');
        const btnCancelar = document.getElementById('confirm-modal-btn-cancelar');

        // cuando de da clic en confirmar se cierra modal y se resuelve promesa con true
        btnConfirmar.addEventListener('click', () => {
            instanciaModalConfirmacion.hide();
            if (resolverPromesa) resolverPromesa(true);
        });
        // cuando de da clic en cancelar se cierra modal y se resuelve con false
        btnCancelar.addEventListener('click', () => {
            instanciaModalConfirmacion.hide();
            if (resolverPromesa) resolverPromesa(false);
        });
    }
}

/**
 * muestra un modal de confirmacion y devuelve una promesa que se resuelve con true o false
 * @param {string} mensaje el texto a mostrar en el cuerpo del modal
 * @returns {Promise<boolean>} resuelve true si el usuario confirma false si cancela
 */
export function mostrarConfirm(mensaje) {
    return new Promise((resolve) => {
        if (!instanciaModalConfirmacion) {
            console.error("El modal de confirmación no está inicializado.");
            // usamos el confirm de siempre si algo fallo.
            resolve(confirm(mensaje));
            return;
        }

        resolverPromesa = resolve;

        const cuerpoModal = document.getElementById('confirmation-modal-body');
        cuerpoModal.textContent = mensaje;
        
        instanciaModalConfirmacion.show();
    });
}