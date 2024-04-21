const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// Подключаем middleware для парсинга тела запроса в формате JSON (для обработки формы обратной связи)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Устанавливаем middleware для обработки статических файлов из папки 'www'
app.use(express.static(path.join(__dirname, 'www')));

// Обработка API-запросов
// Маршрут для загрузки CV
app.get('/api/download-cv', async (req, res) => {
    try {
        const filePath = path.join(__dirname, 'data/cv.pdf');

        // Проверяем, существует ли файл
        const fileStats = await fs.promises.stat(filePath);
        if (!fileStats.isFile()) {
            res.status(404).send('File not found');
            return;
        }

        // Проверяем, что файл находится в допустимой директории
        const dataDirectory = path.join(__dirname, 'data');
        if (!filePath.startsWith(dataDirectory)) {
            res.status(403).send('Forbidden');
            return;
        }

        // Отправляем файл в ответ
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);
    } catch (error) {
        console.error('Error loading CV:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});