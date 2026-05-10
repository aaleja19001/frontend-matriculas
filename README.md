# Portal de Matrículas (Frontend)

Aplicación web para la gestión de citas de matrícula universitaria, desarrollada con Angular.

## 🚀 Tecnologías

*   **Angular 21.2.x** (Usando Componentes Standalone).
*   **Tailwind CSS** para estilos modernos y responsivos.
*   **TypeScript** para tipado estático.
*   **Angular Signals** para la gestión reactiva del estado.
*   **RxJS** para el manejo de flujos asíncronos y peticiones HTTP.
*   **jsPDF** y **jspdf-autotable** para la generación de reportes en PDF.

## 🛠️ Requisitos Previos

*   **Node.js** (Versión 20 o superior recomendada).
*   **npm** (Viene con Node.js).

## ⚙️ Configuración

La configuración del API backend se encuentra en `src/environments/`.

### Desarrollo
En `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8081/api'
};
```

## Estructura del Proyecto

*   `src/app/core`: Servicios globales, guardas de seguridad e interceptores.
*   `src/app/features`: Módulos de funcionalidad divididos por rol:
    *   `admin`: Gestión de slots, citas, estudiantes, profesores y programas.
    *   `student`: Dashboard del estudiante, solicitud de citas y perfil.
    *   `auth`: Login y recuperación de contraseña.
*   `src/app/shared`: Componentes reutilizables, layouts (admin/student) y componentes UI.

## Ejecución

1.  Instalar dependencias:
    ```bash
    npm install
    ```

2.  Iniciar servidor de desarrollo:
    ```bash
    npm start
    ```

La aplicación estará disponible en `http://localhost:4200`.

## Construcción

Para generar el build de producción:

```bash
npm run build
```

Los archivos se generarán en la carpeta `dist/frontend-matriculas`.

## Autenticación

El sistema utiliza **JWT**. El token se almacena en el `localStorage` del navegador y se adjunta automáticamente a todas las peticiones salientes mediante un interceptor (`auth.interceptor.ts`).
