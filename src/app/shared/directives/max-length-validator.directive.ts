import { Directive, Input, OnInit } from '@angular/core';
import { 
  AbstractControl, 
  NG_VALIDATORS, 
  ValidationErrors, 
  Validator 
} from '@angular/forms';
import { ValidationService } from '../../core/services/validation.service';

/**
 * Validador reactivo para formularios
 * Uso: <input formControl="field" appMaxLengthValidator="fieldName">
 */
@Directive({
  selector: '[appMaxLengthValidator]',
  providers: [
    {
      provide: NG_VALIDATORS,
      useExisting: MaxLengthValidatorDirective,
      multi: true
    }
  ],
  standalone: true
})
export class MaxLengthValidatorDirective implements Validator, OnInit {
  @Input() appMaxLengthValidator!: string; // Nombre del campo

  private maxLength = 20;

  constructor(private validationService: ValidationService) {}

  ngOnInit() {
    this.maxLength = this.validationService.getFieldLimit(this.appMaxLengthValidator);
  }

  validate(control: AbstractControl<any, any>): ValidationErrors | null {
    const value = control.value;

    if (!value || value.length <= this.maxLength) {
      return null;
    }

    return {
      maxLength: {
        max: this.maxLength,
        actual: value.length,
        message: `Máximo ${this.maxLength} caracteres permitidos`
      }
    };
  }
}
