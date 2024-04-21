document.addEventListener('DOMContentLoaded', function () {
    const downloadButton = document.getElementById('downloadButton');

    if (downloadButton) {
        downloadButton.addEventListener('click', function () {
            fetch('/api/download-cv', {
                method: 'GET',
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to download CV');
                }
                return response.blob();
            })
            .then(blob => {
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'cv.pdf';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            })
            .catch(error => {
                console.error('Error downloading CV:', error);
            });
        });
    }

    const contactForm = document.getElementById("contact-form");
    if (contactForm) {
        contactForm.addEventListener("submit", async function(event) {
            event.preventDefault(); // Предотвращаем стандартное поведение формы

            var formData = {
                name: document.getElementById("name").value,
                email: document.getElementById("email").value,
                message: document.getElementById("message").value
            };

            try {
                const response = await fetch("/submit-form", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    this.reset(); // Сбрасываем форму
                    document.getElementById("response-message").innerText = "Спасибо";
                    document.getElementById("response-message").style.display = "block";
                } else {
                    throw new Error('Network response was not ok');
                }
            } catch (error) {
                console.error("Error:", error);
                this.reset(); // Сбрасываем форму
                document.getElementById("response-message").innerText = "Ошибка";
                document.getElementById("response-message").style.display = "block";
            }
        });
    }
});