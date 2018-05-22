// angular
import { Component, OnInit, ViewChild } from '@angular/core';
// nativescript
import * as switchModule from 'tns-core-modules/ui/switch';
import { RouterExtensions } from 'nativescript-angular/router';
import { SegmentedBar, SegmentedBarItem } from 'tns-core-modules/ui/segmented-bar';
import { TextField } from 'tns-core-modules/ui/text-field';
import { Observable } from 'tns-core-modules/data/observable';
import { confirm } from 'tns-core-modules/ui/dialogs';
import { SnackBar, SnackBarOptions } from 'nativescript-snackbar';
import * as email from 'nativescript-email';
// app
import { Trial } from '@maxmobility/core';
import { Evaluation, EvaluationService } from '@maxmobility/mobile';

@Component({
  selector: 'Summary',
  moduleId: module.id,
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.css']
})
export class SummaryComponent implements OnInit {
  trialName: string = '';
  snackbar = new SnackBar();

  hasFlatDifficulty: boolean = false;
  hasRampDifficulty: boolean = false;

  totalPushesWith: number = 0;
  totalPushesWithout: number = 0;
  totalTimeWith: number = 0;
  totalTimeWithout: number = 0;
  totalCoastWith: number = 0;
  totalCoastWithout: number = 0;
  totalCadenceWith: number = 0;
  totalCadenceWithout: number = 0;

  pushDiff: number = 0;
  coastDiff: number = 0;

  cadenceThresh = 10; // pushes per minute

  constructor(private routerExtensions: RouterExtensions) {
    this.evaluation.trials.map(t => {
      this.totalPushesWith += t.with_pushes;
      this.totalPushesWithout += t.without_pushes;
      this.totalTimeWith += t.with_elapsed;
      this.totalTimeWithout += t.without_elapsed;
    });
    this.totalCoastWith = this.totalPushesWith ? this.totalTimeWith * 60 / this.totalPushesWith : 0;
    this.totalCoastWithout = this.totalPushesWithout ? this.totalTimeWithout * 60 / this.totalPushesWithout : 0;
    this.totalCadenceWith = this.totalTimeWith ? this.totalPushesWith / this.totalTimeWith : 0;
    this.totalCadenceWithout = this.totalTimeWithout ? this.totalPushesWithout / this.totalTimeWithout : 0;
    // pushes
    this.pushDiff = 100 - this.totalPushesWith / this.totalPushesWithout * 100;
    // coast
    this.coastDiff = this.totalCoastWith / this.totalCoastWithout * 100;
  }

  generateLMN(): string {
    let lmnBody = [
      'This email was generated and sent by the Smart Evaluation App.',
      '',
      `User had pushing pain? ${this.evaluation.PushingPain}`,
      `                       ${this.evaluation.pain}`,
      `User had pushing fatigue? ${this.evaluation.PushingFatigue}`,
      `                       ${this.evaluation.fatigue}`,
      `Impact on user's independence: ${this.evaluation.independence}`
    ];
    this.evaluation.trials.map(t => {
      lmnBody.push('');
      lmnBody.push(`Trial "${t.name}":`);
      lmnBody.push(`  distance:   ${t.distance.toFixed(2)} m`);
      lmnBody.push(`  With SD:`);
      lmnBody.push(`    pushes: ${t.with_pushes}`);
      lmnBody.push(`    coast:  ${t.with_coast.toFixed(2)} s`);
      lmnBody.push(`    time:   ${Trial.timeToString(t.with_elapsed * 60)}`);
      lmnBody.push(`  Without SD:`);
      lmnBody.push(`    pushes: ${t.without_pushes}`);
      lmnBody.push(`    coast:  ${t.without_coast.toFixed(2)} s`);
      lmnBody.push(`    time:   ${Trial.timeToString(t.without_elapsed * 60)}`);
      lmnBody.push('');
    });
    lmnBody.push(`User's difficulty with ramps: ${this.evaluation.rampDifficulty}`);
    lmnBody.push(`User's difficulty with flats: ${this.evaluation.flatDifficulty}`);
    // pushes
    lmnBody.push('');
    lmnBody.push(
      `User performed ${this.pushDiff.toFixed(0)}% ${this.pushDiff > 0 ? 'fewer' : 'more'} pushes with SmartDrive`
    );
    // coast
    lmnBody.push('');
    lmnBody.push(
      `Average coast time was ${this.coastDiff.toFixed(0)}% ${
        this.coastDiff > 100 ? 'higher' : 'lower'
      } with SmartDrive`
    );
    // cadence
    lmnBody.push('');
    if (this.totalCadenceWithout > this.cadenceThresh) {
      lmnBody.push(
        `At ${this.totalCadenceWithout.toFixed(
          1
        )} pushes per minute, user's cadence is exceptionally high. Consider looking at rear wheel placement and efficient push technique.`
      );
    }
    return lmnBody.join('\n');
  }

  // button events
  onNext(): void {
    confirm({
      title: 'Complete Evaluation?',
      message: "Are you sure you're done with the evaluation?",
      okButtonText: 'Yes',
      cancelButtonText: 'No'
    }).then(result => {
      if (result) {
        // send email to user
        email
          .available()
          .then(available => {
            console.log(`The device email status is ${available}`);
            if (available) {
              let lmnBody = this.generateLMN();
              email
                .compose({
                  to: [],
                  subject: 'Smart Evaluation LMN',
                  body: lmnBody,
                  cc: []
                })
                .then(result => {
                  console.log(result);
                  if (result) {
                    console.log('the email may have been sent!');
                  } else {
                    console.log('the email may NOT have been sent!');
                  }
                })
                .catch(error => console.error(error));
            }
          })
          .catch(error => console.error(error));
        // now go back to dashboard
        this.routerExtensions.navigate(['/home'], {
          clearHistory: true,
          transition: {
            name: 'fade'
          }
        });
      }
    });
  }

  onRampDifficultyChecked(args): void {
    this.hasRampDifficulty = args.value;
  }

  onFlatDifficultyChecked(args): void {
    this.hasFlatDifficulty = args.value;
  }

  onBack(): void {
    this.routerExtensions.navigate(['/trial'], {
      clearHistory: true,
      transition: {
        name: 'slideRight'
      }
    });
  }

  onTextChange(args) {
    const textField = <TextField>args.object;

    console.log('onTextChange');
    this.trialName = textField.text;
  }

  onReturn(args) {
    const textField = <TextField>args.object;

    console.log('onReturn');
    this.trialName = textField.text;
  }

  showAlert(result) {
    alert('Text: ' + result);
  }

  submit(result) {
    alert('Text: ' + result);
  }

  onSliderUpdate(key, args) {
    this.evaluation.set(key, args.object.value);
  }

  ngOnInit() {
    console.log('Summary.Component ngOnInit');
  }

  get evaluation(): Evaluation {
    return EvaluationService.evaluation;
  }
}
