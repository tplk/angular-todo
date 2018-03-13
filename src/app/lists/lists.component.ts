import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { StateService } from 'app/core/state.service';
import { sanitizeName } from 'app/shared/helpers/sanitize-name';
import { trackById } from 'app/shared/helpers/track-by-id';
import { ListWithCount } from 'app/shared/models/list-with-count';
import { nameValidators } from 'app/shared/validators/name.validator';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'atd-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['./lists.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListsComponent {
  public trackByFunc = trackById;

  public lists$: Observable<ListWithCount[]>;
  public form: FormGroup;

  constructor(private state: StateService,
              private fb: FormBuilder,
              private router: Router) {
    this.createForm();
    this.lists$ = state.getListsWithCount();
  }

  public onSubmit(): void {
    if (this.form.valid) {
      const id = this.state.addList(
        sanitizeName(this.form.get('name').value.toString()),
      );
      this.form.reset();
      this.router.navigate([`/lists/${id}`]);
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: this.fb.control('', nameValidators),
    });
  }
}
