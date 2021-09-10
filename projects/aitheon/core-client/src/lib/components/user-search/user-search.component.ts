import { Component, OnInit, Optional, Inject } from '@angular/core';
import { Observable, of, concat, Subject, forkJoin } from 'rxjs';
import { distinctUntilChanged, debounceTime, switchMap, tap, catchError, filter, map } from 'rxjs/operators';
// import { UsersService } from '@aitheon/ai-core-client';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ICoreClientOptions } from '../../core-client.options';
import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';
// import { Cookie } from '../../services/cookie';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RestService } from '../../services/rest.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'ai-user-search',
  templateUrl: './user-search.component.html',
  styleUrls: [
    './user-search.component.scss',
    './user-search.component.dark.scss'
  ]
})
export class UserSearchComponent implements OnInit {

  loading = false;
  isUsersModule: boolean;
  selected: any = null;
  searchResults$: Observable<any>;
  searchInput$ = new Subject<string>();
  usersSearchUrl: string;
  orgSearchUrl: string;
  defaultAvatar: string;

  constructor(
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
    private router: Router,
    private toastr: ToastrService,
    private restService: RestService,
    private authService: AuthService
  ) {
    this.isUsersModule = window.location.pathname.includes('/users') && options.production || (window.location.hostname === 'localhost');
    // this.usersSearchUrl = this.isUsersModule ? '/api/users/profile/search' : '/users/api/users/profile/search';
    this.usersSearchUrl = this.isUsersModule ? options.baseApi + '/users' + '/api/users/profile/search' : '/users/api/users/profile/search';
    this.orgSearchUrl = this.isUsersModule ? options.baseApi + '/users' + '/api/organizations/search' : '/users/api/organizations/search';
    this.defaultAvatar = this.isUsersModule ? '/assets/img/nophoto.png' : '/users/assets/img/nophoto.png';
  }

  groupByFn = (item) => item.searchType;
  groupValueFn = (key: string, children: any[]) => ({ name: key });

  resultSelected(result: any) {
    switch (result.searchType) {
      case 'Users':
        const userProfileUrl = `/profile/personal/${ result._id }`;
        this.authService.clearActiveOrganization();
        this.authService.initActiveOrganization();
        if (this.isUsersModule) {
          this.router.navigateByUrl(userProfileUrl);
        } else {
          window.location.href = '/users' + userProfileUrl;
        }
        break;
      case 'Organizations':
        if (this.isUsersModule) {
          this.router.navigateByUrl('/organization-detail');
        } else {
          const link = `${ window.location.protocol }//${ result.domain }.${ this.authService.baseHost() }:${ window.location.port }/users/organization-detail`;
          window.location.href = link;
        }
        break;
    }
  }
  ngOnInit() {
    // const fl_token = Cookie.get('fl_token');
    this.searchResults$ = concat(
      of([]), // default items
      this.searchInput$.pipe(
        filter(t => t && t.length > 2),
        debounceTime(200),
        distinctUntilChanged(),
        tap(() => this.loading = true),
        switchMap(term => {
          return this.search(term).pipe(
            catchError((err: any) => {
              this.toastr.error(err);
              return of([]);
            }), // empty list on error
            map((results: any) => {
              return this.searchMapping(results);
            }),
            tap(() => this.loading = false));
        })
      ));
  }

  searchMapping(response: Array<Array<any>>) {
    let results = [];
    if (response.length > 0) {
      results = results.concat(response[0].map((user: any) => {
        user.searchType = 'Users';
        return user;
      }));
    }
    if (response.length > 1) {
      results = results.concat(response[1].map((org: any) => {
        org.searchType = 'Organizations';
        return org;
      }));
    }
    return results;
  }

  search(term: string): Observable<any> {
    const users = this.restService.fetch(this.usersSearchUrl, { search: term }, true);
    const organizations = this.restService.fetch(this.orgSearchUrl, { term: term }, true);
    return forkJoin([users, organizations]);
  }

}
