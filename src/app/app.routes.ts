import { Routes } from '@angular/router';
import { adminGuard, advisorGuard, authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password.component').then(m => m.ForgotPasswordComponent)
  },
  {
    path: 'reset-password',
    loadComponent: () => import('./features/auth/reset-password/reset-password.component').then(m => m.ResetPasswordComponent)
  },
  {
    path: 'change-password',
    loadComponent: () => import('./features/auth/change-password/change-password.component').then(m => m.ChangePasswordComponent)
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
      },
      {
        path: 'offerings',
        loadComponent: () => import('./features/admin/offerings/offerings.component').then(m => m.OfferingsComponent)
      },
      {
        path: 'professors',
        loadComponent: () => import('./features/admin/professors/professors.component').then(m => m.ProfessorsComponent)
      }
      ,
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent)
      }
    ]
  },
  {
    path: 'advisor',
    canActivate: [advisorGuard],
    loadComponent: () => import('./shared/advisor-layout/advisor-layout.component').then(m => m.AdvisorLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/advisor/dashboard/advisor-dashboard.component').then(m => m.AdvisorDashboardComponent)
      },
      {
        path: 'profile',
        loadComponent: () => import('./features/advisor/profile/advisor-profile.component').then(m => m.AdvisorProfileComponent)
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./features/advisor/profile/change-password/advisor-change-password.component').then(m => m.AdvisorChangePasswordComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
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
      {
        path: 'profile',
        loadComponent: () => import('./features/student/profile/profile.component').then(m => m.ProfileComponent)
      },
      {
        path: 'profile/change-password',
        loadComponent: () => import('./features/student/profile/change-password/student-change-password.component').then(m => m.StudentChangePasswordComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
