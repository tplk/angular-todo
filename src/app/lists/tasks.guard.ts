import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { StateService } from 'app/core/state.service';

@Injectable()
export class TasksGuard implements CanActivate {
  constructor(private router: Router, private stateService: StateService) {}

  public canActivate(next: ActivatedRouteSnapshot): boolean {
    if (next && next.params['id']) {
      const listId: number = parseInt(next.params['id'], 10);
      if (!isNaN(listId) && this.stateService.listExists(listId)) {
        return true;
      }
    }
    this.router.navigate(['/lists']);
    return false;
  }
}
