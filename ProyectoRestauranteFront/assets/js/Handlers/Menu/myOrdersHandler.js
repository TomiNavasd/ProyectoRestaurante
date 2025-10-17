import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderActiveOrders } from '../../Components/renderMyOrders.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga las ordenes desde localStorage, las pide a la api y las muestra en pedidos en Curso
 */
async function cargarPedidosActivos() {
    const numerosDeOrdenGuardados = JSON.parse(localStorage.getItem('myOrders')) || [];
    if (numerosDeOrdenGuardados.length === 0) {
        renderActiveOrders([]);
        return;
    }

    // meto el Promise.allSettled por si una orden falla no se rompa todo el proceso
    const promesasDePedidos = numerosDeOrdenGuardados.map(id => getOrderById(id));
    const resultados = await Promise.allSettled(promesasDePedidos);

    const pedidos = resultados
        .filter(resultado => resultado.status === 'fulfilled' && resultado.value)
        .map(resultado => resultado.value);

    // pedido activo es cualquiera que no haya sido entregado
    const pedidosActivos = pedidos.filter(pedido => pedido.status.id < 4);
    renderActiveOrders(pedidosActivos);
}

/**
 * configura los eventos de la pagina por ej abrir el modal de detalles
 * y manejar las acciones dentro de el.cambiar cantidades, guardar.....)
 */
function configurarAccionesDePedidos() {
    const contenedorPedidosActivos = document.getElementById('active-orders-container');
    const elementoModal = document.getElementById('order-details-modal');
    
    if (!contenedorPedidosActivos || !elementoModal) return;

    const instanciaModal = new bootstrap.Modal(elementoModal);

    // variable q guarda una copia de la orden que estamos editando tipo testigo
    let pedidoEnEdicion = null;

    // listener para abrir el modal al hacer clic en ver detalle/modificar
    contenedorPedidosActivos.addEventListener('click', async (event) => {
        const botonVerDetalle = event.target.closest('.btn-outline-primary');
        if (!botonVerDetalle) return;

        const ordenId = botonVerDetalle.dataset.orderId;
        if (!ordenId) return;

        const detallesDelPedido = await getOrderById(ordenId);
        if (!detallesDelPedido) {
            mostrarNot("No se pudieron cargar los detalles de la orden.", 'error');
            return;
        }
        
        // copia para poder modificarla sin afectar el estado original.
        pedidoEnEdicion = JSON.parse(JSON.stringify(detallesDelPedido));

        renderOrderModal(detallesDelPedido);
        instanciaModal.show();
    });

    // Listener para todas las acciones DENTRO del modal
    elementoModal.addEventListener('click', async (event) => {
        const objetivo = event.target;

        if (objetivo.classList.contains('modal-quantity-btn')) {
            const elementoLista = objetivo.closest('li');
            const platoId = elementoLista.dataset.itemId;
            const itemEnEstado = pedidoEnEdicion.items.find(item => item.dish.id === platoId);
            if (!itemEnEstado) return;

            const accion = objetivo.dataset.action;
            if (accion === 'increase') {
                itemEnEstado.quantity++;
            } else if (accion === 'decrease' && itemEnEstado.quantity > 0) {
                itemEnEstado.quantity--;
            }
            
            elementoLista.dataset.quantity = itemEnEstado.quantity;
            elementoLista.querySelector('.item-quantity').textContent = itemEnEstado.quantity;
        }

        if (objetivo.id === 'save-changes-btn') {
            const botonGuardar = objetivo;
            const ordenId = botonGuardar.dataset.orderId;
            if (!ordenId) {
                mostrarNot("Error: No se pudo identificar la orden.", 'error');
                return;
            }

            botonGuardar.disabled = true;
            botonGuardar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;
            
            // hago la peticion usando nuestra variable pedidoEnEdicion como fuente de verdad
            const datosParaActualizar = {
                items: pedidoEnEdicion.items
                    .filter(item => item.quantity > 0)
                    .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }))
            };
            
            const resultado = await updateOrder(ordenId, datosParaActualizar);

            botonGuardar.disabled = false;
            botonGuardar.innerHTML = 'Guardar Cambios';

            if (resultado.error) {
                mostrarNot(`Error al guardar: ${resultado.error}`, 'error');
            } else {
                mostrarNot(`Orden #${ordenId} actualizada con éxito.`);
                instanciaModal.hide();
                await cargarPedidosActivos(); // await para asegurar que se refresque
            }
        }
    });
}

/**
 * punto de entrada para la pagina mis pedidos
 */
export function initMyOrders() {
    cargarPedidosActivos();
    configurarAccionesDePedidos();
}