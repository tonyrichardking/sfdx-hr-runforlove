import { LightningElement, api, wire } from 'lwc';
import { refreshApex } from '@salesforce/apex';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

// from HR_RFL_AppController
import getCampaignIdForName from '@salesforce/apex/HR_RFL_AppController.getCampaignIdForName';
import getScoreboardForCampaignId from '@salesforce/apex/HR_RFL_AppController.getScoreboardForCampaignId';
import GetLimitedHomePages from '@salesforce/apex/HR_RFL_AppController.GetLimitedHomePages';

import STAR_PURPLE_ICON from '@salesforce/resourceUrl/star_purple';
import STAR_GREEN_ICON from '@salesforce/resourceUrl/star_green';
import STAR_PINK_ICON from '@salesforce/resourceUrl/star_pink';
import STAR_YELLOW_ICON from '@salesforce/resourceUrl/star_yellow';

import RUNNER_PURPLE_ICON from '@salesforce/resourceUrl/runner_purple';

export default class HrRunForLoveScoreboard extends LightningElement {

    @api campaignname = 'Around The World In 40 Days';

    // Scoreboard
    theScoreboard;
    theCampaignId;
    theScoreboard;
    theScoreboardName;
    theTotalMilesPledged;
    theTotalMilesCompleted;
    theMilesToReachTarget;
    theDaysToGo;
    theCollectiveTargetMiles;
    theTotalRunsCompleted;
    theTotalRunners;
    theFundraisingTotal;
    theFundraisingTarget;
    theFundraisingAmountToGo;

    // HomePages
    theHomePages;
    theError;

    // Expose the static resource URL for use in the template
    star_purple = STAR_PURPLE_ICON;
    star_green = STAR_GREEN_ICON;
    star_pink = STAR_PINK_ICON;
    star_yellow = STAR_YELLOW_ICON;

    runner_purple = RUNNER_PURPLE_ICON;

    // Home page offset and count
    theHomePageOffset = 0;
    theHomePageCount = 5;

    // Is there a fundraising page?
    isFundraisingPage;

    @wire(getCampaignIdForName, { campaignName: '$campaignname' })
    wiredRecord({ error, data }) {
        if (error) {
            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Error loading campaign',
                    //message: reduceErrors(error).join(', '),
                    variant: 'error'
                })
            );
        } else if (data) {
            //alert('getCampaignIdForName:');

            this.theCampaignId = data;

            getScoreboardForCampaignId({ campaignId: this.theCampaignId }).then(result => {
                this.theScoreboard = result;
                this.theScoreboardName = result.Name;
                this.theTotalMilesPledged = result.T4R_Total_miles_pledged__c;
                this.theTotalMilesCompleted = result.T4R_Total_miles_completed__c;
                this.theMilesToReachTarget = result.T4R_Miles_to_reach_target__c;
                this.theDaysToGo = result.T4R_Days_to_go__c;
                this.theCollectiveTargetMiles = result.T4R_Collective_target_miles__c;
                this.theTotalRunsCompleted = result.T4R_Total_runs_completed__c;
                this.theTotalRunners = result.T4R_Total_runners__c;
                this.theFundraisingTotal = result.T4R_Fundraising_total__c;
                this.theFundraisingTarget = result.T4R_Fundraising_target__c;
                this.theFundraisingAmountToGo = result.T4R_Fundraising_amount_to_go__c;

                // Load the totaliser
                var percentage = (this.theTotalMilesCompleted / this.theCollectiveTargetMiles) * 100;
                this.loadTotaliser(percentage);

            }).then(
                GetLimitedHomePages({ start: this.theHomePageOffset, count: this.theHomePageCount }).then(result => {
                    this.theHomePages = result;
                }))
        }
    }

    //
    // Totaliser
    //

    loadTotaliser(percent) {
        //alert('loadTotaliser - percent' + percent)

        // clean percent: if higher than 100%, set 100%; if lower than 0%, set 0%
        var widthPercent = percent > 100 ? 100 : percent;
        widthPercent = widthPercent < 0 ? 0 : widthPercent;
        widthPercent = Math.round(widthPercent);

        const progressLabel = this.template.querySelector('.progress-label');
        const progressBar = this.template.querySelector('.progress-bar');

        // set label
        progressLabel.innerHTML = widthPercent + '%';

        // set width
        progressBar.style.width = widthPercent + '%';
    }

    // --------------------------------------------------------------------------------
    handleMore() {
        //alert('handleMore');

        this.theHomePageOffset = this.theHomePageOffset + 5;
        GetLimitedHomePages({ start: this.theHomePageOffset, count: this.theHomePageCount }).then(result => {
            this.theHomePages = result;
        })
    }

    /*     
    _isRendered;
        renderedCallback() {
            if (this._isRendered) return;
            this._isRendered = true;
        } 
    */
}