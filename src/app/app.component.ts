import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  calculatorOutline,
  flaskOutline,
  informationCircleOutline,
  medicalOutline,
  shieldCheckmarkOutline,
  timeOutline,
  trashOutline,
  warningOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  imports: [IonApp, IonRouterOutlet],
  template: `
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor() {
    addIcons({
      calculatorOutline,
      flaskOutline,
      informationCircleOutline,
      medicalOutline,
      shieldCheckmarkOutline,
      timeOutline,
      trashOutline,
      warningOutline,
    });
  }
}
