/**
 * entrada de logica para la de la navegacion del panel
 */
export function initAdminNav() {
    // para saber en qué página estamos sacamos el nombre del archivo actual de la url
    const paginaActual = window.location.pathname.split('/').pop();
    // links que estan en el nav
    const enlacesDeNavegacion = document.querySelectorAll('.navbar-nav .nav-link');
    
    // recorremos cada uno de los links que encontramos
    enlacesDeNavegacion.forEach(enlace => {
        // se compara href del link ej panel.html con la pagina actual
        if (enlace.getAttribute('href') === paginaActual) {
            // si coinciden le ponemos la clase active para que el css lo resalte
            enlace.classList.add('active');
        }
    });
}