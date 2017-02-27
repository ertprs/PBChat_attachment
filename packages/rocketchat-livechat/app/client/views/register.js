/* globals Department, Livechat, LivechatVideoCall */

Template.register.helpers({
    error() {
        return Template.instance().error.get();
    },
    // customername() {
    //     var name = (Session.get('custinfo').name).trim();
    //     var array = name.split(/\s+/);
    //     return 'Hi ' + array[0] + ' ! ';
    // },
    greeting() {
        var dt = new Date().getHours();
        var greeting;
        if (dt >= 0 && dt <= 11) {
            greeting = 'Good Morning';
        } else if (dt >= 12 && dt <= 16) {
            greeting = 'Good Afternoon';
        } else {
            greeting = 'Good Evening';
        }
        return greeting;
    },
    welcomeMessage() {
        return Livechat.welcome;
    },
    hasDepartments() {
        return Department.find().count() > 1;
    },
    departments() {
        return Department.find({ name: /Service/ });
    },
    videoCallEnabled() {
        return Livechat.videoCall;
    },
    HasLead() {
        if (Session.get('custinfo') != null && Session.get('custinfo').leadid != null && Session.get('custinfo').leadid != 0) {
            return false;
        } else {
            return true;
        }
    }
});

Template.register.events({
    'submit #livechat-registration' (e, instance) {
        if (!localStorage.visitorToken) {
            localStorage.visitorToken = visitor.getToken();
        }
        var $email, $name, leadid = 0,
            $custid = 0,
            departmentname, departmentId, mobilenumber;
        var custinfo = {
            name: null,
            email: null,
            custid: null,
            departmentId: null,
            leadid: null,
            departmentname: null,
            mobilenumber: null
        };
        e.preventDefault();

        // let start = () => {
        //     instance.hideError();
        //     if (instance.request === 'video') {
        //         LivechatVideoCall.request();
        //     }
        // };
        $name = instance.$('input[name=name]').val();
        $email = instance.$('input[name=email]').val();
        mobilenumber = instance.$('input[name=mobilenumber]').val();
        departmentId = instance.$('select[name=department]').val();
        departmentname = instance.$('select[name=department] option:selected').text();

        if (!($name.trim() && $email.trim() && mobilenumber.trim() && departmentId.trim())) {
            return instance.showError('Please fill Name,Email,Mobile number and concerned Department!');
        } else if (!(mobilenumber.match(/^[0-9]+$/) != null)) {
            return instance.showError('Mobile number should contain digits only(exclude country code)! ');
        } else {
            custinfo.name = $name;
            custinfo.email = $email;
            custinfo.mobilenumber = mobilenumber;
            custinfo.departmentname = departmentname + '_Service';
            custinfo.departmentId = departmentId;
            custinfo.leadid = 0;
            custinfo.custid = 0;
            var customerdetails;
            Meteor.call('livechat:getDetailsForService', leadid, 1, mobilenumber, departmentname, function(error, result) {
                if (error) {
                    console.log(error);
                } else {
                    customerdetails = result;
                    if (customerdetails && customerdetails.LeadID && customerdetails.CustID) {
                        custinfo.leadid = customerdetails.LeadID;
                        custinfo.custid = customerdetails.CustID;
                        Session.set('custinfo', custinfo);
                    }

                }
            });
            Session.set('custinfo', custinfo);

            if (!departmentId) {
                var department = Department.findOne();
                if (department) {
                    departmentId = department._id;
                }
            }
            var guest = {
                token: visitor.getToken(),
                name: custinfo.name,
                email: custinfo.email,
                department: custinfo.departmentId,
                custid: custinfo.custid,
                leadid: custinfo.leadid,
                mobilenumber: custinfo.mobilenumber
            };
            Meteor.call('livechat:registerGuest', guest, function(error, result) {
                if (error != null) {
                    return instance.showError(error.reason);
                }
                Meteor.loginWithToken(result.token, function(error) {
                    if (error) {
                        return instance.showError(error.reason);
                    }
                    //start();
                    Livechat.registrationForm = false;
                });
            });
        }
    },
    'click .error' (e, instance) {
        return instance.hideError();
    },
    'click .request-chat' (e, instance) {
        instance.request = 'chat';
    },
    'click .request-video' (e, instance) {
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