    /**
     * el contenido del modal de detalles de la orden
     * @param {object} order - objeto de la orden con todos sus detalles
     */
    export function renderOrderModal(order) {
        const elementoNumeroOrden = document.getElementById('modal-order-number');
        const cuerpoDelModal = document.getElementById('modal-order-body');
        const botonGuardar = document.querySelector('#order-details-modal #save-changes-btn');

        if (!elementoNumeroOrden || !cuerpoDelModal) return;

        elementoNumeroOrden.textContent = `Detalles de la Orden #${order.orderNumber}`;

        // una orden solo se puede editar si está en estado pndiente
        const esEditable = order.status.id === 1;

        if (botonGuardar) {
            botonGuardar.dataset.orderId = order.orderNumber;
            // mostramos el botón de guardar cambios si la orden es editable
            botonGuardar.style.display = esEditable ? 'block' : 'none';
        }

        // la etiqueta del detalle de entrega cambia dependiendo del tipo de pedido.
        let etiquetaEntrega = 'Detalle';

        if (order.deliveryType.id === 1) {
            etiquetaEntrega = 'Dirección';
        } else if (order.deliveryType.id === 2) {
            etiquetaEntrega = 'Nombre';
        } else if (order.deliveryType.id === 3) {
            etiquetaEntrega = 'N° de Mesa';
        }

        // el detalle de la entrega solo se muestra, no se edita
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
            <hr>
            <h6>Ítems en la Orden</h6>
            <ul id="modal-item-list" class="list-group">
                ${order.items.map(item => `
                    <li class="list-group-item" data-item-id="${item.dish.id}" data-quantity="${item.quantity}">
                        <div class="d-flex justify-content-between align-items-center">
                            <span>${item.dish.name}</span>
                            <div class="d-flex align-items-center">
                                ${esEditable 
                                    ? `<button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="decrease">-</button>
                                    <span class="mx-2 item-quantity">${item.quantity}</span>
                                    <button class="btn btn-sm btn-outline-secondary modal-quantity-btn" data-action="increase">+</button>`
                                    : `<span class="item-quantity">Cantidad: ${item.quantity}</span>`
                                }
                            </div>
                        </div>
                        ${esEditable 
                            ? `<input type="text" class="form-control form-control-sm mt-2 modal-item-note" placeholder="Notas para este plato..." value="${item.notes || ''}">`
                            : `${item.notes ? `<p class="text-muted mt-2 mb-0">Nota: ${item.notes}</p>` : ''}`
                        }
                    </li>
                `).join('')}
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