import { NgModule } from '@angular/core';
import { SharedModule } from 'app/shared/shared.module';

import { ListsRoutingModule } from './lists-routing.module';
import { ListsComponent } from './lists.component';
import { TasksComponent } from './tasks/tasks.component';

@NgModule({
  imports: [
    SharedModule,
    ListsRoutingModule,
  ],
  declarations: [
    ListsComponent,
    TasksComponent,
  ],
})
export class ListsModule {
}
