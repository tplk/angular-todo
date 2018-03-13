import { List } from './list.model';

export class ListWithCount extends List {
  public tasksCountTodo: number = null;
  public tasksCountTotal: number = null;

  constructor() {
    super();
  }
}
