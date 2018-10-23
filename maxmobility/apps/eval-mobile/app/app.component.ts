import { Component } from '@angular/core';
import { CLog, LoggingService, UserService } from '@maxmobility/mobile';
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
import { connectionType, startMonitoring, stopMonitoring } from 'tns-core-modules/connectivity';
import { device } from 'tns-core-modules/platform';
import { alert } from 'tns-core-modules/ui/dialogs/dialogs';
import { KinveyKeys } from './kinvey-keys';

// Register Custom Elements for Angular
registerElement('Carousel', () => <any>Carousel);
registerElement('CarouselItem', () => <any>CarouselItem);
registerElement('BarcodeScanner', () => require('nativescript-barcodescanner').BarcodeScannerView);
registerElement('Gradient', () => require('nativescript-gradient').Gradient);
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
    const sentryDsn = 'https://aaa25eb556fa476a92e0edea6dd57af6:65c984b9260e47f0bb128def7eddd5f4@sentry.io/306438';
    Sentry.init(sentryDsn, {
      environment: 'mobile',
      release: '0.1.0'
    });

    // REGISTER FOR PUSH NOTIFICATIONS
    console.log('*** app.component constructor ***');
    console.log('UserService.hasRegistered', UserService.hasRegistered);

    if (UserService.hasRegistered === false) {
      this._userService
        ._registerForPushNotifications()
        .then((deviceToken: string) => {
          console.log(`registered push notifications: ${deviceToken}`);
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
      // this._translateService.use(device.language);
      console.log(`device language: ${device.language}`);
    } catch (error) {
      CLog('Error trying to set the TranslateService.use() default to device.language.');
      console.log(JSON.stringify(error));
    }

    // application level events
    application.on(application.uncaughtErrorEvent, (args: application.UnhandledErrorEventData) => {
      console.log('**** App Uncaught Error Event ****', args.error);
      this._stopNetworkMonitoring();
    });

    application.on(application.suspendEvent, () => {
      console.log('**** App Suspended Event ****');
      this._stopNetworkMonitoring();
    });

    application.on(application.exitEvent, () => {
      console.log('**** App Exit Event ****');
      this._stopNetworkMonitoring();
    });

    application.on(application.resumeEvent, (args: application.ApplicationEventData) => {
      console.log('**** App Resume Event ****');
      this._startNetworkMonitor();
      // set the orientation to be portrait and don't allow orientation changes
      orientation.setOrientation('portrait');
      orientation.disableRotation(); // may not need to call this - docs say 'set' calls this
    });

    Kinvey.init({
      appKey: `${KinveyKeys.APP_KEY}`,
      appSecret: `${KinveyKeys.APP_SECRET}`
    });
    Kinvey.ping()
      .then(res => {
        CLog(`Kinvey ping successful, SDK is active 💯`);
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
      console.log('network type', newConnectionType);
      switch (newConnectionType) {
        case connectionType.none:
          alert({
            message: `Smart Evaluation has detected a network change. Please make sure you are connected to wifi or a cell network. The app`,
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
