import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class WidgetService {


  constructor(
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) { 
    if(this.options.production) {
      this.init();
    }
  }

  widgets = [{
              path: '/messages/assets/widget.js',
              appendTo: 'head' ,
              ignoreAt: ['/messages']
            },
            {
              path: '/hr/widget.js',
              appendTo: '#elementID_IN_header',
              ignoreAt: ['/orchestrator-as-example']
            }];

  import(widgets: Array<any>) {
    let currentService = window.location.pathname;
    for(let item of widgets) {
      let ignore = false;
      for (let i of item.ignoreAt) {
        if (currentService.indexOf(i) !== -1) {
          ignore = true;
        }
      }
      if (!ignore) {
        let s = document.createElement('script'); 
        s.type = 'text/javascript'; 
        s.async = true; 
        s.src = item.path;  
        let el;
        if (item.appendTo.indexOf('#') !== -1) {
          el = document.getElementById(item.appendTo);
        } else if (item.appendTo('.') !== -1) {
          el = document.getElementsByClassName(item.appendTo)[0];
        } else {
          el = document.getElementsByTagName(item.appendTo)[0];
        }
        if (el) {
          el.appendChild(s);
        }
      }
    }
  }

  init() {
    this.import(this.widgets);
  }

}
