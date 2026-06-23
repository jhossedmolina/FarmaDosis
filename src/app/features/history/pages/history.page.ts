import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar, ToastController } from '@ionic/angular/standalone';

import { BottomNavComponent } from '../../../shared/components/bottom-nav.component';
import { HistoryStoreService } from '../services/history-store.service';

@Component({
  selector: 'app-history-page',
  imports: [BottomNavComponent, DatePipe, DecimalPipe, IonContent, IonHeader, IonIcon, IonInput, IonTitle, IonToolbar, RouterLink],
  template: `
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-title>Historial</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-page">
      <section class="screen-shell">
        <div class="search-shell">
          <ion-input placeholder="Buscar medicamento o calculo..." />
        </div>

        @if (history.hasEntries()) {
          <div class="history-section-title">Hoy</div>
          <div class="history-list">
            @for (entry of history.entries(); track entry.id) {
              <article class="history-card" data-testid="history-card">
                <button type="button" class="delete-button" data-testid="delete-history-entry" aria-label="Eliminar calculo" (click)="removeEntry(entry.id)">
                  <ion-icon name="trash-outline" aria-hidden="true" />
                </button>
                <h2>{{ entry.kind === 'dose' ? 'Dosis de medicamento' : 'Infusion CRI' }}</h2>
                <p class="history-meta">{{ entry.kind === 'dose' ? 'Calculo' : 'Infusion' }} · {{ entry.createdAt | date: 'HH:mm' }}</p>
                <div class="history-metrics">
                  <div>
                    <span>Peso paciente</span>
                    <strong>{{ entry.input.patientWeightKg }} kg</strong>
                  </div>
                  <div class="green">
                    <span>{{ entry.kind === 'dose' ? 'Dosis resultante' : 'Ritmo infusion' }}</span>
                    @if (entry.kind === 'dose') {
                      <strong>{{ entry.result.physicalAmount ?? entry.result.totalDose | number: '1.0-2' }} {{ entry.result.physicalAmountUnit === 'tablet' ? 'comp.' : entry.result.physicalAmountUnit ?? entry.result.totalDoseUnit }}</strong>
                    } @else {
                      <strong>{{ entry.result.infusionRateMlHour }} ml/h</strong>
                    }
                  </div>
                </div>
                <p class="history-dose">{{ entry.instruction }}</p>
                <a class="reuse-button" [routerLink]="entry.kind === 'dose' ? '/dose' : '/cri'" [queryParams]="{ reuse: entry.id }">Reutilizar</a>
              </article>
            }
          </div>
        } @else {
          <section class="empty-result history-empty">
            <ion-icon name="time-outline" aria-hidden="true" />
            <p>No hay calculos guardados.</p>
          </section>
        }
      </section>

      <app-bottom-nav active="history" />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HistoryPage {
  readonly history = inject(HistoryStoreService);
  private readonly toastController = inject(ToastController);

  async removeEntry(id: string): Promise<void> {
    try {
      const removed = this.history.remove(id);

      if (!removed) {
        await this.presentToast('No se pudo eliminar el registro.', 'danger');
        return;
      }

      await this.presentToast('Registro eliminado correctamente.', 'success');
    } catch {
      await this.presentToast('No se pudo eliminar el registro.', 'danger');
    }
  }

  private async presentToast(message: string, color: 'success' | 'danger'): Promise<void> {
    const toast = await this.toastController.create({
      message,
      duration: 2200,
      position: 'bottom',
      color,
    });

    await toast.present();
  }
}
