# Call Control Conference System

The [Call Control framework](https://developers.telnyx.com/docs/api/v2/call-control) is a set of REST APIs that allow you to control the complete call flow from the moment a call comes in (or out) to the moment you terminate that call. In between you will receive a number of [webhooks](https://developers.telnyx.com/docs/v2/call-control/receiving-webhooks) for each step of the call, to which you answer with a [command](https://developers.telnyx.com/docs/v2/call-control/sending-commands) of your need. It's this back and forward communication that makes Call Control so great in terms of the granular control you have for your call.

Among the options you have for Call Control there is the [Call Control Conference](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands) framework. This framework allows you to create a conference upon an incoming or outgoing call. 


## Conference Webhooks and Commands
The same way for any other Call Control framework, Call Control Conference also works based on HTTP webhooks and REST commands back and forward. To build and manage a conference room and its participants Call Control Conference gives a set of commands to enforce the following actions:

- create a new Conference room with `POST` [https://api.telnyx.com/v2/conferences](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#CreateConference)
- list all conferences that exist on your running Call Control with `GET` [https://api.telnyx.com/v2/conferences](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#GetConferences)
- put an user in a specific conference room with [join conference](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#JoinConference)
- mute and unmute specific users with [mute participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#MuteConference)
- hold and unhold specific users with [hold participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#HoldConference)

Those commands will make Telnyx to take the actions described above and some will trigger the following webhooks:

- conference.participant.joined
- conference.participant.left


## Creating Your Conference System Logic

When you create a Conference Room with Call Control you will obviously keep receiving regular Call Control Webhooks that are non-Conference related. It is by mixing regular Call Control webhooks and commands with Call Control Conference webhooks and commands that you create your application logic. 

For the purpose of this guide we are using simple `node.js` that would have the *Create Conference* command defined as follows:


```js
function call_control_create_conf(f_telnyx_api_auth_v2, f_call_control_id, f_name, f_callback) {

    var options = {
        url: 'https://api.telnyx.com/v2/conferences/',

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            call_control_id: f_call_control_id,
            name: f_name,
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }

        if (body.data)
            f_callback(err, body.data.id);
        else
            f_callback(err, '0');
    });
}
```

Where `f_telnyx_api_auth_v2` is the *API V2* token being used for authentication, `f_call_control_id` is the Call Control Id from the call leg I want to use to create the conference, `f_name` is simply the name I want to give to this particular conference room and finally `f_callback` is the javascript callback function that allows me to keep control over the `async` way of working of Call Control (i.e. webhooks might not come in any specific order).

In the logic we are building for this guide we are issuing the *Conference Create* right after a `call.answered` webhook is received. If for some reason that fails we issue a `Call Control Hangup` command, otherwise we just iterate a list of participants we maintain:

```js

if (l_hook_event_type == 'call.answered') { 

                (...)

     call_control_create_conf(g_telnyx_api_auth_v2, l_call_control_id, 'conf-created', 'myconf', function (conf_err, conf_res) {

        if (conf_res == '0') {
            call_control_hangup(g_telnyx_api_auth_v2, l_call_control_id);
        } else {
                (...)                    
            g_participants.set(l_call_control_id, l_hook_to); 
        }
    });
}
```

If the previous command succeeds Telnyx will be sending a `conference.participant.joined` webhook and we will act accordingly, etc. It's this sort of "pong" game that allows you to build the logic that you need for your app. As for Telnyx, we make sure to keep you up to date with everything that occurs with your call with the finest granular level we can provide. 


## Complete Running Call Control Conference Apps

To help you understand the concepts we just walk you through, we build two `node.js` applications in both Call Control V1 and V2 versions of the API.

We invite you to have a deeper look in order to see the differences and step-by-step instructions:

1. [Telnyx Conference System Demo in API v1](https://github.com/team-telnyx/demo-conference-node/tree/master/api-v1)
2. [Telnyx Conference System Demo in API v2](https://github.com/team-telnyx/demo-conference-node/tree/master/api-v2)
