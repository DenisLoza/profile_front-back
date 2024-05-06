const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const port = 8000;

// Устанавливаем максимальный размер данных запроса в целях безопасности (10MB в данном примере)
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.use(bodyParser.json({ limit: '10mb' }));

// Устанавливаем middleware для обработки статических файлов из папки 'www'
app.use(express.static(path.join(__dirname, 'www')));

// Добавляем базовые заголовки безопасности для каждого запроса
app.use((req, res, next) => {
    // Запрещаем сайтам встраивать его в iframe
    res.setHeader('X-Frame-Options', 'DENY');

    // Защищаем от атаки межсайтовой подделки запроса
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Предотвращаем атаки межсайтовой подделки запроса для методов, отличных от GET, HEAD, OPTIONS
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Запрещаем браузеру запрашивать ресурс через HTTP, если сайт работает по HTTPS
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

    next();
});

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

// Путь к файлу data.json
const dataFilePath = path.join(__dirname, 'data', 'data.json');

// Проверка наличия файла data.json и его создание, если его нет
fs.access(dataFilePath, fs.constants.F_OK, (err) => {
    if (err) {
        console.error("File 'data.json' does not exist. Creating...");
        fs.writeFileSync(dataFilePath, '[]');
        console.log("File 'data.json' created successfully.");
    }
});

app.post('/submit-form', (req, res) => {
    const formData = req.body;

    // Добавляем поля date и time с текущей датой и временем на сервере к каждому объекту формы
    const currentDate = new Date();
    formData.date = currentDate.toLocaleDateString();
    formData.time = currentDate.toLocaleTimeString();

    // Чтение текущего содержимого файла data.json
    fs.readFile(dataFilePath, (err, data) => {
        if (err) {
            console.error("Error reading data file:", err);
            return res.status(500).send("An error occurred while processing the form data.");
        }

        // Парсинг JSON-данных из файла
        let jsonData = JSON.parse(data);

        // Добавление новых данных в массив
        jsonData.push(formData);

        // Запись обновленных данных обратно в файл
        fs.writeFile(dataFilePath, JSON.stringify(jsonData, null, 2), (err) => {
            if (err) {
                console.error("Error writing data to file:", err);
                return res.status(500).send("An error occurred while processing the form data.");
            }

            res.status(200).send("Form data saved successfully!");
        });
    });
});

// Запускаем сервер
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});