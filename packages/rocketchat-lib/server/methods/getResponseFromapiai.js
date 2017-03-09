const apiai = require('apiai');
const app = apiai("299f725c59464203b84e1aac944fcd6e");

export const botresponse = new Mongo.Collection('rocketchat_apiai');

Meteor.methods({
    getResponseFromapiai(text, rid) {
        var customerreplytime = new Date();
        check(text, String);
        let options = {
            sessionId: rid
        };
        var customerreply = text;
        let request = app.textRequest(text, options);
        request.on('response', Meteor.bindEnvironment(function(response, errror) {
            var botreply = response.result.fulfillment.speech;
            var botreplytime = new Date();
            msgObject = {
                _id: Random.id(),
                rid: rid,
                msg: botreply
            };
            //Meteor.call('sendMessage', msgObject);
            botresponse.insert({
                rid,
                customerreply,
                botreply,
                ts: new Date(),
                customerreplytime,
                botreplytime
            });
        }, function(error) {
            console.log(error);
        }));
        request.end();
    }
});