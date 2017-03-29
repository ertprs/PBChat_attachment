/* globals Department, Livechat, LivechatVideoCall,FileUpload */

Template.livechatWindow.helpers({
    title() {
        return Livechat.title;
    },
    color() {
        return Livechat.color;
    },
    fontColor() {
        return Livechat.fontColor;
    },
    mobileapp(){            
        return FlowRouter.getQueryParam('mobileapp')=="1"?true:false; 
    },
    popoutActive() {
        return FlowRouter.getQueryParam('mode') === 'popout';
    },
    soundActive() {
        return Session.get('sound');
    },
    showRegisterForm() {
        if (Meteor.userId()) {
            return false;
        } else if (FlowRouter.getQueryParam('service') && FlowRouter.getQueryParam('service') == "1") {
            return Livechat.registrationForm;
        } else {
            return false;
        }
    },
    livechatStarted() {
        return Livechat.online !== null;
    },
    livechatOnline() {
        return Livechat.online;
    },
    offlineMessage() {
        return Livechat.offlineMessage;
    },
    offlineData() {
        return {
            offlineMessage: Livechat.offlineMessage.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
            offlineSuccessMessage: Livechat.offlineSuccessMessage,
            offlineUnavailableMessage: Livechat.offlineUnavailableMessage.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1<br>$2'),
            displayOfflineForm: Livechat.displayOfflineForm
        };
    },
    videoCalling() {
        return LivechatVideoCall.isActive();
    },
    isOpened() {
        return Livechat.isWidgetOpened();
    }
});

Template.livechatWindow.events({
    'click .title' () {
        parentCall('toggleWindow');
    },

    'click .popout' (event) {
        var token = visitor.getRoom();
        Meteor.call('livechat:getRoom', token, (err, result) => {
            if (err) {
                console.error(err);
            } else {
                if (result.code) {
                    window.open("live/" + result.code);
                }
            }
        });
    },

    'click .sound' (event) {
        event.stopPropagation();
        Session.set({ sound: !Session.get('sound') });
    }

});

Template.livechatWindow.onCreated(function() {

    Session.set({ sound: true });

    const defaultAppLanguage = () => {
        let lng = window.navigator.userLanguage || window.navigator.language || 'en';
        let regexp = /([a-z]{2}-)([a-z]{2})/;
        if (regexp.test(lng)) {            
                lng = lng.replace(regexp, function(match, ...parts) {
                return parts[0] + parts[1].toUpperCase();
            });
        }
        return lng;
    };

    if (FlowRouter.getQueryParam('service')) {
        var service = 1;
    } else {
        var service = 0;
    }
    if (FlowRouter.getQueryParam('leadid')) {
        var leadid = FlowRouter.getQueryParam('leadid');
    } else {
        var leadid = 0;
    }

    Meteor.call('livechat:getInitialData', visitor.getToken(), leadid, service, (err, result) => {
        if (err) {
            console.error(err);
        } else {
            Session.set('custinfo', result.custinfo);
            if (!result.enabled) {
                Triggers.setDisabled();
                return parentCall('removeWidget');
            }
            if (!result.online && localStorage.getItem('currentTime')) {
                var lastTime = new Date(localStorage.getItem('currentTime'));
                var now = new Date;
                var diff = ((now - lastTime) / 1000) / 60;
                if (diff < 120) {
                    result.online = true;
                }
            }

            if (!result.online) {
                Triggers.setDisabled();
                Livechat.title = result.offlineTitle;
                Livechat.offlineColor = result.offlineColor;
                Livechat.offlineMessage = result.offlineMessage;
                Livechat.displayOfflineForm = result.displayOfflineForm;
                Livechat.offlineUnavailableMessage = result.offlineUnavailableMessage;
                Livechat.offlineSuccessMessage = result.offlineSuccessMessage;
                Livechat.online = false;
                //send event to client window for online / offline widget
                parentCall('offline');
            } else {
                Livechat.title = result.title;
                Livechat.onlineColor = result.color;
                Livechat.online = true;
                Livechat.transcript = result.transcript;
                Livechat.transcriptMessage = result.transcriptMessage;
                Livechat.welcome = result.welcome;
            }
            Livechat.videoCall = result.videoCall;
            Livechat.registrationForm = result.registrationForm;
            if (result.room) {
                RoomHistoryManager.getMoreIfIsEmpty(result.room._id);
                visitor.subscribeToRoom(result.room._id);
                visitor.setRoom(result.room._id);
            }

            TAPi18n.setLanguage((result.language || defaultAppLanguage()).split('-').shift());

            Triggers.setTriggers(result.triggers);
            Triggers.init();

            result.departments.forEach((department) => {
                Department.insert(department);
            });
            Session.set({ 'allowAttachments': result.allowAttachments });
            FileUpload.mediaTypeWhiteList = result.mediaTypeWhiteList;
            FileUpload.maxFileSize = result.maxFileSize;
            FileUpload.storageType = result.storageType;
        }
    });
});