// Обработчик при нажатии на кнопку "Download CV"
document.addEventListener('DOMContentLoaded', function () {
    const downloadButton = document.getElementById('downloadButton');
  
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
});