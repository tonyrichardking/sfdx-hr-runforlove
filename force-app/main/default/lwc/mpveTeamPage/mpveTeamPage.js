// --------------------------------------------------------------------------------
// DON'T FORGET THE 'this.' !!!!!!!!!!!!!!!!!!!!!!!!!!
//
// hrRunForLoveHomeTest1
// --------------------------------------------------------------------------------

import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import MPVE_CreateTeamForHomePage from '@salesforce/apex/HR_RFL_AppController.MPVE_CreateTeamForHomePage';
import MPVE_ReadTeamsForHomePageNullResult from '@salesforce/apex/HR_RFL_AppController.MPVE_ReadTeamsForHomePageNullResult';

export default class MpveTeamPage extends LightningElement {
    @api homepageid;
    @api teamPageId;

    // Teams
    theTeams;
    theNewTeam;

    // UI
    theInputTeamName;           // input field variable
    @track theNewTeamName;      // trigger a reload when written

    //Debug
    error;
    errorMessage;

    // --------------------------------------------------------------------------------
    // initialisation
    //
    connectedCallback() {

        // set up debugging

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();  
        this.theDateToday = dd + '/' + mm + '/' + yyyy;

        // initialise the teams

        //this.initialiseTeams();
    }

    initialiseTeams() {
        ReadCampaignForName({ campaignName: theRandMCampaignName })
            .then((result) => {
                if (result != null) {
                    this.theRandMCampaign = result;
                    this.theRandMCampaignId = result.Id;
                    this.errorMessage = 'result OK;'
                }
                else {
                    this.theRandMCampaign = undefined;
                    this.errorMessage = 'result was null;'
                }
            })
            .then((result) => {
                // do something             
            })
    }

    // Reactive variables are prefixed with $.  If a reactive variable changes, the wire service provisions new data
    // @wire decorates a private property or function that receives the stream of data from the wire service. 
    // If a property is decorated with @wire, the results are returned to the property’s data property or error property. 
    // If a function is decorated with @wire, the results are returned in an object with a data property and an error property.
    // Be careful to either use 'property.data', or to set a property with the value of 'data' to use in the page.
    @wire(MPVE_ReadTeamsForHomePageNullResult, { homeId: '$homepageid' })
    wiredTeamRecords({ error, data }) {
        if (error) {
            this.error = error;
            this.errorMessage = reduceErrors(error);
            //alert('Error: homePageId = ' + this.homepageid + ' error = ' + this.errorMessage);
        } else if (data) {
            //alert('Got data; homePageId = ' + this.homepageid + ' data = ' + data);

            if (data === null) {
                alert('data = null');
            }

            this.theTeams = data;
        }
        else {
            //alert('No data; homePageId = ' + this.homepageid);
        }
    }

    // --------------------------------------------------------------------------------
    handleChangeTeamName(event) {
        this.theInputTeamName = event.target.value;
        //alert('handleChangeTeamName: new team = ' + this.theUpdatedTeamName);
    }

    // --------------------------------------------------------------------------------
    handleCreateTeam() {
        alert('handleCreateTeam; homePageId = ' + this.homepageid);

        MPVE_CreateTeamForHomePage({ homePageId: this.homepageid, teamName: this.theInputTeamName }).then(
            (result) => {
                this.theNewTeam = result;
                this.teamAdded();
            })
            .catch(error => {
                this.error = error;
            });
    }
  
    // --------------------------------------------------------------------------------
    teamAdded() {
        //alert('teamAdded')

        this.theNewTeamName = this.theInputTeamName;
        this.theInputTeamName = "";
        refreshApex(this.homepageid);
    }
}
