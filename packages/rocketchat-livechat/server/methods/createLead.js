//new method added by PBChat
Meteor.methods({
    'livechat:createLead' (enquiry, name, mobilenumber, email) {
        var url = RocketChat.settings.get('Twowheeler');
        var createdLead = HTTP.call("POST", url, {
            data: {
                "enquiryEncripted": enquiry,
                "CustomerName": name,
                "MobileNo": mobilenumber,
                "EmailID": email,
                "Gender": "1",
                "DOB": "01-01-1998",
                "MaritalStatus": "1",
                "isAddressSame": "true"
            },
            headers: { "Content-Type": "application/json" }
        }).content;
        var leadid = JSON.parse(createdLead).ResponseObject.MatrixLeadId;
        return leadid;
    }
});