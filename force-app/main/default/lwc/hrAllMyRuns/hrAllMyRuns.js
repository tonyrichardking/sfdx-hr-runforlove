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

    @wire(GetRunsForLoveForHomePage, { homeId: '$homepageid' })
    therunsforlove;

    //
    // Log a new run
    //

    @track theTime;
    @track theMileage;
    @track theDate;
    @track theNotes;

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

    //
    // Teams
    //

    theEnableTeams = false;
    theTeamPageBaseUrl = 'https://tonysb1-help-refugees.cs127.force.com/tothemoonteam/';
    theTeamRecordId = 'a2W3M0000005EfkUAE';

    handleTeams() {
        this.theEnableTeams = !this.theEnableTeams;
        //alert('handleTeams: theEnableTeams = ' + this.theEnableTeams);
    }

    openTeamPage() {
        window.location.assign(this.theTeamPageBaseUrl + '?id=' + this.theTeamRecordId);
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