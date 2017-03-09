class LivechatChatbotMessages extends RocketChat.models._Base {
    constructor() {
        super('rocketchat_apiai');
    }

    // FIND
    findByRoomId(roomId, sort = { ts: 1 }) {
        const query = { rid: roomId };
        console.log(query);
        return this.find(query, { sort: sort });
    }
}

RocketChat.models.LivechatChatbotMessages = new LivechatChatbotMessages();