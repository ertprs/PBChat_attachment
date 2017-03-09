Template.chatbot.helpers({
    messages() {
        return LivechatChatbotMessages.find();
    }
});

Template.chatbot.events({
    'click button.pick-message' (event, instance) {
        event.preventDefault();
        $('.input-message').val(this.botreply);
        $('.input-message').focus();
    }
});

Template.chatbot.onCreated(function() {
    this.roomId = null;
    // this.autorun(() => {
    this.roomId = Template.currentData().rid;
    this.subscribe('livechat:chatbotMessages', Template.currentData().rid);
    // });
});