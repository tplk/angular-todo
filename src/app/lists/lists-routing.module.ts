import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListsComponent } from './lists.component';
import { TasksGuard } from './tasks.guard';
import { TasksComponent } from './tasks/tasks.component';

const routes: Routes = [
  {
    path: '',
    component: ListsComponent,
    children: [
      {path: ':id', component: TasksComponent, canActivate: [TasksGuard]},
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [TasksGuard],
})
export class ListsRoutingModule {
}
