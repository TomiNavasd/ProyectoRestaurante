/**
 * Dibuja las tarjetas de los platos en el HTML.
 * @param {Array} dishes - El array de platos.
 */
export function renderDishes(dishes) {
    const container = document.getElementById('dish-list-container');
    if (!container) return;

    if (dishes.length === 0) {
        container.innerHTML = '<p class="text-center col-12">No se encontraron platos.</p>';
        return;
    }

    container.innerHTML = dishes.map(dish => `
        <div class="col">
            <div class="card h-100">
                <img src="${dish.image || 'https://via.placeholder.com/400x200.png?text=Sin+Imagen'}" class="card-img-top" alt="${dish.name}">
                <div class="card-body d-flex flex-column">
                    <h5 class="card-title">${dish.name}</h5>
                    <p class="card-text">${dish.description}</p>
                    <p class="card-text mt-auto"><strong>$${dish.price.toFixed(2)}</strong></p>
                </div>
                <div class="card-footer">
                    <button class="btn btn-primary w-100 add-to-cart-btn" data-dish-id="${dish.id}">
                        Agregar a la Comanda
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}