//sender

var app2app;
var clientChannelProxy;

jQuery(document).ready(function() {

    webinos.discovery.findServices({"api": "http://webinos.org/api/app2app"}, {
		onFound: function (service) {
			//alert("[CLIENT] App2App");
			service.bindService({
                onBind: function () {
                    app2app = service;
                }
            });
		},
        onError: function (error) {
            alert("Error finding service: " + error.message + " (#" + error.code + ")");
        }
	});

	$('#btnClientConnectToChannel').click(function() {
    	var channelNamespace = $('#txtNamespaceChannel').val();
    	searchMyChannel(channelNamespace);
	});


	$('#btnSendMessage').click(function() {
    	var message = $('#txtMessage').val();
    	sendMessageTo(message);
	});

});

function searchMyChannel(channelNamespace){
	if (typeof clientChannelProxy !== "undefined") {
        alert("[CLIENT] Already connected to the channel.");
        return;
    }

    // Search for channels with given namespace, within its own personal zone. It returns a proxy to a found
    // channel through the searchCallback function. Only a single search can be active on a peer at the same time,
    // and a search automatically times out after 5 seconds.
	app2app.searchForChannels(
            // the namespace to search for (can include a wildcard "*" instead of "example"
            // to search for all channels with prefix "org-webinos")
            channelNamespace,
            // no other zones need to be searched, only its own personal zone... zoneIds Not implemented yet.
            [],
            // callback function invoked for each channel that is found. A proxy to the channel is
   			// provided as an argument. The proxy is not yet connected to the actual channel; to use it one first has to call
   			// its connect method.
            // callback invoked on each channel found, we expect it to be called at most once because we did not use a wildcard.
            function(channelProxy) {
            	console.log("[CLIENT] Channel found");
                // we directly request to connect to the channel
                connectToChannel(channelProxy);
            },
            // callback invoked when the search query is accepted for processing
            function(success) {
                // ok, but no action needed in our example
            },
            // callback invoked when search query could not be processed.
            function(error) {
                alert("[CLIENT] Could not search for channel: " + error.message);
            }
    );
}

function connectToChannel(channelProxy){

	var num_msg = 0;

	// we can include application-specific information to the connect request
    var requestInfo = {};

	// Connect to the channel. The connect request is forwarded to the channel creator, which decides if a client
   	// is allowed to connect. The client can provide application-specific info with the request through the
   	// requestInfo parameter.
   	channelProxy.connect(
        requestInfo,
        // callback invoked to receive messages, only after successful connect
        function(message) {

        	//alert("message.contents.cont: " + message.contents.cont + "message.contents.type: " + message.contents.type);

            console.log("[CLIENT] Client received message from creator: " + message.contents.cont);
            // we directly reply to the message, and here we send a message to
            // the sender only (i.e. the creator in this example)
            num_msg++;
            printMSG(message,num_msg);
        },
        // callback invoked when the client is successfully connected (i.e. authorized by the creator)
        function(success) {
            // make the proxy available now that we are successfully connected
            clientChannelProxy = channelProxy;
            console.log("[CLIENT] Channel Created qith success");
        },
        function(error) {
            alert("Could not connect to channel: " + error.message);
        }
    );
}

function printMSG(msg, num_msg){
	console.log("[CLIENT] New MSG received");
	$('#messagesReceived').append(num_msg+' - ' + JSON.stringify(msg.from) + ' : ' + msg.contents.cont + "\n");
}


function sendMessageTo(message) {

	msg = {};
	msg.type = "print";
	msg.function = "";
	msg.cont = message;
	
	if (typeof clientChannelProxy === "undefined") {
        alert("[CLIENT] You first have to connect to the channel.");
        return;
    }

    //send to all client connected to channel
    clientChannelProxy.send(
        msg,
        // callback invoked when the message is accepted for processing
        function(success) {
            // ok, but no action needed in our example
            //alert("Msg SEND - to all client connected!");
            $('#txtMessage').val("");
        },
        function(error) {
            alert("[CLIENT] Could not send message: " + error.message);
        }
    );
}
