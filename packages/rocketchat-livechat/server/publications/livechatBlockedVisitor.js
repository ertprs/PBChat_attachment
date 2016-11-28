Meteor.publish('livechat:BlockedVisitor', function() {
	if (!this.userId) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));
	}

	if (!RocketChat.authz.hasPermission(this.userId, 'view-l-room')) {
		return this.error(new Meteor.Error('error-not-authorized', 'Not authorized', { publish: 'livechat:agents' }));
	}

	var self = this;

	var handle = RocketChat.authz.getUsersInRole('livechat-guest').observeChanges({
		added(id, fields) {
			self.added('BlockedVisitor', id, fields);
		},
		changed(id, fields) {
			self.changed('BlockedVisitor', id, fields);
		},
		removed(id) {
			self.removed('BlockedVisitor', id);
		}
	});

	self.ready();

	self.onStop(function() {
		handle.stop();
	});
});
