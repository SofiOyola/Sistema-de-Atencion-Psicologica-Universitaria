# SAPU - Sistema de Atencion Psicologica Universitaria

Plataforma academica para la gestion de atencion psicologica universitaria, construida con Laravel, React, Vite, Neo4j, Docker y Docker Compose bajo una arquitectura orientada a microservicios.

## Integrantes

- Maria Sofia Oyola
- Lucas Fernando Ardila

## Descripcion

SAPU centraliza los procesos principales de acompanamiento psicologico dentro de una universidad. La plataforma permite registrar usuarios, gestionar estudiantes y psicologos, consultar recursos psicoeducativos, programar citas, hacer seguimiento clinico, registrar estados emocionales, generar alertas y consultar informacion administrativa.

La solucion se ejecuta con un gateway Nginx en `http://localhost:8080`, que redirige las peticiones hacia servicios Laravel separados por dominio. El frontend React se entrega desde el servicio `frontend` y consume APIs relativas como `/api/auth/login`, `/api/resources` y `/api/student/profile/{id}`.

## Objetivos

- Facilitar el acceso de estudiantes a servicios de bienestar psicologico.
- Permitir a psicologos gestionar agenda, pacientes, seguimiento clinico, alertas emocionales y recursos.
- Proveer al area administrativa herramientas para gestionar estudiantes, psicologos, recursos, reportes y configuracion.
- Centralizar informacion relacional en Neo4j para representar estudiantes, psicologos, citas, alertas, recursos e historiales clinicos.
- Desplegar la solucion en contenedores usando Docker Compose.

## Modulos

- **Frontend SPA:** interfaz React servida por Laravel/Vite.
- **Auth Service:** registro, login y logout.
- **Resources Service:** consulta de recursos psicoeducativos y categorias.
- **Student Service:** citas, perfil, bienestar emocional y seguimiento del estudiante.
- **Psychologist Service:** agenda, pacientes, seguimiento clinico, alertas, perfil y recursos del psicologo.
- **Admin Service:** dashboard administrativo, gestion de estudiantes, psicologos, recursos, reportes y configuracion.
- **Gateway Nginx:** punto unico de entrada en `localhost:8080`.
- **Neo4j:** base de datos grafica persistente.

## Requisitos

- Git
- Docker Desktop
- Docker Compose

## Clonar el proyecto

```bash
git clone <URL_DEL_REPOSITORIO>
cd Sistema-de-Atencion-Psicologica-Universitaria
```

## Configurar variables de entorno

Crear el archivo `.env` a partir de `.env.example`:

```bash
cp .env.example .env
```

Configurar las variables de Neo4j en `.env`:

```env
NEO4J_URI=bolt://neo4j:7687
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=tu-password-local
NEO4J_DATABASE=neo4j
```

El archivo `docker-compose.microservices.yml` no contiene claves reales; lee `NEO4J_PASSWORD` desde `.env`.

## Levantar la solucion

Construir y ejecutar los microservicios:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml up -d --build
```

Verificar que los contenedores esten activos y saludables:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml ps
```

Resultado esperado: todos los servicios deben aparecer como `healthy`.

Servicios principales:

- Aplicacion: `http://localhost:8080`
- Login: `http://localhost:8080/login`
- Registro: `http://localhost:8080/register`
- Neo4j Browser: `http://localhost:7475`

## Probar la solucion

Verificar que el frontend responda:

```bash
curl http://localhost:8080/login
```

Probar recursos psicoeducativos:

```bash
curl http://localhost:8080/api/resources
```

Probar registro:

```bash
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"name":"Maria Sofia Oyola Lozano","identification":"123456789","program":"Ingenieria de Sistemas","email":"moyola@unab.edu.co","password":"123456789","password_confirmation":"123456789"}'
```

Probar login:

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email":"moyola@unab.edu.co","password":"123456789"}'
```

Listar rutas de un servicio:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml exec auth-service php artisan route:list --path=api
```

Consultar logs:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml logs gateway --tail=100
docker compose -p sapu_micro -f docker-compose.microservices.yml logs auth-service --tail=100
```

Verificar health checks:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml ps
```

## Detener la solucion

Detener los contenedores sin borrar volumenes:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml down
```

Detener y borrar tambien el volumen de Neo4j:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml down -v
```

Usar `down -v` solo si se desea eliminar los datos persistidos.

## Arquitectura de servicios

El gateway Nginx enruta las peticiones asi:

- `/` hacia `frontend`
- `/api/auth/` hacia `auth-service`
- `/api/resources` hacia `resources-service`
- `/api/student/` hacia `student-service`
- `/api/psychologist/` hacia `psychologist-service`
- `/api/admin/` hacia `admin-service`

Cada servicio Laravel se activa con la variable `SAPU_SERVICE`, definida en `docker-compose.microservices.yml`.

## Persistencia

La persistencia se realiza en Neo4j. La base se mantiene en el volumen:

```text
neo4j_microservices_data
```

Aunque los servicios estan separados, comparten Neo4j porque el dominio usa relaciones de grafo entre estudiantes, psicologos, citas, alertas, recursos e historiales clinicos.

## Observabilidad

El archivo `docker-compose.microservices.yml` define health checks para:

- Servicios Laravel: `http://localhost:8000/up`
- Gateway Nginx: `http://127.0.0.1`
- Neo4j: `http://localhost:7474`

Los logs se revisan con:

```bash
docker compose -p sapu_micro -f docker-compose.microservices.yml logs <servicio> --tail=100
```

