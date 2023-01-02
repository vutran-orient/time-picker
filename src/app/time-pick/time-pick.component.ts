import { JsonPipe, NgIf } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewEncapsulation,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { isInteger, isNumber, padNumber, toInteger } from '../utils/utils';
import { Time } from './time-config/time';
import { TimeAdapter } from './time-config/time-adapter';
import { TimePickConfig } from './time-pick.config';
import { MatIconModule } from '@angular/material/icon';

const FILTER_REGEX = /[^0-9]/g;

@Component({
  exportAs: 'app-time-pick',
  selector: 'app-time-pick',
  templateUrl: './time-pick.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  styleUrls: ['./time-pick.component.scss'],
  imports: [FormsModule, JsonPipe, NgIf, MatIconModule],

  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TimePickComponent),
      multi: true,
    },
  ],
})
export class TimePickComponent implements ControlValueAccessor, OnChanges {
  static ngAcceptInputType_size: string;

  disabled: boolean;
  model?: Time;

  private _hourStep!: number;
  private _minuteStep!: number;
  private _secondStep!: number;

  /**
   * Whether to display 12H or 24H mode.
   */
  @Input() meridian: boolean;

  /**
   * If `true`, the spinners above and below inputs are visible.
   */
  @Input() spinners: boolean;

  /**
   * If `true`, it is possible to select seconds.
   */
  @Input() seconds: boolean;

  /**
   * The number of hours to add/subtract when clicking hour spinners.
   */
  @Input()
  set hourStep(step: number) {
    this._hourStep = isInteger(step) ? step : this._config.hourStep;
  }

  get hourStep(): number {
    return this._hourStep;
  }

  /**
   * The number of minutes to add/subtract when clicking minute spinners.
   */
  @Input()
  set minuteStep(step: number) {
    this._minuteStep = isInteger(step) ? step : this._config.minuteStep;
  }

  get minuteStep(): number {
    return this._minuteStep;
  }

  /**
   * The number of seconds to add/subtract when clicking second spinners.
   */
  @Input()
  set secondStep(step: number) {
    this._secondStep = isInteger(step) ? step : this._config.secondStep;
  }

  get secondStep(): number {
    return this._secondStep;
  }

  /**
   * If `true`, the timepicker is readonly and can't be changed.
   */
  @Input() readonlyInputs: boolean;

  /**
   * The size of inputs and buttons.
   */
  @Input() size: 'small' | 'medium' | 'large';

  constructor(
    private readonly _config: TimePickConfig,
    private _ngbTimeAdapter: TimeAdapter<any>,
    private _cd: ChangeDetectorRef
  ) {
    this.meridian = _config.meridian;
    this.spinners = _config.spinners;
    this.seconds = _config.seconds;
    this.hourStep = _config.hourStep;
    this.minuteStep = _config.minuteStep;
    this.secondStep = _config.secondStep;
    this.disabled = _config.disabled;
    this.readonlyInputs = _config.readonlyInputs;
    this.size = _config.size;
  }

  onChange = (_: any) => {};
  onTouched = () => {};

  writeValue(value: any) {
    const structValue = this._ngbTimeAdapter.fromModel(value);
    this.model = structValue
      ? new Time(structValue.hour, structValue.minute, structValue.second)
      : new Time();
    if (!this.seconds && (!structValue || !isNumber(structValue.second))) {
      this.model.second = 0;
    }
    this._cd.markForCheck();
  }

  registerOnChange(fn: (value: any) => any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean) {
    this.disabled = isDisabled;
  }

  /**
   * Increments the hours by the given step.
   */
  changeHour(step: number) {
    this.model?.changeHour(step);
    this.propagateModelChange();
  }

  /**
   * Increments the minutes by the given step.
   */
  changeMinute(step: number) {
    this.model?.changeMinute(step);
    this.propagateModelChange();
  }

  /**
   * Increments the seconds by the given step.
   */
  changeSecond(step: number) {
    this.model?.changeSecond(step);
    this.propagateModelChange();
  }

  /**
   * Update hours with the new value.
   */
  updateHour(newVal: string) {
    const isPM = this.model ? this.model.hour >= 12 : false;
    const enteredHour = toInteger(newVal);
    if (
      this.meridian &&
      ((isPM && enteredHour < 12) || (!isPM && enteredHour === 12))
    ) {
      this.model?.updateHour(enteredHour + 12);
    } else {
      this.model?.updateHour(enteredHour);
    }
    this.propagateModelChange();
  }

  /**
   * Update minutes with the new value.
   */
  updateMinute(newVal: string) {
    this.model?.updateMinute(toInteger(newVal));
    this.propagateModelChange();
  }

  /**
   * Update seconds with the new value.
   */
  updateSecond(newVal: string) {
    this.model?.updateSecond(toInteger(newVal));
    this.propagateModelChange();
  }

  toggleMeridian() {
    if (this.meridian) {
      this.changeHour(12);
    }
  }

  formatInput(input: HTMLInputElement) {
    input.value = input.value.replace(FILTER_REGEX, '');
  }

  formatHour(value?: number) {
    if (isNumber(value)) {
      if (this.meridian) {
        return padNumber(value % 12 === 0 ? 12 : value % 12);
      } else {
        return padNumber(value % 24);
      }
    } else {
      return padNumber(NaN);
    }
  }

  formatMinSec(value?: number) {
    return padNumber(isNumber(value) ? value : NaN);
  }

  handleBlur() {
    this.onTouched();
  }

  get isSmallSize(): boolean {
    return this.size === 'small';
  }

  get isLargeSize(): boolean {
    return this.size === 'large';
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      changes['seconds'] &&
      !this.seconds &&
      this.model &&
      !isNumber(this.model.second)
    ) {
      this.model.second = 0;
      this.propagateModelChange(false);
    }
  }

  private propagateModelChange(touched = true) {
    if (touched) {
      this.onTouched();
    }
    if (this.model?.isValid(this.seconds)) {
      this.onChange(
        this._ngbTimeAdapter.toModel({
          hour: this.model.hour,
          minute: this.model.minute,
          second: this.model.second,
        })
      );
    } else {
      this.onChange(this._ngbTimeAdapter.toModel(null));
    }
  }
}
