import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Demo, RouterExtService, User, UserTypes } from '@maxmobility/core';
import {
  BluetoothService,
  DemoService,
  FileService,
  FirmwareService,
  LoggingService,
  UserService
} from '@maxmobility/mobile';
import { TranslateService } from '@ngx-translate/core';
import { RouterExtensions } from 'nativescript-angular/router';
import {
  Feedback,
  FeedbackPosition,
  FeedbackType
} from 'nativescript-feedback';
import { Fab } from 'nativescript-floatingactionbutton';
import { Color } from 'tns-core-modules/color';
import { EventData } from 'tns-core-modules/data/observable';
import { ObservableArray } from 'tns-core-modules/data/observable-array';
import * as dialogs from 'tns-core-modules/ui/dialogs';
import { Page } from 'tns-core-modules/ui/page';

@Component({
  selector: 'Home',
  moduleId: module.id,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  changeDetection: ChangeDetectionStrategy.Default
})
export class HomeComponent {
  connectivityItems = [
    {
      Image: '~/assets/images/training-transparent.png',
      Description: 'menu.training',
      Route: '/training'
    },
    {
      Image: '~/assets/images/pt-phone-home.png',
      Description: 'menu.pair-pt-app',
      Directive: 0,
      Route: '/pairing'
    },
    {
      Image: '~/assets/images/pt-connect-home.png',
      Description: 'menu.connect-app',
      Directive: 1,
      Route: 'pairing'
    },
    {
      Image: '~/assets/images/pt-sd-pairing-home.png',
      Description: 'menu.pair-pt-sd',
      Directive: 2,
      Route: '/pairing'
    },
    {
      Image: '~/assets/images/pt-settings-gear.png',
      Description: 'PushTracker Settings',
      Directive: 3,
      Route: '/pairing'
    },
    {
      Image: '~/assets/images/pt-sd-ota.png',
      Description: 'menu.ota',
      Directive: 'ota',
      Route: '/ota'
    }
  ];

  evalItems = [
    {
      Image: '~/assets/images/evaluation.png',
      Description: 'menu.eval',
      Route: '/eval-entry'
    },
    {
      Image: '~/assets/images/trial-history-transparent.png',
      Description: 'menu.eval-history',
      Route: '/evals'
    },
    {
      Image: '~/assets/images/trial-transparent.png',
      Description: 'menu.trial',
      Route: '/trial'
    }
  ];

  faqItems = this._translateService.instant('faqs');
  videoItems = this._translateService.instant('videos');

  /**
   * Boolean to track when the demo unit loading has finished to hide the loading indicator and show the list data
   */
  demoUnitsLoaded = false;

  userType: number;

  private feedback = new Feedback();

  constructor(
    private _page: Page,
    private _routerExtService: RouterExtService,
    private _routerExtensions: RouterExtensions,
    private _logService: LoggingService,
    private _demoService: DemoService,
    private _firmwareService: FirmwareService,
    private _loggingService: LoggingService,
    private _fileService: FileService,
    private _userService: UserService,
    private _bluetoothService: BluetoothService,
    private _translateService: TranslateService
  ) {
    this._page.enableSwipeBackNavigation = false;

    this._fileService.downloadTranslationFiles();

    this._firmwareService.initFirmwareService();

    const activeUser = this._userService.user;
    this.userType = (activeUser.data as User).type as number;

    // delaying since it typically won't be in the viewport initially on majority of devices
    // only loading if the static demos member of the service has no items
    // adding a refresh button in the UI to query on demand for the list items
    if (DemoService.Demos.length <= 0) {
      setTimeout(() => {
        this.loadDemoUnits();
      }, 1500);
    } else {
      this.demoUnitsLoaded = true;
    }
  }

  get currentVersion(): string {
    return this._firmwareService.currentVersion;
  }

  get Demos(): ObservableArray<Demo> {
    return DemoService.Demos;
  }

  onAccountButtonTap(): void {
    this._routerExtensions.navigate(['/account'], {
      transition: {
        name: 'slideTop',
        duration: 350,
        curve: 'easeInOut'
      }
    });
  }

  loadDemoUnits() {
    try {
      this.demoUnitsLoaded = false; // toggle the display of the loading indicator
      DemoService.Demos.splice(0, DemoService.Demos.length); // empty the current items

      this._demoService
        .load()
        .then(() => {
          this.demoUnitsLoaded = true;
        })
        .catch(err => {
          this._loggingService.logException(err);
          this.demoUnitsLoaded = true;
        });
    } catch (error) {
      this._logService.logException(error);
    }
  }

  connectivityThumbTapped(item: any) {
    // Determines the pairing processs to perform
    const directive = item.Directive;

    this._routerExtensions.navigate([item.Route], {
      queryParams: {
        index: directive
      }
    });
  }

  otaThumbTapped(item: any) {
    // Determines the OTA process to perform
    this._routerExtensions.navigate([item.Route]);
  }

  videoThumbTapped(item: any) {
    this._routerExtensions.navigate([item.Route], {
      transition: {
        name: ''
      },
      queryParams: {
        url: item.Url,
        desc: item.Description,
        title: item.Title
      }
    });
  }

  evalThumbTapped(item: any) {
    this._routerExtensions.navigate([item.Route], {
      transition: {
        name: ''
      }
    });
  }

  demoThumbTapped(item: any) {
    let index = -1;
    if (item) {
      index = DemoService.Demos.indexOf(item);
    }
    this._routerExtensions.navigate(['/demo-detail'], {
      queryParams: {
        index
      }
    });
  }

  chevronButtonTapped(route: string) {
    this._routerExtensions.navigate([route], {
      transition: {
        name: ''
      }
    });
  }

  faqThumbTapped(item: any) {
    const answer = item.answer;
    const question = item.question;
    const whiteColor = new Color('#fff');
    const blueColor = new Color('#004F7E');
    this.feedback.show({
      title: question,
      titleColor: whiteColor,
      message: answer,
      messageColor: whiteColor,
      position: FeedbackPosition.Bottom,
      duration: 14500,
      type: FeedbackType.Info,
      backgroundColor: blueColor,
      onTap: () => {
        // do nothing
      }
    });
  }

  fabTap(args: EventData) {
    const fab = args.object as Fab;
    // simple animation on fab for interaction
    fab.animate({
      rotate: 90,
      duration: 300
    });

    // based on the current user type set the actions options they will be presented with
    let actions;
    switch (this.userType) {
      case UserTypes.Clinician:
        actions = [
          this._translateService.instant('home.quick-actions.start-eval'),
          this._translateService.instant('home.quick-actions.update'),
          this._translateService.instant('home.quick-actions.request-demo')
        ];
        break;
      case UserTypes.Representative:
        actions = [
          this._translateService.instant('home.quick-actions.start-eval'),
          this._translateService.instant('home.quick-actions.update'),
          this._translateService.instant('home.quick-actions.register-demo')
        ];
        break;
      case UserTypes.EndUser:
        actions = [
          this._translateService.instant('home.quick-actions.update'),
          this._translateService.instant('home.quick-actions.learn')
        ];
        break;
      case UserTypes.Admin:
        actions = [
          this._translateService.instant('home.quick-actions.start-eval'),
          this._translateService.instant('home.quick-actions.update'),
          this._translateService.instant('home.quick-actions.request-demo'),
          this._translateService.instant('home.quick-actions.register-demo'),
          this._translateService.instant('home.quick-actions.learn')
        ];
        break;
    }

    // show the action dialog with the actions based on user type
    dialogs
      .action({
        message: '',
        cancelButtonText: this._translateService.instant('dialogs.cancel'),
        actions
      })
      .then((result: string) => {
        this._handleActionResult(result);
        // reset the fab
        fab.animate({
          rotate: 0,
          duration: 300
        });
      })
      .catch(error => {
        this._logService.logException(error);
        // reset the fab
        fab.animate({
          rotate: 0,
          duration: 300
        });
      });
  }

  private _handleActionResult(value: string) {
    // log breadcrumb for sentry
    this._logService.logBreadCrumb(
      `User has tapped the home FAB button and selected action ${value}`
    );

    // route user to the screen based on the action selected
    if (
      value === this._translateService.instant('home.quick-actions.start-eval')
    ) {
      this._routerExtensions.navigate(['/eval-entry']);
    } else if (
      value === this._translateService.instant('home.quick-actions.update')
    ) {
      this._routerExtensions.navigate(['/ota']);
    } else if (
      value ===
      this._translateService.instant('home.quick-actions.request-demo')
    ) {
      this._routerExtensions.navigate(['/demos']);
    } else if (
      value ===
      this._translateService.instant('home.quick-actions.register-demo')
    ) {
      this._routerExtensions.navigate(['/demos']);
    } else if (
      value === this._translateService.instant('home.quick-actions.learn')
    ) {
      this._routerExtensions.navigate(['/videos']);
    }
  }
}
