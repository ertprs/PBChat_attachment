/* globals Department, Livechat, LivechatVideoCall */

Template.register.helpers({
	error() {
		return Template.instance().error.get();
	},
	welcomeMessage() {		
		return Livechat.welcome;
	},
	hasDepartments() {
		return Department.find().count() > 1;
	},
	departments() {
		return Department.find();
	},
	videoCallEnabled() {
		return Livechat.videoCall;
	},
	HasLead(){
        if(Session.get('custinfo')!=null && Session.get('custinfo').leadid!=null){
                return false;
        } 
        else{
            return true;
        }
    }	
});

Template.register.events({
	'submit #livechat-registration'(e, instance) {
        //Added By PBChat
		if(!localStorage.visitorToken){
            localStorage.visitorToken=visitor.getToken();           
        }       
        var $email, $name,$custid,departmentname,departmentId;
		e.preventDefault();

		let start = () => {
			instance.hideError();
			if (instance.request === 'video') {
				LivechatVideoCall.request();
			}
		};
		if(Session.get('custinfo')!=null && Session.get('custinfo').leadid!=null)
        {
            $name = Session.get('custinfo').name;
            $email =  Session.get('custinfo').email;            
            $custid = Session.get('custinfo').custid;
            departmentId = Session.get('custinfo').departmentid;
			leadid = Session.get('custinfo').leadid;
        }
        else
        {
            $name = instance.$('input[name=name]').val();
            $email = instance.$('input[name=email]').val();
            
        }
		if (!($name.trim() && $email.trim())) {
			return instance.showError(TAPi18n.__('Please_fill_name_and_email'));
		} else {
			//var departmentId = instance.$('select[name=department]').val();
			if (!departmentId) {
				var department = Department.findOne();
				if (department) {
					departmentId = department._id;
				}
			}

			var guest = {
				token: visitor.getToken(),
				name: $name,
				email: $email,
				department: departmentId,
                custid:$custid,
				leadid:leadid
			};

			Meteor.call('livechat:registerGuest', guest, function(error, result) {
				if (error != null) {
					return instance.showError(error.reason);
				}
				Meteor.loginWithToken(result.token, function(error) {
					if (error) {
						return instance.showError(error.reason);
					}
					start();
				});
			});
		}
	},
	'click .error'(e, instance) {
		return instance.hideError();
	},
	'click .request-chat'(e, instance) {
		instance.request = 'chat';
	},
	'click .request-video'(e, instance) {
		instance.request = 'video';
	}
});

Template.register.onCreated(function() {
	this.error = new ReactiveVar();
	this.welcomeMessage = new ReactiveVar();
	this.request = '';
	this.showError = (msg) => {
		$('.error').addClass('show');
		this.error.set(msg);
	};
	this.hideError = () => {
		$('.error').removeClass('show');
		this.error.set();
	};
});

Template.register.rendered = function() {	
    if(!this._rendered) {
      this._rendered = true;
	if(localStorage.visitorToken){
	  		$('.button').click();          
        } 
    }
}
