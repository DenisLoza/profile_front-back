function loadHeader() {
    fetch('header.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load header');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('header').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading header:', error);
        });
}

function loadFooter() {
    fetch('footer.html')
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to load footer');
            }
            return response.text();
        })
        .then(html => {
            document.getElementById('footer').innerHTML = html;
        })
        .catch(error => {
            console.error('Error loading footer:', error);
        });
}

// Загружаем header.html и footer.html при загрузке страницы
function loadContent() {
    loadHeader();
    loadFooter();
}

loadContent();

// Обрабатываем событие изменения адресной строки браузера (например, при переходе назад/вперед или при загрузке новой страницы)
window.addEventListener('popstate', function(event) {
    loadContent();
});