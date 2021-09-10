import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Injectable, Optional, Inject } from '@angular/core';
import { Cookie } from './cookie';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _services: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private _organizations: ReplaySubject<Array<any>> = new ReplaySubject(1);
  private _currentUser: ReplaySubject<any> = new ReplaySubject<any>(1);
  private _token: ReplaySubject<String> = new ReplaySubject(1);
  private _loggedIn: ReplaySubject<boolean> = new ReplaySubject(1);
  private _isServiceAdmin: ReplaySubject<boolean> = new ReplaySubject(1);
  private _activeOrganization: ReplaySubject<any> = new ReplaySubject(1);
  private _paymentRequired: ReplaySubject<any> = new ReplaySubject(1);


  /**
   * * Available Services for logged in user
   */
  services: Observable<Array<any>> = this._services.asObservable();

  /**
   * Current organization or null if it's personal
   */
  activeOrganization: Observable<any> = this._activeOrganization.asObservable();

  /**
   * Current organizations for logged in user
   */
  organizations: Observable<Array<any>> = this._organizations.asObservable();

  /**
   * Current user
   *
   */
  currentUser: Observable<any> = this._currentUser.asObservable();

  /**
   * Token for current user
   */
  token: Observable<any> = this._token.asObservable();

  /**
   * Current logged in status
   */
  loggedIn: Observable<boolean> = this._loggedIn.asObservable();

  /**
   * is service admin
   */
  isServiceAdmin: Observable<boolean> = this._isServiceAdmin.asObservable();

  paymentRequired: Observable<boolean> = this._paymentRequired.asObservable();

  baseApi = '';
  production = false;

  /**
   * Base host of app
   */
  public baseHost(): string {
    return Cookie.get('base_host');
  }

  private get cookieOrgId() {
    return Cookie.get('organization-id');
  }

  private get isLocalhost() {
    return window.location.hostname === 'localhost';
  }

  private get ignoreActiveOrgChecker() {
    const actPath = this.options.production ? location.pathname : `/users${location.pathname}`;
    const paths = [
      '/users/settings',
      '/users/settings/payments',
      '/users/settings/referral',
      '/users/settings/services',
      '/users/settings/notifications',
      '/users/settings/security',
      '/users/settings/change-password',
    ];
    return paths.includes(actPath);
  }

  constructor(
    private http: Http,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    if (options) {
      this.baseApi = options.baseApi || '';
      this.production = options.production;
    }
    this.init();
  }

  init() {
    console.log('authService init');
    const fl_token = Cookie.get('fl_token');
    if (fl_token) {
      this._token.next(fl_token);
      this._loggedIn.next(true);

      this.loadCurrentUser();
      this.loadOrganizations();
      if (!this.ignoreActiveOrgChecker) {
        this.initActiveOrganization();
      } else {
        console.log('Ignore Active Org Checker!');
      }
      this.loadServices();
      let once = this.activeOrganization.subscribe((org: any) => {
        // console.log('ONCE', once);
        if (once) {
          once.unsubscribe();
          once = undefined;
          org ? this.navigateToOrg(org) : this.navigateToPersonal();
        } else {
          if (!this.isLocalhost) {
            this.navigateToPersonal();
          }
        }
      });


    } else {
      this._loggedIn.next(false);
    }

    this.currentUser.subscribe((user: any) => {
      const domain = window.location.hostname.split('.')[0];
      const orgRole = user.roles.find((r: any) => r.organization.domain === domain);
      if (!orgRole) {
        return;
      }
      const service = orgRole.services.find((s: any) => s.service === 'HR');
      if (!service) {
        return;
      }
      let isServiceAdmin = service.role === 'ServiceAdmin';
      const fullRoles = ['Owner', 'OrgAdmin', 'SuperAdmin'];

      if (fullRoles.indexOf(orgRole.role) > -1) {
        isServiceAdmin = true;
      }
      this._isServiceAdmin.next(isServiceAdmin);
    });
  }


  login(email: string, password: string): Observable<string> {
    const url = '/auth/api/login';
    const body = {
      email: email,
      password: password
    };
    const request = this.makeRequest('POST', url, body);
    request.subscribe((r: any) => this.handleLogin(r));
    return request;
  }

  logout(): Observable<any> {
    return new Observable<any>((observer: any) => {
      // clear token remove user from local storage to log user out
      this.removeAuthCookie();
      this._loggedIn.next(false);
      // this._currentUser.next(null);
      // this._token.next(null);

      observer.next();
    });
  }

  loadCurrentUser(): Observable<any> {
    const request = this.makeRequest('POST', '/auth/api/access-token', null, true);
    request.subscribe((response: any) => {
      localStorage.setItem('current_user', JSON.stringify(response.user));
      this._currentUser.next(response.user);
    });
    return request;
  }

  refreshAvatar(res: any) {
    const user = JSON.parse(localStorage.getItem('current_user'));
    user.updatedAt = res.updatedAt;
    user.profile.avatarUrl = res.profile.avatarUrl;
    localStorage.setItem('current_user', JSON.stringify(user));
    this._currentUser.next(user);
  }

  loadOrganizations(): Observable<any> {
    const request = this.makeRequest('GET', '/users/api/me/organizations');
    request.subscribe((response: any) => {
      this._organizations.next(response);
    });
    return request;
  }

  toggleTestMode(organizationId: String, mode: boolean): Observable<any> {
    return this.makeRequest('POST', `/users/api/organizations/test-mode?organizationId=${organizationId}`, { mode: mode });
  }

  clearTestMode(organizationId: String, resetToDefault: boolean): Observable<any> {
    return this.makeRequest('POST', `/users/api/organizations/${organizationId}/test-mode/clear`, { resetToDefault: resetToDefault });
  }

  checkTestMode(organizationId: String): Observable<any> {
    return this.makeRequest('GET', `/users/api/organizations/${organizationId}/test-mode`);
  }

  updateDockService(dockServices: Array<string>): Observable<any> {
    return this.makeRequest('POST', `/users/api/users/me/dockservices/`, { dockServices: dockServices });
  }

  loadServices(): void {
    this.activeOrganization.subscribe((organization: any) => {
      this.makeRequest('GET', `/users/api/me/services${organization ? '?organizationId=' + organization._id : ''}`)
        .subscribe((response: any) => {
          this._services.next(response);
        });
    });
  }

  requestSecondFactor(forEmail?: string): Observable<{ status: string }> {
    let url = '/auth/api/second-factor';
    if (forEmail) {
      url += ('?forEmail=' + forEmail);
    }
    const request = this.makeRequest('GET', url);
    return request;
  }

  initActiveOrganization(): void {
    this.organizations.subscribe((organizations: Array<any>) => {

      if (this.isLocalhost) {
        const localOrg = organizations.find((o: any) => o._id === this.cookieOrgId);
        localOrg ? this._activeOrganization.next(localOrg) : this._activeOrganization.next(null);
        this.saveActiveOrganization(localOrg);
        return;
      }

      const orgDomain = window.location.hostname.replace(`.${this.baseHost()}`, '');
      const lastDomain = window.location.host.split('.')[0];
      let org = organizations.find((o: any) => o.domain === orgDomain || o.domain === lastDomain);
      // this mean user requery exactly org from domain
      if (org && this.cookieOrgId !== org._id) {
        this.saveActiveOrganization(org);
      }
      // find org by cookie id
      if (!org && this.cookieOrgId) {
        org = organizations.find((o: any) => o._id === this.cookieOrgId);
      }

      if (!org) {
        // cleanup cookie id if user lose org access
        this.clearActiveOrganization();

        if (!this.isLocalhost) {
          this.navigateToPersonal();
        }

        return;
      }
      this._activeOrganization.next(org);
    });

  }

  navigateToOrg(organization: any) {
    // console.log('organization:', organization);
    const domains = window.location.host.split('.');
    // prevent redirect if it's same organization
    if (domains[0] === organization.domain) {
      return;
    }

    const baseHost = this.baseHost();
    // tslint:disable-next-line:max-line-length
    let orgLocation = `${window.location.protocol}//${organization.domain}.${baseHost ? baseHost : window.location.hostname}` + (window.location.port ? `:${window.location.port}` : '');
    this.saveActiveOrganization(organization);
    // append microservice path
    const microservicePath = window.location.pathname.split('/').slice(0, 2).join('/');
    orgLocation += microservicePath;

    if (this.isLocalhost) {
      // local no redirect
      return this.initActiveOrganization();
    }

    // prevent same page redirect
    if (window.location.href !== orgLocation) {
      window.location.href = orgLocation;
    }
  }

  navigateToPersonal(): void {
    const baseHost = this.baseHost();
    // tslint:disable-next-line:max-line-length
    const personalLocation = `${window.location.protocol}//${baseHost ? baseHost : window.location.hostname}` + (window.location.port ? `:${window.location.port}` : '') + '/users/dashboard';
    // + window.location.pathname;
    // if (this.isLocalhost && window.location.href !== personalLocation) {
    this.clearActiveOrganization();
    if (this.isLocalhost) {
      return this.initActiveOrganization();
    }

    // tslint:disable-next-line: max-line-length
    const personalTestUrl = `${window.location.protocol}//${baseHost ? baseHost : window.location.hostname}` + (window.location.port ? `:${window.location.port}` : '');

    // prevent same page redirect
    if ((!window.location.href.startsWith(personalTestUrl)) && !this.isLocalhost) {
      window.location.href = personalLocation;
    }
  }

  clearActiveOrganization() {
    Cookie.delete('organization-id', '/', this.baseHost());
    this._activeOrganization.next(null);
  }

  saveActiveOrganization(organization: { _id: string }) {
    if (!organization) {
      this.clearActiveOrganization();
    } else {
      const now = new Date();
      Cookie.set('organization-id', organization._id, new Date(now.setFullYear(now.getFullYear() + 10)), '/', this.baseHost());
    }
  }

  private removeAuthCookie() {
    localStorage.removeItem('current_user');
    Cookie.delete('fl_token', '/', this.baseHost());
    Cookie.delete('base_host', '/', this.baseHost());
    Cookie.delete('organization-id', '/', this.baseHost());
    const domainSplit = window.location.host.split('.');
    // clear prev cookie fix for upper subdomains
    if (domainSplit.length > 2) {
      domainSplit.splice(0, 1);
      Cookie.delete('fl_token', '/', `.${domainSplit.join('.')}`);
      Cookie.delete('base_host', '/', `.${domainSplit.join('.')}`);
      Cookie.delete('organization-id', '/', `.${domainSplit.join('.')}`);
    }
  }

  private makeRequest(method: string, url: string, body: any = null, serviceHeader: boolean = false): Observable<any> {

    url = this.baseApi + url;
    const options = new RequestOptions({
      method: method,
      url: url,
      headers: new Headers()
    });

    if (body) {
      options.body = JSON.stringify(body);
    }

    options.headers.set('Content-Type', 'application/json');
    const fl_token = Cookie.get('fl_token');
    if (fl_token) {
      options.headers.set('Authorization', `JWT ${fl_token}`);
    }
    if (this.cookieOrgId) {
      options.headers.append('organization-id', this.cookieOrgId);
    }

    if (serviceHeader && this.options.service) {
      options.headers.append('X-Service', this.options.service);
    }

    const request = this.http
      .request(new Request(options))
      .pipe(map((res: Response) => {
        // because 204 does not contain body
        if (res.status >= 201 && res.status <= 226) {
          return;
        } {
          return res.json();
        }
      }),
        catchError((err: any) => this.handleError(err)));

    return request;
  }

  private handleLogin(response: any) {
    // login successful if there's a jwt token in the response
    if (response) {
      const current_user = response;
      const fl_token = Cookie.get('fl_token');

      localStorage.setItem('current_user', JSON.stringify(current_user));

      this._currentUser.next(current_user);
      this._token.next(fl_token);
      this._loggedIn.next(true);
      // return true to indicate successful login
      return true;
    } else {
      // return false to indicate failed login
      return false;
    }
  }

  /**
  * Handle HTTP error
  */
  private handleError(error: any) {
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    if (error._body) {
      try {
        const json = error.json();
        if (json.message) {
          errMsg = json.message;
        } else {
          errMsg = json;
        }
      } catch (error) {
      }
    }
    console.error(errMsg); // log to console instead
    if (error.status === 401 || error.status === 403) {
      localStorage.removeItem('current_user');
      let baseHost = this.baseHost() || window.location.hostname;
      Cookie.delete('fl_token', '/', baseHost);
      if (!baseHost) {
        const domains = window.location.hostname.split('.');
        // assume we have 2 level domain always
        if (domains.length >= 2) {
          baseHost = `${domains[domains.length - 2]}.${domains[domains.length - 1]}`;
        }
      }
      if (this.production) {
        const location = `${window.location.protocol}//${baseHost}:${window.location.port}/login`;
        window.location.href = location;
      } else {
        console.warn('User not logged in');
      }
    } else if (error.status === 402) {
      this._paymentRequired.next(true);
    }
    return throwError(errMsg);
  }

}
