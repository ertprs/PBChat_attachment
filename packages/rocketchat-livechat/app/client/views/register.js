/* globals Department, Livechat, LivechatVideoCall */

Template.register.helpers({
    error() {
        return Template.instance().error.get();
    },
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
    },
    isService() {
        if (FlowRouter.getQueryParam('service') == '1') {
            return true;
        } else {
            return false;
        }
    }
});

Template.register.events({
    'submit #livechat-registration' (e, instance) {
        var isProduct;
        document.getElementById('btnEntrar').setAttribute('disabled', true);
        if (!localStorage.visitorToken) {
            localStorage.visitorToken = visitor.getToken();
        }
        var $email, $name, leadid = 0,
            $custid = 0,
            departmentname, departmentid, mobilenumber, enquiry;
        var custinfo = {
            name: null,
            email: null,
            custid: null,
            departmentid: null,
            leadid: null,
            departmentname: null,
            mobilenumber: null
        };
        e.preventDefault();
        $name = instance.$('input[name=name]').val();
        $email = instance.$('input[name=email]').val();
        mobilenumber = instance.$('input[name=mobilenumber]').val();

        if (FlowRouter.getQueryParam('product') == 'twowheeler') {
            var department = Department.find({ name: 'Twowheeler' }).fetch();
            departmentid = department[0]._id;
            departmentname = department[0].name;
            isProduct = true;
            var query = window.location.search.substring(1);
            var vars = query.split("&");
            for (var i = 0; i < vars.length; i++) {
                var pair = vars[i].split("=");
                if (pair[0] == 'enquiryid') {
                    if (pair.length > 1) {
                        for (var i = 2; i < pair.length; i++) {
                            pair[1] = pair[1] + '='
                        }
                    }
                    enquiry = pair[1];
                }
            }
        } else {
            departmentid = instance.$('select[name=department]').val();
            departmentname = instance.$('select[name=department] option:selected').text();
        }

        if (!($name.trim() && $email.trim() && mobilenumber.trim() && departmentid.trim())) {
            document.getElementById('btnEntrar').removeAttribute('disabled');
            return instance.showError('Please fill Name,Email,Mobile number and concerned Department!');
        } else if (!(mobilenumber.match(/^[0-9]+$/) != null)) {
            document.getElementById('btnEntrar').removeAttribute('disabled');
            return instance.showError('Mobile number should contain digits only(exclude country code)! ');
        } else {
            custinfo.name = $name;
            custinfo.email = $email;
            custinfo.mobilenumber = mobilenumber;
            if (isProduct) {
                custinfo.departmentname = departmentname;
            } else {
                custinfo.departmentname = departmentname + '_Service';
            }
            custinfo.departmentid = departmentid;
            custinfo.leadid = 0;
            custinfo.custid = 0;
            Session.set('custinfo', custinfo);
            if (enquiry && enquiry != '') {
                Meteor.call('livechat:createLead', enquiry, custinfo.name, custinfo.mobilenumber, custinfo.email, function(error, result) {
                    if (error) {
                        console.log(error);
                    } else {
                        leadid = window.btoa(result);
                        Meteor.call('livechat:getDetailsForService', leadid, 1, mobilenumber, departmentname, function(error, result) {
                            if (error) {
                                console.log(error);
                            } else {
                                var customerdetails = result;
                                if (customerdetails && customerdetails.LeadID && customerdetails.CustID) {
                                    custinfo.leadid = customerdetails.LeadID;
                                    custinfo.custid = customerdetails.CustID;
                                    Session.set('custinfo', custinfo);
                                }
                            }
                        });
                    }
                });
            } else {
                Meteor.call('livechat:getDetailsForService', leadid, 1, mobilenumber, departmentname, function(error, result) {
                    if (error) {
                        console.log(error);
                    } else {
                        var customerdetails = result;
                        if (customerdetails && customerdetails.LeadID && customerdetails.CustID) {
                            custinfo.leadid = customerdetails.LeadID;
                            custinfo.custid = customerdetails.CustID;
                            Session.set('custinfo', custinfo);
                        }
                    }
                });
            }
            if (!departmentid) {
                var department = Department.findOne();
                if (department) {
                    departmentid = department._id;
                }
            }
            var guest = {
                token: visitor.getToken(),
                name: custinfo.name,
                email: custinfo.email,
                department: custinfo.departmentid,
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
                    Livechat.registrationForm = false;
                });
            });
        }
        document.getElementById('btnEntrar').removeAttribute('disabled');
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