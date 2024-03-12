<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="200" alt="Nest Logo" /></a>
</p>

# Ejecutar en desarrollo

1. Clonar el repositorio.
2. Ejecutar
```
pnpm install
```

3. Tener nest CLI instalado
```
npm i -g @nestjs/cli
```

4. Levantar la base de datos
```
docker-compose up -d
```

5. Clonar el archivo __.env.template__ y renombra la copia a __.env__ .

6. LLenar las variables de entorno definidas en el __.env__

7. Ejecutar la aplicación en dev:
```
pnpm start:dev
```

8. Reconstruir la base de datos con la semilla, si no se tiene registros en el db y cuando sea solo desarrollo.
```
http://localhost:3000/api/v2/seed
```


## Stack usado
* MongoDB
* Nest