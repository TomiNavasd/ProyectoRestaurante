/**
 * decide que imagen mostrar para un plato,si el plato tiene su propia imagen,
 * la usa sino devuelve una url a una imagen genérica que diseñe
 * @param {string|null} urlImagen la urlde la imagen que viene de la base de datos
 * @returns {string} la url final de la imagen a mostrar
 */
function obtenerImagen(urlImagen) {
    // si la URL no es nula o solo espacio blanco
    if (urlImagen && urlImagen.trim() !== '') {
        return urlImagen;
    }
    // si no hay imagen, usamos la de por defecto que subi
    return 'https://i.ibb.co/Gv0zcJQW/Sin-t-tulo-Folleto-A4-con-doblez-en-el-medio-420-mm-x-297-mm.png';
}

/**
 * tarjetas de los platos en la página principal del menu
 * @param {Array} platos - La lista de platos a mostrar.
 */
export function renderDishes(platos) {
    const contenedor = document.getElementById('dish-list-container');
    if (!contenedor) return;

    // Si el array de platos está vacio
    if (platos.length === 0) {
        contenedor.innerHTML = '<p class="text-muted text-center col-12">No se encontraron platos que coincidan con la búsqueda.</p>';
        return;
    }

    // mappeo
    contenedor.innerHTML = platos.map(plato => `
        <div class="col">
            <div class="card h-100 dish-card">
                <img src="${obtenerImagen(plato.image)}" class="card-img-top" alt="${plato.name}">
                <div class="card-body d-flex flex-column">
                    <div>
                        <h5 class="dish-name">${plato.name}</h5>
                        <p class="dish-description">${plato.description || ''}</p>
                    </div>
                    <div class="mt-auto pt-3">
                        <p class="dish-price">$${plato.price.toFixed(2)}</p>
                        <button class="btn btn-primary w-100 add-to-cart-btn" data-dish-id="${plato.id}">
                            Agregar a la Comanda
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}