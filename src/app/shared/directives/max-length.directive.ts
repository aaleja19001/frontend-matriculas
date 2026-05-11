import { Directive, ElementRef, HostListener, Input, OnInit, output } from '@angular/core';
import { ValidationService } from '../../core/services/validation.service';

/**
 * Directiva para limitar caracteres en inputs de texto
 * Uso: <input appMaxLength="fieldName">
 * 
 * Ejemplos:
 * <input appMaxLength="firstName"> <!-- límite 20 caracteres -->
 * <input appMaxLength="email"> <!-- límite 35 caracteres -->
 */
@Directive({
  selector: '[appMaxLength]',
  standalone: true
})
export class MaxLengthDirective implements OnInit {
  @Input() appMaxLength!: string; // Nombre del campo para obtener el límite
  @Input() showWarning = true; // Mostrar advertencia visual
  
  characterLimitExceeded = output<{ field: string; limit: number; current: number }>();

  private maxLength = 20;
  private lastValidValue = '';

  constructor(
    private el: ElementRef,
    private validationService: ValidationService
  ) {}

  ngOnInit() {
    // Obtener el límite de caracteres según el nombre del campo
    this.maxLength = this.validationService.getFieldLimit(this.appMaxLength);
    
    // Establecer el atributo maxlength en el input o textarea
    const element = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement;
    element.maxLength = this.maxLength;
    
    // Guardar el valor inicial válido
    this.lastValidValue = element.value || '';
  }

  @HostListener('input', ['$event'])
  onInput(event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    let currentValue = input.value;

    const pattern = this.validationService.getFieldPattern(this.appMaxLength);
    
    // Si el patrón bloquea caracteres inválidos (ej. nombres solo letras)
    if (pattern && pattern.blockInvalidChars) {
      // Remover cualquier caracter que no sea letra, espacio o vocal con tilde
      const cleanedValue = currentValue.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
      if (currentValue !== cleanedValue) {
        currentValue = cleanedValue;
        input.value = currentValue;
        // Mostrar advertencia de patrón
        if (this.showWarning) {
           this.showExceededWarning(input, pattern.message);
           setTimeout(() => this.removeExceededWarning(input), 1500);
        }
      }
    }

    if (currentValue.length > this.maxLength) {
      // Si se pega texto más largo, truncarlo
      currentValue = currentValue.substring(0, this.maxLength);
      input.value = currentValue;
      this.lastValidValue = currentValue;
      
      // Emitir evento de límite excedido
      this.characterLimitExceeded.emit({
        field: this.appMaxLength,
        limit: this.maxLength,
        current: currentValue.length
      });

      if (this.showWarning) {
        this.showExceededWarning(input);
      }
    } else if (currentValue.length === this.maxLength) {
      // Mostrar advertencia justo cuando se alcanza el límite
      this.lastValidValue = currentValue;
      if (this.showWarning) {
        this.showExceededWarning(input);
      }
    } else {
      // Validar patrón si es de formato estricto y no está bloqueando (ej. semester)
      if (pattern && !pattern.blockInvalidChars && currentValue.length > 0) {
        if (!pattern.regex.test(currentValue) && currentValue.length === this.maxLength) {
           if (this.showWarning) this.showExceededWarning(input, pattern.message);
        } else {
           this.removeExceededWarning(input);
        }
      } else {
        // Guardar como último valor válido
        this.lastValidValue = currentValue;
        this.removeExceededWarning(input);
      }
    }
  }

  @HostListener('keypress', ['$event'])
  onKeyPress(event: KeyboardEvent): void {
    const pattern = this.validationService.getFieldPattern(this.appMaxLength);
    if (pattern && pattern.blockInvalidChars) {
       // Validar solo si la tecla no es de control (Enter, Backspace, etc)
       if (event.key && event.key.length === 1 && !pattern.regex.test(event.key)) {
         event.preventDefault();
         if (this.showWarning) {
            const input = event.target as HTMLInputElement;
            this.showExceededWarning(input, pattern.message);
            setTimeout(() => this.removeExceededWarning(input), 1500);
         }
       }
    }
  }

  private showExceededWarning(input: HTMLInputElement | HTMLTextAreaElement, customMsg?: string): void {
    input.style.borderColor = '#EF4444'; // Red
    input.style.backgroundColor = '#FEE2E2'; // Light red
    
    // Mostrar tooltip
    this.showTooltip(customMsg);
  }

  private removeExceededWarning(input: HTMLInputElement | HTMLTextAreaElement): void {
    input.style.borderColor = '';
    input.style.backgroundColor = '';
    this.hideTooltip();
  }

  private showTooltip(customMsg?: string): void {
    let tooltip = document.getElementById(`tooltip-${this.appMaxLength}`);
    
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.id = `tooltip-${this.appMaxLength}`;
      tooltip.style.cssText = `
        position: absolute;
        background-color: #EF4444;
        color: white;
        padding: 0.5rem 0.75rem;
        border-radius: 0.375rem;
        font-size: 0.75rem;
        font-weight: 600;
        z-index: 1000;
        margin-top: 0.25rem;
        white-space: nowrap;
      `;
      const input = this.el.nativeElement as HTMLInputElement | HTMLTextAreaElement;
      input.parentElement?.appendChild(tooltip);
      
      // Posicionar el tooltip
      const rect = input.getBoundingClientRect();
      tooltip.style.top = `${rect.bottom + 5}px`;
      tooltip.style.left = `${rect.left}px`;
    }
    tooltip.textContent = customMsg || `Máximo ${this.maxLength} caracteres`;
  }

  private hideTooltip(): void {
    const tooltip = document.getElementById(`tooltip-${this.appMaxLength}`);
    if (tooltip) {
      tooltip.remove();
    }
  }
}
