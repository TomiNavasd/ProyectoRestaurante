import { getOrders, updateOrderItemStatus, getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { getDishes } from '../../APIs/DishApi.js';
import { renderOrderPanel } from '../../Components/renderOrderPanel.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';
import { mostrarNot } from '../../notification.js';
import { mostrarConfirm } from '../../confirmation.js';

//carga de las ordenes
async function refrescarPanel() {
    const ordenes = await getOrders();
    renderOrderPanel(ordenes);
}

// funcion principal para las acciones en el panel
function configurarAccionesDelPanel() {
    const contenedorPrincipal = document.querySelector('main');
    const modalDetallesOrden = document.getElementById('order-details-modal');
    const modalAgregarPlatos = document.getElementById('add-dishes-modal');

    if (!contenedorPrincipal || !modalDetallesOrden || !modalAgregarPlatos) return;

    const instanciaModalDetalles = new bootstrap.Modal(modalDetallesOrden);
    const instanciaModalAgregarPlatos = new bootstrap.Modal(modalAgregarPlatos);
    
    // variable va a guardar una copia de la orden que estamos editando 
    let ordenEnEdicion = null;

    // unico listener en el main para manejar todos los clics de las tarjetas de ordenes
    contenedorPrincipal.addEventListener('click', async (event) => {
        const boton = event.target.closest('.view-details-btn, .status-action-btn, .order-action-btn, .cancel-order-btn, .cancel-item-btn');
        if (!boton) return;

        //logica para el boton ver detalles
        if (boton.classList.contains('view-details-btn')) {
            const ordenId = boton.dataset.orderId;
            const detallesDeLaOrden = await getOrderById(ordenId);

            if (detallesDeLaOrden) {
                // se crea una copia para poder modificarla sin afectar otros datos
                ordenEnEdicion = JSON.parse(JSON.stringify(detallesDeLaOrden));
                
                // usocopia para render
                renderOrderModal(ordenEnEdicion); 
                
                instanciaModalDetalles.show();
            } else {
                mostrarNot('No se pudieron cargar los detalles de la orden.', 'error');
            }
        }

        //logica para los botones preparar y terminar de cada item
        if (boton.classList.contains('status-action-btn')) {
            boton.disabled = true;
            boton.textContent = '...';
            const { orderId, itemId, newStatus } = boton.dataset;
            const resultado = await updateOrderItemStatus(orderId, itemId, newStatus);
            if (!resultado || resultado.error) {
                mostrarNot(resultado?.error || 'Ocurrió un error al actualizar el ítem.', 'error');
            }
            await refrescarPanel();
        }

        //logica para el boton entregar de la orden completa
        if (boton.classList.contains('order-action-btn')) {
            boton.disabled = true;
            boton.textContent = '...';
            const ordenId = boton.dataset.orderId;
            const nuevoEstadoId = boton.dataset.newStatusId;
            
            const tarjetaOrden = boton.closest('.card');
            const elementosItem = tarjetaOrden.querySelectorAll('.list-group-item');

            for (const item of elementosItem) {
                const itemId = item.dataset.itemId;
                if (itemId) {
                    await updateOrderItemStatus(ordenId, itemId, nuevoEstadoId);
                }
            }
            mostrarNot(`¡Orden #${ordenId} marcada como entregada!`);
            await refrescarPanel();
        }

        // logica para cancelar orden completa
        if (boton.classList.contains('cancel-order-btn')) {
            const ordenId = boton.dataset.orderId;
            
            const confirmado = await mostrarConfirm(`¿Estás seguro de que quieres CANCELAR la orden #${ordenId} completa?`);

            if (confirmado) { 
                boton.disabled = true;
                const tarjetaOrden = boton.closest('.card');
                const elementosItem = tarjetaOrden.querySelectorAll('.list-group-item');

                for (const itemEl of elementosItem) {
                    const itemId = itemEl.dataset.itemId;
                    if (itemId) {
                        await updateOrderItemStatus(ordenId, itemId, 5);
                    }
                }
                mostrarNot(`Orden #${ordenId} cancelada con éxito.`);
                await refrescarPanel();
            }
        }

        // logica para cancelar un solo item
        if (boton.classList.contains('cancel-item-btn')) {
            const { orderId, itemId } = boton.dataset;
            
            const confirmado = await mostrarConfirm(`¿Estás seguro de que quieres CANCELAR este ítem de la orden #${orderId}?`);
            
            if (confirmado) { 
                boton.disabled = true;
                const resultado = await updateOrderItemStatus(orderId, itemId, 5); // 5 = cancelado
                if (resultado.error) {
                    mostrarNot(resultado.error, 'error');
                } else {
                    mostrarNot('Ítem cancelado con éxito.');
                }
                await refrescarPanel();
            }
        }
    });

    

    //logica para el flujo entre modales Ver Detalles->Agregar platos->Volver a detalles

    modalAgregarPlatos.addEventListener('show.bs.modal', async () => {
        const idsDeItemsActuales = new Set(ordenEnEdicion.items.map(item => item.dish.id));
        const todosLosPlatos = await getDishes();
        renderDishesToModal(todosLosPlatos, idsDeItemsActuales);
    });

    modalAgregarPlatos.addEventListener('click', (event) => {
        const botonAgregar = event.target.closest('.add-dish-to-order-btn');
        if (botonAgregar && !botonAgregar.disabled) {
            const { dishId, dishName } = botonAgregar.dataset;
            const itemExistente = ordenEnEdicion.items.find(item => item.dish.id === dishId);
            
            if (itemExistente) {
                // si está marcado para borrar lo vuelve a agregar
                if (itemExistente.quantity === 0) {
                    itemExistente.quantity = 1;
                } else {
                    itemExistente.quantity++;
                }
            } else {
                ordenEnEdicion.items.push({ 
                    dish: { id: dishId, name: dishName }, 
                    quantity: 1, 
                    notes: '',
                    status: { id: 1, name: 'Pending' } 
                });
            }
            botonAgregar.disabled = true;
            botonAgregar.textContent = 'Agregado';
        }
        if (event.target.id === 'confirm-dishes-btn') {
            instanciaModalAgregarPlatos.hide();
        }
    });

    modalAgregarPlatos.addEventListener('hide.bs.modal', () => {
        renderOrderModal(ordenEnEdicion);
    });
    
    //logica para las interacciones dentro del modal de detalles
    modalDetallesOrden.addEventListener('click', async (event) => {
        const objetivo = event.target;

        if (objetivo.classList.contains('modal-quantity-btn')) {
            const elementoLista = objetivo.closest('li');
            const platoId = elementoLista.dataset.itemId;
            const itemEnEstado = ordenEnEdicion.items.find(item => item.dish.id === platoId);
            if (!itemEnEstado) return;

            const accion = objetivo.dataset.action;
            if (accion === 'increase') {
                itemEnEstado.quantity++;
            } else if (accion === 'decrease' && itemEnEstado.quantity > 0) {
                itemEnEstado.quantity--;
            }

            elementoLista.dataset.quantity = itemEnEstado.quantity;
            elementoLista.querySelector('.item-quantity').textContent = itemEnEstado.quantity;
            
            const spanNombre = elementoLista.querySelector('.d-flex span');

            if (itemEnEstado.quantity === 0) {
                elementoLista.classList.add('item-marked-for-deletion');
                if (spanNombre) spanNombre.classList.add('text-decoration-line-through');
            } else {
                elementoLista.classList.remove('item-marked-for-deletion');
                if (spanNombre) spanNombre.classList.remove('text-decoration-line-through');
            }
        }

        if (objetivo.id === 'save-changes-btn') {
            const ordenId = objetivo.dataset.orderId;
            
            const datosParaActualizar = {
                items: ordenEnEdicion.items
                    .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }))
            };

            objetivo.disabled = true;
            objetivo.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;

            const resultado = await updateOrder(ordenId, datosParaActualizar);

            objetivo.disabled = false;
            objetivo.innerHTML = 'Guardar Cambios';

            if (resultado.error) {
                mostrarNot(`Error al guardar: ${resultado.error}`, 'error');
            } else {
                mostrarNot('¡Orden actualizada con éxito!');
                instanciaModalDetalles.hide();
                await refrescarPanel();
            }
        }
    });

    modalDetallesOrden.addEventListener('input', (event) => {
        if (event.target.classList.contains('modal-item-note')) {
            const platoId = event.target.closest('li').dataset.itemId;
            const itemEnEstado = ordenEnEdicion.items.find(item => item.dish.id === platoId);
            if (itemEnEstado) {
                itemEnEstado.notes = event.target.value;
            }
        }
    });
}

export function initOrderStatusHandlers() {
    refrescarPanel();
    configurarAccionesDelPanel();
}