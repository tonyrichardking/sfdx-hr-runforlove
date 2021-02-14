// --------------------------------------------------------------------------------
// DON'T FORGET THE 'this.' !!!!!!!!!!!!!!!!!!!!!!!!!!
//
// hrRunForLoveHomeTest1
// --------------------------------------------------------------------------------

import { LightningElement, track, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi'

// from HR_RFL_AppController
import GetContactForHomePageId from '@salesforce/apex/HR_RFL_AppController.GetContactForHomePageId';
import UpdateHomePage from '@salesforce/apex/HR_RFL_AppController.UpdateHomePage';
import UpdateHomePageLatestRunDistance from '@salesforce/apex/HR_RFL_AppController.UpdateHomePageLatestRunDistance';
import GetHomePageForId from '@salesforce/apex/HR_RFL_AppController.GetHomePageForId';

import TARGETMILES_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Target_miles__c';
import RUNSCOMPLETED_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Runs_completed__c';
import MILESTOGO_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Miles_to_go__c';
import DESCRIPTION_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Description__c';
import DAYSLEFT_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Days_left__c';
import CURRENTMILES_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Current_miles__c';
import FUNDRAISINGPAGE_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Fundraising_page__c';
import DAYSTOSTART_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Days_to_start__c';
import SCOREBOARD_FIELD from '@salesforce/schema/T4R_Run_For_Love_Home__c.T4R_Run_For_Love_Scoreboard__c';

const fields = [
    TARGETMILES_FIELD,
    RUNSCOMPLETED_FIELD,
    MILESTOGO_FIELD,
    DESCRIPTION_FIELD,
    DAYSLEFT_FIELD,
    CURRENTMILES_FIELD,
    FUNDRAISINGPAGE_FIELD,
    DAYSTOSTART_FIELD,
    SCOREBOARD_FIELD,
];

export default class HrRunForLoveHome extends LightningElement {

    // wire service: https://rajvakati.com/2019/02/01/lightning-web-components-wire-service-3/
    // expose lwc to appbuilder: https://rajvakati.com/2018/12/26/lightning-web-components-in-lightning-app-builder/

    @api homePageId;

    // Home page fields
    @track theHomepageRecord;
    @track theTargetMiles;
    @track theRunsCompleted;
    @track theMilesToGo;
    @track theDescription;
    @track theDaysLeft;
    @track theCurrentMiles;
    @track theFundraisingPage;
    @track theDaysToStart;
    @track theScoreboardId;

    // Scoreboard fields
    theScoreboardRecord;
    theStartDate;

    // Contact fields
    theRelatedContact;
    theRelatedContactName;
    theRelatedContactFirstname;
    theEmail;

    @track newTargetMiles

    // Run time progress variables
    gettingReady;
    startsToday;
    isFinished;
    hasReachedTarget;
    isDisabled;

    wiredResult;

    // Reactive variables are prefixed with $.  If a reactive variable changes, the wire service provisions new data,
    @wire(getRecord, { recordId: '$homePageId', fields })
    wiredRecord({ error, data }) {
        this.wiredResult = data;
        if (error) {
            //alert('getRecord: homePageId = ' + this.homePageId + 'getRecord: error = ' + error);

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading job',
                    //message: reduceErrors(error).join(', '),
                    variant: 'error'
                })
            );
        } else if (data) {
            //alert('getRecord: homePageId = ' + this.homePageId);

            this.theHomepageRecord = data;
            this.theTargetMiles = getFieldValue(data, TARGETMILES_FIELD);
            this.theRunsCompleted = getFieldValue(data, RUNSCOMPLETED_FIELD);
            this.theMilesToGo = getFieldValue(data, MILESTOGO_FIELD);
            this.theDescription = getFieldValue(data, DESCRIPTION_FIELD);
            this.theDaysLeft = getFieldValue(data, DAYSLEFT_FIELD);
            this.theCurrentMiles = getFieldValue(data, CURRENTMILES_FIELD);
            this.theFundraisingPage = getFieldValue(data, FUNDRAISINGPAGE_FIELD);
            this.theDaysToStart = getFieldValue(data, DAYSTOSTART_FIELD);
            this.theScoreboardId = getFieldValue(data, SCOREBOARD_FIELD);

            this.theDaysLeft = this.theDaysLeft > 0 ? this.theDaysLeft : 0;

            GetContactForHomePageId({ homePageId: this.homePageId }).then(result => {
                this.theRelatedContact = result;
                this.theRelatedContactName = result.Name;
                this.theRelatedContactFirstname = this.theRelatedContactName.split(" ")[0];
                this.theEmail = result.Email;

                //
                // Compute all the boolean variables to switch the progess messages
                //

                // TODO:- Get the starting date from the scoreboard why doesn't this work?

                //alert('GetScoreboardForId: theScoreboardId = ' + this.theScoreboardId);
                /*             GetScoreboardForId({ scoreboardId: this.theScoreboardId }).then(result => {
                                this.theScoreboardRecord = result;
                                this.theStartDate = result.T4R_Campaign_start_date__c;
                            }); */
                //alert('GetScoreboardForId: theStartDate = ' + this.theStartDate + 'Scoreboard = ' + this.theScoreboardRecord);

                this.theStartDate = '23rd May';

                // We are getting ready
                this.gettingReady = this.theDaysToStart > 0;
                //alert('handleNewRunEvent: gettingReady = ' + this.gettingReady + '; theDaysToStart = ' + this.theDaysToStart);

                // The starting pistol has fired!
                this.startsToday = this.theDaysToStart == 0;
                //alert('handleNewRunEvent: startsToday = ' + this.startsToday + '; theDaysToStart = ' + this.theDaysToStart);

                // The 40 days are up.  Keep Angie's page active.
                this.isFinished = this.theDaysLeft <= 0 && this.theEmail != 'angie@angiegooderhamstore.com';
                //alert('handleNewRunEvent: isFinished = ' + this.isFinished + '; theDaysLeft = ' + this.theDaysLeft + '; theEmail = ' + this.theEmail);

                // Disable logging before and after event
                this.isDisabled = this.gettingReady || this.isFinished;
                //alert('handleNewRunEvent: isDisabled = ' + this.isDisabled);

                // The celebration!!!  Switch off when the 40 days are up.
                this.hasReachedTarget = this.theCurrentMiles >= this.theTargetMiles ? true : false;
                this.hasReachedTarget = this.hasReachedTarget && !this.isFinished;
                //alert('handleNewRunEvent: hasReachedTarget = ' + this.hasReachedTarget);
            });
        }
    }

    // --------------------------------------------------------------------------------
    handleNewRunEvent(event) {
        //alert('handleNewRunEvent: gettingReady = ' + this.gettingReady + '; isFinished = ' + this.isFinished);

        GetHomePageForId({ recordId: this.homePageId }).then(result => {
            this.theMilesToGo = result.T4R_Miles_to_go__c;
            this.theCurrentMiles = result.T4R_Current_miles__c;
        })

        //alert('handleNewRunEvent: latestRunMileage = ' + event.detail.latestRunMileage);
        UpdateHomePageLatestRunDistance({ homePageId: this.homePageId, miles: event.detail.latestRunMileage })
    }

    // --------------------------------------------------------------------------------
    handleChangeMiles(event) {
        //alert('handleChangeMiles: new target = ' + this.newTargetMiles);
        this.newTargetMiles = event.target.value;
    }

    // --------------------------------------------------------------------------------
    handleSaveMiles() {
        //alert('handleSaveMiles: new target = ' + this.newTargetMiles);
        this.theTargetMiles = this.newTargetMiles;
        this.theMilesToGo = this.theTargetMiles - this.theCurrentMiles;

        UpdateHomePage({ homePageId: this.homePageId, miles: this.theTargetMiles })

        /*         .then(result => {
                    alert('handleSaveMiles: read home page = ' + result.Id);
                }) */

        this.newTargetMiles = '';
    }
}