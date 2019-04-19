'use strict';

const request = require('request');

function formatResponse(sessionAttributes, fulfillmentState, location) {
    
    var chatReply = "Not able to locate!";
    
    if (location) {
        chatReply = location;
    }
    
    var message = {'contentType': 'PlainText', 'content': chatReply};
    
    return {
        sessionAttributes,
        dialogAction: {
            type: 'Close',
            fulfillmentState,
            message,
        },
    };
}

// replace with internal system call that gets realtime GPS coordinates for a given assetType
function getTrackablePersonLocation(name) {
    var coords = null;
    
    switch(name) {
      case 'nic':
        coords = {lat:47.679506, lng:-122.387584};  // ballard
        break;
      case 'mike':
        coords = {lat:47.570186, lng:-122.386759};  // west seattle
        break;
      case 'jay':
        coords = {lat:47.603980, lng:-122.335579};  // downtown
        break;
        case 'richard':
        coords = {lat:47.608291, lng:-122.338056};  // downtown
        break;
      default:
        coords = null;  // for demo purposes we only, no error handling
    }
    
    return coords;
}

// --------------- Events -----------------------

function dispatch(intentRequest, callback) {

    const sessionAttributes = intentRequest.sessionAttributes;

    console.log(`dispatch userId=${intentRequest.userId}, intentName=${intentRequest.currentIntent.name}`);

    const slots = intentRequest.currentIntent.slots;
    const trackablePerson = slots.slotOne.toLowerCase();
    var formattedResponse = null;
    var coords = getTrackablePersonLocation(trackablePerson);
    
    if (coords) {
        const url = 'https://reverse.geocoder.api.here.com/6.2/reversegeocode.json' +
                '?app_id=tSXbAYr7C2G2JzFqITty' +
                '&app_code=Af_oJSzqZ-zvR6WL0vmW2A' +
                '&prox=41.8842,-87.6388' +
                '&mode=retrieveAreas&maxresults=1&gen=9';

        request(url, { json: true }, (err, res, body) => {

                    if (err) { return console.log('err: ', err); }

                    console.log('statusCode:', res && res.statusCode);
                    console.log('body: ', JSON.stringify(body));
                    
                    // process response
                    var location = body.Response.View[0].Result[0].Location.Address.Label;
           
                    formattedResponse = formatResponse(sessionAttributes, 'Fulfilled', location);
                
                    callback(formattedResponse);
                });
    } else {
        formattedResponse = formatResponse(sessionAttributes, 'Fulfilled', null);
    }
}

// --------------- Main handler -----------------------
 
exports.handler = (event, context, callback) => {
    try {
        dispatch(event,
            (response) => {
                callback(null, response);
            });
    } catch (err) {
        callback(err);
    }
};