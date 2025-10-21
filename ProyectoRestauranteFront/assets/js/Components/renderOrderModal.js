/**
 * Renderiza el contenido del modal de detalles de la orden.
 * @param {object} order - El objeto de la orden con todos sus detalles.
 */
export function renderOrderModal(order) {
    const elementoNumeroOrden = document.getElementById('modal-order-number');
    const cuerpoDelModal = document.getElementById('modal-order-body');
    const botonGuardar = document.querySelector('#order-details-modal #save-changes-btn');

    if (!elementoNumeroOrden || !cuerpoDelModal) return;

    elementoNumeroOrden.textContent = `Detalles de la Orden #${order.orderNumber}`;

    const esEditable = order.status.id === 1;

    if (botonGuardar) {
        botonGuardar.dataset.orderId = order.orderNumber;
        botonGuardar.style.display = esEditable ? 'block' : 'none';
    }

    let etiquetaEntrega = 'Detalle';
    if (order.deliveryType.id === 1) {
        etiquetaEntrega = 'Dirección';
    } else if (order.deliveryType.id === 2) {
        etiquetaEntrega = 'Nombre';
    } else if (order.deliveryType.id === 3) {
        etiquetaEntrega = 'N° de Mesa';
    }

const htmlDetallesEntrega = `
        <p><strong>Tipo de Entrega:</strong> ${order.deliveryType.name}</p>
        <p><strong>${etiquetaEntrega}:</strong> ${order.deliveryTo || 'N/A'}</p>
    `;

    cuerpoDelModal.innerHTML = `
        <div class="row">
            <div class="col-md-6">
                <p><strong>Estado:</strong> <span class="badge bg-info">${order.status.name}</span></p>
                <p><strong>Total:</strong> $${order.totalAmount.toFixed(2)}</p>
            </div>
            <div class="col-md-6">
                ${htmlDetallesEntrega}
            </div>
        </div>

        ${order.notes
            ? `<div class="order-general-notes bg-light p-3 rounded mt-3 mb-3 shadow-sm border">
                <h6 class="text-dark fw-semibold mb-2">
                    <i class="bi bi-chat-left-text text-muted me-2"></i>Notas Generales de la Orden
                </h6>
                <p class="mb-0 fst-italic" style="white-space: pre-wrap;">${order.notes}</p>
            </div>`
            : ''
        }
        <hr>
        <h6>Ítems en la Orden</h6>
        <ul id="modal-item-list" class="list-group">
            ${order.items.map(item => {
                // --- LÓGICA DE ESTILO ACTUALIZADA ---
                const isCanceled = item.status.id === 5;
                // ¡NUEVO! Comprobar si está marcado para borrar (cantidad 0)
                const isMarkedForDeletion = item.quantity === 0 && !isCanceled;

                let liClass = '';
                if (isCanceled) liClass = 'list-group-item-light text-muted';
                if (isMarkedForDeletion) liClass = 'item-marked-for-deletion';

                let spanClass = '';
                if (isCanceled || isMarkedForDeletion) spanClass = 'text-decoration-line-through';
                // --- FIN LÓGICA DE ESTILO ---

                return `
                    <li class="list-group-item ${liClass}" data-item-id="${item.dish.id}" data-quantity="${item.quantity}">
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="${spanClass}">${item.dish.name}</span>
                            <div class="d-flex align-items-center">
                                ${esEditable && !isCanceled
                                    ? `<button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="decrease">-</button>
                                    <span class="mx-2 item-quantity">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="increase">+</button>`
                                    : `<span class="item-quantity">Cantidad: ${item.quantity}</span>`
                                }
                            </div>
                        </div>
                        ${esEditable && !isCanceled
                            ? `<input type="text" class="form-control form-control-sm mt-2 modal-item-note" placeholder="Notas para este plato..." value="${item.notes || ''}">`
                            : `${item.notes ? `<p class="text-muted mt-2 mb-0 fst-italic">Nota: ${item.notes}</p>` : ''}`
                        }
                        ${isCanceled
                            ? `<p class="text-danger small mt-1 mb-0 fw-bold">Plato Cancelado</p>` : ''
                        }
                    </li>
                `;
            }).join('')}
        </ul>
        ${esEditable 
            ? `<div class="d-grid gap-2 mt-4">
                <button class="btn btn-success" type="button" data-bs-toggle="modal" data-bs-target="#add-dishes-modal">
                    Agregar Platos
                </button>
            </div>`
            : ''
        }
    `;
}