import { Component } from '@angular/core';
import { LoggingService, UserService } from '@maxmobility/mobile';
import { TranslateService } from '@ngx-translate/core';
import { Kinvey } from 'kinvey-nativescript-sdk';
import { registerElement } from 'nativescript-angular/element-registry';
import { RouterExtensions } from 'nativescript-angular/router';
import { Carousel, CarouselItem } from 'nativescript-carousel';
import { Gif } from 'nativescript-gif';
import { MapboxView } from 'nativescript-mapbox';
import * as orientation from 'nativescript-orientation';
import { Sentry } from 'nativescript-sentry';
import * as application from 'tns-core-modules/application';
import {
  connectionType,
  startMonitoring,
  stopMonitoring
} from 'tns-core-modules/connectivity';
import { alert } from 'tns-core-modules/ui/dialogs/dialogs';
import { APP_KEY, APP_SECRET } from './kinvey-keys';

// Register Custom Elements for Angular
registerElement('Carousel', () => <any>Carousel);
registerElement('CarouselItem', () => <any>CarouselItem);
registerElement(
  'BarcodeScanner',
  () => require('nativescript-barcodescanner').BarcodeScannerView
);
registerElement('Gif', () => Gif);
registerElement('Mapbox', () => MapboxView);

@Component({
  selector: 'ns-app',
  template: '<page-router-outlet></page-router-outlet>'
})
export class AppComponent {
  constructor(
    private _translateService: TranslateService,
    private _logService: LoggingService,
    private _userService: UserService,
    private _router: RouterExtensions
  ) {
    // init sentry
    const sentryDsn =
      'https://aaa25eb556fa476a92e0edea6dd57af6:65c984b9260e47f0bb128def7eddd5f4@sentry.io/306438';
    Sentry.init(sentryDsn, {
      environment: 'mobile',
      release: '0.1.0'
    });

    // REGISTER FOR PUSH NOTIFICATIONS
    if (UserService.hasRegistered === false) {
      this._userService
        ._registerForPushNotifications()
        .then((deviceToken: string) => {
          UserService.hasRegistered = true;
        })
        .catch(err => {
          this._logService.logException(err);
        });
    }

    // set the orientation to be portrait and don't allow orientation changes
    orientation.setOrientation('portrait');
    orientation.disableRotation(); // may not need to call this - docs say 'set' calls this

    // Brad - sets the default language for ngx-translate
    // *** The value being set must match a translation .json file in assets/i18n/ or it will fail ***
    // wrapping this in try/catch due to https://github.com/PushTracker/EvalApp/issues/43
    try {
      this._translateService.setDefaultLang('en');
      this._translateService.addLangs(['en', 'es', 'de', 'fr', 'nl']);
    } catch (error) {
      this._logService.logException(error);
    }

    // application level events
    application.on(
      application.uncaughtErrorEvent,
      (args: application.UnhandledErrorEventData) => {
        this._logService.logException(args.error);
        this._stopNetworkMonitoring();
      }
    );

    application.on(application.suspendEvent, () => {
      this._stopNetworkMonitoring();
    });

    application.on(application.exitEvent, () => {
      this._stopNetworkMonitoring();
    });

    application.on(
      application.resumeEvent,
      (args: application.ApplicationEventData) => {
        this._startNetworkMonitor();
        // set the orientation to be portrait and don't allow orientation changes
        orientation.setOrientation('portrait');
        orientation.disableRotation(); // may not need to call this - docs say 'set' calls this
      }
    );

    Kinvey.init({ appKey: `${APP_KEY}`, appSecret: `${APP_SECRET}` });
    Kinvey.ping()
      .then(() => {
        // nothing useful here - Kinvey SDK is working
      })
      .catch(err => {
        this._logService.logException(err);
      });

    // if user is logged in, go home, else go to login
    if (this._userService.user) {
      this._router.navigate(['/home']);
    } else {
      this._router.navigate(['/login']);
    }
  }

  private _startNetworkMonitor() {
    // start network monitoring
    startMonitoring(newConnectionType => {
      switch (newConnectionType) {
        case connectionType.none:
          alert({
            message: this._translateService.instant('general.no-connection'),
            okButtonText: 'Okay'
          });
          break;
        case connectionType.wifi:
          return;
        case connectionType.mobile:
          return;
      }
    });
  }

  // Stop the monitoring
  private _stopNetworkMonitoring() {
    stopMonitoring();
  }
}
