import { getDishes } from '../../APIs/DishApi.js';
import { getOrderById, updateOrder } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { renderDishesToModal } from '../../Components/renderAddDishesModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga las ordenes desde localStorage las pide a la api y se clasifican en curso y en historial
 */
async function cargarYClasificarPedidos() {
    const ordenesGuardadas = JSON.parse(localStorage.getItem('myOrders')) || [];
    if (ordenesGuardadas.length === 0) {
        renderOrders([], 'active-orders-container', 'No tienes pedidos en curso.');
        renderOrders([], 'history-orders-container', 'No tienes pedidos en tu historial.');
        return;
    }

    // se usa Promise.allSettled para que si una orden falla no se rompa todo
    const promesasDeOrdenes = ordenesGuardadas.map(id => getOrderById(id));
    const resultados = await Promise.allSettled(promesasDeOrdenes);
    
    const ordenesValidas = resultados
        .filter(resultado => resultado.status === 'fulfilled' && resultado.value !== null)
        .map(resultado => resultado.value);

    const ordenesActivas = ordenesValidas.filter(orden => orden.status.id < 4);
    const ordenesHistorial = ordenesValidas.filter(orden => orden.status.id >= 4);
    
    renderOrders(ordenesActivas, 'active-orders-container', 'No tienes pedidos en curso.');
    renderOrders(ordenesHistorial, 'history-orders-container', 'No tienes pedidos en tu historial.');
}

/**
 * configura todos los eventos de los detalles y la modificacion de una orden
 */
function configurarDetallesDeOrden() {
    const contenedorPrincipal = document.querySelector('main');
    const modalDetalles = document.getElementById('order-details-modal');
    const modalAgregarPlatos = document.getElementById('add-dishes-modal');
    
    if (!contenedorPrincipal || !modalDetalles || !modalAgregarPlatos) return;

    const instanciaModalDetalles = new bootstrap.Modal(modalDetalles);
    const instanciaModalAgregarPlatos = new bootstrap.Modal(modalAgregarPlatos);
    
    // variable de fuente de verdad mientras editamos una orden
    let ordenEnEdicion = null;

    contenedorPrincipal.addEventListener('click', async (event) => {
        const botonVerDetalle = event.target.closest('.view-details-btn');
        if (!botonVerDetalle) return;
        
        const ordenId = botonVerDetalle.dataset.orderId;
        const detallesDeLaOrden = await getOrderById(ordenId);

        if (!detallesDeLaOrden) {
            mostrarNot("No se pudieron cargar los detalles de la orden.", 'error');
            return;
        }
        // se crea una copia profunda para poder modificarla sin afectar otros datos
        ordenEnEdicion = JSON.parse(JSON.stringify(detallesDeLaOrden));
        renderOrderModal(detallesDeLaOrden);
        instanciaModalDetalles.show();
    });
    
    // la logica para el flujo entre modales es Detalles->Agregar platos->Volver a detalles
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
                itemExistente.quantity++;
            } else {
                ordenEnEdicion.items.push({ dish: { id: dishId, name: dishName }, quantity: 1, notes: '' });
            }
            botonAgregar.disabled = true;
            botonAgregar.textContent = 'Agregado';
        }
        if (event.target.id === 'confirm-dishes-btn') {
            instanciaModalAgregarPlatos.hide();
        }
    });

    modalAgregarPlatos.addEventListener('hidden.bs.modal', () => {
        // se cierra el modal de agregar volvemos a renderizar el de detalles con la info actualizada
        renderOrderModal(ordenEnEdicion);
        instanciaModalDetalles.show();
    });
    
    // Listener para todas las acciones DENTRO del modal de detalles
    modalDetalles.addEventListener('click', async (event) => {
        const objetivo = event.target;

        if (objetivo.matches('[data-bs-target="#add-dishes-modal"]')) {
            instanciaModalDetalles.hide();
        }

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
            
            if (itemEnEstado.quantity === 0) {
                ordenEnEdicion.items = ordenEnEdicion.items.filter(item => item.dish.id !== platoId);
                elementoLista.remove();
            } else {
                elementoLista.dataset.quantity = itemEnEstado.quantity;
                elementoLista.querySelector('.item-quantity').textContent = itemEnEstado.quantity;
            }
        }
        
        if (objetivo.id === 'save-changes-btn') {
            const botonGuardar = objetivo;
            const ordenId = botonGuardar.dataset.orderId;
            
            const datosParaActualizar = {
                items: ordenEnEdicion.items
                    .filter(item => item.quantity > 0)
                    .map(item => ({ id: item.dish.id, quantity: item.quantity, notes: item.notes || '' }))
            };

            botonGuardar.disabled = true;
            botonGuardar.innerHTML = `<span class="spinner-border spinner-border-sm"></span> Guardando...`;
            const resultado = await updateOrder(ordenId, datosParaActualizar);
            botonGuardar.disabled = false;
            botonGuardar.innerHTML = 'Guardar Cambios';

            if (resultado.error) {
                mostrarNot(`Error al guardar: ${resultado.error}`, 'error');
            } else {
                mostrarNot(`Orden #${ordenId} actualizada con éxito.`);
                instanciaModalDetalles.hide();
                await cargarYClasificarPedidos(); // await para asegurar que se refresque bien
            }
        }
    });

    modalDetalles.addEventListener('input', (event) => {
        if (event.target.classList.contains('modal-item-note')) {
            const input = event.target;
            const platoId = input.closest('li').dataset.itemId;
            const itemEnEstado = ordenEnEdicion.items.find(item => item.dish.id === platoId);
            if (itemEnEstado) {
                itemEnEstado.notes = input.value;
            }
        }
    });
}

/**
 * punto de entrada para la pagina mis pedidos
 */
export function initOrdersPage() {
    cargarYClasificarPedidos();
    configurarDetallesDeOrden();
}