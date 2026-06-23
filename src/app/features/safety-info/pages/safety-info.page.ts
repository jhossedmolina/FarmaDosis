import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { PROFESSIONAL_USE_WARNING } from '../../../domain/safety/safety-copy';
import { BottomNavComponent } from '../../../shared/components/bottom-nav.component';

@Component({
  selector: 'app-safety-info-page',
  imports: [BottomNavComponent, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar],
  template: `
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-title>Informacion</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-page">
      <section class="screen-shell">
        <div class="brand-block">
          <div class="brand-mark">
            <ion-icon name="medical-outline" aria-hidden="true" />
          </div>
          <h1>FarmaDosis</h1>
          <p>Version 1.1.0 · FarmaDosis</p>
        </div>

        <article class="info-card">
          <div class="info-heading">
            <ion-icon name="information-circle-outline" aria-hidden="true" />
            <h2>Proposito</h2>
          </div>
          <p>FarmaDosis facilita calculos de dosificacion complejos, reduce carga cognitiva y minimiza errores aritmeticos en entornos clinicos.</p>
        </article>

        <article class="info-card danger" data-testid="safety-warning">
          <div class="info-heading">
            <ion-icon name="warning-outline" aria-hidden="true" />
            <h2>Validacion profesional obligatoria</h2>
          </div>
          <p>{{ professionalUseWarning }}</p>
          <p>Todos los resultados deben ser revisados antes de administrar cualquier medicamento.</p>
        </article>

        <article class="info-card">
          <div class="info-heading">
            <ion-icon name="shield-checkmark-outline" aria-hidden="true" />
            <h2>Guia de uso</h2>
          </div>
          <ul>
            <li>Verifique siempre las unidades antes de ingresar valores.</li>
            <li>Use puntos para decimales si el teclado no acepta coma.</li>
            <li>Confirme el peso actual del paciente en cada sesion.</li>
            <li>Compare el resultado con las guias de referencia de su centro.</li>
          </ul>
        </article>
      </section>

      <app-bottom-nav active="info" />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SafetyInfoPage {
  readonly professionalUseWarning = PROFESSIONAL_USE_WARNING;
}
