import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AvailableSlot {
  id?: number;
  startTime: string;
  endTime: string;
  availableSpots: number;
  bookedSpots?: number;
  active?: boolean;
  program?: { id: number; name?: string };
}

@Injectable({ providedIn: 'root' })
export class AvailableSlotService {

  private url = `${environment.apiUrl}/available-slots`;

  constructor(private http: HttpClient) {}

  getAll() {
    return this.http.get<AvailableSlot[]>(this.url);
  }

  create(slot: AvailableSlot) {
    return this.http.post<AvailableSlot>(this.url, slot);
  }

  update(id: number, slot: AvailableSlot) {
    return this.http.put<AvailableSlot>(`${this.url}/${id}`, slot);
  }

  delete(id: number) {
    return this.http.delete(`${this.url}/${id}`);
  }
}