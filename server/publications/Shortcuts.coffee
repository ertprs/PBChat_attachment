Meteor.publish 'Shortcuts', (departmentname) ->

	console.log('Auto Complete - ' + departmentname)	
	options =		
		sort: { _id: -1 }
	return RocketChat.models.Shortcuts.findByDepartment departmentname,options

	