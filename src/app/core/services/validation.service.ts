import { Injectable } from '@angular/core';

export interface ValidationRule {
  fieldName: string;
  maxLength: number;
  pattern?: RegExp;
}

export interface ValidationError {
  field: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class ValidationService {
  
  // Define límites de caracteres por tipo de campo
  private readonly fieldLimits = {
    // Campos de texto general: 20 caracteres
    firstName: 20,
    lastName: 20,
    studentCode: 20,
    nationalId: 20,
    login: 20,
    name: 20,
    description: 20,
    title: 20,
    phone: 20,
    address: 20,
    city: 20,
    country: 20,
    semester: 7, // YYYY-PP
    
    // Email: 35 caracteres
    email: 35,
    
    // Otros campos por defecto: 20
    default: 20
  };

  private readonly fieldPatterns: { [key: string]: { regex: RegExp, message: string, blockInvalidChars?: boolean } } = {
    firstName: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/, message: 'Solo se permiten letras y espacios', blockInvalidChars: true },
    lastName: { regex: /^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]*$/, message: 'Solo se permiten letras y espacios', blockInvalidChars: true },
    semester: { regex: /^\d{4}-\d{2}$/, message: 'El formato debe ser AAAA-PP (ej. 2026-02)' }
  };

  /**
   * Obtiene el límite de caracteres para un campo específico
   */
  getFieldLimit(fieldName: string): number {
    const lowerField = fieldName as keyof typeof this.fieldLimits;
    return this.fieldLimits[lowerField] || this.fieldLimits.default;
  }

  /**
   * Obtiene el patrón de validación para un campo específico si existe
   */
  getFieldPattern(fieldName: string) {
    return this.fieldPatterns[fieldName] || null;
  }

  /**
   * Valida un campo contra su límite de caracteres y patrón (si existe)
   */
  validateField(fieldName: string, value: string): ValidationError | null {
    if (!value) return null;
    
    const limit = this.getFieldLimit(fieldName);
    if (value.length > limit) {
      return {
        field: fieldName,
        message: `El campo no puede exceder ${limit} caracteres (tiene ${value.length})`
      };
    }
    
    const pattern = this.getFieldPattern(fieldName);
    if (pattern && !pattern.blockInvalidChars && !pattern.regex.test(value)) {
      return {
        field: fieldName,
        message: pattern.message
      };
    }
    
    return null;
  }

  /**
   * Obtiene un mensaje de error formateado para mostrar al usuario
   */
  formatErrorMessage(field: string, limit: number, current: number): string {
    return `${field} no puede tener más de ${limit} caracteres (tiene ${current})`;
  }

  /**
   * Valida múltiples campos
   */
  validateFields(data: Record<string, string>): ValidationError[] {
    const errors: ValidationError[] = [];
    
    Object.entries(data).forEach(([field, value]) => {
      const error = this.validateField(field, value || '');
      if (error) errors.push(error);
    });
    
    return errors;
  }

  /**
   * Obtiene todas las reglas de validación
   */
  getAllValidationRules(): ValidationRule[] {
    return Object.entries(this.fieldLimits).map(([fieldName, maxLength]) => ({
      fieldName,
      maxLength
    }));
  }
}
