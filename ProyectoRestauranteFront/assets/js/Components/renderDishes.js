function getDishImageUrl(imageUrl) {
    if (imageUrl && imageUrl.trim() !== '') {
        return imageUrl;
    }
    // URL corregida y 100% válida
    return 'https://i.ibb.co/Gv0zcJQW/Sin-t-tulo-Folleto-A4-con-doblez-en-el-medio-420-mm-x-297-mm.png';
    
}

/**
 * Renderiza la lista de platos en el contenedor principal.
 * @param {Array} dishes - La lista de platos a mostrar.
 */
export function renderDishes(dishes) {
    const container = document.getElementById('dish-list-container');
    if (!container) return;

    if (dishes.length === 0) {
        container.innerHTML = '<p class="text-muted text-center col-12">No se encontraron platos que coincidan con la búsqueda.</p>';
        return;
    }

    container.innerHTML = dishes.map(dish => `
        <div class="col">
            <div class="card h-100 dish-card">
                <img src="${getDishImageUrl(dish.image)}" class="card-img-top" alt="${dish.name}">
                <div class="card-body">
                    <div>
                        <h5 class="dish-name">${dish.name}</h5>
                        <p class="dish-description">${dish.description || ''}</p>
                    </div>
                    <div class="mt-auto">
                        <p class="dish-price">$${dish.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100 add-to-cart-btn" data-dish-id="${dish.id}">
                            Agregar a la Comanda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}