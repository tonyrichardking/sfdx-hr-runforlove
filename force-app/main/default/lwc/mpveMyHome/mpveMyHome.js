// --------------------------------------------------------------------------------
// DON'T FORGET THE 'this.' !!!!!!!!!!!!!!!!!!!!!!!!!!
//
// mpveMyHome
// --------------------------------------------------------------------------------

import { LightningElement, track, api, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import GetContactForHomePageId from "@salesforce/apex/HR_RFL_AppController.GetContactForHomePageId";
import MPVE_ReadProfileForHomePage from "@salesforce/apex/HR_RFL_AppController.MPVE_ReadProfileForHomePage";

export default class MpveMyHome extends LightningElement {

  //
  // public properties
  //

  @api homePageId;

  //Debug
  theDateToday;

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

    this.resetPanes();
    this.getContact();
    this.theEnableActivities = true;
  }

  // Called after every render of the component.
  renderedCallback() {

    //alert('renderedCallback');

    this.getProfile();
  }

  // Creates an error boundary component that captures errors in all the descendent components in its tree.
  error;
  errorMessage;
  stack;
  errorCallback(error, stack) {
    this.error = error;
    this.errorMessage = reduceErrors(error);
    alert('errorCallback: error = ' + this.errorMessage);
  }

  //
  // Contact
  //

  theRelatedContact;
  theRelatedContactName;
  theRelatedContactFirstname;

  getContact() {

    GetContactForHomePageId({ homePageId: this.homePageId })
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

  theEnableProfile = false;
  theProfile;

  getProfile() {

    MPVE_ReadProfileForHomePage({ homeId: this.homePageId })
      .then((result) => {
        if (result != null) {
          this.theProfile = result;
          this.errorMessage = 'result OK;'
        }
        else {
          this.theProfile = null;
          this.errorMessage = 'result was null;'
        }
      })
      .then((result) => {
        // do something             
      })
  }

  // --------------------------------------------------------------------------------
  // Enable the Profile pane when selected
  handleProfile() {
    this.resetPanes();
    this.theEnableProfile = true;
    //alert('handleProfile: theEnableProfile = ' + this.theEnableProfile);
  }

  //
  // Activities
  //

  theEnableActivities = false;

  // --------------------------------------------------------------------------------
  // Enable the Activities pane when selected
  handleActivities() {
    this.resetPanes();
    this.theEnableActivities = true;
    //alert('handleActivities: theEnableActivities = ' + this.theEnableActivities);
  }

  //
  // Teams
  //

  theEnableTeams = false;

  // --------------------------------------------------------------------------------
  // Enable the Teams pane when selected
  handleTeams() {
    this.resetPanes();
    this.theEnableTeams = true;
    //alert('handleTeams: theEnableTeams = ' + this.theEnableTeams);
  }

  //
  // Follow
  //

  theEnableFollow = false;

  // --------------------------------------------------------------------------------
  // Enable the Follow pane when selected
  handleFollow() {
    this.resetPanes();
    this.theEnableFollow = true;
    //alert('handleFollow: theEnableFollow = ' + this.theEnableFollow);
  }

  //
  // Chat
  //

  theEnableChat = false;

  // --------------------------------------------------------------------------------
  // Enable the Chat pane when selected
  handleChat() {
    this.resetPanes();
    this.theEnableChat = true;
    //alert('handleChat: theEnableChat = ' + this.theEnableChat);
  }

  //
  // Page
  //

  resetPanes() {
    this.theEnableProfile = false;
    this.theEnableActivities = false;
    this.theEnableTeams = false;
    this.theEnableFollow = false;
    this.theEnableChat = false;
  }
}