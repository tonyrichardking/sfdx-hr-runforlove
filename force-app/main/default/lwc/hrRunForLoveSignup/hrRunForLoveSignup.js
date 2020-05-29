import { LightningElement } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import EnsureContact from '@salesforce/apex/HR_RFL_AppController.EnsureContact';
import EnsureVolHoursForJob from '@salesforce/apex/HR_RFL_AppController.EnsureVolHoursForJob';
import CreateHomePage from '@salesforce/apex/HR_RFL_AppController.CreateHomePage';

export default class HrRunForLoveSignup extends LightningElement {

    showSignup = true;
    showRequiredError = false;

    gdprValue = '';
    newsletterValue = '';

    theFirstname = '';
    theLastname = '';
    theEmail = '';
    theMiles = '';
    theSelectTos = false;

    theVolHours;

    // --------------------------------------------------------------------------------
    // Handle the inputs
    handleFirstname(event) {
        // alert('handleFirstname: theFirstname = ' + event.target.value);
        this.theFirstname = event.target.value;
    }

    handleLastname(event) {
        // alert('handleLastname: theLastname = ' + event.target.value);
        this.theLastname = event.target.value;
    }

    handleEmail(event) {
        // alert('handleEmail: theEmail = ' + event.target.value);
        this.theEmail = event.target.value;
    }

    handleMiles(event) {
        // alert('handleMiles: theMiles = ' + event.target.value);
        this.theMiles = event.target.value;
    }

    handleTos() {
        this.theSelectTos = !this.theSelectTos;
        //alert('handleTos: theSelectTos = ' + this.theSelectTos);
    }

    // --------------------------------------------------------------------------------
    // GDPR agreement and newsletter signup.

    get gdprOptions() {
        return [
            { label: 'I Agree', value: 'agree' },
        ];
    }

    handleGdprAgreement(event) {
        this.gdprValue = event.detail.value;
        //alert('handleGdprAgreement: value = ' + this.gdprValue);
    }

    get newsletterOptions() {
        return [
            { label: 'Yes', value: 'yes' },
            { label: 'No', value: 'no' },
        ];
    }

    handleNewsletterAgreement(event) {
        this.newsletterValue = event.detail.value;
        //alert('handleNewsletterAgreement: value = ' + this.newsletterValue);
    }

    // --------------------------------------------------------------------------------
    // Save the signup information.
    // If the Contact exists use it; create a new one otherwise.
    // If a Volunteer Hours exists for a 'Run For Love' do no more; create one and a home page otherwise
    handleSave() {
        /*         alert('handleSave: Firstname = ' + this.theFirstname + ', Lastname = ' + this.theLastname + ', Email = '
                    + this.theEmail + ', gdpr = ' + this.gdprValue + ', newsletter = ' + this.newsletterValue); */

        const runnerJobName = 'Around The World In 40 Days - Runner';
        const toSJobName = 'Around The World In 40 Days - ToS';
        var aroundTheWorldJobName = this.theSelectTos ? toSJobName : runnerJobName;

        var selectAgreeGdpr = this.gdprValue == 'agree' ? true : false;
        var selectAgreeNewsletter = this.newsletterValue == 'yes' ? true : false;

        if (this.theFirstname == '' || this.theLastname == '' || this.theEmail == '' || this.theMiles == ''
            || this.gdprValue == '' || this.newsletterValue == '') {

            //  All the required combos must have a value selected
            //alert('Both gdpr and newsletter combos must have a value selected');
            this.showRequiredError = true;

        } else {
            EnsureContact({ firstname: this.theFirstname, lastname: this.theLastname, email: this.theEmail, gdpr: selectAgreeGdpr, newsletter: selectAgreeNewsletter }).then(result => {
                EnsureVolHoursForJob({ contactId: result.Id, jobName: aroundTheWorldJobName }).then(result => {
                    if (result != null) {
                        CreateHomePage({ volHoursId: result.Id, miles: this.theMiles });
                    }
                });
            }).catch(error => {
                this.error = error;
            })

            this.dispatchEvent(
                new ShowToastEvent({
                    title: 'Success',
                    message: 'Your information has been saved',
                    variant: 'success'
                })
            );

            // change the component view
            this.showRequiredError = false;
            this.showSignup = false;
        }
    };
}