// ==================================== Telnyx Conferencing ===================================

// Description:
// This simple app is creating a simple conferencing system using Call Control v1

// Author:
// Filipe Leitão (filipe@telnyx.com)

// Application:
const g_appName = "telnyx-conf";

// TTS Options
const g_ivr_voice = 'female';
const g_ivr_language = 'en-US';

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

var configs = fs.readFileSync("telnyx-account.json");
var jsonConfigs = JSON.parse(configs);

const g_telnyx_api_key_v1 = jsonConfigs.telnyx_api_key_v1;
const g_telnyx_api_secret_v1 = jsonConfigs.telnyx_api_secret_v1;
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

function call_control_create_conf(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_call_control_id, f_client_state_s, f_name, f_callback) {

    var l_cc_action = 'create_conf';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/conferences/',

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

        f_callback(err, body.data.id);

    });
}

// TELNYX CALL CONTROL CONFERENCE - Join Conference

function call_control_join_conf(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_call_control_id, f_conf_id, f_client_state_s) {

    var l_cc_action = 'join';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_mute(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_conf_id, f_call_control_ids) {

    var l_cc_action = 'mute';



    var options = {
        url: 'https://api.telnyx.com/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_unmute(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_conf_id, f_call_control_ids) {

    var l_cc_action = 'unmute';



    var options = {
        url: 'https://api.telnyx.com/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_hold(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_conf_id, f_call_control_ids, f_audio_url) {

    var l_cc_action = 'hold';

    var options = {
        url: 'https://api.telnyx.com/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_unhold(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_conf_id, f_call_control_ids, f_audio_url) {

    var l_cc_action = 'unhold';

    var options = {
        url: 'https://api.telnyx.com/conferences/' +
            f_conf_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_answer_call(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_call_control_id, f_client_state_s) {

    var l_cc_action = 'answer';

    var l_client_state_64 = null;

    if (f_client_state_s)
        l_client_state_64 = Buffer.from(f_client_state_s).toString('base64');


    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
        },

        json: {
            client_state: l_client_state_64 //if inbound call >> null
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

function call_control_hangup(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_call_control_id) {

    var l_cc_action = 'hangup';

    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            l_cc_action,

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

function call_control_dial(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_dest, f_from, f_connection_id) {

    var l_cc_action = 'dial';

    var options = {
        url: 'https://api.telnyx.com/calls/',

        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
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

// TELNYX CALL CONTROL API - SPEAK
function call_control_speak(f_telnyx_api_key_v1, f_telnyx_api_secret_v1, f_call_control_id, f_tts_text) {

    var cc_action = 'speak'

    var options = {
        url: 'https://api.telnyx.com/calls/' +
            f_call_control_id +
            '/actions/' +
            cc_action,
        auth: {
            username: f_telnyx_api_key_v1,
            password: f_telnyx_api_secret_v1
        },
        json: {
            payload: f_tts_text,
            voice: g_ivr_voice,
            language: g_ivr_language,
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







// ================================================    WEBHOOK CREATION   ================================================


// POST - Receive Number: https://<webhook_domain>:8081/telnyx-conf/start


rest.post('/' + g_appName + '/start', function (req, res) {


    if (req && req.body && req.body.event_type) {
        var l_hook_event_type = req.body.event_type;
        var l_call_control_id = req.body.payload.call_control_id;
        var l_client_state_64 = req.body.payload.client_state;
    } else {
        console.log("[%s] LOG - Invalid Webhook received!", get_timestamp());
        res.end('0');
    }

    console.log("[%s] LOG - Webhook received - call_control_id [%s]", get_timestamp(), l_call_control_id);
    console.log("[%s] DEBUG - Webhook received - complete payload: %s", get_timestamp(),
        JSON.stringify(req.body, null, 4));



    if (l_hook_event_type == 'call_initiated') { // ===========> Call Innitiated >> Answer Call

        if (req.body.payload.direction == 'incoming')
            call_control_answer_call(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id, null);
        else
            call_control_answer_call(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id, 'outgoing');

        res.end();

    } else if (l_hook_event_type == 'call_answered') { // ===========> Call Answered >> Start Conference


        if (req && req.body) {
            var l_hook_from = req.body.payload.from;
            var l_hook_to = req.body.payload.to;
        } else {
            console.log("[%s] LOG - Invalid Webhook received!", get_timestamp());
            res.end('0');
        }


        if (g_conf_id == 'no-conf') {

            // First participant message
            call_control_speak(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id,
                'Welcome to this conference demo. ' +
                'Please wait for other participants to join. '
            );

            // Create Conference
            call_control_create_conf(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id, 'conf-created', 'myconf', function (conf_err, conf_res) {
                g_conf_id = conf_res;

                // Add Participant to the Participant List
                if (!l_client_state_64)
                    g_participants.set(l_call_control_id, l_hook_from); // add inbound participant to the list
                else
                    g_participants.set(l_call_control_id, l_hook_to); // add outbound participant to the list

            });

        } else {

            // Consequent participants message
            call_control_speak(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id,
                'Welcome to this conference demo. ' +
                'We are now putting you on the conference room. '
            );

            call_control_join_conf(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, l_call_control_id, g_conf_id, 'agent-in');

            // Add Participant to the Participant List
            g_participants.set(l_call_control_id, l_hook_from); // add participant to the list

        }

        res.end();



    } else if (l_hook_event_type == 'conference_created') { // ===========> Conference Created >> Just Log


        console.log("[%s] LOG - New Conference Created! - Conference ID [%s]", get_timestamp(), g_conf_id);

        res.end();


    } else if (l_hook_event_type == 'conference_join') { // ===========> Conference Join >> Hold/Unhold Participant


        // Note: most recent Call Control versions include this hability from scratch, please check the new documentation

        if (g_participants.size < 2) {

            // First Participant
            call_control_hold(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [l_call_control_id], g_telnyx_waiting_url);
            g_on_hold = l_call_control_id;

        } else if (g_participants.size == 2) {

            // Second Participant
            call_control_unhold(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [g_on_hold]);
            g_on_hold = 'false';

        }

        console.log("[%s] LOG - Participant Joined - call_control_id [%s]", get_timestamp(), l_call_control_id);

        res.end();


    } else if (l_hook_event_type == 'conference_leave') { // ===========> Conference Leave >> Remove Participant / Cleanup Vars

        // Remove participant from the list
        g_participants.delete(l_call_control_id);

        console.log("[%s] LOG - Participant Left - call_control_id [%s]", get_timestamp(), l_call_control_id);


        // Reset Conf_Id if conference room empty

        if (g_participants.size < 1) {

            g_conf_id = 'no-conf';

            // Put participant back on hold if it's the last one
        } else if (g_participants.size == 1) {

            for (var key of g_participants.keys()) {

                // First Participant
                call_control_hold(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [key], g_telnyx_waiting_url);
                g_on_hold = key;
            }
        }

        res.end();


    } else if (l_hook_event_type == 'speak_ended' ||
        l_hook_event_type == 'speak_started' ||
        l_hook_event_type == 'speak_ended' ||
        l_hook_event_type == 'playback_ended' ||
        l_hook_event_type == 'call_hangup' ||
        l_hook_event_type == 'gather_ended' ||
        l_hook_event_type == 'call_bridged' ||
        l_hook_event_type == 'dtmf' ||
        l_hook_event_type == 'playback_started') { // ===========> Anything Else >> Just Ack/200ok

        res.end();

    }

})



// GET - Participant Lists: https://<webhook_domain>:8081/telnyx-conf/list


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



// GET - Mute Participant: https://<webhook_domain>:8081/telnyx-conf/mute?participant=x


rest.get('/' + g_appName + '/mute', function (req, res) {

    // Mute specific Participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_mute(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [req.query.participant]);

        res.end("participant muted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})



// GET - Unmute Participant: https://<webhook_domain>:8081/telnyx-conf/unmute?participant=x


rest.get('/' + g_appName + '/unmute', function (req, res) {

    // Un-Mute specific Participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unmute(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [req.query.participant]);

        res.end("participant unmuted [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})


// GET - Hold Participant: https://<webhook_domain>:8081/telnyx-conf/hold?participant=x


rest.get('/' + g_appName + '/hold', function (req, res) {

    // Put specific participant on-hold

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_hold(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [req.query.participant], g_telnyx_waiting_url);

        res.end("participant on hold [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})


// GET - Unhold Participant: https://<webhook_domain>:8081/telnyx-conf/unhold?participant=x


rest.get('/' + g_appName + '/unhold', function (req, res) {

    // Un-hold specific participant

    if (g_participants.size > 0 && g_conf_id != 'no-conf') {

        call_control_unhold(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, g_conf_id, [req.query.participant]);

        res.end("participant resumed [" + req.query.participant + "]");

    } else
        res.end("no participant or no conference exists");

})


// GET - Pull Participant: https://<webhook_domain>:8081/telnyx-conf/pull?number=x


rest.get('/' + g_appName + '/pull', function (req, res) {

    // Dial-out to specific number to pull participant in

    call_control_dial(g_telnyx_api_key_v1, g_telnyx_api_secret_v1, req.query.number, "conf", g_telnyx_connection_id);
    res.end("called " + req.query.number);
})


// ================================================ RESTful Server Start ================================================

var server = rest.listen(8081, function () {

    var host = server.address().address
    var port = server.address().port


    console.log("[%s] SERVER - " + g_appName + " app listening at http://%s:%s", get_timestamp(), host, port)

})
