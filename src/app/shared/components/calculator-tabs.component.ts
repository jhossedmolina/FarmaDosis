import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonIcon } from '@ionic/angular/standalone';

export type CalculatorTab = 'dose' | 'cri';

@Component({
  selector: 'app-calculator-tabs',
  imports: [IonIcon, RouterLink],
  template: `
    <nav class="calculator-tabs" aria-label="Calculadoras clinicas">
      <a routerLink="/dose" data-testid="tab-dose" [class.is-active]="active() === 'dose'">
        <ion-icon name="medical-outline" aria-hidden="true" />
        <span>Dosis de medicamento</span>
      </a>
      <a routerLink="/cri" data-testid="tab-cri" [class.is-active]="active() === 'cri'">
        <ion-icon name="flask-outline" aria-hidden="true" />
        <span>Infusion CRI</span>
      </a>
    </nav>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalculatorTabsComponent {
  readonly active = input.required<CalculatorTab>();
}
