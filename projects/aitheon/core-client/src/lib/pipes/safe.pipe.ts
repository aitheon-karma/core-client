import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl, SafeHtml, SafeStyle, SafeScript, SafeUrl } from '@angular/platform-browser';

@Pipe({ name: 'safe' })
export class SafePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) { }


  public transform(value: string, type: string = 'url'): SafeHtml | SafeStyle | SafeScript | SafeUrl | SafeResourceUrl {
    switch (type) {
      case 'html':
        return this.sanitizer.bypassSecurityTrustHtml(value);
      case 'style':
        return this.sanitizer.bypassSecurityTrustStyle(value);
      case 'script':
        return this.sanitizer.bypassSecurityTrustScript(value);
      case 'resourceUrl':
        return this.sanitizer.bypassSecurityTrustResourceUrl(value);
      case 'url':
      default:
        return this.sanitizer.bypassSecurityTrustUrl(value);
    }
  }
}
