FROM node:20-alpine

# Установите рабочую директорию внутри контейнера
WORKDIR /app

# Скопируйте зависимости приложения
COPY package*.json /app

# Установите зависимости приложения
RUN npm install

# Скопируйте исходный код приложения в контейнер
COPY --chown=node:node . /app

USER node

# Команда для запуска приложения
CMD ["npm", "start"]