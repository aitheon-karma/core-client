import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'serviceName' })
export class ServiceNamePipe implements PipeTransform {
  constructor() { }
  public transform(name: string): string {
    let result = '';
    switch (name) {
      case 'HR':
        result = 'Human Resources';
        break;
      case 'USER':
        result = 'Main';
        break;
      case 'TREASURY':
        result = 'Treasury';
        break;
    }
    return result;
  }
}
