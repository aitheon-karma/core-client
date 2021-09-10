import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'slug' })
export class SlugPipe implements PipeTransform {
  public transform(input: string): string {
    if (!input) {
      return '';
    }
    return input.toString().toLowerCase()
      .replace(/\s+/g, '-')           // Replace spaces with -
      .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
      .replace(/\-\-+/g, '-')         // Replace multiple - with single -
      .replace(/^-+/, '')             // Trim - from start of text
      .replace(/-+$/, '');            // Trim - from end of text
  }
}
