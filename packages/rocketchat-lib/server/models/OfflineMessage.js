/**
 * Livechat Department model
 */
class OfflineMessage extends RocketChat.models._Base {
	constructor() {
		super('OfflineMessage');
	}

	// FIND
	findOneById(_id, options) {
		const query = { _id: _id };

		return this.findOne(query, options);
	}	

	createOfflineMessage(record) {						
		this.insert(record);
		
	}	
}

RocketChat.models.OfflineMessage = new OfflineMessage();
