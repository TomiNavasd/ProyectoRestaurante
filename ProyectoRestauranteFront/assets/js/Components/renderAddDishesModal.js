/**
 * Renderiza la lista de platos disponibles en el modal de "Agregar Platos".
 * @param {Array} allDishes - La lista completa de platos activos.
 * @param {Set<string>} currentItemIds - Un Set con los IDs de los platos que ya están en la orden.
 */
export function renderDishesToModal(allDishes, currentItemIds) {
    const container = document.getElementById('dishes-list-container');
    if (!container) return;

    if (allDishes.length === 0) {
        container.innerHTML = '<p class="text-center">No hay platos disponibles para agregar.</p>';
        return;
    }

    container.innerHTML = allDishes.map(dish => {
        const isAlreadyInOrder = currentItemIds.has(dish.id);
        return `
            <div class="card mb-2">
                <div class="card-body d-flex justify-content-between align-items-center">
                    <div>
                        <h6 class="card-title mb-0">${dish.name}</h6>
                        <small class="text-muted">$${dish.price.toFixed(2)}</small>
                    </div>
                    <button 
                        class="btn btn-sm btn-primary add-dish-to-order-btn"
                        data-dish-id="${dish.id}"
                        data-dish-name="${dish.name}"
                        ${isAlreadyInOrder ? 'disabled' : ''}>
                        ${isAlreadyInOrder ? 'Agregado' : 'Agregar'}
                    </button>
                </div>
            </div>
        `;
    }).join('');
}