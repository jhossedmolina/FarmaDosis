# FarmaDosis

Aplicacion movil Ionic/Angular para apoyar calculos farmacologicos locales de dosis por peso e infusion continua CRI. Esta herramienta esta orientada a flujos academicos y clinicos de apoyo; no reemplaza la validacion profesional antes de administrar medicamentos.

## Estado Del Proyecto

- Frontend Ionic con Angular `21.2.9`.
- Ionic Framework `8.8.9`.
- Capacitor `7` con proyecto Android incluido.
- En la implementacion actual, los calculos y el historial se procesan localmente; el codigo de aplicacion no integra backend ni servicios HTTP.
- Historial persistente en el almacenamiento local del navegador o dispositivo.
- Pruebas unitarias con Karma/Jasmine.
- Pruebas E2E con Playwright.

## Versionado

Version actual: `1.1.0`.

- La version web se define en `package.json`; `package-lock.json` debe conservar el mismo valor.
- Para una publicacion Android, sincronice `versionName` en `android/app/build.gradle` e incremente `versionCode` en cada APK o AAB distribuido.
- La version visible para el usuario se muestra en la pantalla de informacion y debe mantenerse alineada con los archivos de empaquetado.

## Alcance Funcional

- Calculo de dosis por peso del paciente.
- Unidades de dosis `mg/kg` y `ml/kg`.
- Presentacion del medicamento: sin presentacion, solucion o comprimidos.
- Calculo CRI con unidad temporal explicita: `ug/kg/min`, `ug/kg/h` o `mg/kg/h`.
- En CRI, la duracion por bolsa permite derivar la velocidad de infusion en `ml/h` y la duracion total del tratamiento.
- El calculo CRI no genera un resultado si el volumen de medicamento calculado es igual o mayor que el volumen de la bolsa.
- Validacion visible por campo antes de guardar un calculo.
- Historial persistente de hasta 20 resultados recientes.
- Reutilizacion de un resultado del historial para completar nuevamente el formulario de dosis o CRI.
- Eliminacion individual de registros del historial con feedback mediante un mensaje toast.
- Mensajes tipo toast para guardado y eliminacion correcta o fallida.
- Pantalla de seguridad con advertencia de validacion profesional.

## Restricciones Clinicas

- Todo resultado debe ser revisado por un profesional antes de administrar medicamentos.
- La aplicacion no prescribe, solo calcula y presenta resultados de apoyo.
- El redondeo de comprimidos debe validarse con criterio clinico.
- La formula CRI requiere una unidad temporal y una duracion por bolsa valida; la aplicacion deriva la velocidad de infusion para evitar ambiguedades.
- Los resultados se calculan con los datos ingresados; la aplicacion no valida indicacion terapeutica, dosis maxima, compatibilidad, contraindicaciones, interacciones ni protocolos institucionales.
- El historial se guarda en `localStorage` con la clave `farmadosis.history.v1`, permanece en el navegador o dispositivo hasta eliminar sus registros o borrar los datos locales y no se sincroniza con un servidor. No ingrese identificadores ni datos personales del paciente.

## Arquitectura

La aplicacion sigue una estructura modular por responsabilidad:

```text
src/
  app/
    domain/
      cri/
      dose/
      history/
      safety/
    features/
      cri-calculator/
      dose-calculator/
      history/
      home/
      safety-info/
    infrastructure/
      storage/
    shared/
      components/
    app.config.ts
    app.routes.ts
  assets/
  theme/
```

Responsabilidades principales:

- `domain`: modelos y funciones puras de calculo. No depende de Angular ni Ionic.
- `features`: pantallas Ionic standalone agrupadas por flujo funcional.
- `infrastructure/storage`: acceso a `localStorage` y migracion de registros CRI guardados con el formato anterior.
- `shared`: componentes reutilizables de navegacion y tabs.
- `HistoryStoreService`: estado reactivo del historial con Angular signals; guarda los cambios mediante `HistoryStorageService`.
- `app.routes.ts`: rutas lazy con `loadComponent`.
- `global.scss` y `theme/variables.scss`: estilos globales y tema Ionic.

Rutas publicas:

- `/` redirige a `/home`.
- `/home`, `/dose`, `/cri`, `/history` y `/safety` son rutas cargadas de forma diferida.
- `/dose` y `/cri` admiten temporalmente `?reuse=<id>` para cargar una entrada del historial y luego limpian el parametro de la URL.

## Patrones Frontend

- Componentes standalone.
- Formularios reactivos tipados.
- Angular signals para estado local y resultados derivados.
- Change detection `OnPush` en paginas.
- Logica clinica fuera de templates y componentes visuales.
- Rutas cargadas de forma diferida.
- Toasts de Ionic para feedback no bloqueante.
- Parametros de consulta para reutilizar una entrada del historial y restablecer el formulario correspondiente.

## Requisitos De Entorno

- Node.js compatible con Angular 21.
- npm.
- Corepack habilitado para ejecutar E2E, porque Playwright inicia el servidor con `corepack npm start`.
- Android Studio para generar APK.
- JDK compatible con Gradle/Android Studio.
- Chrome o Chromium disponible para pruebas unitarias con Karma.
- Chromium de Playwright instalado para E2E.

## Instalacion

```bash
npm ci
```

Para actualizar dependencias en lugar de reproducir el lockfile:

```bash
npm install
```

Antes de ejecutar E2E por primera vez:

```bash
npx playwright install chromium
```

## Ejecucion En Desarrollo

```bash
npm start
```

o:

```bash
npm run ionic:serve
```

La app queda disponible normalmente en:

```text
http://localhost:4200
```

## Scripts

```bash
npm run build
npm run test:unit
npm run e2e
```

Notas:

- `npm run build` usa la configuracion de produccion por defecto y genera los artefactos web que Capacitor sincroniza desde `www/browser/`.
- `npm run test:unit` ejecuta Karma/Jasmine en Chrome Headless.
- `npm run e2e` inicia o reutiliza un servidor en `http://127.0.0.1:4200` y ejecuta el proyecto Chromium de Playwright.

## Generar APK

1. Compilar la aplicacion web:

```bash
npm run build
```

2. Sincronizar Capacitor:

```bash
npx cap sync android
```

3. Abrir Android Studio:

```bash
npx cap open android
```

4. Generar APK desde Android Studio:

```text
Build > Build Bundle(s) / APK(s) > Build APK(s)
```

Alternativa por terminal desde la carpeta `android/`:

```bash
./gradlew assembleDebug
```

En Windows:

```powershell
.\gradlew.bat assembleDebug
```

El APK debug queda normalmente en:

```text
android/app/build/outputs/apk/debug/app-debug.apk
```

## Cobertura Automatizada Incluida

Unitarias:

- Calculo de dosis.
- Calculo CRI.
- Historial: agregar, recuperar por identificador para reutilizar, eliminar, persistir y manejar identificadores inexistentes.
- Migracion de entradas CRI heredadas: de velocidad de infusion a duracion por bolsa.

E2E:

- Navegacion principal.
- Calculo de dosis sin presentacion.
- Calculo de dosis con solucion.
- Calculo de dosis con comprimidos.
- Calculo CRI paso a paso.
- Guardado y eliminacion de historial con toasts.
- Advertencia clinica obligatoria.

La ejecucion de las suites debe verificarse en un entorno con Node.js, npm y los navegadores requeridos instalados.

## Documentacion Complementaria

- `docs/arquitectura-farmadosis.md` (documento de decision inicial; no refleja por completo la persistencia actual del historial ni el uso de duracion por bolsa en CRI).
- `docs/validacion-arquitectura-inicial.md`
- `docs/mockups/`

## Archivos Generados O Locales

Estas carpetas son regenerables y estan ignoradas por Git:

- `.angular/`
- `.playwright-mcp/`
- `playwright-report/`
- `test-results/`
- `.idea/`
- `www/`
- `dist/`
- `coverage/`
- `node_modules/`

`www/browser/` se regenera con `npm run build`. `node_modules/` se regenera con `npm ci` o `npm install`.

## Decisiones Pendientes

- Confirmar regla clinica final para redondeo de comprimidos.
- Medir rendimiento en emulador y dispositivo Android real.
- Ampliar pruebas para rangos extremos y unidades invalidas.
- Definir el periodo de retencion y un mecanismo de borrado total del historial local.
- Corregir y ejecutar la suite E2E despues de la migracion del historial; verificar en navegador y dispositivo Android real.
- Configurar pipeline CI si el proyecto se publica en repositorio remoto.
