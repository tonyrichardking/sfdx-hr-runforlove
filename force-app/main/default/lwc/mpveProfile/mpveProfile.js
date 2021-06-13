import { LightningElement, track, api, wire } from "lwc";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import MPVE_CreateProfileForHomePage from '@salesforce/apex/HR_RFL_AppController.MPVE_CreateProfileForHomePage';

export default class MpveProfile extends LightningElement {

    //
    // Public properties
    //

    @api homepageid;

    //
    // Debug
    //

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

        // initialise something

        //this.initialiseSomething();
    }

    //
    // Form to create a Profile
    //

    @track theInputScreenName;
    @track theInputProfileDescription;
    @track theGlobalProfileVisibility;
    @track theGlobalContactVisibility;

    handleChangeScreenName(event) {
        // alert('handleTime: theTime = ' + event.target.value);
        this.theInputScreenName = event.target.value;
    }

    handleChangeProfileDescription(event) {
        this.theInputProfileDescription = event.target.value;
    }

    handleGlobalProfileVisibility(event) {
        this.theGlobalProfileVisibility = !this.theGlobalProfileVisibility;
    }

    handleGlobalContactVisibility(event) {
        this.theGlobalContactVisibility = !this.theGlobalContactVisibility;
    }

    //
    // Create Profile Button
    //

    theProfile;

    // --------------------------------------------------------------------------------
    handleCreateProfile() {
        alert('handleCreateProfile; homePageId = ' + this.homepageid);

        MPVE_CreateProfileForHomePage({ homeId: this.homepageid, screenName: this.theInputScreenName, aboutMe: this.theInputProfileDescription }).then(
            (result) => {
                alert('Screen name = ' + result.T4R_MPVE_Screen_name__c);                
                this.theProfile = result;

                // fire an event up to the home page to display profile and configure buttons
                const runEvent = new CustomEvent('newprofile', {
                    detail: {
                        newProfile: this.theProfile
                    }
                });

                this.dispatchEvent(runEvent);
            })
            .then(() => {
                this.handleReset();
            })
            .catch(error => {
                this.error = error;
                this.errorMessage = reduceErrors(error);
                alert('Error: homePageId = ' + this.homepageid + ' error = ' + this.errorMessage);
            });
    }

    // --------------------------------------------------------------------------------
    handleReset() {
        //alert('handleReset')

        this.theInputScreenName = '';
        this.theInputProfileDescription = '';
        this.theGlobalProfileVisibility = 'false';
        this.theGlobalContactVisibility = 'false';
    }
}