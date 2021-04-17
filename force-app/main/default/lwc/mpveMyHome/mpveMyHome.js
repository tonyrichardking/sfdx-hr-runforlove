// --------------------------------------------------------------------------------
// DON'T FORGET THE 'this.' !!!!!!!!!!!!!!!!!!!!!!!!!!
//
// mpveMyHome
// --------------------------------------------------------------------------------

import { LightningElement, track, api, wire } from "lwc";
import { reduceErrors } from "c/ldsUtils";

// from HR_RFL_AppController
import GetContactForHomePageId from "@salesforce/apex/HR_RFL_AppController.GetContactForHomePageId";

export default class MpveMyHome extends LightningElement {

  //
  // public properties
  //

  @api homePageId;

  //Debug
  error;
  errorMessage;
  theDateToday;

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

    this.resetPanes();
    this.getContact();
    this.theEnableActivities = true;
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

  handleProfile() {
    this.resetPanes();
    this.theEnableProfile = true;
    //alert('handleProfile: theEnableProfile = ' + this.theEnableProfile);
  }

  //
  // Activities
  //

  theEnableActivities = false;

  handleActivities() {
    this.resetPanes();
    this.theEnableActivities = true;
    //alert('handleActivities: theEnableActivities = ' + this.theEnableActivities);
  }

  //
  // Teams
  //

  theEnableTeams = false;

  handleTeams() {
    this.resetPanes();
    this.theEnableTeams = true;
    //alert('handleTeams: theEnableTeams = ' + this.theEnableTeams);
  }

  //
  // Follow
  //

  theEnableFollow = false;

  handleFollow() {
    this.resetPanes();
    this.theEnableFollow = true;
    //alert('handleFollow: theEnableFollow = ' + this.theEnableFollow);
  }

  //
  // Chat
  //

  theEnableChat = false;

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