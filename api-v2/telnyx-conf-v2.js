// ==================================== Telnyx Conferencing ===================================

// Description:
// This simple app is creating a simple conferencing system using Call Control v2

// Author:
// Filipe Leitão (contact@fleitao.org)

// Application:
const g_appName = "telnyx-conf-v2";

// TTS Options
const g_ivr_voice = 'female';
const g_ivr_language = 'en-GB';

// Conf Options
var g_conf_id = 'no-conf';
var g_on_hold = 'false';
var g_participants = new Map();

// ======= Conventions =======
// = g_xxx: global variable
// = f_xxx: function variable
// = l_xxx: local variable
// ===========================

// ============================================================================================


var express = require('express');
var request = require('request');
var fs = require("fs");


// =============== Telnyx Account Details ===============

var configs = fs.readFileSync("telnyx-account-v2.json");
var jsonConfigs = JSON.parse(configs);

const g_telnyx_api_auth_v2 = jsonConfigs.telnyx_api_auth_v2;
const g_telnyx_waiting_url = jsonConfigs.telnyx_waiting_url;
const g_telnyx_connection_id = jsonConfigs.telnyx_connection_id;

// ======================================================


// =============== RESTful API Creation ===============

var rest = express();

// to parse json body
rest.use(express.json());



// ================================================ AUXILIARY FUNCTIONS  ================================================

function get_timestamp() {

    var now = new Date();

    return 'utc|' + now.getUTCFullYear() +
        '/' + (now.getUTCMonth() + 1) +
        '/' + now.getUTCDate() +
        '|' + now.getHours() +
        ':' + now.getMinutes() +
        ':' + now.getSeconds() +
        ':' + now.getMilliseconds();

}


// ============================================== CALL CONTROL CONFERENCE  ==============================================


// TELNYX CALL CONTROL CONFERENCE - Create Conference

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);

        if (body.data)
            f_callback(err, body.data.id);
        else
            f_callback(err, '0');


    });
}

// TELNYX CALL CONTROL CONFERENCE - Join Conference

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);
    });
}


// TELNYX CALL CONTROL CONFERENCE - Mute Participant

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);

        console.log(body);
    });
}


// TELNYX CALL CONTROL CONFERENCE - Unmute Participant

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);

        console.log(body);
    });
}

// TELNYX CALL CONTROL CONFERENCE - Hold Participant

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);

        console.log(body);

    });
}

// TELNYX CALL CONTROL CONFERENCE - Unhold Participant

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);

        console.log(body);
    });
}


// ============================================== CALL CONTROL API  ==============================================


// TELNYX CALL CONTROL API - Answer Call

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);
    });
}




// TELNYX CALL CONTROL API -  Hangup

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);
    });
}

// TELNYX CALL CONTROL API -  Dial

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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);

    });
}


// TELNYX CALL CONTROL API - Play Audio

function call_control_play(f_telnyx_api_auth_v2, f_call_control_id, f_audio_url) {

    var l_cc_action = 'playback_start';

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
            audio_url: f_audio_url
        }

    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), l_cc_action);
        console.log(body);
    });
}

// TELNYX CALL CONTROL API - SPEAK
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
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), cc_action);
        console.log(body);
    });
}


// TELNYX CALL CONTROL API - Recording Start
function call_control_record_start(f_telnyx_api_auth_v2, f_call_control_id) {

    var cc_action = 'record_start'

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
            format: 'mp3',
            channels: 'dual'
        }
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), cc_action);
        console.log(body);
    });
}


// TELNYX CALL CONTROL API - Recording Stop
function call_control_record_stop(f_telnyx_api_auth_v2, f_call_control_id) {

    var cc_action = 'record_stop'

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
        json: {}
    };

    request.post(options, function (err, resp, body) {
        if (err) {
            return console.log(err);
        }
        console.log("[%s] DEBUG - Command Executed [%s]", get_timestamp(), cc_action);
        console.log(body);
    });
}




// ================================================    WEBHOOK CREATION   ================================================


// POST - Receive Number: https://<webhook_domain>:8081/telnyx-conf/start


rest.post('/' + g_appName + '/start', function (req, res) {


    if (req && req.body && req.body.data.event_type) {
        var l_hook_event_type = req.body.data.event_type;
        var l_call_control_id = req.body.data.payload.call_control_id;
        var l_client_state_64 = req.body.data.payload.client_state;
    } else {
        console.log("[%s] LOG - Invalid Webhook received!", get_timestamp());
        res.end('0');
    }

    console.log("[%s] LOG - Webhook received - call_control_id [%s]", get_timestamp(), l_call_control_id);
    console.log("[%s] DEBUG - Webhook received - complete payload: %s", get_timestamp(),
        JSON.stringify(req.body, null, 4));



    if (l_hook_event_type == 'call.initiated') { // ===========> Call Innitiated >> Answer Call

        if (req.body.data.payload.direction == 'incoming')
            call_control_answer_call(g_telnyx_api_auth_v2, l_call_control_id, null);
        else
            call_control_answer_call(g_telnyx_api_auth_v2, l_call_control_id, 'outgoing');

        res.end();

    } else if (l_hook_event_type == 'call.answered') { // ===========> Call Answered >> Start Conference


        if (req && req.body) {
            var l_hook_from = req.body.data.payload.from;
            var l_hook_to = req.body.data.payload.to;
        } else {
            console.log("[%s] LOG - Invalid Webhook received!", get_timestamp());
            res.end('0');
        }


        if (g_conf_id == 'no-conf') {

            call_control_speak(g_telnyx_api_auth_v2, l_call_control_id,
                'Welcome to this conference demo. ' +
                'Please wait for other participants to join. '
            );

            // conference create
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

            call_control_speak(g_telnyx_api_auth_v2, l_call_control_id,
                'Welcome to this conference demo. ' +
                'We are now putting you on the conference room. '
            );

            call_control_join_conf(g_telnyx_api_auth_v2, l_call_control_id, g_conf_id, 'agent-in');

            if (!l_client_state_64)
                g_participants.set(l_call_control_id, l_hook_from); // add inbound participant to the list
            else
                g_participants.set(l_call_control_id, l_hook_to); // add outbound participant to the list

        }

        res.end();



    } else if (l_hook_event_type == 'conference.created') {


        console.log("[%s] LOG - New Conference Created! - Conference ID [%s]", get_timestamp(), g_conf_id);

        res.end();


    } else if (l_hook_event_type == 'conference.participant.joined') {


        if (g_participants.size < 2) {

            // First Participant
            call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [l_call_control_id], g_telnyx_waiting_url);
            g_on_hold = l_call_control_id;

        } else if (g_participants.size == 2) {

            // Second Participant
            call_control_unhold(g_telnyx_api_auth_v2, g_conf_id, [g_on_hold]);
            g_on_hold = 'false';

        }

        console.log("[%s] LOG - Participant Joined - call_control_id [%s]", get_timestamp(), l_call_control_id);

        res.end();


    } else if (l_hook_event_type == 'conference.participant.left') {

        // remove participant from the list
        g_participants.delete(l_call_control_id);

        console.log("[%s] LOG - Participant Left - call_control_id [%s]", get_timestamp(), l_call_control_id);

        if (g_participants.size < 1) {

            g_conf_id = 'no-conf';

        } else if (g_participants.size == 1) {

            for (var key of g_participants.keys()) {

                // First Participant
                call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [key], g_telnyx_waiting_url);
                g_on_hold = key;
            }
        }

        res.end();

    } else if (l_hook_event_type == 'call.speak.ended' ||
        l_hook_event_type == 'call.speak.started' ||
        l_hook_event_type == 'playback.ended' ||
        l_hook_event_type == 'call.hangup' ||
        l_hook_event_type == 'gather.ended' ||
        l_hook_event_type == 'call.bridged' ||
        l_hook_event_type == 'dtmf' ||
        l_hook_event_type == 'playback.started') { // ===========> Anything Else >> 200ok

        res.end();

    }

})

// GET - Participant Lists: https://<webhook_domain>:8081/telnyx-conf/list


rest.get('/' + g_appName + '/list', function (req, res) {


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



// GET - Mute Participant: https://<webhook_domain>:8081/telnyx-conf/mute?participant=x


rest.get('/' + g_appName + '/mute', function (req, res) {


    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_mute(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant muted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})



// GET - Unmute Participant: https://<webhook_domain>:8081/telnyx-conf/unmute?participant=x


rest.get('/' + g_appName + '/unmute', function (req, res) {


    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unmute(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant unmuted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})


// GET - Hold Participant: https://<webhook_domain>:8081/telnyx-conf/hold?participant=x


rest.get('/' + g_appName + '/hold', function (req, res) {


    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_hold(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant], g_telnyx_waiting_url);

        res.end("participant on hold [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})


// GET - Unhold Participant: https://<webhook_domain>:8081/telnyx-conf/unhold?participant=x


rest.get('/' + g_appName + '/unhold', function (req, res) {


    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unhold(g_telnyx_api_auth_v2, g_conf_id, [req.query.participant]);

        res.end("participant resumed [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})

// GET - Participant Recording Start: https://<webhook_domain>:8081/telnyx-conf-v2/record-start?participant=x


rest.get('/' + g_appName + '/record-start', function (req, res) {
    call_control_record_start(g_telnyx_api_auth_v2, req.query.participant);
    res.end("recording started for " + req.query.participant);
})

// GET - Participant Recording Stop: https://<webhook_domain>:8081/telnyx-conf-v2/record-stop?participant=x

rest.get('/' + g_appName + '/record-stop', function (req, res) {
    call_control_record_stop(g_telnyx_api_auth_v2, req.query.participant);
    res.end("recording stopped for " + req.query.participant);
})


// GET - Pull Participant: https://<webhook_domain>:8081/telnyx-conf/pull?number=%2Bx

// Note: using "conf" as Caller ID will make Telnyx to decided what Caller ID to use, i.e. local or anonymous call
//       You can change that behavior by adding the specific Caller ID number you wan't to be used

rest.get('/' + g_appName + '/pull', function (req, res) {
    call_control_dial(g_telnyx_api_auth_v2, req.query.number, "conf", g_telnyx_connection_id);
    res.end("calling " + req.query.number);
})


// ================================================ RESTful Server Start ================================================

var server = rest.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port


    console.log("[%s] SERVER - " + g_appName + " app listening at http://%s:%s", get_timestamp(), host, port)

})
