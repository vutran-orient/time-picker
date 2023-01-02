import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TimePickConfig {
  meridian = false;
  spinners = true;
  seconds = false;
  hourStep = 1;
  minuteStep = 1;
  secondStep = 1;
  disabled = false;
  readonlyInputs = false;
  size: 'small' | 'medium' | 'large' = 'medium';
}
