Template.externalSearch.helpers({
    messages() {
        console.log(Shortcuts.find().fetch());
        return Shortcuts.find().fetch();
    }
});

Template.externalSearch.events({
    'click button.pick-message' (event, instance) {
        event.preventDefault();
        $('.input-message').val(this.shortcut);
        $('.input-message').focus();
        //$('#chat-window-' + instance.roomId + ' .input-message').val(this.msg).focus();
    }
});

Template.externalSearch.onCreated(function() {
    this.roomId = null;
    // console.log('externalSearch.this ->',this);
    this.autorun(() => {
        this.roomId = Template.currentData().rid;
        //this.subscribe('livechat:externalMessages', Template.currentData().rid);
    });
});