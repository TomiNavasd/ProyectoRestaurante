/**
 * muestra lista de ordenes dentro de un contenedor especifico
 * esta función la uso en "Mis Pedidos" como para el "Historial"
 * @param {Array} ordenes lista de órdenes a mostrar
 * @param {string} idContenedor id del div donde se van a dibujar las tarjetas
 * @param {string} mensajeVacio texto a mostrar si no hay ordenes en la lista
 * @param {boolean} esEditable define si las ordenes deben mostrar el botón de "Modificar"
 */
export function renderOrders(ordenes, idContenedor, mensajeVacio, esEditable = true) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;

    // Si la lista de ordenes esta vacia, mostramos el mensaje y terminamos
    if (!ordenes || ordenes.length === 0) {
        contenedor.innerHTML = `<p class="text-muted text-center p-4">${mensajeVacio}</p>`;
        return;
    }

    contenedor.innerHTML = ordenes.map(orden => {
        // Chequeamos si la orden es parte del historial (Entregado o Cancelado).
        // esto nos sirve para cambiar el color del badge de estado.
        const esDelHistorial = orden.status.id >= 4;
        let htmlDelBoton;

        // dependiendo de si la orden es editable o no, el botón cambia.
        // en el historial solo se puede ver detalle.
        if (esEditable && !esDelHistorial) {
            htmlDelBoton = `
                <button class="btn btn-sm btn-primary view-details-btn" 
                        data-order-id="${orden.orderNumber}"
                        data-bs-toggle="modal"
                        data-bs-target="#order-details-modal">
                    Ver Detalle / Modificar
                </button>
            `;
        } else {
            htmlDelBoton = `
                <button class="btn btn-sm btn-outline-secondary view-details-btn" 
                        data-order-id="${orden.orderNumber}"
                        data-bs-toggle="modal"
                        data-bs-target="#order-details-modal">
                    Ver Detalle
                </button>
            `;
        }
        
        // formateamos la fecha ej"15/10/2025"
        const fechaFormateada = new Date(orden.createdAt).toLocaleDateString();

        return `
            <div class="card order-card">
                <div class="card-body">
                    <div class="order-card-header">
                        <div>
                            <h5 class="order-title">Orden #${orden.orderNumber}</h5>
                            <div class="order-card-info">
                                <span>Total: $${orden.totalAmount.toFixed(2)}</span>
                                <span class="mx-2">|</span>
                                <span>Realizado el: ${fechaFormateada}</span>
                            </div>
                        </div>
                        <div class="d-flex flex-column align-items-end">
                            <span class="badge ${esDelHistorial ? 'bg-secondary' : 'bg-success'} mb-2">
                                ${orden.status.name}
                            </span>
                            ${htmlDelBoton}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}