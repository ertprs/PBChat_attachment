//export const chatbotMessages = new Mongo.Collection('rocketchat_apiai');

Meteor.publish('livechat:chatbotMessages', function(roomId) {
    console.log(roomId);
    console.log(RocketChat.models.LivechatChatbotMessages.find().count());
    return RocketChat.models.LivechatChatbotMessages.find();
});