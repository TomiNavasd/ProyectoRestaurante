/**
 * dibuja la lista de platos en el panel de gestión de menu
 * @param {Array} platos lista de platos a mostrar.
 */
export function renderAdminDishes(platos) {
    const contenedor = document.getElementById('panel-dish-list');
    if (!contenedor) return;

    // mapeo
    contenedor.innerHTML = platos.map(plato => `
        <div class="col">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${plato.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">$${plato.price.toFixed(2)}</h6>
                    <p class="card-text">
                        <span class="badge ${plato.isActive ? 'bg-success' : 'bg-danger'}">
                            ${plato.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </p>
                </div>
                <div class="card-footer d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-secondary edit-dish-btn" data-dish-id="${plato.id}" data-bs-toggle="modal" data-bs-target="#edit-dish-modal">Editar</button>
                    
                    ${plato.isActive
                        ? `<button class="btn btn-sm btn-danger status-toggle-btn" data-dish-id="${plato.id}" data-action="deactivate">Desactivar</button>`
                        : `<button class="btn btn-sm btn-success status-toggle-btn" data-dish-id="${plato.id}" data-action="activate">Activar</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}