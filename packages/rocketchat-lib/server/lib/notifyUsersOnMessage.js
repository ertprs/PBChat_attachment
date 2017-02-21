RocketChat.callbacks.add('afterSaveMessage', function(message, room) {
    // skips this callback if the message was edited
    if (message.editedAt) {
        return message;
    }

    if (message.ts && Math.abs(moment(message.ts).diff()) > 60000) {
        return message;
    }

    /**
     * Chechs if a messages contains a user highlight
     *
     * @param {string} message
     * @param {array|undefined} highlights
     *
     * @returns {boolean}
     */
    function messageContainsHighlight(message, highlights) {
        if (!highlights || highlights.length === 0) { return false; }

        var has = false;
        highlights.some(function(highlight) {
            var regexp = new RegExp(s.escapeRegExp(highlight), 'i');
            if (regexp.test(message.msg)) {
                has = true;
                return true;
            }
        });

        return has;
    }

    if (room.t != null && room.t === 'd') {
        // Update the other subscriptions
        RocketChat.models.Subscriptions.incUnreadOfDirectForRoomIdExcludingUserId(message.rid, message.u._id, 1);
    } else {
        var mentionIds, toAll, highlightsIds, highlights;

        mentionIds = [];
        highlightsIds = [];
        toAll = false;
        highlights = RocketChat.models.Users.findUsersByUsernamesWithHighlights(room.usernames, { fields: { '_id': 1, 'settings.preferences.highlights': 1 } }).fetch();

        if (message.mentions != null) {
            message.mentions.forEach(function(mention) {
                if (!toAll && mention._id === 'all') {
                    toAll = true;
                }
                if (mention._id !== message.u._id) {
                    mentionIds.push(mention._id);
                }
            });
        }

        highlights.forEach(function(user) {
            if (user && user.settings && user.settings.preferences && messageContainsHighlight(message, user.settings.preferences.highlights)) {
                if (user._id !== message.u._id) {
                    highlightsIds.push(user._id);
                }
            }
        });

        if (toAll) {
            RocketChat.models.Subscriptions.incUnreadForRoomIdExcludingUserId(room._id, message.u._id);
        } else if ((mentionIds && mentionIds.length > 0) || (highlightsIds && highlightsIds.length > 0)) {
            RocketChat.models.Subscriptions.incUnreadForRoomIdAndUserIds(room._id, _.compact(_.unique(mentionIds.concat(highlightsIds))));
        }
    }
    var userId = message.u._id;
    var user = Meteor.users.find({ _id: userId }).fetch()[0];
    // Update all the room activity tracker fields
    var agentmsgscount = 0;
    if (room.t == "l" && message.t != 'livechat-close' && room.servedBy && room.servedBy._id && user.type == 'user') {
        agentmsgscount = 1;
    }

    if (message && message.t == 'livechat-close') {
        var msg = "close room, no need to increase msgs count and update lastmessage time";
    } else {
        RocketChat.models.Rooms.incMsgCountAndSetLastMessageTimestampById(message.rid, 1, message.ts, agentmsgscount);
    }

    // Update all other subscriptions to alert their owners but witout incrementing
    // the unread counter, as it is only for mentions and direct messages
    RocketChat.models.Subscriptions.setAlertForRoomIdExcludingUserId(message.rid, message.u._id);

    return message;

}, RocketChat.callbacks.priority.LOW, 'notifyUsersOnMessage');