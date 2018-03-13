import { Injectable } from '@angular/core';
import { populateModel } from 'app/shared/helpers/populate-model';
import { ListWithCount } from 'app/shared/models/list-with-count';
import { List } from 'app/shared/models/list.model';
import { Task } from 'app/shared/models/task.model';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { combineLatest, map, switchMap } from 'rxjs/operators';
import * as data from './initial-state.json';

@Injectable()
export class StateService {
  private _lists$: BehaviorSubject<List[]> = new BehaviorSubject<List[]>([]);
  private _tasks$: BehaviorSubject<Task[]> = new BehaviorSubject<Task[]>([]);
  private _activeListId$: BehaviorSubject<number> = new BehaviorSubject<number>(null);

  public init(): void {
    this._lists$.next(
      (data as any).lists
        .map((v) => populateModel<List>((new List()), v)),
    );
    this._tasks$.next(
      (data as any).tasks
        .map((v) => populateModel<Task>((new Task()), v)),
    );
  }

  public get lists$(): Observable<List[]> {
    return this._lists$.asObservable();
  }

  public get tasks$(): Observable<Task[]> {
    return this._tasks$.asObservable();
  }

  public get activeListId$(): Observable<number> {
    return this._activeListId$.asObservable();
  }

  public setActiveListId(id: number): void {
    this._activeListId$.next(id);
  }

  public listExists = (id: number): boolean =>
    this._lists$.getValue().filter((l) => l.id === id).length > 0;

  public getTasksByListId = (id: number): Observable<Task[]> =>
    this._tasks$.pipe(
      map((tasks: Task[]) => this.filterTasksByListId(id, tasks)),
    );

  public getActiveListTasks = (): Observable<Task[]> =>
    this._activeListId$.pipe(
      switchMap((id: number) => this.getTasksByListId(id)),
    );

  public getListsWithCount = (): Observable<ListWithCount[]> =>
    this._tasks$.pipe(
      combineLatest(this._lists$),
      map(([tasks, lists]: [Task[], List[]]) =>
        lists.map((list) => {
          const listTasks: Task[] = this.filterTasksByListId(list.id, tasks);
          return populateModel<ListWithCount>(
            (new ListWithCount()),
            {
              ...list,
              tasksCountTodo: listTasks.filter((t) => !t.isDone).length,
              tasksCountTotal: listTasks.length,
            },
          );
        }),
      ),
    );

  public addList(name: string): number {
    const newId = Math.max(...this._lists$.getValue().map((list) => list.id)) + 1;
    this._lists$.next(
      [
        ...this._lists$.getValue(),
        populateModel((new List()), {
          id: newId,
          name,
        }),
      ],
    );
    return newId;
  }

  public addTask(name: string): number {
    const newId = Math.max(...this._tasks$.getValue().map((task) => task.id)) + 1;
    this._tasks$.next(
      [
        ...this._tasks$.getValue(),
        populateModel((new Task()), {
          id: newId,
          listId: this._activeListId$.getValue(),
          name,
          isDone: false,
        }),
      ],
    );
    return newId;
  }

  public changeTaskStatus(id: number, isDone: boolean): void {
    this._tasks$.next(
      [
        ...this._tasks$.getValue().map((task) =>
          task.id !== id
            ? task
            : {
              ...task,
              isDone,
            }),
      ],
    );
  }

  public deleteTask(id: number): void {
    const tasks = this._tasks$.getValue();
    const index = tasks.map((task) => task.id).indexOf(id);
    if (!isNaN(index)) {
      this._tasks$.next(
        [
          ...tasks.slice(0, index),
          ...tasks.slice(index + 1),
        ],
      );
    }
  }

  private filterTasksByListId = (id: number, tasks: Task[]) =>
    tasks.filter((t: Task) => t.listId === id);
}
