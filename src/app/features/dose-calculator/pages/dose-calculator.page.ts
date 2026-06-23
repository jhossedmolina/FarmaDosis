import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
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

import { calculateDose, validateDoseInput } from '../../../domain/dose/dose-calculator';
import { DoseConcentrationUnit, DoseInput } from '../../../domain/dose/dose.models';
import { BottomNavComponent } from '../../../shared/components/bottom-nav.component';
import { CalculatorTabsComponent } from '../../../shared/components/calculator-tabs.component';
import { HistoryStoreService } from '../../history/services/history-store.service';

@Component({
  selector: 'app-dose-calculator-page',
  imports: [
    BottomNavComponent,
    CalculatorTabsComponent,
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
        <app-calculator-tabs active="dose" />

        <article class="calculator-card">
          <div class="card-heading">
            <div class="heading-icon success">
              <ion-icon name="medical-outline" aria-hidden="true" />
            </div>
            <div>
              <h1>Calculadora de dosis</h1>
              <p>Dosis por peso y presentacion del medicamento.</p>
            </div>
            <button type="button" class="link-button" (click)="clear()">Limpiar</button>
          </div>

          <form [formGroup]="form" class="calculation-form">
            <ion-item>
              <ion-input data-testid="dose-weight" label="Peso del paciente (kg)" labelPlacement="stacked" type="number" inputmode="decimal" placeholder="Ej: 12.5" formControlName="patientWeightKg" />
            </ion-item>
            @if (fieldError('patientWeightKg'); as message) { <ion-note color="danger" role="alert">{{ message }}</ion-note> }

            <div class="inline-field">
              <ion-item>
                <ion-input data-testid="dose-per-kg" label="Dosis por kg" labelPlacement="stacked" type="number" inputmode="decimal" placeholder="Ej: 10" formControlName="dosePerKg" />
              </ion-item>
              <ion-item class="unit-pill">
                <ion-select aria-label="Unidad de dosis" justify="space-between" formControlName="doseUnit" interface="popover">
                  <ion-select-option value="mg/kg">mg/kg</ion-select-option>
                  <ion-select-option value="ml/kg">ml/kg</ion-select-option>
                </ion-select>
              </ion-item>
            </div>
            @if (fieldError('dosePerKg'); as message) { <ion-note color="danger" role="alert">{{ message }}</ion-note> }

            <div class="field-block">
              <span class="field-label">Presentacion del medicamento</span>
              <div class="segmented-list">
                <button type="button" data-testid="presentation-none" [class.is-active]="form.controls.presentation.value === 'none'" (click)="setPresentation('none')">
                  Sin presentacion
                </button>
                <button type="button" data-testid="presentation-solution" [class.is-active]="form.controls.presentation.value === 'solution'" (click)="setPresentation('solution')">
                  Solucion
                </button>
                <button type="button" data-testid="presentation-tablet" [class.is-active]="form.controls.presentation.value === 'tablet'" (click)="setPresentation('tablet')">
                  Comprimidos
                </button>
              </div>
            </div>

            @if (form.controls.presentation.value !== 'none') {
              <ion-item>
                <ion-input data-testid="dose-concentration" label="Concentracion" labelPlacement="stacked" type="number" inputmode="decimal" formControlName="concentration" />
              </ion-item>
              @if (fieldError('concentration'); as message) { <ion-note color="danger" role="alert">{{ message }}</ion-note> }
              <ion-item>
                <ion-select label="Unidad concentracion" labelPlacement="stacked" justify="space-between" interface="popover" formControlName="concentrationUnit">
                  @if (form.controls.presentation.value === 'solution') {
                    <ion-select-option value="mg/ml">mg/ml</ion-select-option>
                    <ion-select-option value="ml/ml">ml/ml</ion-select-option>
                  } @else {
                    <ion-select-option value="mg/tablet">mg/comprimido</ion-select-option>
                  }
                </ion-select>
              </ion-item>
              @if (fieldError('concentrationUnit'); as message) { <ion-note color="danger" role="alert">{{ message }}</ion-note> }
            }
          </form>

          @if (result(); as doseResult) {
            <section class="result-panel success-result" data-testid="dose-result">
              <span class="result-kicker">Resultado</span>
              <div class="metric-row">
                <span>Dosis total</span>
                <strong>{{ doseResult.totalDose }} {{ doseResult.totalDoseUnit }}</strong>
              </div>
              @if (doseResult.displayAmount) {
                <div class="metric-row">
                  <span>Cantidad fisica</span>
                  <strong>{{ doseResult.displayAmount }}</strong>
                </div>
              }
              <p class="instruction">{{ doseResult.instruction }}</p>
              <ion-note>Verifique el resultado con un profesional antes de administrar el medicamento.</ion-note>
              <ion-button data-testid="save-dose" expand="block" (click)="save()">Guardar en historial</ion-button>
            </section>
          } @else {
            <section class="empty-result">
              <ion-icon name="information-circle-outline" aria-hidden="true" />
              <p>Ingresa la dosis y el peso para ver el resultado</p>
            </section>
          }
        </article>
      </section>

      <app-bottom-nav active="calculators" />
    </ion-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DoseCalculatorPage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly history = inject(HistoryStoreService);
  private readonly toastController = inject(ToastController);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly submitted = signal(false);

  readonly form = this.fb.group({
    patientWeightKg: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    doseUnit: this.fb.control<DoseInput['doseUnit']>('mg/kg', [Validators.required]),
    dosePerKg: this.fb.control<number>(0, [Validators.required, Validators.min(0.01)]),
    presentation: this.fb.control<DoseInput['presentation']>('none', [Validators.required]),
    concentration: this.fb.control<number | null>(null),
    concentrationUnit: this.fb.control<DoseConcentrationUnit | null>(null),
  });

  private readonly formVersion = signal(0);

  readonly result = computed(() => {
    this.formVersion();
    return calculateDose(this.form.getRawValue());
  });

  constructor() {
    this.form.valueChanges.subscribe(() => this.formVersion.update((value) => value + 1));
    this.route.queryParamMap.subscribe((params) => this.reuseHistoryEntry(params.get('reuse')));
  }

  clear(): void {
    this.form.reset({
      patientWeightKg: 0,
      doseUnit: 'mg/kg',
      dosePerKg: 0,
      presentation: 'none',
      concentration: null,
      concentrationUnit: null,
    });
    this.submitted.set(false);
    this.form.markAsPristine();
    this.form.markAsUntouched();
  }

  setPresentation(presentation: DoseInput['presentation']): void {
    const concentrationUnit: DoseConcentrationUnit | null =
      presentation === 'solution' ? 'mg/ml' : presentation === 'tablet' ? 'mg/tablet' : null;

    this.form.patchValue({
      presentation,
      concentration: presentation === 'none' ? null : this.form.controls.concentration.value,
      concentrationUnit,
    });
  }

  async save(): Promise<void> {
    this.submitted.set(true);
    this.form.markAllAsTouched();
    const result = this.result();

    if (!result) {
      await this.presentToast('No hay un resultado valido para guardar.', 'danger');
      return;
    }

    try {
      this.history.add({
        kind: 'dose',
        input: this.form.getRawValue(),
        result,
        instruction: result.instruction,
      });

      await this.presentToast('Registro guardado en historial.', 'success');
    } catch {
      await this.presentToast('No se pudo guardar el registro.', 'danger');
    }
  }

  fieldError(field: keyof DoseInput): string | null {
    const control = this.form.controls[field];
    if (!control || (!control.touched && !this.submitted())) {
      return null;
    }
    return validateDoseInput(this.form.getRawValue()).find((issue) => issue.field === field)?.message ?? null;
  }

  private reuseHistoryEntry(id: string | null): void {
    if (!id) return;
    const entry = this.history.find(id);
    if (entry?.kind === 'dose') {
      this.form.patchValue({
        ...entry.input,
        patientWeightKg: Number(entry.input.patientWeightKg),
        dosePerKg: Number(entry.input.dosePerKg),
        concentration: entry.input.concentration == null ? null : Number(entry.input.concentration),
      });
      this.form.markAsPristine();
      this.form.markAsUntouched();
      this.submitted.set(false);
    }
    void this.router.navigate([], { relativeTo: this.route, queryParams: { reuse: null }, queryParamsHandling: 'merge', replaceUrl: true });
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
