document.addEventListener('DOMContentLoaded', () => {
    const cardTitles = document.querySelectorAll('.biblioteca-item .card .row .col-md-8 .card-body h5.card-title');
    const bibliotecaItems = document.querySelectorAll('.biblioteca-item');

    function convertTitleToLink() {
        if (window.innerWidth <= 460) {
            cardTitles.forEach((title, index) => {
                const link = bibliotecaItems[index].querySelector('.card-body .btn-primary');
                if (link && !title.querySelector('a')) { 
                    const href = link.getAttribute('href');
                    const anchor = document.createElement('a');
                    anchor.href = href;
                    anchor.textContent = title.textContent;
                    anchor.classList.add('card-link'); 
                    title.textContent = '';
                    title.appendChild(anchor); 
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

 
    convertTitleToLink();


    window.addEventListener('resize', convertTitleToLink);
});



        document.addEventListener('DOMContentLoaded', () => {
            const form = document.querySelector('form');
         
            form.addEventListener('submit', (event) => {
                event.preventDefault();
                const queryString = new URLSearchParams(new FormData(form)).toString();
                window.location.href = `/bibliotecas?${queryString}`; 
            });
        });

