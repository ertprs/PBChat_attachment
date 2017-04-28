RocketChat.API.v1.addRoute('livechat/wa-incoming', { authRequired: false }, {
    post() {

        const sms = this.bodyParams;
        var leaddata;
        var message = {
            _id: Random.id(),
            msg: sms.Body
        }

        var roomInfo;
        var guest;
        var custinfo;
        var userId = sms.userid;
        var VisitorToken;
        var LeadID;
        var CustID;

        LeadID = sms.leadid ? sms.leadid : 0;
        CustID = sms.custid;
        custinfo = {
            name: sms.name,
            email: sms.emailid,
            custid: sms.custid,
            leadid: LeadID,
            departmentid: sms.departmentid,
            departmentname: sms.department,
            waflag: 1
        };

        if (userId == null) {
            VisitorToken = Random.id();
            guest = {
                token: VisitorToken,
                name: sms.name,
                username: sms.name + "-" + sms.custid,
                email: sms.emailid,
                department: sms.departmentid,
                custid: sms.custid,
                leadid: LeadID,
                mobilenumber: sms.mobileno
            };

            userId = RocketChat.Livechat.registerGuest(guest);
            guest._id = userId;
        } else {
            visitor = RocketChat.models.Users.findOneById(userId);
            guest = visitor;
            VisitorToken = visitor.profile.token;
        }

        if (sms.roomid) {
            roomInfo = RocketChat.models.Rooms.findOneById(sms.roomid);
            message.rid = roomInfo._id;
        } else {
            message.rid = Random.id();
        }


        message.token = VisitorToken;

        try {
            let sent = RocketChat.Livechat.sendMessage({ guest, message, roomInfo, custinfo });
            sent.userId = userId;
            return sent;
        } catch (e) {
            console.log("Error occured");
            console.log(e);
            return e;
        }
    }
});