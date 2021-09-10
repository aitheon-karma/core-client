import { Router, NavigationEnd } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NotificationsService } from '../../services/notifications.service';
import { Notification, Task } from '../../services/notification';
import { Component, OnInit, Inject, Input, Optional, EventEmitter, OnDestroy, ViewChild } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';
import { BugReportComponent } from '../bug-report/bug-report.component';
import * as momentNs from 'moment';
const moment = momentNs;
import { AI_CORE_CLIENT_OPTIONS } from '../../core-client.tokens';
import { ICoreClientOptions } from '../../core-client.options';
import { ThemesService } from '../../services/themes.service';
import { Output } from '@angular/core';
import { TasksService } from '../../services/tasks.service';
import { TourGuideModalComponent } from '../tour-guide/tour-guide-modal/tour-guide-modal.component';
import { TourGuideService } from '../../services/tour-guide.service';
import { TourGuideStep, TourGuidPositions } from '../../services/tour-guide-step';
import { forkJoin, Subscription } from 'rxjs';
import { PaymentRequiredComponent } from '../payment-required/payment-required.component';
import { GenericModalComponent } from '../generic-modal/generic-modal.component';
import { Cookie } from '../../services/cookie';

@Component({
  selector: 'ai-header',
  templateUrl: './header.component.html',
  styleUrls: [
    './header.component.scss',
    './header.component.dark.scss'
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  constructor(
    public authService: AuthService,
    private readonly tourGuideService: TourGuideService,
    private themesService: ThemesService,
    private toastr: ToastrService,
    private router: Router,
    private notificationsService: NotificationsService,
    private tasksService: TasksService,
    @Optional()
    @Inject(AI_CORE_CLIENT_OPTIONS) private options: ICoreClientOptions,
  ) {
    this.isProd = options ? options.production : false;
    const defaultError = console.error.bind(console);
    let errors = [];
    console.error = function () {
      defaultError.apply(console, arguments);
      errors.push(Array.from(arguments));
    };
    this.errorLogs = errors;
    this.router.events.subscribe((val) => {
      if (event instanceof NavigationEnd) {
        this.errorLogs = [];
        errors = [];
      }
    });
  }
  @ViewChild('bugReport') bugReport: BugReportComponent;
  @ViewChild('paymentRequiredModal') paymentRequiredComponent: PaymentRequiredComponent;
  @ViewChild('loginDialog') loginDialog: LoginDialogComponent;
  @ViewChild('tourGuide') tourGuide: TourGuideModalComponent;
  @ViewChild('checkForTracker') checkForTrackerModal: GenericModalComponent;
  @Output() connectionsClick: EventEmitter<void> = new EventEmitter<void>();
  @Output() reviewConnection: EventEmitter<Notification> = new EventEmitter<Notification>();
  @Input() serviceName: string;
  @Input() navBarMenuData: any[] = [];

  sidebarOpened = false;
  isUsersModule = false;
  path: string;
  errorLogs: any;
  notificationsOpened = false;
  helperOpened = false;
  tasksTotal: number;
  notifications: Notification[];
  activeOrganization: any;
  allowedRoles = ['Owner', 'SuperAdmin', 'OrgAdmin'];
  orgLoading = false;
  currentUser: any;
  avatar: string;
  orgAvatar: string;
  userAvatar: string;
  generatedOrgAvatar: string;
  generatedUserAvatar: string;
  noAvatar = 'assets/img/icons/user.svg';
  avatarColors = ['#E96058', '#ED9438', '#F5BA06', '#67B231', '#1AC0C9', '#589BE9', '#6278C4', '#8C58E9', '#CA58E9', '#F39ABA'];
  isAvatarOrg: boolean;
  isAvatarUser: boolean;
  activeBgColor: string;
  isTestMode: Boolean;
  testModeDate: string;
  isProd: boolean;
  sortedTasks: any;
  isApprovedEmployee: boolean;
  isTrackerLoad: boolean;
  tasks: Task[];
  isAitheonAdmin = false;
  tourGuideElements: any[];
  tourGuideOpen = false;
  guideTourElements: any;
  selectedStepConfig: any;
  notificationsType = 'NOTIFICATIONS';
  services: any[];
  organizations: any[] = [];
  adminOrgs: any[] = [];
  showLess = true;
  platformRole: string;
  paymentRequiredSub: Subscription;
  tasksCounter: {
    assigned: number,
    unassigned: number;
  };
  notificationsCounter: number;

  tourSteps: TourGuideStep[];

  toggleSidebar() {
    this.sidebarOpened = !this.sidebarOpened;
  }

  toggleNotifications() {
    this.notificationsOpened = !this.notificationsOpened;
  }

  toggleHelper() {
    this.helperOpened = !this.helperOpened;
  }

  toggleTourGuide() {
    this.tourGuideOpen = !this.tourGuideOpen;
  }

  private get isLocalhost() {
    return window.location.hostname === 'localhost';
  }


  ngOnInit() {
    this.orgLoading = true;
    this.activeBgColor = this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
    this.isUsersModule = window.location.pathname.includes('/users') && this.isProd || (window.location.hostname === 'localhost');
    this.authService.activeOrganization.subscribe((organization: any) => {
      this.activeOrganization = organization;
      this.orgLoading = false;

      if (this.activeOrganization) {
        this.loadEmployee();
        this.authService.checkTestMode(this.activeOrganization._id).subscribe((result: { mode: boolean, testModeDate: string }) => {
          this.isTestMode = result.mode;
          this.testModeDate = moment(result.testModeDate).format('ddd MM/DD/YYYY h:mm:ss a');
          if (this.isTestMode) {
            document.getElementsByTagName('body')[0].className += ' test-mode--on';
          }
        }, (err: any) => {
          this.toastr.error(err);
        });
        if (this.activeOrganization.profile && this.activeOrganization.profile.avatarUrl) {
          this.isAvatarOrg = true;
          this.orgAvatar = this.activeOrganization.profile.avatarUrl;
        } else {
          const orgTitleArray = this.activeOrganization.name.split(' ');
          if (orgTitleArray.length > 1) {
            this.generatedOrgAvatar = orgTitleArray[0][0].toUpperCase() + orgTitleArray[orgTitleArray.length - 1][0].toUpperCase();
          } else {
            this.generatedOrgAvatar = this.activeOrganization.name[0].toUpperCase() + this.activeOrganization.name[1].toUpperCase();
          }
          this.isAvatarOrg = false;
        }

        // if (!localStorage.getItem('organization-id')) {
        //   localStorage.setItem('organization-id', organization._id);
        // }
        // console.log(window.location.hostname.indexOf(organization.domain));
        // if(window.location.hostname.indexOf(organization.domain) == -1 && window.location.hostname !== 'localhost') {
        // tslint:disable-next-line:max-line-length
        //   let orgLocation = `${ window.location.protocol }//${ organization.domain }.${ baseHost ? baseHost : window.location.hostname }` + (window.location.port ? `:${window.location.port}` : '') + window.location.pathname;
        //   window.location.href = orgLocation;
        // }
      } else {
        this.isApprovedEmployee = false;
      }
      // else {
      //   if (window.location.hostname !== baseHost && window.location.hostname !== 'localhost') {
      // tslint:disable-next-line:max-line-length
      //     let orgLocation = `${ window.location.protocol }//${ baseHost}` + (window.location.port ? `:${window.location.port}` : '') + window.location.pathname;
      //     window.location.href = orgLocation;
      //   }
      // }
    });

    this.authService.currentUser.subscribe((user: any) => {
      this.currentUser = user;
      this.generatedUserAvatar = user.profile.firstName[0].toUpperCase() + user.profile.lastName[0].toUpperCase();
      this.authService.organizations.subscribe((organizations: any) => {
        this.organizations = [...organizations];
        this.adminOrgs = [...organizations];
        this.currentUser.roles.forEach((r: any) => {
          if (!this.allowedRoles.includes(r.role)) {
            this.adminOrgs.splice(this.adminOrgs.findIndex((o: any) => o._id === r.organization['_id']), 1);
          }
        });
      });

      this.platformRole = user.platformRole;
      this.isAitheonAdmin = user.sysadmin || user.envAccess === 'ALPHA';
      if (user.profile.avatarUrl) {
        this.userAvatar = user.profile.avatarUrl;
        this.isAvatarUser = true;
      } else {
        this.isAvatarUser = false;
      }
      if (user) {
        this.tasksService.listServices().subscribe((services: any) => {
          this.services = services;
          this.loadAllNotifications();
          this.loadNotifications([], this.notificationsType);
        });
      }
    });
    this.checkPaymentStatus();
  }

  private checkPaymentStatus() {
    this.paymentRequiredSub = this.authService.paymentRequired.subscribe(required => {
      if (required) {
        this.paymentRequiredComponent.show();
      }
    });
  }

  getIsOwner(organization: any) {
    return this.adminOrgs.includes(organization);
  }

  getImageService(name: string) {
    return this.services.find(s => s._id === name);
  }

  getOrgAvatar(organization: any) {
    if (organization.profile && organization.profile.avatarUrl) {
      return organization.profile.avatarUrl;
    } else {
      return this.generateOrgAvatar(organization);
    }
  }

  generateOrgAvatar(organization: any) {
    const orgTitleArray = organization.name.split(' ');
    if (orgTitleArray.length > 1) {
      return orgTitleArray[0][0].toUpperCase() + orgTitleArray[orgTitleArray.length - 1][0].toUpperCase();
    } else {
      return organization.name[0].toUpperCase() + organization.name[1].toUpperCase();
    }
  }

  getServiceName(name: string) {
    return this.services.find(s => s._id === name) ? this.services.find(s => s._id === name).name : 'Unnamed';
  }

  loadAllNotifications() {
    forkJoin(this.tasksService.list(true, 'NOTIFICATION'), this.tasksService.list(true, 'TASK')).subscribe((result: any) => {
      const notifications = result[0].filter((task: Task) => {
        return !task.dismissed.includes(this.currentUser._id) && task.service;
      });
      const tasks = result[1].filter((task: Task) => {
        return !task.dismissed.includes(this.currentUser._id) && task.service;
      });
      this.tasksTotal = notifications.length + tasks.length;
      const assigned = tasks.filter((t: any) => t.assigned.includes(this.currentUser._id));
      const unassigned = tasks.filter((t: any) => !t.assigned.includes(this.currentUser._id));
      this.tasksCounter = {
        assigned: assigned.length,
        unassigned: unassigned.length
      };
      this.notificationsCounter = notifications.length;
    });
  }

  private setupTaskTime(task: Task) {
    if (!task._id) {
      return;
    }

    let prevTime;
    let started;

    for (const time of task.loggedTime) {
      if (time.user === this.currentUser._id) {
        if (!time.endTime) {
          started = time;
          break;
        } else {
          prevTime = time;
        }
      }
    }

    if (!prevTime) {
      prevTime = {
        totalTime: 0
      };
    }

    if (started) {
      const taskRunning = true;
      const startTime = new Date(started.startTime).getTime();
      const taskTime = Math.floor((Date.now() - startTime) / 1000) + prevTime.totalTime;
      return {taskTime, taskRunning};
    } else {
      const taskRunning = false;
      const taskTime = prevTime.totalTime;
      return {taskTime, taskRunning};
    }
  }

  loadNotifications(services: string[], type: string): void {
    this.notificationsType = type;
    type = type.slice(0, -1);
    this.tasksService.list(true, type).subscribe((tasks: Task[]) => {
      this.tasks = tasks.filter((task: Task) => {
        return !task.dismissed.includes(this.currentUser._id) && task.service;
      })
        .map((t: Task) => {
          const { taskRunning, taskTime } = this.setupTaskTime(t);
          const newTask = {
            ...t,
            taskRunning,
            taskTime
          } as any;
          return newTask;
        })
        .sort((a: any, b: any) => {
          return a.taskRunning ? -1 : 1;
        });
      this.sortedTasks = this.tasks.reduce((r, o) => {
        if (r[o.service] || (r[o.service] = {
          tasks: [],
          isOpened: this.getOpened(services, o.service),
          isTasksOpened: true,
          isUnassignedTasksOpened: false,
          unassignedTasks: [],
          service: this.getImageService(o.service),
          serviceName: this.getServiceName(o.service)
         })) {
           type === 'NOTIFICATION' || o.assigned.includes(this.currentUser._id) ? r[o.service].tasks.push(o) : r[o.service].unassignedTasks.push(o);
           }
        return r;
      }, {});
    });
  }

  onChangeType(type: string) {
    this.notificationsType = type;
    this.loadNotifications([], type);
  }

  getOpened(services: string[], service: string) {
    return services.includes(service);
  }

  goToSettings() {
    const baseHost = Cookie.get('base_host');
    window.location.href = 'https://' + baseHost + '/users/settings';
  }

  loadEmployee(): void {
    if (this.activeOrganization && this.activeOrganization.services.includes('HR')) {
      this.notificationsService.getEmployeeByUser().subscribe((employee: any) => {
        if (employee && employee.approved) {
          this.isApprovedEmployee = true;
        } else {
         this.isApprovedEmployee = false;
        }
      });
    } else {
      this.isApprovedEmployee = false;
    }
  }

  get totalCounter() {
    return ((this.tasksCounter && this.tasksCounter.assigned) || 0) + this.notificationsCounter;
  }

  markAsRead(notification: Notification): void {
    this.notificationsService.markAsRead(notification._id).subscribe(() => {
      this.notifications.splice(this.notifications.findIndex((n: Notification) => n._id === notification._id), 1);
    }, (err: any) => {
      this.toastr.error(err);
    });
  }

  showLogin() {
    this.loginDialog.show();
  }


  logout() {
    this.authService.logout().subscribe(() => {
      window.location.href = '/';
    });
  }

  goToLink(link) {
    window.location.href = window.location.origin + link;
  }

  reviewDocuments(notification: Notification): void {
    const employeeId = notification.actionData.employeeId;
    window.location.href = `/hr/review-and-approve/${ employeeId }`;
    this.markAsRead(notification);
  }

  organizationsLink(): void {
    if (this.isUsersModule) {
      this.router.navigate(['/organizations/setup']);
    } else {
      window.location.href = '/users/organizations/setup';
    }
  }

  reviewConnectionHandler(notification: Notification): void {
    this.reviewConnection.emit(notification);
    this.markAsRead(notification);
  }

  declineOrgInvite(notification: Notification): void {
    const inviteId = notification.actionData.inviteId;
    this.notificationsService.declineOrgInvite(inviteId).subscribe(() => {
      this.markAsRead(notification);
    }, (err: any) => {
      this.toastr.error(err);
    });
  }

  acceptOrgInvite(notification: Notification): void {
    const inviteId = notification.actionData.inviteId;
    this.notificationsService.acceptOrgInvite(inviteId).subscribe(() => {
      this.markAsRead(notification);
      this.authService.loadCurrentUser();
      this.authService.loadOrganizations();
    }, (err: any) => {
      this.toastr.error(err);
    });
  }

  toggleTestModeModal(mode: boolean): void {
    this.toastr.info('Processing...');
    this.authService.toggleTestMode(this.activeOrganization ? this.activeOrganization._id : '', mode).subscribe((result: any) => {
      this.toastr.success(`Test mode ${ mode ? 'enabled' : 'disabled' }. Page will refresh in a few seconds`);
      setTimeout(() => {
        if (mode) {
          if (this.activeOrganization) {
            window.location.reload();
          } else {
            window.location.href = `${ window.location.protocol }//${ result.domain }.${ window.location.host }/users`;
          }
        } else {
          const microservicePath = window.location.pathname.split('/').slice(0, 2).join('/');
          const href = `${ window.location.protocol }//${ window.location.host }${ microservicePath }`;
          window.location.href = href;
        }
      }, 2000);
    }, (err: any) => {
      this.toastr.error(err);
    });
  }

  clearData(resetToDefault: boolean): void {
    this.toastr.info('Processing...');
    this.authService.clearTestMode(this.activeOrganization._id, resetToDefault).subscribe(() => {
      this.toastr.success(`${ resetToDefault ? 'Reset to default done' : 'Data cleared' }. Page will refresh in a few seconds`);
      setTimeout(() => {
        const microservicePath = window.location.pathname.split('/').slice(0, 2).join('/');
        const href = `${ window.location.protocol }//${ window.location.host }${ microservicePath }`;
        window.location.href = href;
      }, 2000);
    }, (err: any) => {
      this.toastr.error(err);
    });
  }

  showBugReport() {
    this.bugReport.show();
  }

  switchTheme() {
    this.themesService.switchTheme();
  }

  goHome() {
    this.router.navigateByUrl('/');
  }

  goToDashboard() {
    window.location.href = '/users/dashboard';
  }

  changeAccount(organization: any) {
    if (this.activeOrganization && this.activeOrganization.services.includes('HR')) {
      this.tasksService.isClockedInToAnotherOrg(organization._id).subscribe((tracker: any) => {
        if (tracker) {
          const trackerOrg = this.organizations.find(o => o._id === tracker.organization);
          return this.checkForTrackerModal.show({ text: `You are clocked in another organization.\nDo you want to clock out from it now and change organization?`, payload: {trackerOrg, navigateOrg: organization} });
        }
        this.switchOrg(organization);
      },
        err => console.log(err));
    } else {
      this.switchOrg(organization);
    }
  }

  switchOrg(organization: any) {
    this.activeBgColor = this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
    this.authService.navigateToOrg(organization);
  }

  changeAccountToPersonal() {
    this.activeBgColor = this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
  }

  stopTrackerAndChangeOrg(result: any) {
    this.tasksService.clockout(result.trackerOrg._id).subscribe(() => {
      this.activeBgColor = this.avatarColors[Math.floor(Math.random() * this.avatarColors.length)];
      this.authService.navigateToOrg(result.navigateOrg);
    },
    err => console.log(err));
  }

  getRandomColor(index: number) {
    return this.avatarColors[index % this.avatarColors.length];
  }

  loadTracker() {
    this.isTrackerLoad = false;
    setTimeout(() => {
      this.isTrackerLoad = true;
    }, 3000);
  }

  onTasksRemove(services: string[]) {
    this.loadNotifications(services, this.notificationsType);
    this.loadAllNotifications();
  }

  selectElement(selectedTour: TourGuideStep) {


    this.tourGuide.show(this.tourSteps, selectedTour, this.tourPath);
  }

  getElements() {
    const elements = document.querySelectorAll('[joyrideStep]');
    const elementValues  = Array.from(elements).map((el: any) => el.attributes.joyridestep.nodeValue) as string[];

    this.tourSteps = [];
    this.tourGuideService.listByReferences(elementValues, this.tourPath).subscribe(tourSteps => {
     // tourSteps.sort((a, b) => a.step - b.step);
     this.tourSteps = tourSteps;
     const toCreateReference = elementValues.filter(e => !(this.tourSteps .map(t => t.reference)).includes(e));
     toCreateReference.map(ref => {
       const step = new TourGuideStep();
       step.reference = ref;
       step.stepPosition = TourGuidPositions.BOTTOM;
       return step;
     }).forEach(ref => this.tourSteps.push(ref));
    });

  }

  get tourPath() {
    const url = this.isLocalhost ? '/localhost' + this.router.url : '/' + location.pathname.split('/')[1] +  this.router.url;
    return url;
  }

  selectStepConfig(event: Event, stepConfig: TourGuideStep) {
    event.preventDefault();
    event.stopPropagation();
    if (this.selectedStepConfig) {
      const element = document.querySelector(`[joyrideStep=${this.selectedStepConfig.reference}]`);
      element.classList.remove('step-outlined');
    }
    this.selectedStepConfig = stepConfig;
    const element = document.querySelector(`[joyrideStep=${stepConfig.reference}]`);
    element.classList.add('step-outlined');
  }

  onStepHover(stepConfig: TourGuideStep) {
    const element = document.querySelector(`[joyrideStep=${stepConfig.reference}]`);
    element.classList.add('step-outlined');
  }

  onStepHoverEnd(stepConfig: TourGuideStep) {
    if (stepConfig === this.selectedStepConfig) { return; }
    const element = document.querySelector(`[joyrideStep=${stepConfig.reference}]`);
    element.classList.remove('step-outlined');
  }

  onCloseStepConfig() {
    if (this.selectedStepConfig) {
      const element = document.querySelector(`[joyrideStep=${this.selectedStepConfig.reference}]`);
      element.classList.remove('step-outlined');
    }
  }

  navigateTo(organization: any, event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    if (this.isProd) {
    // tslint:disable-next-line:max-line-length
      const link = `${ window.location.protocol }//${ organization.domain }.${ this.authService.baseHost() }:${ window.location.port }/users/organizations/organization-detail`;
      window.location.href = link;
    } else {
      this.router.navigate(['/organizations/organization-detail']);
    }
  }

  onShowMore() {
    this.showLess = false;
    event.stopPropagation();
  }

  ngOnDestroy() {
    if (this.paymentRequiredSub) {
      this.paymentRequiredSub.unsubscribe();
    }
  }
}
