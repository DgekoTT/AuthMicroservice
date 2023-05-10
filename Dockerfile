# Указываем базовый образ
FROM node

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и yarn.lock для установки зависимостей
COPY package*.json ./


# Устанавливаем зависимости
RUN npm install

# Копируем исходный код приложения
COPY . .



# Открываем порт, на котором будет работать приложение
EXPOSE 4020


# Запускаем приложение
CMD npm run start:Auth-docker