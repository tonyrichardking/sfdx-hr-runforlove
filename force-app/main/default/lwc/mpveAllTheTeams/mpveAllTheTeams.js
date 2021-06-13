// -----------------------------------------------------------------------
// <copyright file="mpveAllTheTeams.js">
// Copyright (c) Choose Love and Tony King. All rights reserved.
// </copyright>
// -----------------------------------------------------------------------

import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import MPVE_ReadTeamsForHomePage from '@salesforce/apex/HR_RFL_AppController.MPVE_ReadTeamsForHomePage';
import MPVE_SearchTeams from '@salesforce/apex/HR_RFL_AppController.MPVE_SearchTeams';

// The delay used when debouncing event handlers before invoking Apex.
const DELAY = 300;

export default class MpveAllTheTeams extends LightningElement {

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

        //this.getTeams();
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
    // Teams
    //

    // Reactive variables are prefixed with $.  If a reactive variable changes, the wire service provisions new data
    // @wire decorates a private property or function that receives the stream of data from the wire service. 
    // If a property is decorated with @wire, the results are returned to the property’s data property or error property. 
    // If a function is decorated with @wire, the results are returned in an object with a data property and an error property.
    // Be careful to either use 'property.data', or to set a property with the value of 'data' to use in the page.
    // Be careful to use the <property>.data in the 'for:each={...}' iterator
    // Be careful to use the <property>.data in the 'if:true' template property  
    @wire(MPVE_ReadTeamsForHomePage, { homeId: '$homepageid' }) theTeams;

    getTeams() {

        MPVE_ReadTeamsForHomePage({ homeId: this.homepageid })
            .then((result) => {
                if (result != null) {
                    this.theTeams = result;
                }
                else {
                    this.theTeams = null;
                }
            })
            .then((result) => {
                // do something             
            })
    }

    //
    // Search Team Form
    //

    @wire(MPVE_SearchTeams, { searchKey: '$theSearchKey' }) theSearchTeams;

    theSearchKey = '';

    // --------------------------------------------------------------------------------
    handleSearchTeam(event) {
        // Debouncing this method: Do not update the reactive property as long as this function is
        // being called within a delay of DELAY. This is to avoid a very large number of Apex method calls.

        //alert('handleSearchTeam: new team = ' + this.theUpdatedTeamName);

        window.clearTimeout(this.delayTimeout);
        const searchKey = event.target.value;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.theSearchKey = searchKey;
        }, DELAY);
    }
}
