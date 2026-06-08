import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonNote,
  IonSelect,
  IonSelectOption,
  IonTitle,
  IonToolbar,
  ToastController,
} from '@ionic/angular/standalone';

import { calculateCri } from '../../../domain/cri/cri-calculator';
import { CriInput } from '../../../domain/cri/cri.models';
import { BottomNavComponent } from '../../../shared/components/bottom-nav.component';
import { CalculatorTabsComponent } from '../../../shared/components/calculator-tabs.component';
import { HistoryStoreService } from '../../history/services/history-store.service';

@Component({
  selector: 'app-cri-calculator-page',
  imports: [
    BottomNavComponent,
    CalculatorTabsComponent,
    DecimalPipe,
    IonBackButton,
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonInput,
    IonItem,
    IonNote,
    IonSelect,
    IonSelectOption,
    IonTitle,
    IonToolbar,
    ReactiveFormsModule,
  ],
  template: `
    <ion-header class="app-header">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button defaultHref="/home" />
        </ion-buttons>
        <ion-title>Calculadoras clinicas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content class="app-page">
      <section class="screen-shell">
        <app-calculator-tabs active="cri" />

        <article class="calculator-card">
          <div class="card-heading">
            <div class="heading-icon violet">
              <ion-icon name="flask-outline" aria-hidden="true" />
            </div>
            <div>
              <h1>Infusion CRI</h1>
              <p>Infusion de tasa continua.</p>
            </div>
            <button type="button" class="link-button violet-text" (click)="clear()">Limpiar</button>
          </div>

          <form [formGroup]="form" class="calculation-form">
            <ion-item>
              <ion-input data-testid="cri-medication" label="Nombre del farmaco" labelPlacement="stacked" placeholder="Ej: Morfina, Fentanilo, Dopamina" formControlName="medicationName" />
            </ion-item>
            <ion-item>
              <ion-select label="Via" labelPlacement="stacked" justify="space-between" interface="popover" formControlName="route">
                <ion-select-option value="Intravenosa (IV)">Intravenosa (IV)</ion-select-option>
                <ion-select-option value="Subcutanea (SC)">Subcutanea (SC)</ion-select-option>
              </ion-select>
            </ion-item>
            <ion-item>
              <ion-input label="Hora de inicio" labelPlacement="stacked" type="time" formControlName="startTime" />
            </ion-item>
            <ion-item>
              <ion-input data-testid="cri-weight" label="Peso del paciente (kg)" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="patientWeightKg" />
            </ion-item>
            <div class="inline-field">
              <ion-item>
                <ion-input data-testid="cri-dose-rate" label="Dosis" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="doseRate" />
              </ion-item>
              <ion-item class="unit-pill">
                <ion-select aria-label="Unidad dosis" justify="space-between" interface="popover" formControlName="doseRateUnit">
                  <ion-select-option value="ug/kg/min">ug/kg/min</ion-select-option>
                  <ion-select-option value="ug/kg/h">ug/kg/h</ion-select-option>
                  <ion-select-option value="mg/kg/h">mg/kg/h</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
            <ion-item>
              <ion-input data-testid="cri-bag-volume" label="Volumen del suero (ml)" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="bagVolumeMl" />
            </ion-item>
            <ion-item>
              <ion-input data-testid="cri-infusion-rate" label="Velocidad de bomba (ml/h)" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="infusionRateMlHour" />
            </ion-item>
            <ion-item>
              <ion-input data-testid="cri-vial-concentration" label="Concentracion farmaco (mg/ml)" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="vialConcentrationMgMl" />
            </ion-item>
            <ion-item>
              <ion-input data-testid="cri-bag-count" label="Num. de bolsas" labelPlacement="stacked" type="number" inputmode="numeric" formControlName="bagCount" />
            </ion-item>
          </form>

          @if (result(); as criResult) {
            <section class="step-results" aria-label="Calculo paso a paso" data-testid="cri-step-results">
              <h2>Calculo paso a paso</h2>
              <div class="step-card blue">
                <span>A · Dosis horaria</span>
                <strong>{{ criResult.drugRequiredMgHour }} <small>mg/h</small></strong>
              </div>
              <div class="step-card green">
                <span>B · Duracion por bolsa</span>
                <strong>{{ criResult.bagDurationHours }} <small>h</small></strong>
              </div>
              <div class="step-card amber">
                <span>C · Farmaco total por bolsa</span>
                <strong>{{ criResult.targetBagConcentrationMgMl * form.controls.bagVolumeMl.value | number: '1.0-2' }} <small>mg</small></strong>
              </div>
              <div class="step-card purple">
                <span>D · Volumen a anadir</span>
                <strong>{{ criResult.medicationVolumeMl }} <small>ml</small></strong>
              </div>
            </section>

            <section class="volume-card">
              <div class="warning-title">
                <ion-icon name="warning-outline" aria-hidden="true" />
                <strong>Compensacion de volumen</strong>
              </div>
              <p>Retire <strong>{{ criResult.serumVolumeToRemoveMl }} ml de suero</strong> antes de anadir el farmaco para mantener el volumen en {{ form.controls.bagVolumeMl.value }} ml.</p>
              <div class="volume-grid">
                <div>
                  <span>Retirar</span>
                  <strong>{{ criResult.serumVolumeToRemoveMl }} ml</strong>
                  <small>de suero</small>
                </div>
                <div>
                  <span>Anadir</span>
                  <strong>{{ criResult.medicationVolumeMl }} ml</strong>
                  <small>del vial</small>
                </div>
                <div>
                  <span>Vol. final</span>
                  <strong>{{ form.controls.bagVolumeMl.value }} ml</strong>
                  <small>en bolsa</small>
                </div>
              </div>
            </section>

            <section class="follow-card">
              <strong>Plan de seguimiento:</strong>
              <p>Check cada {{ criResult.bagDurationHours }} h. Finaliza despues de {{ form.controls.bagCount.value }} bolsas.</p>
              <ion-note>Verifique dosis, unidades y velocidad de infusion antes de administrar.</ion-note>
              <ion-button data-testid="save-cri" expand="block" (click)="save()">Guardar en historial</ion-button>
            </section>
          } @else {
            <section class="empty-result">
              <ion-icon name="information-circle-outline" aria-hidden="true" />
              <p>Completa los datos CRI para ver el calculo paso a paso</p>
            </section>
          }
        </article>
      </section>

      <app-bottom-nav active="calculators" />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CriCalculatorPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly history = inject(HistoryStoreService);
  private readonly toastController = inject(ToastController);

  readonly form = this.fb.group({
    medicationName: this.fb.control<string>(''),
    route: this.fb.control<string>('Intravenosa (IV)'),
    startTime: this.fb.control<string>(''),
    patientWeightKg: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    doseRate: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    doseRateUnit: this.fb.control<CriInput['doseRateUnit']>('ug/kg/min', [Validators.required]),
    vialConcentrationMgMl: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    bagVolumeMl: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    bagCount: this.fb.control<number>(1, [Validators.required, Validators.min(1)]),
    infusionRateMlHour: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
  });

  private readonly formVersion = signal(0);

  readonly result = computed(() => {
    this.formVersion();
    return calculateCri(this.form.getRawValue());
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.formVersion.update((value) => value + 1));
  }

  clear(): void {
    this.form.reset({
      medicationName: '',
      route: 'Intravenosa (IV)',
      startTime: '',
      patientWeightKg: 0,
      doseRate: 0,
      doseRateUnit: 'ug/kg/min',
      vialConcentrationMgMl: 0,
      bagVolumeMl: 0,
      bagCount: 1,
      infusionRateMlHour: 0,
    });
  }

  async save(): Promise<void> {
    const result = this.result();

    if (!result) {
      await this.presentToast('No hay un resultado valido para guardar.', 'danger');
      return;
    }

    try {
      this.history.add({
        kind: 'cri',
        input: this.form.getRawValue(),
        result,
        instruction: result.instruction,
      });

      await this.presentToast('Registro guardado en historial.', 'success');
    } catch {
      await this.presentToast('No se pudo guardar el registro.', 'danger');
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
