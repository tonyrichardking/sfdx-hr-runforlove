//
// Log
//
// 18/1/2021 changed to without sharing 
// 18/1/2021 in GetHomePageForId set cacheable=true
// 21/1/2021 added T4R_Run_For_Love_Scoreboard__c to GetHomePageForId

public without sharing class HR_RFL_AppController 
{
    public string conid {get;set;}

    public HR_RFL_AppController() 
    {
        conid  = ApexPages.currentPage().getParameters().get('conid');
    }

    //
    // Contacts
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static Contact GetContactForId(string contactId) 
    {
        //system.debug('getContactForId: contactId = ' + contactId);
    
        return [
            SELECT Id, Name
            FROM Contact
            WHERE Id =: contactId
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }  

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static Contact GetContactForHomePageId(string homePageId) 
    {
        system.debug('getContactForHomePageId: homePageId = ' + homePageId);

        T4R_Run_For_Love_Home__c homePage = GetHomePageForId(homePageId);
        string volHoursId = homePage.T4R_Related_Runner__c;

        GW_Volunteers__Volunteer_Hours__c volHours =  GetVolunteerHoursForId(volHoursId);
        string contactId = volHours.GW_Volunteers__Contact__c;

        Contact contact = GetContactForId(contactId);

        return contact;
    }    

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static Contact EnsureContact(string firstname, string lastname, string email, boolean gdpr, boolean newsletter) 
    {
        //system.debug('EnsureContact: firstname = ' + firstname + 'lastname = ' + lastname + 'email = ' + email + 'gdpr = ' + gdpr + 'newsletter = ' + newsletter);

        string fullName = firstname + ' ' + lastname;
            
        List<Contact> existingContacts = [
            SELECT Id, Name, Email, Permit_Contact_del__c, T4R_Receive_emails__c
            FROM Contact
            WHERE Email =: email AND Name =: fullName
            //WITH SECURITY_ENFORCED
        ];

        //system.debug('EnsureContacts: existingContact = ' + existingContacts);

        if(!existingContacts.isEmpty())
        {
            system.debug('EnsureContact: existingContact != null');
            return existingContacts.get(0);
        }

        Contact newContact = new Contact();
        newContact.Firstname = firstname;     
        newContact.Lastname = lastname;   
        newContact.Email = email;
        newContact.Permit_Contact_del__c = gdpr;
        newContact.T4R_Receive_emails__c = newsletter ? 'Yes' : 'No';

        //system.debug('EnsureContact: newContact = ' + newContact);

        try 
        {
            insert newContact;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        } 

        return newContact;
    } 

    //
    // Volunteer Hours
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static GW_Volunteers__Volunteer_Hours__c getVolunteerHoursForId(string volHoursId) 
    {
        //system.debug('getVolunteerHoursForId: volHoursId = ' + volHoursId);

        return [
            SELECT Id, Name, GW_Volunteers__Contact__c, GW_Volunteers__Volunteer_Campaign__c
            FROM GW_Volunteers__Volunteer_Hours__c
            WHERE Id =: volHoursId
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }  

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static GW_Volunteers__Volunteer_Hours__c EnsureVolHoursForJob(string contactId, string jobName) 
    {
        //system.debug('EnsureVolHoursForJob: contactId = ' + contactId + 'jobName = ' + jobName);

        GW_Volunteers__Volunteer_Job__c job = GetJobForName(jobName);

        List<GW_Volunteers__Volunteer_Hours__c> existingVolHours = [
            SELECT Id, GW_Volunteers__Volunteer_Job__c, GW_Volunteers__Contact__c
            FROM GW_Volunteers__Volunteer_Hours__c
            WHERE GW_Volunteers__Volunteer_Job__c =: job.Id AND GW_Volunteers__Contact__c =: contactId
            //WITH SECURITY_ENFORCED
        ];

        if(!existingVolHours.isEmpty())
        {
            //system.debug('EnsureVolHoursForJob: found an existing VolHours = ' + existingVolHours);            
            return null;
        }

        //system.debug('EnsureVolHoursForJob: creating a new VolHours = ');

        GW_Volunteers__Volunteer_Hours__c newVolHours = new GW_Volunteers__Volunteer_Hours__c();
        newVolHours.GW_Volunteers__Contact__c = contactId;
        newVolHours.GW_Volunteers__Volunteer_Job__c = job.Id;
        newVolHours.GW_Volunteers__Status__c = 'Web Sign Up';
        newVolHours.GW_Volunteers__Start_Date__c = Date.today();
    
        try 
        {
            insert newVolHours;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        } 
   
        return newVolHours;
    }  
 
    //
    // Campaigns
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static Campaign getCampaignForName(string campaignName) 
    {
        //system.debug('getCampaignForName: campaignName = ' + campaignName);

        return [
            SELECT Id, Name, Type
            FROM Campaign
            WHERE Name =: campaignName
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }  

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static string getCampaignIdForName(string campaignName) 
    {
        system.debug('getCampaignIdForName: campaignName = ' + campaignName);

        Campaign campaign = getCampaignForName(campaignName);

        return campaign.Id;
    }

    //
    // Jobs
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static GW_Volunteers__Volunteer_Job__c GetJobForName(string jobName) 
    {
        //system.debug('GetJobForName: campaignName = ' + campaignName);

        return [
            SELECT Id, Name, GW_Volunteers__Campaign__c
            FROM GW_Volunteers__Volunteer_Job__c
            WHERE Name =: jobName
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }  

    //
    // Scoreboard
    //

        // --------------------------------------------------------------------------------
        @AuraEnabled(cacheable=true)
        public static T4R_Run_For_Love_Scoreboard__c GetScoreboardForId(string scoreboardId) 
        {
        system.debug('getScoreboardForId: scoreboardId = ' + scoreboardId);
    
        T4R_Run_For_Love_Scoreboard__c scoreboard = [
                SELECT Id, Name, T4R_Total_miles_pledged__c, T4R_Total_miles_completed__c, 
                    T4R_Miles_to_reach_target__c, T4R_Days_to_go__c, T4R_Collective_target_miles__c, 
                    T4R_Total_runs_completed__c, T4R_Total_runners__c, T4R_Campaign__c, 
                    T4R_Campaign_start_date__c, T4R_Fundraising_total__c,
                    T4R_Fundraising_target__c, T4R_Fundraising_amount_to_go__c
                FROM T4R_Run_For_Love_Scoreboard__c
                WHERE Id =: scoreboardId
                //WITH SECURITY_ENFORCED
                LIMIT 1
            ];

            system.debug('getScoreboardForId: T4R_Campaign_start_date__c = ' + scoreboard.T4R_Campaign_start_date__c);
            
            return scoreboard;
        } 

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static T4R_Run_For_Love_Scoreboard__c getScoreboardForCampaignId(string campaignId) 
    {
        //system.debug('getScoreboardForCampaignId: campaignId = ' + campaignId);

        return [
            SELECT Id, Name, T4R_Total_miles_pledged__c, T4R_Total_miles_completed__c, 
                T4R_Miles_to_reach_target__c, T4R_Days_to_go__c, T4R_Collective_target_miles__c, 
                T4R_Total_runs_completed__c, T4R_Total_runners__c, T4R_Campaign__c, 
                T4R_Campaign_start_date__c, T4R_Fundraising_total__c,
                T4R_Fundraising_target__c, T4R_Fundraising_amount_to_go__c
            FROM T4R_Run_For_Love_Scoreboard__c
            WHERE T4R_Campaign__c =: campaignId
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }  

    
    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static string getScoreboardIdForCampaignId(string campaignId) 
    {
        //system.debug('getScoreboardIdForCampaignId: campaignId = ' + campaignId);

        T4R_Run_For_Love_Scoreboard__c scoreboard = getScoreboardForCampaignId(campaignId);

        return scoreboard.Id;
    } 

    //
    // Home Pages
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static T4R_Run_For_Love_Home__c GetHomePageForId(string recordId) 
    {
        //system.debug('GetHomePageForId: recordId = ' + recordId);

        return [
            SELECT Id, Name, T4R_Target_miles__c, T4R_Runs_completed__c, 
                T4R_Miles_to_go__c, T4R_Description__c, T4R_Latest_run_miles__c,
                T4R_Days_left__c, T4R_Current_miles__c, T4R_Related_Runner__c, 
                T4R_Run_For_Love_Scoreboard__c, T4R_Days_to_start__c
            FROM T4R_Run_For_Love_Home__c
            WHERE Id =: recordId
            //WITH SECURITY_ENFORCED
            LIMIT 1
        ];
    }   

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static List<T4R_Run_For_Love_Home__c> GetAllHomePages() 
    {
        //system.debug('GetAllHomePages:');
    
         return [
            SELECT Id, Name, T4R_Runners_Name__c, T4R_Fundraising_page__c, T4R_Target_miles__c, 
                T4R_Runs_completed__c, T4R_Miles_to_go__c, T4R_Description__c,
                T4R_Days_left__c, T4R_Current_miles__c, T4R_Related_Runner__c, 
                createdDate, T4R_Has_fundraising_page__c, T4R_Runners_first_name__c,
                LastModifiedDate, T4R_Latest_run_miles__c
            FROM T4R_Run_For_Love_Home__c
            ORDER BY LastModifiedDate DESC
            //WITH SECURITY_ENFORCED
        ];
    }

        // --------------------------------------------------------------------------------
        @AuraEnabled(cacheable=false)
        public static List<T4R_Run_For_Love_Home__c> GetLimitedHomePages(Integer start, Integer count) 
        {
            //system.debug('GetLimitedHomePages:');
        
             return [
                SELECT Id, Name, T4R_Runners_Name__c, T4R_Fundraising_page__c, T4R_Target_miles__c, 
                    T4R_Runs_completed__c, T4R_Miles_to_go__c, T4R_Description__c,
                    T4R_Days_left__c, T4R_Current_miles__c, T4R_Related_Runner__c, 
                    createdDate, T4R_Has_fundraising_page__c, T4R_Runners_first_name__c,
                    LastModifiedDate, T4R_Latest_run_miles__c
                FROM T4R_Run_For_Love_Home__c
                ORDER BY LastModifiedDate DESC
                LIMIT :count            
                OFFSET :start
                //WITH SECURITY_ENFORCED
            ];
        }
        
    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static T4R_Run_For_Love_Home__c CreateHomePage(string volHoursId, Integer miles) 
    {  
        //system.debug('CreateHomePage: volHoursId = ' + volHoursId + '; miles = ' + miles);

        GW_Volunteers__Volunteer_Hours__c volHours = getVolunteerHoursForId(volHoursId);
        string campaignId = volHours.GW_Volunteers__Volunteer_Campaign__c;

        T4R_Run_For_Love_Scoreboard__c scoreboard = getScoreboardForCampaignId(campaignId);

        T4R_Run_For_Love_Home__c newHome = new T4R_Run_For_Love_Home__c();
        newHome.T4R_Related_Runner__c = volHoursId;
        newHome.T4R_Target_miles__c = miles;
        newHome.T4R_Run_For_Love_Scoreboard__c = scoreboard.id;

        try 
        {
            insert newHome;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        } 
 
        return newHome;
    }   

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static T4R_Run_For_Love_Home__c UpdateHomePage(string homePageId, Integer miles) 
    {    
        //system.debug('UpdateHomePage: homePageId = ' + homePageId + '; miles = ' + miles);

        T4R_Run_For_Love_Home__c homePage = GetHomePageForId(homePageId);
        homePage.T4R_Target_miles__c = miles;
 
        try 
        {
            update homePage;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        } 
  
        return homePage;
     }  

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=false)
    public static T4R_Run_For_Love_Home__c UpdateHomePageLatestRunDistance(string homePageId, Integer miles) 
    {    
        //system.debug('UpdateHomePage: homePageId = ' + homePageId + '; miles = ' + miles);

        T4R_Run_For_Love_Home__c homePage = GetHomePageForId(homePageId);
        homePage.T4R_Latest_run_miles__c = miles;
 
        try 
        {
            update homePage;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        } 
  
        return homePage;
     } 

    //
    // Run For Love
    //

    // --------------------------------------------------------------------------------
    //@AuraEnabled(cacheable=true)
    // NOTE: get DML error for insert if cacheable=true
    @AuraEnabled(cacheable=false)
    public static void AddRunForLove(String home, Integer theTime, Integer theMileage, Date theDate, String theNotes) 
    {
        //T4R_Run_For_Love_Route__c newRoute = new T4R_Run_For_Love_Route__c();
        //System.debug('AddRunForLove: home = ' + home +' theTime = ' + theTime + 'theMileage = ' + theMileage + 'theDate = ' + theDate + 'theNotes = ' + theNotes);      

        T4R_Run_For_Love__c newRun = new T4R_Run_For_Love__c();
        newRun.T4R_Run_For_Love_Home__c = home;
        newRun.T4R_Time_in_minutes__c = theTime;
        newRun.T4R_Miles_of_run__c = theMileage;       
        newRun.T4R_Date_of_run__c = theDate;
        newRun.T4R_Notes__c = theNotes;

        try 
        {
            insert newRun;
        } 
        catch(DmlException e) 
        {
            System.debug('An unexpected error has occurred: ' + e.getMessage());
        }
    } 

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static List<T4R_Run_For_Love__c> GetAllRunsForLove() 
    {
        return [
            SELECT Id, Name, T4R_Time_in_minutes__c, T4R_Notes__c, T4R_Miles_of_run__c, 
            T4R_Date_of_run__c, T4R_Run_For_Love_Home__c
            FROM T4R_Run_For_Love__c
            //WITH SECURITY_ENFORCED
        ];
    } 

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static List<T4R_Run_For_Love__c> GetRunsForLoveForHomePage(String homeId) 
    {
        //system.debug('GetRunsForLoveForHomePage: homeId = ' + homeId);

        return [
            SELECT Id, Name, T4R_Time_in_minutes__c, T4R_Notes__c, T4R_Miles_of_run__c, 
            T4R_Date_of_run__c, T4R_Run_For_Love_Home__c
            FROM T4R_Run_For_Love__c
            WHERE T4R_Run_For_Love_Home__c =: homeId
            ORDER BY T4R_Date_of_run__c DESC           
            //WITH SECURITY_ENFORCED
        ];
    } 

    //
    // Debugging
    //

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static string HelloTest(String apexInput) 
    {
        system.debug('HelloTest: apexInput = ' + apexInput);

        return 'Goodbye ' + apexInput;
    } 

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static string TestGetCampaignIdForName(string campaignName) 
    {
        system.debug('TestGetCampaignIdForName: campaignName = ' + campaignName);
    
        //Campaign campaign = getCampaignForName(campaignName);

        //string campaignId = campaign.Id;
        string campaignId = '123456';
    
        return campaignId;
    }

    // --------------------------------------------------------------------------------
    @AuraEnabled(cacheable=true)
    public static string RealGetCampaignIdForName(string campaignName) 
    { 
        system.debug('TestGetCampaignIdForName: campaignName = ' + campaignName);
            
        Campaign campaign = getCampaignForName(campaignName);

        //string campaignId = campaign.Id;
        string campaignId = '123456';
    
        return campaignId;
    }
}