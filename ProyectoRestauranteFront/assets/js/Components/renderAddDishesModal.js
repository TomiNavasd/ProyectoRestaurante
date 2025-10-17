/**
 * Dibuja la lista de platos que se pueden agregar a una orden
 * @param {Array} platosDisponibles  lista completa de platos que se pueden agregar.
 * @param {Set<string>} idsEnLaOrden  ids de platos en la orden
 */
export function renderDishesToModal(platosDisponibles, idsEnLaOrden) {
    const contenedor = document.getElementById('dishes-list-container');
    if (!contenedor) return;

    // si no hay platos para mostrar
    if (platosDisponibles.length === 0) {
        contenedor.innerHTML = '<p class="text-center">No hay platos disponibles para agregar.</p>';
        return;
    }

    // hago mapeo
    contenedor.innerHTML = platosDisponibles.map(plato => {
        // chequeo si el plato ya estaba en la orden
        const estaEnLaOrden = idsEnLaOrden.has(plato.id);

        // tmplate
        return `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="card-title mb-0">${plato.name}</h6>
                        <small class="text-muted">$${plato.price.toFixed(2)}</small>
                    </div>
                    <button 
                        class="btn btn-sm btn-primary add-dish-to-order-btn"
                        data-dish-id="${plato.id}"
                        data-dish-name="${plato.name}"
                        ${estaEnLaOrden ? 'disabled' : ''}> 
                        ${estaEnLaOrden ? 'Agregado' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}