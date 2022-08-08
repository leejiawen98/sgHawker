import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { AnalyticsPage } from './analytics.page';

const routes: Routes = [
  {
    path: '',
    component: AnalyticsPage
  },
  {
    path: 'add-goal',
    loadChildren: () => import('./add-goal/add-goal.module').then( m => m.AddGoalPageModule)
  },
  {
    path: 'view-goal',
    loadChildren: () => import('./view-goal/view-goal.module').then( m => m.ViewGoalPageModule)
  },
  {
    path: 'edit-goal',
    loadChildren: () => import('./edit-goal/edit-goal.module').then( m => m.EditGoalPageModule)
  },
  {
    path: 'fooditem-comparison',
    loadChildren: () => import('./echarts-comparative-fooditem-chart/fooditem-comparison/fooditem-comparison.module').then( m => m.FooditemComparisonPageModule)
  },
  {
    path: 'hawker-comparative',
    loadChildren: () => import('./echarts-comparative-graph/hawker-comparative/hawker-comparative.module').then( m => m.HawkerComparativePageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AnalyticsPageRoutingModule {}
