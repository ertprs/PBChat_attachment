Package.describe({
	name: 'matrix:app',
	version: '0.0.1',
	summary: 'Rest API',
	git: ''
});

Package.onUse(function(api) {
	api.use(['webapp', 'autoupdate'], 'server');
    api.use('ecmascript');
    api.use('underscorestring:underscore.string');
    api.use('rocketchat:lib');
    api.use('rocketchat:authorization');
    api.use('rocketchat:logger');
    api.use('rocketchat:api');
    api.use('konecty:user-presence');
    api.use('rocketchat:ui');
    api.use('kadira:flow-router', 'client');
    api.use('templating', 'client');
    api.use('http');
    api.use('check');
    api.use('mongo');
    api.use('ddp-rate-limiter');
    api.use('rocketchat:sms');
    api.use('tracker');
    api.use('less');

	api.addFiles('server/main.js', 'server');
    api.addFiles('client/main.css', 'client');
	api.addFiles('client/Revist.html', 'client');
	api.addFiles('client/Revist.js', 'client');
    api.addFiles('lib/model.js');
    api.addFiles('client/tasks.html', 'client');
	api.addFiles('client/tasks.js', 'client');
});
