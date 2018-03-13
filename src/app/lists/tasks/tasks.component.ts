import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'app/core/state.service';
import { sanitizeName } from 'app/shared/helpers/sanitize-name';
import { Task } from 'app/shared/models/task.model';
import { nameValidators } from 'app/shared/validators/name.validator';
import { Observable } from 'rxjs/Observable';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

@Component({
  selector: 'atd-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnDestroy {
  public tasks: Observable<Task[]>;
  public form: FormGroup;

  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private route: ActivatedRoute,
              private state: StateService,
              private fb: FormBuilder) {
    this.createForm();
    this.tasks = state.getActiveListTasks();
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.state.setActiveListId(parseInt(params['id'], 10));
      });
  }

  public ngOnDestroy(): void {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

  public toggleTaskStatus(task: Task): void {
    this.state.changeTaskStatus(task.id, !task.isDone);
  }

  public deleteTask(task): void {
    this.state.deleteTask(task.id);
  }

  public onSubmit(): void {
    if (this.form.valid) {
      this.state.addTask(
        sanitizeName(this.form.get('name').value.toString()),
      );
      this.form.reset();
    }
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: this.fb.control('', nameValidators),
    });
  }
}
