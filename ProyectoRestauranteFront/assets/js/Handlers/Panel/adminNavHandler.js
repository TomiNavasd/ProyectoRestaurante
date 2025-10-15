export function initAdminNav() {
    const currentPage = window.location.pathname.split('/').pop();

    // Actualizamos el selector para que busque los enlaces en la nueva ubicación
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active'); // Marca el enlace actual como activo
        }
    });
}