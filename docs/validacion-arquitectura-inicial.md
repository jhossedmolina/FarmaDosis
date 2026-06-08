# Validacion de arquitectura inicial

## Enfoque aplicado

Se valida la propuesta como `solution_architect_requirements` y
`frontend_architect_angular`, y se inicia implementacion como
`frontend_angular_implementer`.

## Resultado

- El workspace no tenia scaffold Ionic/Angular previo.
- Se agrego una base Ionic/Angular manual porque `npm` local no esta operativo e
  `ionic` no esta instalado globalmente.
- Se crea una base integrable con Angular/Ionic: rutas lazy, modelos de dominio,
  historial con signals y funciones puras testeables.

## Alineacion con requerimientos del SRS

- Calculo de dosis: cubierto con peso, dosis por kg, solucion y comprimidos.
- CRI: cubierto parcialmente con modelo que exige unidad temporal explicita y velocidad
  de infusion.
- Historial: cubierto inicialmente en memoria, coherente con historial de sesion.
- Seguridad: advertencias incluidas en resultados y constante reutilizable.
- Offline: los servicios no dependen de red ni backend.

## Criterios frontend Angular

- Servicios `providedIn: 'root'`.
- Estado local con signals para historial.
- Rutas preparadas con `loadComponent` para componentes standalone.
- Logica clinica fuera de componentes y plantillas.
- Tipos estrictos sin `any`.

## Pendientes

- Ejecutar `npm install` cuando el entorno de Node/npm este reparado.
- Definir si historial permanece solo en memoria o usa Capacitor Preferences.
- Confirmar regla clinica de redondeo de comprimidos.
