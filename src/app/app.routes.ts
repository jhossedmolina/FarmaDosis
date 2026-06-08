import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    loadComponent: () => import('./features/home/pages/home.page').then((m) => m.HomePage),
  },
  {
    path: 'dose',
    loadComponent: () =>
      import('./features/dose-calculator/pages/dose-calculator.page').then(
        (m) => m.DoseCalculatorPage,
      ),
  },
  {
    path: 'cri',
    loadComponent: () =>
      import('./features/cri-calculator/pages/cri-calculator.page').then(
        (m) => m.CriCalculatorPage,
      ),
  },
  {
    path: 'history',
    loadComponent: () => import('./features/history/pages/history.page').then((m) => m.HistoryPage),
  },
  {
    path: 'safety',
    loadComponent: () =>
      import('./features/safety-info/pages/safety-info.page').then((m) => m.SafetyInfoPage),
  },
];
