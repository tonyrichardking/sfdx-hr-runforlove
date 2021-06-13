// -----------------------------------------------------------------------
// <copyright file="mpveTeamDashboard.js">
// Copyright (c) Choose Love and Tony King. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import MPVE_CreateTeamForHomePage from '@salesforce/apex/HR_RFL_AppController.MPVE_CreateTeamForHomePage';
import MPVE_ReadTeamsForHomePage from '@salesforce/apex/HR_RFL_AppController.MPVE_ReadTeamsForHomePage';
import GetContactForHomePageId from "@salesforce/apex/HR_RFL_AppController.GetContactForHomePageId";
import MPVE_ReadProfileForHomePage from "@salesforce/apex/HR_RFL_AppController.MPVE_ReadProfileForHomePage";
import GetTeamHomePagesForHome from "@salesforce/apex/HR_RFL_AppController.GetTeamHomePagesForHome";
import MPVE_ReadTeamForHomePage from "@salesforce/apex/HR_RFL_AppController.MPVE_ReadTeamForHomePage";


export default class MpveTeamPage extends LightningElement {

    //
    // public properties
    //

    @api homepageid;
    @api teamPageId;

    // --------------------------------------------------------------------------------
    // Lifecycle hooks
    //

    // Called when the element is inserted into a document.
    connectedCallback() {

        //alert('connectedCallback');

        // set up debugging

        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        this.theDateToday = dd + '/' + mm + '/' + yyyy;

        this.getContact();
        this.getProfile();
        this.getTeamHomePagesForHome();
        this.getTeam();
    }

    // Called after every render of the component.
    renderedCallback() {

        //alert('renderedCallback');
    }

    //
    // Debug
    //

    error;
    errorMessage;

    //
    // Contact
    //

    theRelatedContact;
    theRelatedContactName;
    theRelatedContactFirstname;

    getContact() {

        GetContactForHomePageId({ homePageId: this.homepageid })
            .then((result) => {
                this.theRelatedContact = result;
                this.theRelatedContactName = result.Name;
                this.theRelatedContactFirstname = this.theRelatedContactName.split(
                    " "
                )[0];
            })
            .then((result) => {
                // do something             
            })

        //alert('getContact: theEnableProfile = ' + this.theEnableProfile);
    }

    //
    // Profile
    //

    theProfile;
    theProfileScreenName;

    getProfile() {

        MPVE_ReadProfileForHomePage({ homeId: this.homepageid })
            .then((result) => {
                if (result != null) {
                    this.theProfile = result;
                    this.theProfileScreenName = result.T4R_MPVE_Screen_name__c;
                }
                else {
                    this.theProfile = null;
                }
            })
            .then((result) => {
                // do something             
            })
    }

    //
    // Team Home Pages
    //

    theTeamHomePages;

    getTeamHomePagesForHome() {

        GetTeamHomePagesForHome({ homeId: this.homepageid })
            .then((result) => {
                if (result != null) {
                    this.theTeamHomePages = result;
                }
                else {
                    this.theTeamHomePages = null;
                }
            })
            .then((result) => {
                // do something             
            })
    }

    //
    // Teams
    //

    // Reactive variables are prefixed with $.  If a reactive variable changes, the wire service provisions new data
    // @wire decorates a private property or function that receives the stream of data from the wire service. 
    // If a property is decorated with @wire, the results are returned to the property’s data property or error property. 
    // If a function is decorated with @wire, the results are returned in an object with a data property and an error property.
    // Be careful to either use 'property.data', or to set a property with the value of 'data' to use in the page.
    // Be careful to use the <property>.data in the 'for:each={...}' iterator
    // Be careful to use the <property>.data in the 'if:true' template property  
    @wire(MPVE_ReadTeamForHomePage, { homeId: '$homepageid' }) myTeam;

    @track hasTeam = false;
    theNewTeam;

    getTeam() {

        MPVE_ReadTeamForHomePage({ homeId: this.homepageid })
            .then((result) => {
                if (result != null) {
                    this.hasTeam = true;
                }
                else {
                    this.hasTeam = false;
                }
            })
            .then((result) => {
                // do something             
            })
    }

    //
    // Create Team Form
    //

    theInputTeamName;           // input field variable
    theNewTeamName;

    // --------------------------------------------------------------------------------
    handleSetTeamName(event) {
        this.theInputTeamName = event.target.value;
        //alert('handleSetTeamName: new team = ' + this.theUpdatedTeamName);
    }

    theInputTeamDescription;           // input field variable
    theNewTeamDescription;

    // --------------------------------------------------------------------------------
    handleSetTeamDescription(event) {
        this.theInputTeamDescription = event.target.value;
        //alert('handleSetTeamDescription: new team = ' + this.theUpdatedTeamName);
    }

    theInputTeamMotivation;           // input field variable
    theNewTeamMotivation;

    // --------------------------------------------------------------------------------
    handleSetTeamMotivation(event) {
        this.theInputTeamMotivation = event.target.value;
        //alert('handleSetTeamMotto: new team = ' + this.theUpdatedTeamName);
    }

    theInputTeamMotto;           // input field variable
    theNewTeamMotto;

    // --------------------------------------------------------------------------------
    handleSetTeamMotto(event) {
        this.theInputTeamMotto = event.target.value;
        //alert('handleSetTeamMotto: new team = ' + this.theUpdatedTeamName);
    }

    // --------------------------------------------------------------------------------
    handleCreateTeam() {
        //alert('handleCreateTeam; homePageId = ' + this.homepageid);

        MPVE_CreateTeamForHomePage({
            homePageId: this.homepageid, teamName: this.theInputTeamName, teamDescription: this.theInputTeamDescription,
            teamMotivation: this.theInputTeamMotivation, teamMotto: this.theInputTeamMotto
        }).then(
            (result) => {
                this.theNewTeam = result;
                this.theNewTeamName = this.theInputTeamName;
                this.theNewTeamDescription = this.theInputTeamDescription;
                this.theNewTeamMotivation = this.theInputTeamMotivation;
                this.theNewTeamMotto = this.theInputTeamMotto;
                this.theInputTeamName = "";
                this.theInputTeamDescription = "";
                this.theInputTeamMotivation = "";
                this.theInputTeamMotto = "";

                refreshApex(this.myTeam);
            })
            .then((result) => {
                this.hasTeam = true;
            })
            .catch(error => {
                this.error = error;
            });
    }
}
