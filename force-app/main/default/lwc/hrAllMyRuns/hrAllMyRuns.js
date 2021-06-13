import { LightningElement, track, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { reduceErrors } from 'c/ldsUtils';
import { NavigationMixin } from 'lightning/navigation';

import JOURNEY_ICON from '@salesforce/resourceUrl/journey';

import GetAllRunsForLove from '@salesforce/apex/HR_RFL_AppController.GetAllRunsForLove';
import GetRunsForLoveForHomePage from '@salesforce/apex/HR_RFL_AppController.GetRunsForLoveForHomePage';
import AddRunForLove from '@salesforce/apex/HR_RFL_AppController.AddRunForLove';

export default class HrAllMyRuns extends LightningElement {

    // Expose the static resource URL for use in the template
    journey = JOURNEY_ICON;

    //
    // List of completed runs
    //

    @api homepageid;

    // Reactive variables are prefixed with $.  If a reactive variable changes, the wire service provisions new data
    // @wire decorates a private property or function that receives the stream of data from the wire service. 
    // If a property is decorated with @wire, the results are returned to the property’s data property or error property. 
    // If a function is decorated with @wire, the results are returned in an object with a data property and an error property.
    // Be careful to either use 'property.data', or to set a property with the value of 'data' to use in the page.
    @wire(GetRunsForLoveForHomePage, { homeId: '$homepageid' })
    therunsforlove;

    //
    // 40 days not started, or finished
    //

    @api daystostart;
    @api tooearly;
    @api toolate;
    showtooEarlyError = false;
    showtooLateError = false;

    //Debug
    @track error;
    errorMessage;

    //
    // Form to create a new run
    //

    @track theTime;
    @track theMileage;
    @track theDate;
    @track theNotes;

    handleTime(event) {
        // alert('handleTime: theTime = ' + event.target.value);
        this.theTime = event.target.value;
    }

    handleMileage(event) {
        this.theMileage = event.target.value;
    }

    handleDate(event) {
        this.theDate = event.target.value;
    }

    handleNotes(event) {
        this.theNotes = event.target.value;
    }

    // --------------------------------------------------------------------------------
    // update the list of completed runs
    handleSave() {
        // alert('handleClick: theTime = ' + this.theTime + 'theMileage = ' + this.theMileage + 'theDate = ' + this.theDate + 'theNotes = ' + this.theNotes);

        //alert('handleNewRunEvent: tooearly = ' + this.tooearly + '; toolate = ' + this.toolate);
        if (this.tooearly) {
            // Oops...false start! There's still X days to go until the starting pistol. You can only log your miles from 23rd May.
            this.showtooEarlyError = true;
            this.showtooLateError = false;
            this.handleReset();
        }
        else if (this.toolate) {
            // Sorry, we can't count any more runs as the 40 days are up.
            this.showtooEarlyError = false;
            this.showtooLateError = true;
            this.handleReset();
        }
        else {
            AddRunForLove({ home: this.homepageid, theTime: this.theTime, theMileage: this.theMileage, theDate: this.theDate, theNotes: this.theNotes })
                .then(result => {
                    refreshApex(this.therunsforlove);
                    //alert('dispatchNewRunEvent');

                    const runEvent = new CustomEvent('newrun', {
                        detail: {
                            latestRunMileage: this.theMileage
                        }
                    });

                    this.dispatchEvent(runEvent);
                })
                .then(() => {
                    this.handleReset();
                })
                .catch(error => {
                    this.error = error;
                })
        }
    };

    // --------------------------------------------------------------------------------
    handleReset() {
        //alert('handleReset')

        this.theTime = '';
        this.theMileage = '';
        this.theDate = '';
        this.theNotes = '';
    }
}