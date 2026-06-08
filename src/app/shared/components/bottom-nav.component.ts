import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

export type BottomNavSection = 'calculators' | 'history' | 'info';

@Component({
  selector: 'app-bottom-nav',
  imports: [IonIcon, RouterLink],
  template: `
    <nav class="bottom-nav" aria-label="Navegacion principal">
      <a routerLink="/home" data-testid="nav-calculators" [class.is-active]="active() === 'calculators'">
        <ion-icon name="calculator-outline" aria-hidden="true" />
        <span>Calculadoras</span>
      </a>
      <a routerLink="/history" data-testid="nav-history" [class.is-active]="active() === 'history'">
        <ion-icon name="time-outline" aria-hidden="true" />
        <span>Historial</span>
      </a>
      <a routerLink="/safety" data-testid="nav-safety" [class.is-active]="active() === 'info'">
        <ion-icon name="information-circle-outline" aria-hidden="true" />
        <span>Informacion</span>
      </a>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomNavComponent {
  readonly active = input.required<BottomNavSection>();
}
