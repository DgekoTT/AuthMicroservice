Микросервис авторизации
запускается через docker-compose в микросервисе фильмов
Основа кукис с jwt token позволяет контролировать пользователей во всех микросервисах


## Swager
http://localhost:5010/api/docs

## Endpoints

@Get http://localhost:5010/auth/google/login вход через гугл 

@Get http://localhost:5010/auth/vkontakte/login вход через ВК

@Post http://localhost:5010/auth/login вход через почту

@Post http://localhost:5010/auth/registration регистрация

@Post http://localhost:5010/auth/logout выход


