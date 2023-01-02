import { Injectable } from '@angular/core';
import { TimeStruct } from './time-struct';
import { isInteger } from '../../utils/utils';

export function NGB_DATEPICKER_TIME_ADAPTER_FACTORY() {
  return new TimeStructAdapter();
}

/**
 * An abstract service that does the conversion between the internal timepicker `NgbTimeStruct` model and
 * any provided user time model `T`, ex. a string, a native date, etc.
 *
 * The adapter is used **only** for conversion when binding timepicker to a form control,
 * ex. `[(ngModel)]="userTimeModel"`. Here `userTimeModel` can be of any type.
 *
 * The default timepicker implementation assumes we use `NgbTimeStruct` as a user model.
 *
 * See the [custom time adapter demo](#/components/timepicker/examples#adapter) for an example.
 *
 * @since 2.2.0
 */
@Injectable({
  providedIn: 'root',
  useFactory: NGB_DATEPICKER_TIME_ADAPTER_FACTORY,
})
export abstract class TimeAdapter<T> {
  /**
   * Converts a user-model time of type `T` to an `NgbTimeStruct` for internal use.
   */
  abstract fromModel(value: T | null): TimeStruct | null;

  /**
   * Converts an internal `NgbTimeStruct` time to a user-model time of type `T`.
   */
  abstract toModel(time: TimeStruct | null): T | null;
}

@Injectable()
export class TimeStructAdapter extends TimeAdapter<TimeStruct> {
  /**
   * Converts a NgbTimeStruct value into NgbTimeStruct value
   */
  fromModel(time: TimeStruct | null): TimeStruct | null {
    return time && isInteger(time.hour) && isInteger(time.minute)
      ? {
          hour: time.hour,
          minute: time.minute,
          second: isInteger(time.second) ? time.second : <any>null,
        }
      : null;
  }

  /**
   * Converts a NgbTimeStruct value into NgbTimeStruct value
   */
  toModel(time: TimeStruct | null): TimeStruct | null {
    return time && isInteger(time.hour) && isInteger(time.minute)
      ? {
          hour: time.hour,
          minute: time.minute,
          second: isInteger(time.second) ? time.second : <any>null,
        }
      : null;
  }
}
