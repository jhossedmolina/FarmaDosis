import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonTitle, IonToolbar } from '@ionic/angular/standalone';

import { BottomNavComponent } from '../../../shared/components/bottom-nav.component';
import { CalculatorTabsComponent } from '../../../shared/components/calculator-tabs.component';

@Component({
  selector: 'app-home-page',
  imports: [BottomNavComponent, CalculatorTabsComponent, IonContent, IonHeader, IonIcon, IonTitle, IonToolbar, RouterLink],
  template: `
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-title>Calculadoras clinicas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-page">
      <section class="screen-shell">
        <app-calculator-tabs active="dose" />

        <article class="calculator-card home-card">
          <div class="card-heading">
            <div class="heading-icon success">
              <ion-icon name="calculator-outline" aria-hidden="true" />
            </div>
            <div>
              <h1>Calculadoras clinicas</h1>
              <p>Selecciona el tipo de calculo farmacologico.</p>
            </div>
          </div>

          <div class="home-actions">
            <a routerLink="/dose" class="action-tile primary" data-testid="home-dose-link">
              <ion-icon name="medical-outline" aria-hidden="true" />
              <span>Dosis de medicamento</span>
            </a>
            <a routerLink="/cri" class="action-tile" data-testid="home-cri-link">
              <ion-icon name="flask-outline" aria-hidden="true" />
              <span>Infusion CRI</span>
            </a>
          </div>
        </article>
      </section>

      <app-bottom-nav active="calculators" />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {}
