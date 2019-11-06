# Telnyx Conference System Demo
Telnyx Conference System demo built on Call Control and node.js.


In this tutorial, you’ll learn how to:

1. Set up your development environment to use Telnyx Call Control using Node.
2. Build a simple Telnyx Call Control Conference System using Node.


---

- [Prerequisites](#prerequisites)
- [Telnyx Call Control Basics](#telnyx-call-control-basics)
  - [Understanding the Command Syntax](#understanding-the-command-syntax)
  - [Telnyx Call Control Basic Set](#telnyx-call-control-basic-set)
  - [Telnyx Call Control Conference Commands](#telnyx-call-control-conference-commands)
- [Building a Conference System](#building-a-conference-system)
- [Interacting with the Conference Room](#interacting-with-the-conference-room)
- [Lightning-Up the Application](#lightning-up-the-application)

---

## Prerequisites

Before you get started, you’ll need to complete these steps:

1. Have a Telnyx account, that you can create [here](https://telnyx.com/sign-up).
2. Buy a Telnyx number on Mission Portal, that you can learn how to do [here](https://support.telnyx.com/en/articles/1130593-number-ordering).
3. Create a new Connection as Call Control on Mission Portal, that you can learn how to do [here](https://support.telnyx.com/en/articles/1176788-connection-creation).
4. You’ll need to have `node` installed to continue. You can check this by running the following:

```shell
$ node -v
```

If Node isn’t installed, follow the [official installation instructions](https://nodejs.org/en/download/) for your operating system to install it.

You’ll need to have the following Node dependencies installed for the Call Control API:

```js
require(express);
require(request);
require(fs);
```


## Telnyx Call Control Basics

For the Call Control application you’ll need to get a set of basic functions to perform Telnyx Call Control Commands plus Telnyx Call Control Conference specifics. 

This tutorial will be using the following subset of basic Telnyx Call Control Commands:

- [Call Control Answer](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlAnswer)
- [Call Control Hangup](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlHangup)
- [Call Control Speak](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlSpeak)
- [Call Control Dial](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlDial)

Plus all the Telnyx Call Control Conference Commands:

- [Call Control Join Conference](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#JoinConference)
- [Call Control Mute Conference Participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#MuteConference)
- [Call Control Unmute Conference Participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#UnmuteConference)
- [Call Control Hold Conference Participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#HoldConference)
- [Call Control Unhold Conference Participant](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#UnholdConference)


You can get the full set of available Telnyx Call Control Commands [here](https://developers.telnyx.com/docs/api/v2/overview).

For each Telnyx Call Control Command we will be creating a function that will execute an `HTTP POST` Request to back to Telnyx server.  To execute this API we are using Node `request`, so make sure you have it installed. If not you can install it with the following command:

```shell
$ npm install request --save
```

After that you’ll be able to use ‘request’ as part of your app code as follows:

```js
var request = require('request');
```

To make use of the Telnyx Call Control Command API you’ll need to set a Telnyx API Key and Secret. 

To check that go to Mission Control Portal and under the `Auth` tab you select `Auth V2`. There you'll find credentials for `Auth v2 API Keys`. Click on `Create API Key` and save the key that is shown to you. Please store it as you wont be able to fetch it later.

Once you have it, you can include it on the [telnyx-account-v2.json](https://github.com/team-telnyx/demo-conference-node/blob/master/api-v2/telnyx-account-v2.json) file.

```js
"telnyx_api_auth_v2": "<your-api-v2-key-here>"
```

This application will also make use of a hosted audio file for the waiting tone while on [hold](https://developers.telnyx.com/docs/api/v2/call-control/Conference-Commands#HoldConference):

```js
"telnyx_waiting_url": "<your-path-to-waiting-song-here>"
```

As well as the Connection ID of the Call Control Connection for the [Dial](https://developers.telnyx.com/docs/api/v2/call-control/Call-Commands#CallControlDial) command:

```js
"telnyx_connection_id": "<your-call-control-connection-id>"
```

You can find the Call Control Connection ID in the Mission Portal by editing the connection being used:

<p align="center">
    <img src="https://raw.githubusercontent.com/team-telnyx/demo-conference-node/master/resources/connection-id.png" width="50%" height="50%" title="connection-id">
</p>



Once all dependencies are set, we can create a function for each Telnyx Call Control Command. All Commands will follow the same syntax:

```js

function call_control_COMMAND_NAME(f_call_control_id, f_INPUT1, ...){
    
    var cc_action = ‘COMMAND_NAME’

    var options = {
        url: 'https://api.telnyx.com/v2/calls/' 
                +  f_call_control_id 
                + '/actions/' 
                + cc_action,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
           PARAM1:  f_INPUT-1,
             ...
        } 
    };

    request.post(options,function(err,resp,body){
        if (err) { return console.log(err); }
    });  
}  
```

### Understanding the Command Syntax

There are several aspects of this function that deserve some attention:

- `Function Input Parameters`: to execute every Telnyx Call Control Command you’ll need to feed your function with the following: the `Call Control ID`; and the input parameters, specific to the body of the Command you’re executing. Having these set as function input parameters will make it generic enough to reuse in different use cases:
```js
function call_control_COMMAND_NAME(f_call_control_id, f_INPUT)
```
Most all Telnyx Call Control Commands will be expecting the `Call Control ID` except `Dial`. There you’ll get a new one for the leg generated as response.

- `Name of the Call Control Command`: as detailed [here](https://developers.telnyx.com/docs/api/v2/overview), the Command name is part of the API URL. In our code we call that the `action` name, and will feed the POST Request URL later:
```js
var cc_action = ‘COMMAND_NAME’
```

- `Building the Telnyx Call Control Command`: once you have the Command name defined, you should have all the necessary info to build the complete Telnyx Call Control Command:
```js
var options = {
    url: 'https://api.telnyx.com/v2/calls/' 
            +  f_call_control_id 
            + '/actions/' 
            + cc_action,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
    },
    form: {
        PARAM:  f_INPUT, 
    } 
};
```

In this example you can see that `Call Control ID` and the Action name will feed the URL of the API, and the Telnyx API Key feed the Authentication headers, and the body will be formed with all the different input parameters  received for that specific Command. 


- `Calling the Telnyx Call Control Command`: Having the request  `headers` and `options`/`body` set, the only thing left is to execute the `POST Request` to execute the command. 
For that we are using making use of the node's `request` module:
```js
 request.post(options,function(err,resp,body){
    if (err) { return console.log(err); }
});  
```

### Telnyx Call Control Basic Set

This is how every Telnyx Call Control Command used in this application look like:


#### Call Control Answer

```js
function call_control_answer_call(f_telnyx_api_auth_v2, f_call_control_id, f_client_state_s) {

    var l_cc_action = 'answer';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/v2/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            client_state: l_client_state_64
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Hangup

```js
function call_control_hangup(f_telnyx_api_auth_v2, f_call_control_id) {

    var l_cc_action = 'hangup';

    var options = {
        url: 'https://api.telnyx.com/v2/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {}
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Dial

```js
function call_control_dial(f_telnyx_api_auth_v2, f_dest, f_from, f_connection_id) {

    var l_cc_action = 'dial';

    var options = {
        url: 'https://api.telnyx.com/v2/calls/',

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            to: f_dest,
            from: f_from,
            connection_id: f_connection_id,
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Call Control Speak

```js
function call_control_speak(f_telnyx_api_auth_v2, f_call_control_id, f_tts_text) {

    var cc_action = 'speak'

    var options = {
        url: 'https://api.telnyx.com/v2/calls/' +
            f_call_control_id +
            '/actions/' +
            cc_action,
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            payload: f_tts_text,
            voice: g_ivr_voice,
            language: g_ivr_language
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

### Telnyx Call Control Conference Commands
This is how every Telnyx Call Control Conference Commands look like:


#### Conference: Create Conference

```js
function call_control_create_conf(f_telnyx_api_auth_v2, f_call_control_id, f_client_state_s, f_name, f_callback) {

    var l_cc_action = 'create_conf';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


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
            client_state: l_client_state_64
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

#### Conference: Join Conference

```js
function call_control_join_conf(f_telnyx_api_auth_v2, f_call_control_id, f_conf_id, f_client_state_s) {

    var l_cc_action = 'join';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/v2/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            call_control_id: f_call_control_id,
            client_state: l_client_state_64
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Conference: Mute Participant

```js
function call_control_mute(f_telnyx_api_auth_v2, f_conf_id, f_call_control_ids) {

    var l_cc_action = 'mute';

    var options = {
        url: 'https://api.telnyx.com/v2/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },
        json: {
            call_control_ids: f_call_control_ids
        }

    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Conference: Umute Participant

```js
function call_control_unmute(f_telnyx_api_auth_v2, f_conf_id, f_call_control_ids) {

    var l_cc_action = 'unmute';

    var options = {
        url: 'https://api.telnyx.com/v2/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },

        json: {
            call_control_ids: f_call_control_ids
        }

    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Conference: Hold Participant

```js
function call_control_hold(f_telnyx_api_auth_v2, f_conf_id, f_call_control_ids, f_audio_url) {

    var l_cc_action = 'hold';

    var options = {
        url: 'https://api.telnyx.com/v2/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },

        json: {
            call_control_ids: f_call_control_ids,
            audio_url: f_audio_url
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```

#### Conference: Unhold Participant

```js
function call_control_unhold(f_telnyx_api_auth_v2, f_conf_id, f_call_control_ids, f_audio_url) {

    var l_cc_action = 'unhold';

    var options = {
        url: 'https://api.telnyx.com/v2/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': 'Bearer ' + f_telnyx_api_auth_v2
        },

        json: {
            call_control_ids: f_call_control_ids
        }

    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
    });
}
```



`Client State`: within some of the Telnyx Call Control Commands list we presented, you probably noticed we were including the `Client State` parameter. `Client State` is the key to ensure that we can maintain state while consuming the same Call Control Events. 

Because Call Control is stateless and async your application will be receiving several events of the same type, e.g. user just included `DTMF`. With `Client State` you enforce a unique ID to be sent back to Telnyx which be used within a particular Command flow and identifying it as being at Level 2 of a certain IVR for example.


## Building a Conference System

With all the basic and conference related Telnyx Call Control Commands set, we are ready to put them in the order that will create a simple Conference System. For that all we are going to do is to: 

1. handle incoming calls and place participants in the conference
2. push for outgoing calls and place participants in the conference
3. maintain a participant list 
4. greet the new participants before place them on the conference room
5. put the first participant automatically on hold 
6. put a participant on-hold every-time he's the only participant on the conference room 
7. un-hold the unique participant on the conference room when the second arrives
8. allow remote commands to list participants, force hold/unhold, force mute/unmute, force participant pull 


To exemplify this process we created a simple API call that will be exposed as the webhook in Mission Portal. For that we would be using `express`:

```shell
$ npm install request --save
```

With `express` we can create an API wrapper that uses `HTTP POST` to call our Request Token method:

```js
rest.post('/'+g_appName+'/start', function (req, res) {
  // app code goes here  
})
```

This would expose a webhook like the following: 

    https://<webhook_domain>:8081/telnyx-conf-v2/start

You probably noticed that `g_appName` in  the previous point. That is part of a set of global variables we are defining with a certain set of info we know we are going to use in this app: TTS parameters, like voice and language to be used, etc. 

For the purpose of maintaining the Conference list and state of the Conference room we also define a set of global variables.

You can set these at the beginning of your code:

```js
// Application:
const g_appName = "telnyx-conf-v2";

// TTS Options
const g_ivr_voice     = 'female';
const g_ivr_language = 'en-GB';

// Conf Options
var g_conf_id = 'no-conf';
var g_on_hold = 'false';
var g_participants = new Map();
```

With that set, we can fill in that space that we named as `app code goes here`. So as you expose the URL created as Webhook in Mission Control associated with your number, you’ll start receiving all call events for that call. 

So the first thing to be done is to identify the kind of event you just received and extract the `Call Control Id` and `Client State` (if defined previously):

```js
if (req && req.body && req.body.data.event_type) {
    var l_hook_event_type = req.body.data.event_type;
    var l_call_control_id = req.body.data.payload.call_control_id;
    var l_client_state_64 = req.body.data.payload.client_state;
} else{res.end('0');}
```

Once you identify the `Event Type` received, it’s just a matter of having your application reacting to that. Is the way you react to that Event that helps you creating the IVR logic. What you would be doing is to execute Telnyx Call Control Command as a reaction to those Events.

*Important Note: For consistency Telnyx Call Control engine requires every single Webhook to be replied by the Webhook end-point, otherwise will keep trying. For that reason we have to be ready to consume every Webhook we expect to receive and reply with 200 OK.*


### `Webhook Call Initiated >> Command Answer Call`

```js
    if (req.body.data.payload.direction == 'incoming')
        call_control_answer_call(g_telnyx_api_auth_v2, l_call_control_id, null);
    else
        call_control_answer_call(g_telnyx_api_auth_v2, l_call_control_id, 'outgoing');
    res.end();
```

### `Webhook Call Answered >> Start Conference`

Once your app is notified by Telnyx that the call was established you want to either start the conference room or put the participant in an already existing room.

```js
if (g_conf_id == 'no-conf') {

    // First participant message
    call_control_speak(g_telnyx_api_auth_v2, l_call_control_id,
        'Welcome to this conference demo. ' +
        'Please wait for other participants to join. '
    );

    // Create Conference
    call_control_create_conf(g_telnyx_api_auth_v2, l_call_control_id, 'conf-created', 'myconf', function (conf_err, conf_res) {

        if (conf_res == '0') {
            console.log("[%s] LOG - Conference Creation Failed!", get_timestamp());
            call_control_hangup(g_telnyx_api_auth_v2, l_call_control_id);
        } else {
            g_conf_id = conf_res;

            if (!l_client_state_64)
                g_participants.set(l_call_control_id, l_hook_from); // add inbound participant to the list
            else
                g_participants.set(l_call_control_id, l_hook_to); // add outbound participant to the list
        }

    });

} else {

    // Consequent participants message
    call_control_speak(g_telnyx_api_auth_v2, l_call_control_id,
        'Welcome to this conference demo. ' +
        'We are now putting you on the conference room. '
    );

    call_control_join_conf(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id, g_conf_id, 'agent-in');

    // Add Participant to the Participant List
    if (!l_client_state_64)
        g_participants.set(l_call_control_id, l_hook_from); // add inbound participant to the list
    else
        g_participants.set(l_call_control_id, l_hook_to); // add outbound participant to the list
}

res.end();
```

### `Conference Created >> Just Log`
Your app will be informed that the Conference was created. 

```js
console.log("[%s] LOG - New Conference Created! - Conference ID [%s]", get_timestamp(), g_conf_id);
res.end();
}
```

### `Conference Join >> Hold/Unhold Participant`
Your app will be informed that a participant just joined the room. 

```js
if (g_participants.size < 2) {

    // First Participant
    call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [l_call_control_id], g_telnyx_waiting_url);
    g_on_hold = l_call_control_id;

} else if (g_participants.size == 2) {

    // Second Participant
    call_control_unhold(g_telnyx_api_auth_v2, g_conf_id, [g_on_hold]);
    g_on_hold = 'false';

}
res.end();
```

### `Conference Leave >> Remove Participant / Cleanup Vars`
Your app will be informed that a participant just left the room, we need to cleanup some things. 

```js
// Remove participant from the list
g_participants.delete(l_call_control_id);

// Reset Conf_Id if conference room empty
if (g_participants.size < 1) {

    g_conf_id = 'no-conf';

// Put participant back on hold if it's the last one
} else if (g_participants.size == 1) {

    for (var key of g_participants.keys()) {

        // First Participant
        call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [key], g_telnyx_waiting_url);
        g_on_hold = key;
    }
}

res.end();
```

### `Anything Else >> Just Ack/200ok`

```js
    } else if (l_hook_event_type == 'call.speak.ended' ||
        l_hook_event_type == 'call.speak.started' ||
        l_hook_event_type == 'playback.ended' ||
        l_hook_event_type == 'call.hangup' ||
        l_hook_event_type == 'gather.ended' ||
        l_hook_event_type == 'call.bridged' ||
        l_hook_event_type == 'dtmf' ||
        l_hook_event_type == 'playback.started') { 
        res.end();

}
```



## Interacting with the Conference Room
As part of the process of building a Conference Room, there is also the possibility of interacting with the application to list participants and engage with direct participants. We do that by creating a couple of `HTTP GET` commands that can be then called by a browser, cURL or Postman.


### `Listing Participants`

*https://<webhook_domain>:8081/telnyx-conf-v2/list*

```js
rest.get('/' + g_appName + '/list', function (req, res) {

    // Return/Display complete participant list

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        var l_list = 'Conference ID: ' + g_conf_id + '\n';
        l_list += '\n';
        l_list += 'Participant List: \n';

        for (var key of g_participants.keys()) {
            l_list += key + ' - [' + g_participants.get(key) + '] \n';
        }

        res.end(l_list);

    } else
        res.end("no participant or no conference exists");
})

```

### `Mute Participant`

*https://<webhook_domain>:8081/telnyx-conf-v2/mute?participant=x*

```js
rest.get('/' + g_appName + '/mute', function (req, res) {

    // Mute specific Participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_mute(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant muted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");
})
```

### `Unute Participant`

*https://<webhook_domain>:8081/telnyx-conf-v2/unmute?participant=x*

```js
rest.get('/' + g_appName + '/unmute', function (req, res) {

    // Un-Mute specific Participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unmute(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant unmuted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");
})
```

### `Hold Participant`

*https://<webhook_domain>:8081/telnyx-conf-v2/hold?participant=x*

```js
rest.get('/' + g_appName + '/hold', function (req, res) {

    // Put specific participant on-hold

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant], g_telnyx_waiting_url);

        res.end("participant on hold [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");
})
```


### `Unhold Participant`

*https://<webhook_domain>:8081/telnyx-conf-v2/unhold?participant=x*

```js
rest.get('/' + g_appName + '/unhold', function (req, res) {

    // Un-hold specific participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unhold(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant resumed [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");
})
```

### `Pull Participant`

*https://<webhook_domain>:8081/telnyx-conf-v2/pull?number=x*

Please note that a URL encoded number format is expected by the webhook, so for international `+E164` numbers we should replace `+` per `%2B`.

Example:

https://<webhook_domain>:8081/telnyx-conf-v2/pull?number=%2B351933090907


```js
rest.get('/' + g_appName + '/pull', function (req, res) {

    // Dial-out to specific number to pull participant

    call_control_dial(g_telnyx_api_auth_v2, req.query.number, "conf", g_telnyx_connection_id);
    res.end("called " + req.query.number);
})
```


## Lightning-Up the Application
Finally the last piece of the puzzle is having your application listening for Telnyx Webhooks:

```js
var server = rest.listen(8081, function () {
  var host = server.address().address
  var port = server.address().port
})
```




