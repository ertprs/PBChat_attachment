Meteor.publish 'Shortcuts', (departmentname) ->

	options =		
		sort: { _id: -1 }
	return RocketChat.models.Shortcuts.findByDepartment departmentname,options

	