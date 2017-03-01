Meteor.methods({
    'livechat:registerGuest': function({ token, name, email, department, custid, leadid, country, mobilenumber, invflag } = {}) {
        var stampedToken = Accounts._generateStampedLoginToken();
        var hashStampedToken = Accounts._hashStampedToken(stampedToken);
        var username = "";
        if (custid == 0) {
            var now = new Date();
            username = name + '-' + now.getHours() + ':' + now.getMinutes();
        } else {
            username = name + '-' + custid;
        }
        let userId = RocketChat.Livechat.registerGuest.call(this, {
            token: token,
            name: name,
            email: email,
            department: department,
            loginToken: hashStampedToken,
            username: username,
            custid: custid,
            country: country,
            mobilenumber: mobilenumber,
            invflag: invflag
        });

        RocketChat.models.LivechatPageVisited.keepHistoryForToken(token);

        return {
            userId: userId,
            token: stampedToken.token
        };
    }
});