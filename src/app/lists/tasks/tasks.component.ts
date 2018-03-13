import { ChangeDetectionStrategy, Component, OnDestroy } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { StateService } from 'app/core/state.service';
import { sanitizeName } from 'app/shared/helpers/sanitize-name';
import { Task } from 'app/shared/models/task.model';
import { nameValidators } from 'app/shared/validators/name.validator';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest, debounceTime, distinctUntilChanged, map, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs/Subject';

interface Filters {
  searchQuery: string;
  // undone = true, all = false
  undoneOnly: boolean;
}

const defaultFilters: Filters = {
  searchQuery: '',
  undoneOnly: false,
};

@Component({
  selector: 'atd-tasks',
  templateUrl: './tasks.component.html',
  styleUrls: ['./tasks.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksComponent implements OnDestroy {
  public tasks: Observable<Task[]>;
  public form: FormGroup;
  public searchFilter: FormControl = new FormControl(defaultFilters.searchQuery);
  public undoneFilter: FormControl = new FormControl(defaultFilters.undoneOnly);

  private filters: BehaviorSubject<Filters> = new BehaviorSubject<Filters>(defaultFilters);
  private ngUnsubscribe: Subject<any> = new Subject();

  constructor(private route: ActivatedRoute,
              private state: StateService,
              private fb: FormBuilder) {
    this.createForm();
    this.tasks =
      state.getActiveListTasks().pipe(
        combineLatest(this.filters),
        map(([tasks]) => this.filterData(tasks)),
      );
    this.route.params
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((params) => {
        this.initFilters();
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

  private setIsDoneFilter(undoneOnly: boolean): void {
    this.filters.next({
      ...this.filters.getValue(),
      undoneOnly,
    });
  }

  private setSearchQuery(searchQuery: string): void {
    this.filters.next({
      ...this.filters.getValue(),
      searchQuery: sanitizeName(searchQuery),
    });
  }

  private createForm(): void {
    this.form = this.fb.group({
      name: this.fb.control('', nameValidators),
    });
  }

  private initFilters(): void {
    // reset filters
    this.filters.next(defaultFilters);
    this.searchFilter.reset(defaultFilters.searchQuery);
    this.undoneFilter.reset(defaultFilters.undoneOnly);

    this.searchFilter.valueChanges.pipe(
      distinctUntilChanged(),
      debounceTime(100),
    ).subscribe((searchQuery) =>
      this.setSearchQuery(searchQuery),
    );

    this.undoneFilter.valueChanges.pipe(
      distinctUntilChanged(),
    ).subscribe((undoneOnly) =>
      this.setIsDoneFilter(undoneOnly),
    );
  }

  private filterData(tasks: Task[]): Task[] {
    const searchQuery = this.filters.getValue()
      .searchQuery.toLocaleLowerCase();
    // Filter code is duplicated so it can be done in O(n)
    if (this.filters.getValue().undoneOnly) {
      return tasks.filter((task) =>
        task.isDone === false
        && task.name.toLocaleLowerCase()
          .search(searchQuery) > -1,
      );
    } else {
      return tasks.filter((task) =>
        task.name.toLocaleLowerCase()
          .search(searchQuery) > -1,
      );
    }
  }
}
