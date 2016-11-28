function ShowDesktopchat(leadid) {
    if (document.getElementById('rocketchat-iframe') == 'undefined' || document.getElementById('rocketchat-iframe') == null) {
        (
            function (w, d, s, u) {
                w.RocketChat = function (c) {
                    w.RocketChat._.push(c)
                };
                w.RocketChat._ = [];
                w.RocketChat.url = u;
                var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
                //j.async = true; j.src = 'http://10.0.56.50:3000/packages/rocketchat_livechat/assets/rocket-livechat.js';
                j.async = true; j.src = 'http://10.0.10.167:3000/packages/rocketchat_livechat/assets/rocket-livechat.js';
                h.parentNode.insertBefore(j, h);
            }
        )
        //(window, document, 'script', 'http://10.0.56.50:3000/livechat?leadid='+leadid);
        (window, document, 'script', 'http://10.0.10.167:3000/livechat?leadid='+leadid);
    }
    if(document.getElementsByClassName('rocketchat-widget')[0] != undefined){
        document.getElementsByClassName('rocketchat-widget')[0].style.display = "inline";
    }
    
}

function ShowMobilechat(leadid) {
    if (document.getElementById('rocketchat-iframe') == 'undefined' || document.getElementById('rocketchat-iframe') == null) {
        (
            function (w, d, s, u) {
                w.RocketChat = function (c) {
                    w.RocketChat._.push(c)
                };
                w.RocketChat._ = [];
                w.RocketChat.url = u;
                var h = d.getElementsByTagName(s)[0], j = d.createElement(s);
                //j.async = true; j.src = 'http://10.0.56.50:3000/packages/rocketchat_livechat/assets/rocket-livechat-mobile.js';
                j.async = true; j.src = 'http://10.0.10.167:3000/packages/rocketchat_livechat/assets/rocket-livechat-mobile.js';
                h.parentNode.insertBefore(j, h);
            }
        )
        //(window, document, 'script', 'http://10.0.56.50:3000/livechat?leadid='+leadid);
        (window, document, 'script', 'http://10.0.10.167:3000/livechat?leadid='+leadid);
    }
    if(document.getElementsByClassName('rocketchat-widget')[0] != undefined){
        document.getElementsByClassName('rocketchat-widget')[0].style.display = "inline";
    }
}

function hidechat() {
    alert('Hide');
    if (document.getElementsByClassName('rocketchat-widget') != null) {
        document.getElementsByClassName('rocketchat-widget')[0].style.display = "none";
    }
}