export function renderAdminDishes(dishes) {
    const container = document.getElementById('panel-dish-list');
    if (!container) return;

    container.innerHTML = dishes.map(dish => `
        <div class="col">
            <div class="card h-100">
                <div class="card-body">
                    <h5 class="card-title">${dish.name}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">$${dish.price.toFixed(2)}</h6>
                    <p class="card-text">
                        <span class="badge ${dish.isActive ? 'bg-success' : 'bg-danger'}">
                            ${dish.isActive ? 'Activo' : 'Inactivo'}
                        </span>
                    </p>
                </div>
                <div class="card-footer d-flex justify-content-end gap-2">
                    <button class="btn btn-sm btn-secondary edit-dish-btn" data-dish-id="${dish.id}" data-bs-toggle="modal" data-bs-target="#edit-dish-modal">Editar</button>
                    
                    ${dish.isActive
                        ? `<button class="btn btn-sm btn-danger status-toggle-btn" data-dish-id="${dish.id}" data-action="deactivate">Desactivar</button>`
                        : `<button class="btn btn-sm btn-success status-toggle-btn" data-dish-id="${dish.id}" data-action="activate">Activar</button>`
                    }
                </div>
            </div>
        </div>
    `).join('');
}