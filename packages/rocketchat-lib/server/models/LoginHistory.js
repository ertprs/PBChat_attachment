/**
 * Livechat Department model
 */
class LoginHistory extends RocketChat.models._Base {
	constructor() {
		super('loginhistory');
	}

	// FIND
	findOneById(_id, options) {
		const query = { _id: _id };

		return this.findOne(query, options);
	}	

	createloginhistory(record) {						
		this.insert(record);
		
	}	
}

RocketChat.models.LoginHistory = new LoginHistory();
