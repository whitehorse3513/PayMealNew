function initFreshChat() {
    window.fcWidget.init({
        token: "14e7b4df-277c-4ca4-84ad-71ba51f21610",
        host: "https://wchat.freshchat.com"
    });
    
}
function initialize(i,t){
    var e;
    i.getElementById(t) ? initFreshChat() : ((e=i.createElement("script")).id=t,e.async=!0,e.src="https://wchat.freshchat.com/js/widget.js",e.onload=initFreshChat,i.head.appendChild(e))
}
      
function initiateCall(){
    initialize(document,"freshchat-js-sdk")
}

function setUserInformation(n,e="") {
    
    // To set unique user id in your system when it is available
    window.fcWidget.setExternalId(n+"."+String(Math.random()*100000));

    // To set user name
    window.fcWidget.user.setFirstName(n);

    // To set user email
    window.fcWidget.user.setEmail(e);

    // To set user properties
    window.fcWidget.user.setProperties({
        plan: "Estate",                 // meta property 1
        status: "Active"                // meta property 2
    });
}


// Copy the below lines under window.fcWidget.init inside initFreshChat function in the above snippet

