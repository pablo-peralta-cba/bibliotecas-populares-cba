document.addEventListener('DOMContentLoaded', () => {
    const cardTitles = document.querySelectorAll('.biblioteca-item .card .row .col-md-8 .card-body h5.card-title');
    const bibliotecaItems = document.querySelectorAll('.biblioteca-item');

    function convertTitleToLink() {
        if (window.innerWidth <= 460) {
            cardTitles.forEach((title, index) => {
                const link = bibliotecaItems[index].querySelector('.card-body .btn-primary');
                if (link && !title.querySelector('a')) { // Verificamos que el título no sea ya un enlace
                    const href = link.getAttribute('href');
                    const anchor = document.createElement('a');
                    anchor.href = href;
                    anchor.textContent = title.textContent;
                    anchor.classList.add('card-link'); // Opcional: añade una clase para estilos
                    title.textContent = ''; // Limpiamos el texto original del h5
                    title.appendChild(anchor); // Insertamos el enlace dentro del h5
                }
            });
        } else {
            // Si la pantalla es mayor, revertimos los títulos a texto plano (opcional)
            cardTitles.forEach(title => {
                const anchor = title.querySelector('a');
                if (anchor) {
                    title.textContent = anchor.textContent;
                    title.removeChild(anchor);
                }
            });
        }
    }

    // Ejecutamos la función al cargar la página
    convertTitleToLink();

    // Ejecutamos la función cada vez que se redimensiona la ventana
    window.addEventListener('resize', convertTitleToLink);
});



        document.addEventListener('DOMContentLoaded', () => {
            const form = document.querySelector('form');
            // Se puede añadir un evento submit para manejar la búsqueda
            form.addEventListener('submit', (event) => {
                event.preventDefault(); // Prevenir el envío predeterminado del formulario
                const queryString = new URLSearchParams(new FormData(form)).toString();
                window.location.href = `/bibliotecas?${queryString}`; // Redirigir a la URL con los parámetros de búsqueda
            });
        });

