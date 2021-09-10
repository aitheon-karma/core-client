import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';
import { BehaviorSubject } from 'rxjs';
import { Cookie } from './cookie';

@Injectable({
  providedIn: 'root'
})
export class ThemesService {

  themeChanged: BehaviorSubject<{ name: string }>
    = new BehaviorSubject<{ name: string }>({ name: Cookie.get('current-theme') || 'dark'});

  constructor(
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    const currentTheme = Cookie.get('current-theme') || 'dark';
    this.setTheme(currentTheme);
  }

  setTheme(theme: string) {
    this.addClass(document.body, theme);
    this.saveTheme(theme);
    const link = document.getElementById('css-theme');
    const themeUrl = `styles/themes/${ theme }/${ theme }.css`;
    if (link) {
      link['href'] = themeUrl;
    } else {
      const node = document.createElement('link');
      node.href = themeUrl; // insert url in between quotes
      node.rel = 'stylesheet';
      node.id = 'css-theme';
      document.getElementsByTagName('head')[0].appendChild(node);
    }
  }

  baseHost(): string {
    return Cookie.get('base_host');
  }

  switchTheme() {
    const currentTheme = Cookie.get('current-theme') || 'dark';
    let theme = 'dark';
    if (currentTheme === 'dark') {
      theme = 'default';
    }
    this.removeClass(document.body, currentTheme);
    this.setTheme(theme);
    this.themeChanged.next({ name: theme });
  }

  private saveTheme(theme: string) {
    const now = new Date();
    Cookie.set('current-theme', theme, new Date(now.setFullYear(now.getFullYear() + 10)), '/', this.baseHost());
  }

  private hasClass(ele: any, cls: any) {
    return !!ele.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));
  }

  private addClass(ele: any, cls: any) {
    if (!this.hasClass(ele, cls)) {
      ele.className += ' ' + cls;
    }
  }

  private  removeClass(ele: any, cls: any) {
    if (this.hasClass(ele, cls)) {
      const reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
      ele.className = ele.className.replace(reg, ' ');
    }
  }


}
