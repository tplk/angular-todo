import { Validators } from '@angular/forms';

export const nameValidators = Validators.compose([
  Validators.required,
  Validators.pattern(/[^ ]+/),
]);
