Meteor.methods({
	getShortcuts(department) {      
        let options = {
			sort: { _id : 1}
		};
        return RocketChat.models.Shortcuts.findByDepartment(department, options).fetch();                
	}
});
