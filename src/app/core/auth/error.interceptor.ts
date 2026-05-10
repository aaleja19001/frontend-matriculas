import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service';

/**
 * Interfaz para la respuesta de error del backend
 */
interface BackendError {
  status?: number;
  message?: string;
  error?: string | { message?: string };
  details?: any;
  timestamp?: string;
  path?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorInterceptorService {
  // Esta clase es solo para el servicio, el interceptor real es la función abajo
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toastService = inject(ToastService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      const errorMessage = formatErrorMessage(error);
      
      // Mostrar error en rojo
      toastService.error(errorMessage);
      
      // Mantener el error para que lo maneje el componente si es necesario
      return throwError(() => ({
        statusCode: error.status,
        message: errorMessage,
        originalError: error,
        backend: parseBackendError(error)
      }));
    })
  );
};

/**
 * Parsea el error del backend y lo formatea
 */
function parseBackendError(error: HttpErrorResponse): BackendError {
  let backendError: BackendError = {
    status: error.status,
    timestamp: new Date().toISOString()
  };

  if (error.error) {
    if (typeof error.error === 'object') {
      backendError = { ...backendError, ...error.error };
    } else if (typeof error.error === 'string') {
      backendError.error = error.error;
    }
  }

  // Si no hay mensaje, usar el statusText
  if (!backendError.message) {
    backendError.message = error.message || error.statusText || 'Error en la solicitud';
  }

  return backendError;
}

/**
 * Formatea el mensaje de error para mostrarlo al usuario
 */
function formatErrorMessage(error: HttpErrorResponse): string {
  // Errores de red
  if (error.status === 0) {
    return '❌ Error de conexión. Verifica tu conexión a internet.';
  }

  // Obtener el mensaje del backend
  let message = '';
  
  if (error.error) {
    if (typeof error.error === 'object') {
      message = error.error.message 
        || error.error.error 
        || JSON.stringify(error.error).substring(0, 200);
    } else if (typeof error.error === 'string') {
      message = error.error;
    }
  }

  // Si no hay mensaje del backend, usar el statusText
  if (!message) {
    message = error.message || error.statusText || 'Error desconocido';
  }

  // Agregar código HTTP
  const httpStatus = getHttpStatusDescription(error.status);
  const prefix = getErrorPrefix(error.status);

  return `${prefix} ${httpStatus} - ${message}`;
}

/**
 * Obtiene descripción legible del código HTTP
 */
function getHttpStatusDescription(status: number): string {
  const statusDescriptions: { [key: number]: string } = {
    400: '[Solicitud Inválida]',
    401: '[No Autenticado]',
    403: '[Acceso Denegado]',
    404: '[No Encontrado]',
    409: '[Conflicto]',
    422: '[Datos Inválidos]',
    500: '[Error del Servidor]',
    502: '[Puerta de Enlace Mala]',
    503: '[Servicio No Disponible]',
    504: '[Tiempo de Espera Agotado]'
  };

  return statusDescriptions[status] || `[Error ${status}]`;
}

/**
 * Obtiene un prefijo emoji según el tipo de error
 */
function getErrorPrefix(status: number): string {
  if (status >= 500) return '🔴';      // Error del servidor
  if (status >= 400) return '⚠️';      // Error del cliente
  if (status === 0) return '📡';       // Error de conexión
  return '❌';                          // Error genérico
}
