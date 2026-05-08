import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentService, Appointment } from '../../../core/services/appointment.service';
import { ToastService } from '../../../core/services/toast.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

@Component({
  selector: 'app-appointments',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './appointments.component.html'
})
export class AppointmentsComponent implements OnInit {

  appointments = signal<Appointment[]>([]);
  loading = signal(false);
  selected = signal<Appointment | null>(null);
  processingId = signal<number | null>(null);
  selectedStatus = signal<string>('ALL');
  searchTerm = signal<string>('');

  filteredAppointments = computed(() => {
    let list = this.appointments();
    const status = this.selectedStatus();
    const search = this.searchTerm().toLowerCase().trim();

    if (status !== 'ALL') {
      list = list.filter(a => a.status === status);
    }

    if (search) {
      list = list.filter(a => 
        this.getStudentName(a).toLowerCase().includes(search) ||
        a.student?.studentCode?.toLowerCase().includes(search)
      );
    }

    return list;
  });

  stats = computed(() => {
    const all = this.appointments();
    return {
      total: all.length,
      pending: all.filter(a => a.status === 'PENDING').length,
      approved: all.filter(a => a.status === 'APPROVED').length,
      rejected: all.filter(a => a.status === 'REJECTED').length
    };
  });

  statusLabels: Record<string, string> = {
    PENDING: 'Pendiente',
    APPROVED: 'Aprobada',
    REJECTED: 'Rechazada',
    RESCHEDULED: 'Reprogramada',
    CANCELLED: 'Cancelada'
  };

  constructor(
    private appointmentService: AppointmentService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.loadAppointments();
  }

  loadAppointments() {
    this.loading.set(true);
    this.appointmentService.getAll().subscribe({
      next: data => {
        this.appointments.set([...data]);
        this.loading.set(false);
      },
      error: (err) => {
        this.toast.error('Error al cargar las citas');
        this.loading.set(false);
      }
    });
  }

  onStatusChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedStatus.set(value);
  }

  onSearchChange(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.searchTerm.set(value);
  }

  downloadPDF() {
    try {
      const doc = new jsPDF();
      const data = this.filteredAppointments();
      
      // --- Logo Drawing (Exact SVG Path Replication) ---
      const startX = 14;
      const startY = 10;
      const s = 10 / 24; // Scale factor (box is 10, svg is 24x24)
      
      // Blue Background Box
      doc.setFillColor(37, 99, 235); // #2563EB
      doc.roundedRect(startX, startY, 10, 10, 1.5, 1.5, 'F');
      
      // White Book Icon
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.4);
      
      // Center spine: M12 6.253v13
      doc.line(startX + 12*s, startY + 6.253*s, startX + 12*s, startY + 19.253*s);
      
      // Left side
      doc.moveTo(startX + 12*s, startY + 6.253*s);
      // @ts-ignore
      doc.curveTo(startX + 10.832*s, startY + 5.477*s, startX + 9.246*s, startY + 5*s, startX + 7.5*s, startY + 5*s);
      // @ts-ignore
      doc.curveTo(startX + 5.754*s, startY + 5*s, startX + 4.168*s, startY + 5.477*s, startX + 3*s, startY + 6.253*s);
      doc.lineTo(startX + 3*s, startY + 19.253*s);
      // @ts-ignore
      doc.curveTo(startX + 4.168*s, startY + 18.477*s, startX + 5.754*s, startY + 18*s, startX + 7.5*s, startY + 18*s);
      // @ts-ignore
      doc.curveTo(startX + 10.832*s, startY + 18.477*s, startX + 12*s, startY + 19.253*s, startX + 12*s, startY + 19.253*s);
      doc.stroke();
      
      // Right side
      doc.moveTo(startX + 12*s, startY + 6.253*s);
      // @ts-ignore
      doc.curveTo(startX + 13.168*s, startY + 5.477*s, startX + 14.754*s, startY + 5*s, startX + 16.5*s, startY + 5*s);
      // @ts-ignore
      doc.curveTo(startX + 18.247*s, startY + 5*s, startX + 19.832*s, startY + 5.477*s, startX + 21*s, startY + 6.253*s);
      doc.lineTo(startX + 21*s, startY + 19.253*s);
      // @ts-ignore
      doc.curveTo(startX + 19.832*s, startY + 18.477*s, startX + 18.247*s, startY + 18*s, startX + 16.5*s, startY + 18*s);
      // @ts-ignore
      doc.curveTo(startX + 13.168*s, startY + 18.477*s, startX + 12*s, startY + 19.253*s, startX + 12*s, startY + 19.253*s);
      doc.stroke();

      // --- Brand Text ---
      doc.setFontSize(16);
      doc.setTextColor(15, 23, 42); // #0F172A
      doc.setFont('helvetica', 'bold');
      doc.text('Matricula', startX + 14, startY + 6.5);
      
      doc.setTextColor(74, 222, 128); // #4ADE80 (Green+)
      doc.text('+', startX + 40, startY + 6.5);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 116, 139); // #64748B
      doc.setFont('helvetica', 'normal');
      doc.text('Sistema de Gestión Académica', startX + 14, startY + 11);

      // --- Report Header ---
      doc.setDrawColor(226, 232, 240); // #E2E8F0
      doc.line(startX, startY + 16, 196, startY + 16);

      doc.setFontSize(18);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('Reporte de Citas', startX, 42);
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(71, 85, 105); // #475569
      doc.text(`Estado del filtro: ${this.selectedStatus() === 'ALL' ? 'Todos' : this.statusLabels[this.selectedStatus()]}`, startX, 50);
      doc.text(`Fecha de emisión: ${new Date().toLocaleString('es-CO')}`, startX, 56);
      doc.text(`Registros encontrados: ${data.length}`, startX, 62);

      // --- Table ---
      const tableData = data.map(a => [
        this.getStudentName(a),
        a.student?.studentCode || '—',
        this.formatDate(a.availableSlot?.startTime),
        this.statusLabels[a.status] || a.status
      ]);

      autoTable(doc, {
        startY: 70,
        head: [['Estudiante', 'Código', 'Fecha y Hora', 'Estado']],
        body: tableData,
        theme: 'grid',
        headStyles: { 
          fillColor: [15, 23, 42], 
          textColor: [255, 255, 255],
          fontSize: 10,
          fontStyle: 'bold'
        },
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 65, 85]
        },
        alternateRowStyles: { 
          fillColor: [248, 250, 252] 
        },
        margin: { left: 14, right: 14 }
      });

      doc.save(`reporte_citas_${this.selectedStatus().toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`);
      this.toast.success('Reporte PDF generado con éxito');
    } catch (err) {
      this.toast.error('Error al generar el PDF');
    }
  }

  openDetail(appointment: Appointment) {
    this.selected.set(appointment);
  }

  closeDetail() {
    this.selected.set(null);
  }

  approve(id: number) {
    this.processingId.set(id);
    this.appointmentService.updateStatus(id, 'APPROVED').subscribe({
      next: () => { 
        this.toast.success('Cita aprobada con éxito');
        this.loadAppointments(); 
        this.closeDetail(); 
        this.processingId.set(null); 
      },
      error: () => {
        this.toast.error('Error al aprobar la cita');
        this.processingId.set(null);
      }
    });
  }

  reject(id: number) {
    this.processingId.set(id);
    this.appointmentService.updateStatus(id, 'REJECTED').subscribe({
      next: () => { 
        this.toast.success('Cita rechazada');
        this.loadAppointments(); 
        this.closeDetail(); 
        this.processingId.set(null); 
      },
      error: () => {
        this.toast.error('Error al rechazar la cita');
        this.processingId.set(null);
      }
    });
  }

  formatDate(date: string | undefined) {
    if (!date) return '—';
    return new Date(date).toLocaleString('es-CO', {
      dateStyle: 'medium', timeStyle: 'short'
    });
  }

  getStudentName(appointment: Appointment) {
    if (!appointment.student) return '—';
    return `${appointment.student.firstName} ${appointment.student.lastName}`;
  }
}
