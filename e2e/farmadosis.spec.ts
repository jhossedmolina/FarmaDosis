import { expect, Page, test } from '@playwright/test';

async function fillIonInput(page: Page, testId: string, value: string): Promise<void> {
  await page.locator(`[data-testid="${testId}"] input`).first().fill(value);
}

function toastWithText(page: Page, text: string) {
  return page.locator('ion-toast').filter({ hasText: text }).last();
}

test.describe('FarmaDosis functional flows', () => {
  test('navigates through home, dose, cri, history and safety', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveURL(/\/home$/);
    await expect(page.getByRole('heading', { name: 'Calculadoras clinicas' })).toBeVisible();

    await page.getByTestId('home-dose-link').click();
    await expect(page).toHaveURL(/\/dose$/);
    await expect(page.getByRole('heading', { name: 'Calculadora de dosis' })).toBeVisible();

    await page.locator('app-dose-calculator-page').getByTestId('tab-cri').click();
    await expect(page).toHaveURL(/\/cri$/);
    await expect(page.getByRole('heading', { name: 'Infusion CRI' })).toBeVisible();

    await page.locator('app-cri-calculator-page').getByTestId('nav-history').click();
    await expect(page).toHaveURL(/\/history$/);
    await expect(page.getByText('No hay calculos guardados durante esta sesion.')).toBeVisible();

    await page.locator('app-history-page').getByTestId('nav-safety').click();
    await expect(page).toHaveURL(/\/safety$/);
    await expect(page.getByTestId('safety-warning')).toContainText(
      'Validacion profesional obligatoria',
    );
  });

  test('calculates dose without medication presentation', async ({ page }) => {
    await page.goto('/dose');

    await fillIonInput(page, 'dose-weight', '12.5');
    await fillIonInput(page, 'dose-per-kg', '10');

    await expect(page.getByTestId('dose-result')).toContainText('Dosis total');
    await expect(page.getByTestId('dose-result')).toContainText('125 mg');
    await expect(page.getByTestId('dose-result')).toContainText(
      'Administrar 125 mg del medicamento al paciente.',
    );
  });

  test('calculates solution dose in milliliters', async ({ page }) => {
    await page.goto('/dose');

    await fillIonInput(page, 'dose-weight', '12.5');
    await fillIonInput(page, 'dose-per-kg', '10');
    await page.getByTestId('presentation-solution').click();
    await fillIonInput(page, 'dose-concentration', '50');

    await expect(page.getByTestId('dose-result')).toContainText('125 mg');
    await expect(page.getByTestId('dose-result')).toContainText('2.5 ml');
    await expect(page.getByTestId('dose-result')).toContainText(
      'Administrar 2.5 ml del medicamento al paciente.',
    );
  });

  test('calculates tablet dose with readable fraction', async ({ page }) => {
    await page.goto('/dose');

    await fillIonInput(page, 'dose-weight', '10');
    await fillIonInput(page, 'dose-per-kg', '5');
    await page.getByTestId('presentation-tablet').click();
    await fillIonInput(page, 'dose-concentration', '100');

    await expect(page.getByTestId('dose-result')).toContainText('50 mg');
    await expect(page.getByTestId('dose-result')).toContainText('1/2');
    await expect(page.getByTestId('dose-result')).toContainText(
      'Administrar 1/2 comprimido(s) al paciente.',
    );
  });

  test('calculates CRI step-by-step results', async ({ page }) => {
    await page.goto('/cri');

    await fillIonInput(page, 'cri-medication', 'Dopamina');
    await fillIonInput(page, 'cri-weight', '10');
    await fillIonInput(page, 'cri-dose-rate', '5');
    await fillIonInput(page, 'cri-bag-volume', '100');
    await fillIonInput(page, 'cri-bag-duration', '10');
    await fillIonInput(page, 'cri-vial-concentration', '40');
    await fillIonInput(page, 'cri-bag-count', '2');

    await expect(page.getByTestId('cri-step-results')).toContainText('Calculo paso a paso');
    await expect(page.getByTestId('cri-step-results')).toContainText('A · Dosis horaria');
    await expect(page.getByTestId('cri-step-results')).toContainText('3 mg/h');
    await expect(page.getByTestId('cri-step-results')).toContainText('10 h');
    await expect(page.getByTestId('cri-step-results')).toContainText('0.75 ml');
    await expect(page.getByText('Compensacion de volumen')).toBeVisible();
    await expect(page.getByText(/Finaliza despues de 2 bolsas/i)).toBeVisible();
  });

  test('saves dose and CRI results to session history and deletes an entry', async ({ page }) => {
    await page.goto('/dose');

    await fillIonInput(page, 'dose-weight', '10');
    await fillIonInput(page, 'dose-per-kg', '5');
    await page.getByTestId('save-dose').click();
    await expect(toastWithText(page, 'Registro guardado en historial.')).toBeVisible();

    await page.locator('app-dose-calculator-page').getByTestId('tab-cri').click();
    await fillIonInput(page, 'cri-weight', '10');
    await fillIonInput(page, 'cri-dose-rate', '5');
    await fillIonInput(page, 'cri-bag-volume', '100');
    await fillIonInput(page, 'cri-bag-duration', '10');
    await fillIonInput(page, 'cri-vial-concentration', '40');
    await fillIonInput(page, 'cri-bag-count', '2');
    await page.locator('app-cri-calculator-page').getByTestId('save-cri').click();
    await expect(toastWithText(page, 'Registro guardado en historial.')).toBeVisible();

    await page.locator('app-cri-calculator-page').getByTestId('nav-history').click();
    await expect(page.getByTestId('history-card')).toHaveCount(2);
    await expect(page.locator('app-history-page').getByText('Dosis de medicamento')).toBeVisible();
    await expect(page.locator('app-history-page').getByText('Infusion CRI')).toBeVisible();

    await page.getByTestId('delete-history-entry').first().click();
    await expect(toastWithText(page, 'Registro eliminado correctamente.')).toBeVisible();
    await expect(page.getByTestId('history-card')).toHaveCount(1);
  });

  test('shows the mandatory clinical safety warning', async ({ page }) => {
    await page.goto('/safety');

    await expect(page.getByTestId('safety-warning')).toContainText(
      'Validacion profesional obligatoria',
    );
    await expect(page.getByTestId('safety-warning')).toContainText(
      'Todos los resultados deben ser revisados',
    );
  });
});
