import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
const cookieParser = require('cookie-parser');

async function auth() {
  const PORT = process.env.PORT || 4050;
  const app = await NestFactory.create(AppModule);
  app.use(
      session({
          secret: 'my-secret',
          resave: false,
          saveUninitialized: false,
          cookie: {maxAge: 30 * 24 * 60 *60 *1000, httpOnly: true}
      }))
  app.enableCors({
      origin: "*",
      credentials: true,// отвечает за куки
      methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
      preflightContinue: false,
      optionsSuccessStatus: 200
  });
  const config = new DocumentBuilder()
        .setTitle('Авторизация')
        .setDescription('Описание  API авторизации')
        .setVersion('1.0')
        .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/api/docs', app, document);
  app.use(cookieParser());
  app.use(passport.initialize())
  app.use(passport.session())
  await app.listen(PORT, () => console.log(`Server Auth is started on PORT = ${PORT} `))
}


auth()

