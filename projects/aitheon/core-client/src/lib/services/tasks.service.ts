import { RequestOptions, Http, Request, Response, Headers } from '@angular/http';
import { Observable, throwError, of } from 'rxjs';
import { Injectable, Optional, Inject } from '@angular/core';
import { Cookie } from './cookie';
import { map, catchError } from 'rxjs/operators';
import { AI_CORE_CLIENT_OPTIONS } from '../core-client.tokens';
import { ICoreClientOptions } from '../core-client.options';
import { Task } from './notification';


@Injectable()
export class TasksService {

  baseApi = '';

  constructor(
    private http: Http,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    if (options) {
      this.baseApi = options.baseApi || '';
    }
  }

  list(isNotify: boolean, type: string, algorithmic: boolean = true): Observable<Task[]> {
    return this.makeRequest('GET', `/orchestrator/api/tasks?isNotify=${isNotify}&type=${type}&algorithmic=${algorithmic}`);
  }

  markAsRead(tasks: string[]): Observable<any> {
    return this.makeRequest('POST', `/orchestrator/api/tasks/notifications/read`, {tasks});
  }

  assignToMe(task: Task): Observable<any> {
    return this.makeRequest('PUT', `/orchestrator/api/tasks/assign/me`, task);
  }

  markAsDone(tasks: string[]): Observable<any> {
    return this.makeRequest('POST', `/orchestrator/api/tasks/notifications/done`, {tasks});
  }


  createTask(task: Task): Observable<Task> {
    return this.makeRequest('POST', `/orchestrator/api/tasks`, task);
  }
  createCustomTask(task: Task): Observable<Task> {
    return this.makeRequest('POST', `/orchestrator/api/tasks/customTask`, task);
  }

  listDevices(): Observable<any> {
    return this.makeRequest('POST', `/device-manager/api/devices/search`, {type: 'AOS_DEVICE'}, false);
  }

  declineOrgInvite(inviteId: string): Observable<any> {
    return this.makeRequest('PUT', `/users/api/users/invites/${ inviteId }/decline`, {});
  }

  acceptOrgInvite(inviteId: string): Observable<any> {
    return this.makeRequest('PUT', `/users/api/users/invites/${ inviteId }/accept`, {});
  }

  listServices(): Observable<any> {
    return this.makeRequest('GET', `/users/api/services`);
  }

  listOrgUsers(orgId: string): Observable<any[]> {
    return this.makeRequest('GET', `/users/api/organizations/${orgId}/members`);
  }

  getSystem(systemId: any = ''): Observable<any> {
    return this.makeRequest('GET', `/device-manager/api/systems?parent=${systemId}`);
  }

  getInfrastructure() {
    return this.makeRequest('GET', `/smart-infrastructure/api/infrastructure`);
  }

  getSystemType() {
    return this.makeRequest('GET', `/device-manager/api/system-type`);
  }

  start(taskId: string) {
    return this.makeRequest('POST', `/orchestrator/api/tasks/${taskId}/start`, {});
  }

  stop(taskId: string) {
    return this.makeRequest('POST', `/orchestrator/api/tasks/${taskId}/stop`, {});
  }

  isClockedIn() {
    return this.makeRequest('GET', `/hr/api/tracker/time`);
  }

  isClockedInToAnotherOrg(organizationId: string) {
    return this.makeRequest('GET', `/hr/api/tracker/clocked/${organizationId}`);
  }

  isEmployee() {
    return this.makeRequest('GET', `/hr/api/employees/me/info`);
  }

  clockout(organizationId: string) {
    return this.makeRequest('POST', `/hr/api/tracker/stop?organization=${organizationId}`);
  }

  clockin() {
    return this.makeRequest('POST', `/hr/api/tracker/start`);
  }

  getStartedTask(organizationId: string) {
    return this.makeRequest('GET', `/orchestrator/api/tasks/${organizationId}/task`);
  }

  updateTask(task: Task, taskId: string): Observable<Task> {
    return this.makeRequest('PUT', `/orchestrator/api/tasks/${taskId}`, task);
  }

  removeTask(taskId: string) {
    return this.makeRequest('DELETE', `/orchestrator/api/tasks/${taskId}`);
  }

  listProjectsByOrg(orgId: string) {
    return this.makeRequest('GET', `/project-manager/api/projects/${orgId}/organization`);
  }

  listMembersByProject(projectId: string) {
    return this.makeRequest('GET', `/project-manager/api/project-member/project/${projectId}`);
  }

  getSettingsByProject(projectId: string) {
    return this.makeRequest('GET', `/project-manager/api/projects/settings/${projectId}`);
  }

  getBoardByProject(projectId: string) {
    return this.makeRequest('GET', `/project-manager/api/board/project/${projectId}`);
  }



  private makeRequest(method: string, url: string, body: any = null, logout = true): Observable<any> {
    url = this.baseApi + url;
    const orgId = Cookie.get('organization-id');
    const headers = new Headers();
    if (orgId) {
      headers.append('organization-id', orgId);
    }
    const options = new RequestOptions({
      method: method,
      url: url,
      headers: headers
    });

    if (body) {
      options.body = JSON.stringify(body);
    }

    options.headers.set('Content-Type', 'application/json');
    const fl_token = Cookie.get('fl_token');
    if (fl_token) {
      options.headers.set('Authorization', `JWT ${ fl_token }`);
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
      catchError(logout ? this.handleError : (() => of(false)) ));

    return request;
  }

  /**
  * Handle HTTP error
  */
  private handleError(error: any) {
    // We'd also dig deeper into the error to get a better message
    let errMsg = error.status ? `${ error.status } - ${ error.statusText }` : 'Server error';
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
    return throwError(errMsg);
  }

}
