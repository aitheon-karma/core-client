import { Cookie } from './../services/cookie';
import { AuthService } from './../services/auth.service';
import { Observable, TimeoutError } from 'rxjs';
import { Injectable } from '@angular/core';
import { Router, CanActivate } from '@angular/router';
import { first, map } from 'rxjs/operators';

@Injectable({providedIn: 'root'})
export class AuthGuard implements CanActivate {

    constructor(private authService: AuthService) { }

    canActivate(): Observable<boolean>|boolean {

      return this.authService.loggedIn.pipe(first(), map(result => {
        if (!result) {
         if  (location.hostname !== 'localhost') {
          location.href = '/login';
         }
         return false;
        }
        return true;
      }));

    }
}
