import { Component } from '@angular/core';
import { Trial, EvaluationStatus, Evaluation } from '@maxmobility/core';
import { EvaluationService, LoggingService } from '@maxmobility/mobile';
import { TranslateService } from '@ngx-translate/core';
import * as mustache from 'mustache';
import { RouterExtensions } from 'nativescript-angular/router';
import * as email from 'nativescript-email';
import { isAndroid, isIOS } from 'tns-core-modules/platform';
import { confirm } from 'tns-core-modules/ui/dialogs';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Kinvey } from 'kinvey-nativescript-sdk';

@Component({
  selector: 'Summary',
  moduleId: module.id,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent {
  trialName = '';
  showFlatDifficulty = false;
  showRampDifficulty = false;
  showInclineDifficulty = false;
  showOtherDifficulty = false;
  hasFlatDifficulty = this.evaluation.flat_difficulty > 0;
  hasRampDifficulty = this.evaluation.ramp_difficulty > 0;
  hasInclineDifficulty = this.evaluation.incline_difficulty > 0;
  hasOtherDifficulty = this.evaluation.other_difficulty > 0;

  difficulties = [
    {
      name: 'Flat',
      key: 'flat_difficulty',
      labelText: 'summary.difficulty-flat',
      sliderLabelText: 'summary.flat-surface-difficulty',
      has: false,
      show: false
    },
    {
      name: 'Ramp',
      key: 'ramp_difficulty',
      labelText: 'summary.difficulty-ramp',
      sliderLabelText: 'summary.ramp-difficulty',
      has: false,
      show: false
    },
    {
      name: 'Incline',
      key: 'incline_difficulty',
      labelText: 'summary.difficulty-incline',
      sliderLabelText: 'summary.incline-difficulty',
      has: false,
      show: false
    },
    {
      name: 'Other',
      key: 'other_difficulty',
      labelText: 'summary.difficulty-other',
      sliderLabelText: 'summary.other-surface-difficulty',
      has: false,
      show: false
    }
  ];

  totalPushesWith = 0;
  totalPushesWithout = 0;
  totalTimeWith = 0;
  totalTimeWithout = 0;
  totalCoastWith = 0;
  totalCoastWithout = 0;
  totalCadenceWith = 0;
  totalCadenceWithout = 0;
  pushDiff = 0;
  coastDiff = 0;
  cadenceThresh = 10; // pushes per minute
  lmnTemplate: string = this._translateService.instant('summary.lmnTemplate').join('\n');

  constructor(
    private _routerExtensions: RouterExtensions,
    private _evaluationService: EvaluationService,
    private _translateService: TranslateService,
    private _loggingService: LoggingService
  ) {
    // update difficulties
    this.difficulties.map(d => {
      d.has = this.evaluation[d.key] > 0;
    });

    this.evaluation.trials.map(t => {
      if (t.flat) {
        this.difficulties.filter(d => d.name === 'Flat')[0].show = true;
      }
      if (t.ramp) {
        this.difficulties.filter(d => d.name === 'Ramp')[0].show = true;
      }
      if (t.inclines) {
        this.difficulties.filter(d => d.name === 'Incline')[0].show = true;
      }
      if (t.other) {
        this.difficulties.filter(d => d.name === 'Other')[0].show = true;
      }
      this.totalPushesWith += t.with_pushes;
      this.totalPushesWithout += t.without_pushes;
      this.totalTimeWith += t.with_elapsed;
      this.totalTimeWithout += t.without_elapsed;
    });
    this.totalCoastWith = this.totalPushesWith ? (this.totalTimeWith * 60) / this.totalPushesWith : 0;
    this.totalCoastWithout = this.totalPushesWithout ? (this.totalTimeWithout * 60) / this.totalPushesWithout : 0;
    this.totalCadenceWith = this.totalTimeWith ? this.totalPushesWith / this.totalTimeWith : 0;
    this.totalCadenceWithout = this.totalTimeWithout ? this.totalPushesWithout / this.totalTimeWithout : 0;
    // pushes
    this.pushDiff = 100 - (this.totalPushesWith / this.totalPushesWithout) * 100 || 0;
    // coast
    this.coastDiff = this.totalCoastWith / this.totalCoastWithout || 0;
  }

  isIOS(): boolean {
    return isIOS;
  }

  isAndroid(): boolean {
    return isAndroid;
  }

  generateLMN(): string {
    // const that = this;
    return mustache.render(this.lmnTemplate, {
      evaluation: this.evaluation,
      trials: this.evaluation.trials,
      totalCadenceWithout: this.totalCadenceWithout.toFixed(1),
      pushDiff: this.pushDiff.toFixed(0),
      coastDiff: this.coastDiff.toFixed(1),
      toFixed: function() {
        console.log(this);
        let str = this.toFixed(2);
        console.log(str);
        if (!str.length) {
          str = '0';
        }
        return str;
      },
      toTimeString: function() {
        return Trial.timeToString(this * 60);
      },
      pushComparison: () => {
        return this.pushDiff > 0
          ? this._translateService.instant('summary.fewer')
          : this._translateService.instant('summary.more');
      },
      coastComparison: () => {
        return this.coastDiff > 1.0
          ? this._translateService.instant('summary.higher')
          : this._translateService.instant('summary.lower');
      },
      showCadence: this.totalCadenceWithout > this.cadenceThresh
    });
  }

  // button events
  async onComplete() {
    const confirmResult = await confirm({
      title: this._translateService.instant('summary.complete'),
      message: this._translateService.instant('summary.confirm'),
      okButtonText: this._translateService.instant('dialogs.yes'),
      cancelButtonText: this._translateService.instant('dialogs.no')
    });

    if (!confirmResult) {
      console.log('confirmation was denied');
      return;
    }

    // send email to user
    const isAvailable = await email.available();
    if (!isAvailable) {
      console.log('Email is not available on device.');
      return;
    }

    const lmnBody = this.generateLMN();
    email
      .compose({
        to: [],
        subject: this._translateService.instant('summary.email-subject'),
        body: lmnBody,
        cc: []
      })
      .then(result => {
        if (result) {
          console.log('email compose result', result);
        } else {
          console.log('the email may NOT have been sent!');
        }
      })
      .catch(error => {
        this._loggingService.logException(error);
        console.error(error);
      });

    // Brad - if user is here saving the eval it should be complete
    // we can add better tracking to check for specific values
    // this is quick and dirty to confirm reusing the method with status value
    // related: https://github.com/PushTracker/EvalApp/issues/190
    this.evaluation.status = EvaluationStatus.Complete;
    this.evaluation.creator_id = Kinvey.User.getActiveUser()._id;

    this._evaluationService.save();

    // now go back to dashboard
    this._routerExtensions.navigate(['/home'], {
      // clearHistory: true,
      transition: {
        name: 'fade'
      }
    });
  }

  onDifficultyChecked(diff: any, args): void {
    diff.has = args.value;
    if (!diff.has) {
      this.evaluation[diff.key] = 0;
    }
  }

  onSliderUpdate(key, args) {
    this.evaluation[key] = args.object.value;
  }

  onBack(): void {
    this._routerExtensions.navigate(['/trial'], {
      transition: {
        name: 'slideRight'
      }
    });
  }

  get evaluation() {
    return this._evaluationService.evaluation;
  }
}
