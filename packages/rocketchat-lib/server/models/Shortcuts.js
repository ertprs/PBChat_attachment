/**
 * Livechat Department model
 */
class Shortcuts extends RocketChat.models._Base {
	constructor() {
		super('shortcuts');
	}

	// FIND
	findOneById(_id, options) {
		const query = { _id: _id };

		return this.findOne(query, options);
	}	
    
	findByDepartment(department,options) {
		const query = { department: department};		
		return this.find(query,options);				
	}	


	// REMOVE
	removeById(_id) {
		const query = { _id: _id };

		return this.remove(query);
	}
    	
    findShortcutByKeyOrWordRegxWithExceptions(department, searchTerm, exceptions = [], options = {}){	
		termRegex = new RegExp(s.escapeRegExp(searchTerm), 'i')
		query = {
			shortcut: termRegex,
			department: department
		}
		return this.find(query, options);		
	}
}

RocketChat.models.Shortcuts = new Shortcuts();
