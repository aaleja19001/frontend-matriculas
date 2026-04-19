// import { Routes } from '@angular/router';
// import { adminGuard } from './core/auth/auth.guard';

// export const routes: Routes = [
//   { path: '', redirectTo: 'login', pathMatch: 'full' },
//   {
//     path: 'login',
//     loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
//   },
//   {
//     path: 'admin',
//     canActivate: [adminGuard],
//     loadComponent: () => import('./shared/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
//     children: [
//       {
//         path: 'dashboard',
//         loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
//       },
//       {
//         path: 'appointments',
//         loadComponent: () => import('./features/admin/appointments/appointments.component').then(m => m.AppointmentsComponent)
//       },
//       { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
//     ]
//   },
//   { path: '**', redirectTo: 'login' }
// ];

import { Routes } from '@angular/router';
import { adminGuard, authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./shared/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/admin/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'slots',
        loadComponent: () => import('./features/admin/slots/slots.component').then(m => m.SlotsComponent)
      },
      {
        path: 'appointments',
        loadComponent: () => import('./features/admin/appointments/appointments.component').then(m => m.AppointmentsComponent)
      },
      {
        path: 'students',
        loadComponent: () => import('./features/admin/students/students.component').then(m => m.StudentsComponent)
      },
      {
        path: 'programs',
        loadComponent: () => import('./features/admin/programs/programs.component').then(m => m.ProgramsComponent)
      },
      {
        path: 'subjects',
        loadComponent: () => import('./features/admin/subjects/subjects.component').then(m => m.SubjectsComponent)
      }
    ]
  },
  {
    path: 'student',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/student-layout/student-layout.component').then(m => m.StudentLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/student/dashboard/student-dashboard.component').then(m => m.StudentDashboardComponent)
      },
      {
        path: 'request',
        loadComponent: () => import('./features/student/request/request-appointment.component').then(m => m.RequestAppointmentComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];