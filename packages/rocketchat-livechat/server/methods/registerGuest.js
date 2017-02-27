Meteor.methods({
    'livechat:registerGuest': function({ token, name, email, department, custid, leadid, country, mobilenumber } = {}) {
        var stampedToken = Accounts._generateStampedLoginToken();
        var hashStampedToken = Accounts._hashStampedToken(stampedToken);
        let userId = RocketChat.Livechat.registerGuest.call(this, {
            token: token,
            name: name,
            email: email,
            department: department,
            loginToken: hashStampedToken,
            username: name + '-' + custid,
            custid: custid,
            country: country,
            mobilenumber: mobilenumber
        });

        RocketChat.models.LivechatPageVisited.keepHistoryForToken(token);

        return {
            userId: userId,
            token: stampedToken.token
        };
    }
});