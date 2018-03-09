import { Injectable } from '@angular/core';

import { fromObject, Observable } from 'data/observable';

export class Settings {
  // public members
  PushingPain: string = 'Yes';
  PushingFatigue: string = 'Yes';

  pain: number = 3;
  fatigue: number = 7;
  independence: number = 10;

  maxSpeed: number = 50;
  accelerationRate: number = 30;

  pushCount: number = 0;
  coastTime: number = 0.0;
  trialDistance: number = 0.0;
  trialTime: number = 0.0;
  pushesPercentDifference: number = 0.0;
  coastPercentDifference: number = 0.0;

  rampDifficulty: number = 0.0;
  flatDifficulty: number = 0.0;

  // private members

  // functions

  constructor(obj?: any) {
    if (obj !== null && obj !== undefined) {
      this.fromObject(obj);
    }
  }

  fromObject(obj: any): void {
    this.PushingPain = (obj && obj.PushingPain) || 'Yes';
    this.PushingFatigue = (obj && obj.PushingFatigue) || 'Yes';

    this.pain = (obj && obj.pain) || 3;
    this.fatigue = (obj && obj.fatigue) || 7;
    this.independence = (obj && obj.independence) || 10;

    this.maxSpeed = (obj && obj.maxSpeed) || 50;
    this.accelerationRate = (obj && obj.accelerationRate) || 30;
    this.rampDifficulty = (obj && obj.rampDifficulty) || 0;
    this.flatDifficulty = (obj && obj.flatDifficulty) || 0;
  }
}

@Injectable()
export class EvaluationService {
  static settings: Observable = fromObject(new Settings());

  constructor() {}
}
