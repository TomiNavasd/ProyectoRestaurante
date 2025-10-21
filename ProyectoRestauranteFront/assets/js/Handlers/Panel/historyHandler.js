import { getOrders, getOrderById } from '../../APIs/OrderApi.js';
import { renderOrders } from '../../Components/renderOrdersPage.js';
import { renderOrderModal } from '../../Components/renderOrderModal.js';
import { mostrarNot } from '../../notification.js';

/**
 * Carga órdenes desde la API (solo con filtro de fecha) y luego
 * aplica los filtros de búsqueda y estado en el cliente.
 */
async function cargarHistorial(filtrosAPI = {}) {
    const contenedor = document.getElementById('history-orders-container');
    contenedor.innerHTML = `<p class="text-center">Cargando historial...</p>`;

    // --- 1. LLAMAR A LA API (SOLO CON FILTROS DE FECHA) ---
    const todasLasOrdenes = await getOrders(filtrosAPI);
    
    // --- 2. FILTRAR PRIMERO POR ESTADOS DE HISTORIAL (4 y 5) ---
    // (Asumiendo 4 = Entregado/Delivery, 5 = Cerrado/Closed)
    let ordenesBaseHistorial = todasLasOrdenes.filter(
        orden => orden.status.id === 4 || orden.status.id === 5
    );

    // --- 3. LEER FILTROS DEL DOM ---
    const searchText = document.getElementById('history-search-input').value.trim();
    const statusId = document.getElementById('history-status-filter').value;

    // --- 4. APLICAR FILTROS ADICIONALES ---
    let ordenesFiltradas = ordenesBaseHistorial;

    // (A) Filtro de Búsqueda por N° de Orden
    if (searchText) {
        ordenesFiltradas = ordenesFiltradas.filter(orden =>
            orden.orderNumber.toString().includes(searchText)
        );
    }

    // (B) Filtro de Estado
    if (statusId !== 'all') {
        // Si se seleccionó "Closed" (5) o "Delivery" (4)
        ordenesFiltradas = ordenesFiltradas.filter(orden => 
            orden.status.id == statusId
        );
    }
    
    // --- 5. RENDERIZAR ---
    renderOrders(ordenesFiltradas, 'history-orders-container', 'No se encontraron órdenes que coincidan con los filtros.', false);
}

/**
 * configura el evento para abrir el modal de ver detalle en cada orden
 */
function activarModalDetalles() {
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
            renderOrderModal(detallesDeLaOrden);
            // ocultamos el boton agregar plato
            const contenedorBotonAgregar = document.querySelector('#order-details-modal .d-grid');
            if(contenedorBotonAgregar) {
                contenedorBotonAgregar.style.display = 'none';
            }

            instanciaModal.show();
        } else {
            mostrarNot('No se pudieron cargar los detalles de la orden.', 'error');
        }
    });
}

/**
 * --- 4. FUNCIÓN ACTUALIZADA ---
 * punto de entrada para inicializar toda la pagina de historial
 */
export function initHistoryPage() {
    const botonFiltrar = document.getElementById('filter-btn');
    // --- Añadir selectores para nuevos filtros ---
    const searchInput = document.getElementById('history-search-input');
    const statusFilter = document.getElementById('history-status-filter');
    
    // --- Función centralizada para filtrar ---
    const ejecutarFiltro = () => {
        const fechaDesde = document.getElementById('date-from').value;
        const fechaHasta = document.getElementById('date-to').value;

        const filtros = {};
        // aseguro de que el filtro incluya el dia completo
        if (fechaDesde) {
            filtros.from = `${fechaDesde}T00:00:00`;
        }
        if (fechaHasta) {
            filtros.to = `${fechaHasta}T23:59:59`;
        }
        
        // La función cargarHistorial ahora leerá los otros filtros (search, status)
        cargarHistorial(filtros);
    };

    // --- Asignar listeners a TODOS los filtros ---
    botonFiltrar.addEventListener('click', ejecutarFiltro);
    searchInput.addEventListener('input', ejecutarFiltro); // Se filtra al escribir
    statusFilter.addEventListener('change', ejecutarFiltro); // Se filtra al cambiar
    // También filtramos si cambian las fechas, para no depender solo del botón
    document.getElementById('date-from').addEventListener('change', ejecutarFiltro);
    document.getElementById('date-to').addEventListener('change', ejecutarFiltro);


    cargarHistorial(); // carga sin filtro
    activarModalDetalles(); // logica de detalles
}