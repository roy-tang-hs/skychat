var hangouts = {};

$(document).ready(function(){

    //socket = io('http://localhost:8080/?'
    socket = io('http://54.169.49.211:8080?'
    +'username=' + username
    +'&userid=' + user_id
    +'&avatar=' + avatar);

    if (typeof channelId != 'undefined') {
        hangouts.target = 'CHANNEL';
    } else if (typeof userpage_userid != 'undefined') {
        hangouts.target = 'USER';
    }

    if (username) {
        socket.on('notification message', function(target_user_id){
            if (target_user_id == user_id) {
                $.ajax({
                    type: "GET",
                    url: baseURL + 'api/ooxx/getuserstatus',
                    success: function(d) {
                        if (d.isJailed == 1) {
                            user.active = false;
                        }
                    },
                    error: function(d) {
                    }
                });
            }
        });

        socket.on('private message', function(msg){
            hangouts.privateMessageReceiver(msg);
        });

        if (hangouts.target == 'CHANNEL') {
            socket.on('channel message', function(msg){
                hangouts.channelMessageReceiver(msg);
            });
        }

    }

    hangouts.loadContacts();


    hangouts.$section = $('._chat');

    if (hangouts.$section.length) {
        hangouts.$list = hangouts.$section.find('._list');
        hangouts.$listcontainer = document.getElementById("_listcontainer");
        hangouts.$msg = hangouts.$section.find('._msg');

        hangouts.$msg.keyup(function(e) {
            if (e.which == 13) {
                hangouts.sendTextMessage();
            }
        });

        $('._talk').click(hangouts.sendTextMessage);
        hangouts.load();
    }

});


hangouts.loadContacts = function () {
    $.ajax({
        type: "GET",
        url: baseURL + 'api/chat/contacts',
        success: function(contacts) {
            var count = 5;
            _.each(contacts, function(contact) {
                if (count > 0) {
                    contact.highlight = contact.read ? '' : 'channel-incoming';
                    $('._contactList').append(hangouts.naviNotificationTemplate(contact));
                } else {
                    count--;
                }
            });
        },
        error: function(d) {
            showNote('联系人加载失败', 'error');
        }
    });
};


hangouts.sendNotificationMessage = function (target_user_id) {
    socket.emit('notification message', target_user_id);
};


hangouts.sendVoteMessage = function (content, ox, type) {
    if (!username) {
        showNote('请先登录哦', 'error');
        return;
    }

    var msg = {};
    msg.senderId = user_id;
    msg.senderName = username;
    msg.senderAvatar = avatar;
    msg.type = type;
    msg.content = content;
    msg.ox =  ox;

    if (hangouts.target == 'CHANNEL') {
        hangouts.channelMessageSender(msg);
    }

};

hangouts.sendImageMessage = function (url) {
    if (!username) {
        showNote('请先登录哦', 'error');
        return;
    }

    var msg = {};
    msg.senderId = user_id;
    msg.senderName = username;
    msg.senderAvatar = avatar;
    msg.type = 200;
    msg.content = url;
    msg.user_ox =  user.ox;
    msg.user_ox_style = user.style;

    if (hangouts.target == 'CHANNEL') {
        hangouts.channelMessageSender(msg);
    }

    if (hangouts.target == 'USER') {
        hangouts.privateMessageSender(msg);
    }

};

hangouts.sendTextMessage = function () {
    if (!username) {
        showNote('请先登录哦', 'error');
        return;
    }

    var text = hangouts.$msg.val().trim();
    hangouts.$msg.val('');
    if(!text) {
        return;
    }

    var msg = {};
    msg.senderId = user_id;
    msg.senderName = username;
    msg.senderAvatar = avatar;
    msg.type = 100;
    msg.content = text;
    msg.user_ox =  user.ox;
    msg.user_ox_style = user.style;

    if (hangouts.target == 'CHANNEL') {
        hangouts.channelMessageSender(msg);
    }

    if (hangouts.target == 'USER') {
        hangouts.privateMessageSender(msg);
    }

};

hangouts.channelMessageSender = function (msg) {

    if(!user.active){
        showNote('因为不受欢迎，你已经被暂时禁言', 'error');
        return;
    }

    msg.recipientId = channelId;
    socket.emit('channel message', msg);

    $.ajax({
        type: "POST",
        url: baseURL + 'api/chat/post/channel/' + msg.recipientId,
        data: msg,
        success: function(d) {
            //nothing
        },
        error: function(d) {
            showNote('保存失败', 'error');
        }
    });
};

hangouts.channelMessageReceiver = function (msg) {
    if (!hangouts.$section.length) {
        return;
    }

    if (hangouts.target == 'CHANNEL' && msg.recipientId == channelId) {
        hangouts.appendMsg(msg);
        hangouts.scroll();
    }
};

hangouts.privateMessageSender = function (msg) {
    if(!user.active){
        showNote('因为不受欢迎，你已经被暂时禁言', 'error');
        return;
    }

    msg.recipientId = userpage_userid;
    socket.emit('private message', msg);

    $.ajax({
        type: "POST",
        url: baseURL + 'api/chat/post/user/' + userpage_userid,
        data: msg,
        success: function(d) {
           //nothing
        },
        error: function(d) {
            showNote('保存失败', 'error');
        }
    })
};

hangouts.privateMessageReceiver = function (msg) {
    if (msg.recipientId == user_id) {
        $('._contactList').find('._navi_note_' + msg.senderId).remove();
        msg.contactId = msg.senderId;
        msg.contactAvatar = msg.senderAvatar;
        msg.contactName = msg.senderName;
        msg.senderName = '';
        if (msg.type == 200) {
            msg.content = '[图片]';
        }
        msg.highlight = 'channel-incoming';
        $('._contactList').prepend(hangouts.naviNotificationTemplate(msg));
    }

    if (hangouts.target != 'USER') {
        return;
    }

    if (!hangouts.$section.length) {
        return;
    }

    if ((msg.recipientId == userpage_userid && msg.senderId == user_id) || (msg.recipientId == user_id && msg.senderId == userpage_userid)) {
        hangouts.appendMsg(msg);
        hangouts.scroll();

        //Mark read
        if (msg.recipientId == user_id) {
            setTimeout(function(){
                $.ajax({
                    type: "GET",
                    url:  baseURL + 'api/chat/markread/' + msg.senderId,
                    data: {},
                    success: function(d) {},
                    error: function(d) {}
                });
            }, 1000);
        }

    }
};

hangouts.load = function () {

    hangouts.$list.html('');
    if (hangouts.target == 'USER' && userpage_userid != user_id) {
        $.ajax({
            type: "GET",
            url:  baseURL + 'api/chat/get/user/' + userpage_userid,
            data: {},
            success: function(ims) {
                _.each(ims, function(im){
                    hangouts.appendMsg(im);
                });

                setTimeout(function () {
                    hangouts.$listcontainer.scrollTop = hangouts.$listcontainer.scrollHeight;
                }, 2000);

            },
            error: function(d) {
                showNote(d.responseJSON, 'error');
            }
        });
    }
    if (hangouts.target == 'CHANNEL') {
        socket.emit('join channel', {
            roomid: channelId
        });

        $.ajax({
            type: "GET",
            url:  baseURL + 'api/chat/get/channel/' + channelId,
            data: {},
            success: function(ims) {
                _.each(ims, function(im){
                    hangouts.appendMsg(im);
                });

                setTimeout(function () {
                    hangouts.$listcontainer.scrollTop = hangouts.$listcontainer.scrollHeight;
                }, 2000);
            },
            error: function(d) {
                showNote(d.responseJSON, 'error');
            }
        });
    }
};

hangouts.appendMsg = function (im) {
    im.content = im.content.replace(/(<([^>]+)>)/ig,"");
    if (im.type == 100)  {
        hangouts.$list.append(hangouts.textTemplate(im));
    } else if (im.type == 200) {
        hangouts.$list.append(hangouts.imageTemplate(im));
    } else if (im.type == 900 || im.type == 901) {
        im.oxClass = im.type == 900 ? 'chat-xx-msg' : 'chat-oo-msg';
        hangouts.$list.append(hangouts.ooxxMsgTemplate(im));
    }

};


hangouts.ooxxSection = typeof userpage_userid == 'undefined' ? '<span class="_ooxx_section" contenttype="300" contentid="<%= senderId %>" style="font-weight:400">'
+                   '&nbsp;<a href="javascript:void(0)" class="_oo chat-oo hint hint--bottom" data-hint="喜欢" style="padding-left:5px">oo</a>'
+                   '<text style="padding-left:5px;color:black">/</text>'
+                   '&nbsp;<a href="javascript:void(0)" class="_xx chat-xx hint hint--bottom" data-hint="不喜欢" style="padding-left:1px">xx</a>' : '';


hangouts.textTemplate = _.template(
    '<div class="wow fadeIn animated">'
    +           '<div class="row-picture" >'
    +               '<img class="circle  small-circle avatar _avatar" userid="<%= senderId %>" src="<%= senderAvatar %>" alt="icon">'
    +               '<div class="shield <%= user_ox_style %> ox_shield_user_<%= senderId %> hint hint--bottom" data-hint="受欢迎度"><%= user_ox %></div>'
    +           '</div>'
    +           '<div class="row-content medium-row-content remove-right-padding">'
    +               '<h4 class="list-group-item-heading  small-list-group-item-heading">'
    +                   '<%= senderName %>'
    +                   '<a href="javascript:void(0)" username="<%= senderName %>" class="btn-at _at hint hint--bottom" data-hint="留言" style="padding-left:5px">@</a>'
    +                   hangouts.ooxxSection
    +               '</h4>'
    +               '<p class="list-group-item-text"><%= content %></p>'
    +           '</div>'
    +       '<div class="list-group-separator list-group-separator-small"></div>'
    +       '</div>');


hangouts.ooxxMsgTemplate =  _.template(
    '<div class="wow fadeIn animated">'
    +               '<span class="chat-ooxx-msg <%= oxClass %>"><%= content %></span>'
    +               '<div class="list-group-separator list-group-separator-small"></div>'
    +           '</div>');

hangouts.imageTemplate = _.template(
    '<div class="wow fadeIn animated">'
    +           '<div class="row-picture row-picture-no-padding" >'
    +               '<img class="circle  small-circle avatar _avatar" userid="<%= senderId %>" src="<%= senderAvatar %>" alt="icon">'
    +               '<div class="shield <%= user_ox_style %> ox_shield_user_<%= senderId %> hint hint--bottom" data-hint="受欢迎度""><%= user_ox %></div>'
    +           '</div>'
    +           '<div class="row-content medium-row-content remove-right-padding">'
    +               '<h4 class="list-group-item-heading  small-list-group-item-heading">'
    +                   '<%= senderName %>'
    +                   '<a href="javascript:void(0)" username="<%= senderName %>" class=" btn-at _at hint hint--bottom" data-hint="留言" style="padding-left:5px">@</a>'
    +                   hangouts.ooxxSection
    +               '</h4>'
    +               '<img class="_add_emoji chat-photo" src="<%= content %>"/>'
    +           '</div>'
    +       '<div class="list-group-separator list-group-separator-small"></div>'
    +       '</div>');


hangouts.naviNotificationTemplate = _.template(
    '<li class="channel-collapse <%= highlight%> _navi_note_<%= contactId%>">'  +
        '<a href="' + baseURL + 'user/<%= contactId%>" class="btn-red2 channel">'  +
            '<img class="channel-logo" src="<%= contactAvatar%>">' +
            '<text style="font-weight:400;"><%= contactName %></text>' +
            '<text style="font-weight:100;margin-left:5px"><%= senderName %>:<%= content %></text>' +           
        '</a>' +
    '</li>'
);


hangouts.scroll = function(){
    if (hangouts.$listcontainer.scrollHeight - hangouts.$listcontainer.scrollTop < 1500) {
        hangouts.$listcontainer.scrollTop = hangouts.$listcontainer.scrollHeight;
        setTimeout(function(){
            hangouts.$listcontainer.scrollTop = hangouts.$listcontainer.scrollHeight;
        }, 1000);
    }

};


//TODO already extracted from hangout module, need to implement the drag n drop way
var hangoutsImg = {};
hangoutsImg.awsFile;

$(document).ready(function(){
    hangoutsImg.uploadInit();
});

hangoutsImg.uploadInit = function() {
    if (username) {
        $('._im_image_upload').popup({
            content: '<h1>图片上传工具</h1><div class="_aws_upload _upload_Module"><input class="aws_file_uploader_input" type="file"><br /><a style="cursor: pointer;" onclick="hangoutsImg.uploadToAWS()">[ 上传 ]</a></div>'
            + '<br/><div class="_upload_Module _upload_Module"><h1>图片添加工具</h1><span>请在这里输入图片URL: </span><input class="_url_upload" type="text"><br /><a style="cursor: pointer;" onclick="hangoutsImg.addImageURLBack()">[ 添加 ]</a></div>',
            type: 'html',
            width: 320,
            height: 400
        });

        $(document).on('change', '.aws_file_uploader_input', hangoutsImg.prepareUploadToAWS);
    } else {
        $('._im_image_upload').click(function(){
            showNote('请先登录哦', 'error');
        });
    }
};

hangoutsImg.prepareUploadToAWS = function (event) {
    hangoutsImg.awsFile = event.target.files;
};

hangoutsImg.addImageURLBack = function () {
    var url = $('._url_upload').val();

    if (!url || !url.trim()) {
        showNote('URL不能为空', 'error');
        return;
    }

    var popup = $('._im_image_upload').data('popup');
    popup.close();
    hangouts.sendImageMessage(url);


};

hangoutsImg.uploadToAWS = function() {
    if (typeof hangoutsImg.awsFile === "undefined") {
        showNote('请选择要上传的照片', 'error');
        return;
    }

    $('._upload_Module').html('');
    $('._aws_upload').html('<h2>图片上传中，请稍等(づ￣3￣)</h2>');

    var data = new FormData();
    $.each(hangoutsImg.awsFile, function(key, value)
    {
        data.append(key, value);
    });



    $.ajax({
        url: baseURL + 'ajax/upload/chat',
        type: 'POST',
        data: data,
        cache: false,
        dataType: 'json',
        processData: false, // Don't process the files
        contentType: false, // Set content type to false as jQuery will tell the server its a query string request
        success: function(data, textStatus, jqXHR)
        {
            var popup = $('._im_image_upload').data('popup');
            popup.close();
            hangouts.sendImageMessage(data.url);
        },
        error: function(d)
        {
            showNote(d.responseJSON, 'error');

        }
    });
};