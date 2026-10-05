/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Tarea } from './tarea.model';
import { TareasComponent } from './tareas.component';
import { TareasService } from './tareas.service';

describe('TareasComponent', () => {
  let fixture: ComponentFixture<TareasComponent>;
  let tareasService: jasmine.SpyObj<TareasService>;

  const iniciales: Tarea[] = [
    { id: 1, titulo: 'Leer la guía de la clase 2' },
  ];

  beforeEach(async () => {
    // 1. Agregamos 'actualizar' y 'eliminar' a los métodos espiados
    tareasService = jasmine.createSpyObj('TareasService', ['listar', 'crear', 'actualizar', 'eliminar']);
    tareasService.listar.and.returnValue(of(iniciales));

    await TestBed.configureTestingModule({
      imports: [TareasComponent],
      providers: [{ provide: TareasService, useValue: tareasService }],
    }).compileComponents();

    fixture = TestBed.createComponent(TareasComponent);
    fixture.detectChanges();
  });

  it('muestra el id y el título de cada tarea', () => {
    const elemento: HTMLElement = fixture.nativeElement;

    expect(elemento.querySelector('.numero')?.textContent).toContain('1');
    expect(elemento.querySelector('.titulo')?.textContent).toContain(
      'Leer la guía de la clase 2',
    );
    expect(tareasService.listar).toHaveBeenCalled();
  });

  it('agrega la tarea creada al hacer clic en Agregar', () => {
    tareasService.crear.and.returnValue(
      of({ id: 2, titulo: 'Preparar el entorno' }),
    );

    const elemento: HTMLElement = fixture.nativeElement;
    const input = elemento.querySelector('input');
    expect(input).not.toBeNull();
    input!.value = 'Preparar el entorno';
    elemento.querySelector('button')!.click();
    fixture.detectChanges();

    expect(tareasService.crear).toHaveBeenCalledWith('Preparar el entorno');
    const titulos = Array.from(elemento.querySelectorAll('.titulo')).map(
      (nodo) => nodo.textContent,
    );
    expect(titulos).toEqual([
      'Leer la guía de la clase 2',
      'Preparar el entorno',
    ]);
  });

  // --- PRUEBAS NUEVAS DEL TALLER ---

  it('edita una tarea tras pulsar Editar, cambiar el texto y pulsar Guardar', () => {
    // 1. Preparar el espía para que devuelva la tarea actualizada
    tareasService.actualizar.and.returnValue(of({ id: 1, titulo: 'Título actualizado' }));
    const elemento: HTMLElement = fixture.nativeElement;

    // 2. Simular clic en "Editar" buscando el botón por su texto
    const botones = Array.from(elemento.querySelectorAll('button'));
    const btnEditar = botones.find(b => b.textContent?.trim() === 'Editar');
    btnEditar!.click();
    fixture.detectChanges(); // Angular actualiza la vista y muestra el input

    // 3. Escribir en el campo de texto de edición y pulsar "Guardar"
    const editInput = elemento.querySelector('li input') as HTMLInputElement;
    editInput.value = 'Título actualizado';
    
    const btnGuardar = Array.from(elemento.querySelectorAll('button')).find(b => b.textContent?.trim() === 'Guardar');
    btnGuardar!.click();
    fixture.detectChanges(); // Angular actualiza la vista y vuelve a modo lectura

    // 4. Verificar que se llamó al servicio y que el texto cambió en pantalla
    expect(tareasService.actualizar).toHaveBeenCalledWith(1, 'Título actualizado');
    expect(elemento.querySelector('.titulo')?.textContent).toContain('Título actualizado');
  });

  it('elimina una tarea de la lista tras pulsar Eliminar', () => {
    // 1. Preparar el espía: el servicio de eliminación suele devolver void
    tareasService.eliminar.and.returnValue(of(undefined));
    const elemento: HTMLElement = fixture.nativeElement;

    // 2. Simular clic en "Eliminar"
    const botones = Array.from(elemento.querySelectorAll('button'));
    const btnEliminar = botones.find(b => b.textContent?.trim() === 'Eliminar');
    btnEliminar!.click();
    fixture.detectChanges(); // Angular actualiza la vista y quita el elemento

    // 3. Verificar que se llamó al servicio y que la tarea ya no está en la pantalla
    expect(tareasService.eliminar).toHaveBeenCalledWith(1);
    expect(elemento.querySelector('li')).toBeNull(); // Ya no debe haber ningún elemento en la lista
  });
});