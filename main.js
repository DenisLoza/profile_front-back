const http = require('http');
const fs = require('fs');
const path = require('path');
const { parse } = require('querystring');

const port = 8000;
const wwwPath = path.join(__dirname, 'www');
const dataPath = path.join(__dirname, 'data');
const dataFilePath = path.join(dataPath, 'data.json');

// Проверка наличия файла data.json и его создание, если его нет
try {
    fs.accessSync(dataFilePath, fs.constants.F_OK);
} catch (err) {
    console.error("File 'data.json' does not exist. Creating...");
    fs.writeFileSync(dataFilePath, '[]');
    console.log("File 'data.json' created successfully.");
}

const server = http.createServer((req, res) => {
    const requestedUrl = req.url;

    if (requestedUrl === '/') {
        const redirectTo = '/index.html';
        res.writeHead(302, { 'Location': redirectTo });
        res.end();
        return;
    }

    if (requestedUrl === '/api/download-cv') {
        const filePath = path.join(dataPath, 'cv.pdf');

        fs.stat(filePath, (err, fileStats) => {
            if (err || !fileStats.isFile()) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                const fileStream = fs.createReadStream(filePath);
                fileStream.pipe(res);
            }
        });
    } else if (requestedUrl === '/submit-form' && req.method === 'POST') {
        let body = '';
        
        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            // Парсим данные из JSON-строки
            const formData = JSON.parse(body);

            const currentDate = new Date();
            formData.date = currentDate.toLocaleDateString();
            formData.time = currentDate.toLocaleTimeString();

            try {
                // Читаем текущие данные из файла data.json
                const jsonData = JSON.parse(fs.readFileSync(dataFilePath));

                // Преобразуем данные формы в нужный формат
                const formattedData = {
                    name: formData.name,
                    email: formData.email,
                    message: formData.message,
                    date: formData.date,
                    time: formData.time
                };

                // Добавляем новые данные в массив
                jsonData.push(formattedData);

                // Записываем обновленные данные обратно в файл
                fs.writeFileSync(dataFilePath, JSON.stringify(jsonData, null, 2));
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('Form data saved successfully!');
            } catch (error) {
                console.error("Error processing form data:", error);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                res.end('An error occurred while processing the form data.');
            }
        });
    } else {
        const filePath = path.join(wwwPath, requestedUrl);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('File not found');
            } else {
                const contentType = getContentType(filePath);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(data);
            }
        });
    }
});

server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

const getContentType = (filePath) => {
    const ext = path.extname(filePath).toLowerCase();
    switch (ext) {
        case '.html':
            return 'text/html';
        case '.css':
            return 'text/css';
        case '.js':
            return 'application/javascript';
        case '.json':
            return 'application/json';
        case '.png':
            return 'image/png';
        case '.jpg':
        case '.jpeg':
            return 'image/jpeg';
        case '.pdf':
            return 'application/pdf';
        default:
            return 'application/octet-stream';
    }
};

