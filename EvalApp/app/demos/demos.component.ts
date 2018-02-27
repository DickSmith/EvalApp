import { Component, OnInit, ViewChild } from "@angular/core";
import { DrawerTransitionBase, SlideInOnTopTransition } from "nativescript-pro-ui/sidedrawer";
import { RadSideDrawerComponent } from "nativescript-pro-ui/sidedrawer/angular";

@Component({
    selector: "Demos",
    moduleId: module.id,
    templateUrl: "./demos.component.html",
    styleUrls: ["./demos.component.css"]
})
export class DemosComponent implements OnInit {
    /* ***********************************************************
    * Use the @ViewChild decorator to get a reference to the drawer component.
    * It is used in the "onDrawerButtonTap" function below to manipulate the drawer.
    *************************************************************/
    @ViewChild("drawer") drawerComponent: RadSideDrawerComponent;

    public demos = [
	{ SerialNumber: "11000", LastUsed: new Date(1988, 10, 23) },
	{ SerialNumber: "11001", LastUsed: new Date() },
	{ SerialNumber: "11002", LastUsed: new Date() },
	{ SerialNumber: "11003", LastUsed: new Date() },
    ];

    private _sideDrawerTransition: DrawerTransitionBase;

    // functions

    public onDemoTap(args): void {
	
    }

    /* ***********************************************************
    * Use the sideDrawerTransition property to change the open/close animation of the drawer.
    *************************************************************/
    ngOnInit(): void {
        this._sideDrawerTransition = new SlideInOnTopTransition();
    }

    get sideDrawerTransition(): DrawerTransitionBase {
        return this._sideDrawerTransition;
    }

    /* ***********************************************************
    * According to guidelines, if you have a drawer on your page, you should always
    * have a button that opens it. Use the showDrawer() function to open the app drawer section.
    *************************************************************/
    onDrawerButtonTap(): void {
        this.drawerComponent.sideDrawer.showDrawer();
    }
}
