Meteor.publish 'shortcutAutocomplete', (selector) ->
	unless this.userId
		return this.ready()
	
	if not _.isObject selector
		return this.ready()

	departmentname = null	
	agentid = this.userId
	Meteor.call 'getuserdepartment' ,  agentid, (error,result) ->
		if result != 'null'
	       departmentid = result._id
		   departmentname = result.name	

	options =
		fields:
			shortcut: 1
		sort:
			shortcut: 1
		limit: 10    
	 	

	pub = this

	exceptions = selector.exceptions or []
	
	cursorHandle = RocketChat.models.Shortcuts.findShortcutByKeyOrWordRegxWithExceptions(departmentname, selector.term, exceptions, options).observeChanges
		added: (_id, record) ->
			pub.added("autocompleteRecords", _id, record) 

		changed: (_id, record) ->
			pub.changed("autocompleteRecords", _id, record)

		removed: (_id, record) ->
			pub.removed("autocompleteRecords", _id, record)

	@ready()
	@onStop ->
		cursorHandle.stop()
	return
	 