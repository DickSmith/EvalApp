import { Component, OnInit, ViewChild } from '@angular/core';
import { DrawerTransitionBase, SlideInOnTopTransition } from 'nativescript-ui-sidedrawer';
import { RadSideDrawerComponent } from 'nativescript-ui-sidedrawer/angular';

@Component({
  selector: 'Search',
  moduleId: module.id,
  templateUrl: './search.component.html',
  styles: [
    `
      Image {
        display: block;
        margin-left: auto;
        margin-right: auto;
        width: 50%;
        height: auto;
    }

      .slide-indicator-inactive{
          background-color: #fff;
          opacity : 0.4;
          width : 10;
          height : 10;
          margin-left : 2.5;
          margin-right : 2.5;
          margin-top : 0;
          border-radius : 5;
      }

      .slide-indicator-active{
          background-color: #fff;
          opacity : 0.9;
          width : 10;
          height : 10;
          margin-left : 2.5;
          margin-right : 2.5;
          margin-top : 0;
          border-radius : 5;
      }

    `
  ]
})
export class SearchComponent implements OnInit {
  /************************************************************
   * Use the @ViewChild decorator to get a reference to the drawer component.
   * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
   *************************************************************/
  @ViewChild('drawer') drawerComponent: RadSideDrawerComponent;

  slides = [
    {
      Image: '~/assets/images/PowerOn.jpg',
      Label: 'Powering SmartDrive',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/BandPower.jpg',
      Label: 'Powering PushTracker',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/Tapping.jpg',
      Label: 'Tap Gesture',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/Steer.jpg',
      Label: 'Steering',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/turn.jpg',
      Label: 'Turning',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/Stop.jpg',
      Label: 'Stopping',
      Description: 'It is important to learn how to do a proper tapping technique.'
    },
    {
      Image: '~/assets/images/Stop2.jpg',
      Label: 'More Stopping',
      Description: 'It is important to learn how to do a proper tapping technique.'
    }
  ];

  private _sideDrawerTransition: DrawerTransitionBase;

  /************************************************************
   * Use the sideDrawerTransition property to change the open/close animation of the drawer.
   *************************************************************/
  ngOnInit(): void {
    this._sideDrawerTransition = new SlideInOnTopTransition();
  }

  get sideDrawerTransition(): DrawerTransitionBase {
    return this._sideDrawerTransition;
  }

  /************************************************************
   * According to guidelines, if you have a drawer on your page, you should always
   * have a button that opens it. Use the showDrawer() function to open the app drawer section.
   *************************************************************/
  onDrawerButtonTap(): void {
    this.drawerComponent.sideDrawer.showDrawer();
  }
}
