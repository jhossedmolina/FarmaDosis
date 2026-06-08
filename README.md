# FarmaDosis

Aplicacion movil Ionic/Angular para apoyar calculos farmacologicos locales de dosis por peso e infusion continua CRI. Esta herramienta esta orientada a flujos academicos y clinicos de apoyo; no reemplaza la validacion profesional antes de administrar medicamentos.

## Estado Del Proyecto

- Frontend Ionic con Angular `21.2.9`.
- Ionic Framework `8.8.9`.
- Capacitor `7` con proyecto Android incluido.
- Calculos ejecutados localmente, sin backend ni llamadas de red.
- Historial de calculos en memoria durante la sesion.
- Pruebas unitarias con Karma/Jasmine.
- Pruebas E2E con Playwright.

## Alcance Funcional

- Calculo de dosis por peso del paciente.
- Unidades de dosis `mg/kg` y `ml/kg`.
- Presentacion del medicamento: sin presentacion, solucion o comprimidos.
- Calculo CRI con unidad temporal explicita: `ug/kg/min`, `ug/kg/h` o `mg/kg/h`.
- Historial de resultados recientes durante la sesion.
- Eliminacion de registros del historial con confirmacion visual.
- Mensajes tipo toast para guardado y eliminacion correcta o fallida.
- Pantalla de seguridad con advertencia de validacion profesional.

## Restricciones Clinicas

- Todo resultado debe ser revisado por un profesional antes de administrar medicamentos.
- La aplicacion no prescribe, solo calcula y presenta resultados de apoyo.
- El redondeo de comprimidos debe validarse con criterio clinico.
- La formula CRI requiere unidad temporal y velocidad de infusion para evitar ambiguedades.
- No se almacenan datos personales de pacientes.

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
- `shared`: componentes reutilizables de navegacion y tabs.
- `HistoryStoreService`: estado local de historial usando Angular signals.
- `app.routes.ts`: rutas lazy con `loadComponent`.
- `global.scss` y `theme/variables.scss`: estilos globales y tema Ionic.

## Patrones Frontend

- Componentes standalone.
- Formularios reactivos tipados.
- Angular signals para estado local y resultados derivados.
- Change detection `OnPush` en paginas.
- Logica clinica fuera de templates y componentes visuales.
- Rutas cargadas de forma diferida.
- Toasts de Ionic para feedback no bloqueante.

## Requisitos De Entorno

- Node.js compatible con Angular 21.
- npm/Corepack.
- Android Studio para generar APK.
- JDK compatible con Gradle/Android Studio.
- Playwright browsers instalados para E2E.

## Instalacion

```bash
npm install
```

En esta maquina tambien se ha usado:

```bash
corepack npm install
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
npm run lint
```

Notas:

- `npm run build` genera la salida web en `www/`.
- `npm run test:unit` ejecuta Karma/Jasmine en Chrome Headless.
- `npm run e2e` levanta el servidor local y ejecuta Playwright.
- `npm run lint` requiere que el workspace tenga configurado el builder de lint si se desea usar en CI.

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

## Pruebas Implementadas

Unitarias:

- Calculo de dosis.
- Calculo CRI.
- Historial: agregar, buscar, eliminar y manejo de id inexistente.

E2E:

- Navegacion principal.
- Calculo de dosis sin presentacion.
- Calculo de dosis con solucion.
- Calculo de dosis con comprimidos.
- Calculo CRI paso a paso.
- Guardado y eliminacion de historial con toasts.
- Advertencia clinica obligatoria.

## Documentacion Complementaria

- `docs/arquitectura-farmadosis.md`
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

`www/` se regenera con `npm run build`. `node_modules/` se regenera con `npm install`.

## Decisiones Pendientes

- Confirmar regla clinica final para redondeo de comprimidos.
- Definir si el historial debe persistir entre cierres de la app.
- Medir rendimiento en emulador y dispositivo Android real.
- Ampliar pruebas para rangos extremos y unidades invalidas.
- Configurar pipeline CI si el proyecto se publica en repositorio remoto.
