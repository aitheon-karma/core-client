import { AiWebClientModule } from '@aitheon/ai-web-client-angular';
import { NgModule, ModuleWithProviders, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { SweetAlert2Module } from '@sweetalert2/ngx-sweetalert2';
import { ModalModule, BsModalService } from 'ngx-bootstrap/modal';
import { ToastrModule } from 'ngx-toastr';
import { ICoreClientOptions } from './core-client.options';
import { AuthService } from './services/auth.service';
import { RestService } from './services/rest.service';
import { NotificationsService } from './services/notifications.service';
import { TasksService } from './services/tasks.service';
import { AI_CORE_CLIENT_OPTIONS } from './core-client.tokens';
import { LoadingComponent } from './components/loading/loading.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { HeaderComponent } from './components/header/header.component';
import { LoginDialogComponent } from './components/login-dialog/login-dialog.component';
import { AuthGuard } from './guards/auth.guard';
import { SafePipe } from './pipes/safe.pipe';
import { BugReportComponent } from './components/bug-report/bug-report.component';
import { UserSearchComponent } from './components/user-search/user-search.component';
import { ThemesService } from './services/themes.service';
import { AutofocusDirective } from './directives/autofocus.directive';
import { ClickOutsideDirective } from './directives/click-outside.directive';
import { DriveUploaderDirective } from './components/drive-uploader/drive-uploader.directive';
import { DriveUploaderComponent } from './components/drive-uploader/drive-uploader.component';
import { FileUploadModule } from 'ng2-file-upload';
import { DriveUploaderService } from './components/drive-uploader/drive-uploader.service';
import { DriveDocumentsService } from './services/drive-documents.service';
import { NgSelectModule } from '@ng-select/ng-select';
import { SecondFactorModalComponent } from './components/second-factor-modal/second-factor-modal.component';
import { MomentFormatPipe } from './pipes/moment-format.pipe';
import { TokenInterceptor } from './services/token.interceptor';
import { SlugPipe } from './pipes/slug.pipe';
import { NpnSliderModule } from 'npn-slider';
import { SelectDropDownModule } from 'ngx-select-dropdown';
import { CurrencyMaskModule } from 'ng2-currency-mask';
import { DockComponent } from './components/dock/dock.component';
import { Ng5SliderModule } from 'ng5-slider';
import { WidgetService } from './services/widget.service';
import { NotificationsComponent } from './components/notifications/notifications.component';
import { NotifyDatePipe } from './pipes/notify-date.pipe';
import { ServiceNamePipe } from './pipes/service-name.pipe';
import { InputComponent } from './components/input/input.component';
import { BsDatepickerModule, TimepickerModule, TooltipModule } from 'ngx-bootstrap';
import { TourGuideModalComponent } from './components/tour-guide/tour-guide-modal/tour-guide-modal.component';
// import { TaskDialogComponent } from './components/task-dialog/task-dialog.component';
import { HelperComponent } from './components/helper/helper.component';
import { BugReportFormComponent } from './components/bug-report-form/bug-report-form.component';
import { FeatureRequestFormComponent } from './components/feature-request-form/feature-request-form.component';
import { TourGuideService } from './services/tour-guide.service';
import { HelperService } from './services/helper.service';
import { IntercomModule } from 'ng-intercom';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { AutosizeModule } from 'ngx-autosize';
import { NgxMaskModule, IConfig } from 'ngx-mask';
import { ImageDrawingModule } from 'ngx-image-drawing';
import { ImageDrawingComponent } from './components/image-drawing/image-drawing.component';
import { PaymentRequiredComponent } from './components/payment-required/payment-required.component';
import { CreateSectionFormComponent } from './components/sidebar/create-section-form/create-section-form.component';
import { ServiceGroupsService } from './services/service-groups.service';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { TimerComponent } from './components/timer/timer.component';
import { GenericModalComponent } from './components/generic-modal/generic-modal.component';
import { NoteComponent } from './components/note/note.component';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { SpeechRecognitionComponent } from './components/speech-recognition/speech-recognition.component';
import { SpeechRecognitionService } from './components/speech-recognition/speech-recognition.service';
import { NotesService } from './services/notes.service';
import { onCoreClientInit } from './services/initial.service';
import { FileViewerComponent } from './components/file-viewer/file-viewer.component';

export const options: Partial<IConfig> | (() => Partial<IConfig>) = null;
// import { NgProgress } from 'ngx-progressbar';

@NgModule({
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    HttpModule,
    HttpClientModule,
    ImageDrawingModule,
    ReactiveFormsModule,
    FileUploadModule,
    // BrowserAnimationsModule,
    AutosizeModule,
    CKEditorModule,
    TimepickerModule.forRoot(),
    NgxMaskModule.forRoot(options),
    ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 5000,
      newestOnTop: true,
      closeButton: true
    }),
    AiWebClientModule,
    ModalModule.forRoot(),
    BsDropdownModule.forRoot(),
    SweetAlert2Module.forRoot({
      buttonsStyling: false,
      confirmButtonClass: 'btn btn-primary ripple-effect mr-4',
      cancelButtonClass: 'btn btn-secondary ripple-effect',
      heightAuto: false
    }),
    NgSelectModule,
    NpnSliderModule,
    SelectDropDownModule,
    CurrencyMaskModule,
    Ng5SliderModule,
    BsDatepickerModule.forRoot(),
    TooltipModule.forRoot(),
    DragDropModule,
    CKEditorModule
  ],
  declarations: [
    HeaderComponent,
    LoadingComponent,
    SidebarComponent,
    FileUploadComponent,
    LoginDialogComponent,
    BugReportComponent,
    ImageDrawingComponent,
    UserSearchComponent,
    SafePipe,
    SlugPipe,
    NotifyDatePipe,
    MomentFormatPipe,
    ServiceNamePipe,
    AutofocusDirective,
    ClickOutsideDirective,
    DriveUploaderComponent,
    DriveUploaderDirective,
    SecondFactorModalComponent,
    TourGuideModalComponent,
    DockComponent,
    NotificationsComponent,
    InputComponent,
    // TaskDialogComponent, // to be added later
    HelperComponent,
    BugReportFormComponent,
    FeatureRequestFormComponent,
    PaymentRequiredComponent,
    CreateSectionFormComponent,
    TimerComponent,
    GenericModalComponent,
    NoteComponent,
    SpeechRecognitionComponent,
    FileViewerComponent,
  ],
  exports: [
    InputComponent,
    HeaderComponent,
    LoadingComponent,
    SidebarComponent,
    LoginDialogComponent,
    BugReportComponent,
    SafePipe,
    SlugPipe,
    NotifyDatePipe,
    MomentFormatPipe,
    ServiceNamePipe,
    UserSearchComponent,
    AutofocusDirective,
    AiWebClientModule,
    ClickOutsideDirective,
    DriveUploaderComponent,
    DriveUploaderDirective,
    SecondFactorModalComponent,
    TourGuideModalComponent,
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    ModalModule,
    ToastrModule,
    BsDropdownModule,
    SweetAlert2Module,
    FileUploadModule,
    NgSelectModule,
    NpnSliderModule,
    SelectDropDownModule,
    CurrencyMaskModule,
    Ng5SliderModule,
    BsDatepickerModule,
    AutosizeModule,
    NgxMaskModule
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: onCoreClientInit,
      deps: [AI_CORE_CLIENT_OPTIONS, ServiceGroupsService],
      multi: true
    }]
})
export class CoreClientModule {
  // tslint:disable-next-line:no-shadowed-variable
  public static forRoot(options?: ICoreClientOptions): ModuleWithProviders {
    return {
      ngModule: CoreClientModule,
      providers: [
        AuthService,
        WidgetService,
        RestService,
        ThemesService,
        NotificationsService,
        TasksService,
        NotesService,
        ServiceGroupsService,
        DriveUploaderService,
        DriveDocumentsService,
        BsModalService,
        IntercomModule,
        AuthGuard,
        TourGuideService,
        HelperService,
        SpeechRecognitionService,
        {
          provide: AI_CORE_CLIENT_OPTIONS,
          useValue: options
        },
        {
          provide: HTTP_INTERCEPTORS,
          useClass: TokenInterceptor,
          multi: true
        }
      ]
    };
  }
}
