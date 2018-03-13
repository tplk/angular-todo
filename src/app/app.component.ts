import { Component } from '@angular/core';
import { StateService } from 'app/core/state.service';

@Component({
  selector: 'atd-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(private state: StateService) {
    state.init();
  }
}
