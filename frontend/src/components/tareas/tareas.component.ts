import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { Tarea } from './tarea.model';
import { TareasService } from './tareas.service';

@Component({
  selector: 'app-tareas',
  standalone: true,
  templateUrl: './tareas.component.html',
  changeDetection: ChangeDetectionStrategy.Eager,
  styleUrl: './tareas.component.css',
})
export class TareasComponent implements OnInit {
  private readonly tareasService = inject(TareasService);
  tareas = signal<Tarea[]>([]);
  tareaEnEdicionId = signal<number | null>(null);

  ngOnInit(): void {
    this.tareasService.listar().subscribe((tareas) => {
      this.tareas.set(tareas);
    });
  }
  crear(titulo: string) {
    this.tareasService.crear(titulo).subscribe((tarea) => {
      this.tareas.update((tareas) => [...tareas, tarea]);
    });
  }
iniciarEdicion(id: number) {
    this.tareaEnEdicionId.set(id);
  }

  guardar(id: number, nuevoTitulo: string) {
    this.tareasService.actualizar(id, nuevoTitulo).subscribe({
      next: (tareaActualizada) => {
        // La lista solo se actualiza si el backend responde con éxito
        this.tareas.update(tareas => 
          tareas.map(t => t.id === id ? tareaActualizada : t)
        );
        this.tareaEnEdicionId.set(null); // Cierra el modo edición
      },
      error: (err) => {
        console.error('Error al actualizar:', err);
        alert('Error: La tarea no existe o no se pudo actualizar.');
        this.tareaEnEdicionId.set(null);
      }
    });
  }

  eliminar(id: number) {
    this.tareasService.eliminar(id).subscribe({
      next: () => {
        // La tarea desaparece de la lista si el backend responde con éxito[cite: 9]
        this.tareas.update(tareas => tareas.filter(t => t.id !== id));
      },
      error: (err) => {
        console.error('Error al eliminar:', err);
        alert('Error: La tarea no existe o ya fue eliminada.');
      }
    });
  }
}
