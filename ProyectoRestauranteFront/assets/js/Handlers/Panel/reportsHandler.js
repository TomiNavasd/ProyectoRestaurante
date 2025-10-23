import { getOrders, getOrderById } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js'; 
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * carga las ordenes según el rango de fechas, calcula el total y renderiza.
 */
async function generarReporte() {
    const contenedor = document.getElementById('report-orders-container');
    const resumenContenedor = document.getElementById('report-summary');
    const displayGanancia = document.getElementById('total-profit-display');
    const displayCantidad = document.getElementById('order-count-display');
    
    contenedor.innerHTML = `<p class="text-center">Generando reporte...</p>`;
    resumenContenedor.style.display = 'none'; // ocultar resumen mientras carga

    const fechaDesde = document.getElementById('date-from-report').value;
    const fechaHasta = document.getElementById('date-to-report').value;

    if (!fechaDesde || !fechaHasta) {
        mostrarNot("Por favor, seleccione un rango de fechas completo.", 'warning');
        contenedor.innerHTML = '<p class="text-muted">Seleccione un rango de fechas y genere el reporte.</p>';
        return;
    }

    const filtrosAPI = {
        from: `${fechaDesde}T00:00:00`,
        to: `${fechaHasta}T23:59:59`
    };

    try {
        const ordenesDelPeriodo = await getOrders(filtrosAPI);

        if (ordenesDelPeriodo.error) {
        throw new Error(ordenesDelPeriodo.error);
        }

        if (ordenesDelPeriodo.length === 0) {
            contenedor.innerHTML = '<p class="text-muted text-center">No se encontraron órdenes en el periodo seleccionado.</p>';
            displayGanancia.textContent = '0.00';
            displayCantidad.textContent = '0';
            resumenContenedor.style.display = 'block'; // mostrar resumen con ceros
            return;
        }

        // calcular ganancia total
        const gananciaTotal = ordenesDelPeriodo.reduce((total, orden) => total + orden.totalAmount, 0);

        // actualizar el resumen
        displayGanancia.textContent = gananciaTotal.toFixed(2);
        displayCantidad.textContent = ordenesDelPeriodo.length;
        resumenContenedor.style.display = 'block';

        // renderizar la lista de ordenes
        renderOrders(ordenesDelPeriodo, 'report-orders-container', '', false); // false = no editable

    } catch (error) {
        mostrarNot(`Error al generar el reporte: ${error.message}`, 'error');
        contenedor.innerHTML = '<p class="text-danger text-center">Ocurrió un error al cargar los datos.</p>';
    }
}

/**
 * configura el evento para abrir el modal de detalles en modo solo lectura
 */
function activarModalDetallesReporte() {
    const contenedorPrincipal = document.querySelector('main');
    const elementoModal = document.getElementById('order-details-modal');
    if (!contenedorPrincipal || !elementoModal) return;

    const instanciaModal = new bootstrap.Modal(elementoModal);
    
    contenedorPrincipal.addEventListener('click', async (event) => {
        const botonVerDetalle = event.target.closest('.view-details-btn');
        if (!botonVerDetalle) return;
        
        const ordenId = botonVerDetalle.dataset.orderId;
        const detallesDeLaOrden = await getOrderById(ordenId);
        
        if (detallesDeLaOrden) {
            renderOrderModal(detallesDeLaOrden, true); 
            instanciaModal.show();
        } else {
            mostrarNot('No se pudieron cargar los detalles de la orden.', 'error');
        }
    });
}

/**
 * punto de entrada para inicializar la página de reportes.
 */
export function initReportsPage() {

    const botonGenerar = document.getElementById('filter-report-btn');
    botonGenerar.addEventListener('click', generarReporte);
    activarModalDetallesReporte(); 
    
}