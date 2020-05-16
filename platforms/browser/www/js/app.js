/*DEFINE ALL VARIABLES*/
var ajax_request;
var ajax_url= krms_config.ApiUrl
var dialog_title = krms_config.AppTitle

var cart=[];
var cart_count = 0;

var onsenNavigator ;
var toast_handler;

var push_handle;

var translator;
var dict = {};

var device_id   = 'device_1231';
var device_uiid = 'uiid_1234561';
var device_platform = 'android';
var code_version = 1.3;

var timer;
var ajax_timeout = 30000;

var ajax_cart;

var icon_loader = '<ons-progress-circular indeterminate></ons-progress-circular>';

var dialog;
var tabbar_loaded;

var track_interval;
var modal_content='';

var exit_cout = 0;
var analytics;
var track_history_interval;
var track_interval_timeout = 7000;
var sec = 0;

var startup_banner_interval;

/*END VARIABLES*/

/*DEFINE BASIC FUNCTIONS*/

jQuery.fn.exists = function(){return this.length>0;}

dump = function(data) {
	console.debug(data);
}

empty = function(data) {
	if (typeof data === "undefined" || data==null || data=="" || data=="null" || data=="undefined" ) {	
		return true;
	}
	return false;
}

setStorage = function(key,value)
{
	localStorage.setItem(key,value);
}

getStorage = function(key)
{
	return localStorage.getItem(key);
}

removeStorage = function(key)
{
	localStorage.removeItem(key);
}

isdebug = function(){
	if (krms_config.debug){
		return true;
	}
	return false;
};
/*END DEFINE BASIC FUNCTIONS*/

/*START ONSEN 
ONSEN READY
*/
ons.platform.select('android');
//ons.platform.select('ios');
/*ons.disableAutoStatusBarFill();*/

ons.ready(function() {
	
		
	if (ons.platform.isIPhoneX()) {		
	    document.documentElement.setAttribute('onsflag-iphonex-portrait', '');
	    $('head').append('<link rel="stylesheet" href="css/app_ios.css?ver=1.0" type="text/css" />'); 	     
	}
	
	// fix to autocomplete search address bar
	$(document).on({
	"DOMNodeInserted": function(e){
	console.log(e);
	$(".pac-item span",this).addClass("needsclick");
	}
	}, ".pac-container");
	
	onsenNavigator = document.getElementById('onsenNavigator');
	
	/*RESET DATA*/		
		
	//localStorage.clear();
	/*	
	removeStorage("location_lat");
	removeStorage("user_token");			
	removeStorage("location_data_city");	
	removeStorage("location_data_area");				
	removeStorage("location_data_postal");			
	removeStorage('transaction_type');
	removeStorage('recheck_location');
	*/
		
	removeStorage("next_step");
	removeStorage("cart_re_order");
	removeStorage("delivery_date_set");
	removeStorage("delivery_date_set_pretty");	
	removeStorage("delivery_time_set");	
	removeStorage("active_merchant_category");
	//removeStorage("tooltip_home");
	//removeStorage("device_id");	
	
	ons.setDefaultDeviceBackButtonListener(function(event) {
		dump("Back event");
		dump(event);
		current_page_id = onsenNavigator.topPage.id;
		dump("current_page_id=>" + current_page_id);
		switch (current_page_id){
			case "receipt":
			lat_res = getCurrentLocation();
			resetToPage('tabbar.html','none',{
		    	 lat : lat_res.lat,
		  	   	 lng : lat_res.lng,
		    });
			break;			
						
			case "page_startup":			
			case "tabbar":
			case "page_settings":
			case "page_startup2":
			  
			  if(current_page_id=="tabbar"){
				  active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
				  dump("active_index=>"+ active_index);
				  if(active_index>0){				  	 
				  	 document.querySelector('ons-tabbar').setActiveTab(0);
				  	 return;
				  } 			  
			  }
			
			  exit_cout++;
			  if(exit_cout<=1){
			  	showToast( t("Press once again to exit!") );	
				 setTimeout(function(){ 
				 	 exit_cout=0;
				 }, 3000);
			  } else {
			  	 if (navigator.app) {
				   navigator.app.exitApp();
				 } else if (navigator.device) {
				   navigator.device.exitApp();
				 } else {
				   window.close();
				 }
			  }
			break;
			
		}
	}); 
	
	tabbar_loaded = false;
	
	
	$( document ).on( "keyup", ".numeric_only", function() {
       this.value = this.value.replace(/[^0-9\.]/g,'');
    });	 
    
	$( document ).on( "click", ".subitem_custom", function() {
		object = $(this);
		var limited = object.data("limited");
		dump("limited: "+ limited);
		var total_check=0;	
		
		var id=$(this).data("id");	
		dump("id: "+ id);
		
		$('.subitem_custom input:checked').each(function(){ 
			dump($(this));
		 	if ( $(this).parent().data("id") == id){
		 		total_check++;
		 	}
		});	
		dump("total_check=>" + total_check) ;
				
		if (limited<total_check){
			dump(object);
			showAlert( t('Sorry but you can select only')  +  " " + limited  + " " + t("addon") );
			dump(object.find("input"));			
			object.prop('checked', false);			
		}
		
	});
	
});
/*END ONSEN*/

/*CORDOVA DEVICE READY*/
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady(){
	try {
		
		navigator.splashscreen.hide();	
		device_uiid = device.uuid;
		device_platform = device.platform;		
		
		if(device.platform=="android" || device.platform=="Android" ){
		   StatusBar.backgroundColorByHexString("#ef6625");
		}
		
		initPush(false);
				
	} catch(err) {
       alert(err.message);
    } 
};
/*END CORDOVA DEVICE READY*/

document.addEventListener("offline", function(){
  showNoConnection(true);
  retryNetConnection(true);
}, false);

document.addEventListener("online", function(){
	showNoConnection(false);
	//retryNetConnection(false);	
}, false);

document.addEventListener("resume", function(){
	try {		
		if(device.platform=="Android"){
		   android_version = parseInt(device.version);		   
		   if(android_version<=6){
			   push_handle.setApplicationIconBadgeNumber(function(){
			      //showToast("success")
			   }, function() {
			      //showToast("failed")
			   },0);
		   }
		}
	} catch(err) {
      // alert(err.message);       
   } 
}, false);

initPush = function(re_init){
	try {
		
		PushNotification.createChannel(function(){
	    	//alert('create channel succces');
	    }, function(){
	    	//alert('create channel failed');
	    },{
	    	 id: 'mobile2_channel',
	         description: 'mobile2 app channel',
	         importance: 5,
	         vibration: true,
	         sound : 'beep'
	      }
	    );	    
	    
		push_handle = PushNotification.init({
			android: {
				sound : "true",
				clearBadge : "true"
			},
		    browser: {
		        pushServiceURL: 'http://push.api.phonegap.com/v1/push'
		    },
			ios: {
				alert: "true",
				badge: "true",
				sound: "true",
				clearBadge:"true"
			},
			windows: {}
	    });
	    
	    push_handle.on('registration', function(data) {   	  		    	
	    	device_id = data.registrationId;
	    	setStorage("device_id", data.registrationId );		    	
		});
		
		push_handle.on('notification', function(data){     
	   	   //alert(JSON.stringify(data));   	
		   if ( data.additionalData.foreground ){
	    		playSound();
	       } 	                       	  
	       handleNotification(data);	       
	    });
	    	  
	    push_handle.on('error', function(e) {      
	     	 alert(e.message);
		});
		
	} catch(err) {
       alert(err.message);
    } 
};

playSound = function(){		 
	 try {	 		 	 
		 url = 'file:///android_asset/www/beep.wav';			 
		 if(device_platform=="iOS"){
		 	url = "beep.wav";
		 }
		 //alert(url);
		 my_media = new Media(url,	        
	        function () {
	            dump("playAudio():Audio Success");
	            my_media.stop();
	            my_media.release();
	        },	        
	        function (err) {
	            dump("playAudio():Audio Error: " + err);
	        }
	    );	    
	    my_media.play({ playAudioWhenScreenIsLocked : true });
	    my_media.setVolume('1.0');
    
    } catch(err) {
       alert(err.message);
    } 
};

handleNotification = function(data){	
	showToast(data.title+"\n"+data.message);
	
	/*SET THE COUNT FOR NOTIFICATION BADGE*/	
	//setNotificationCount();
};

pushUnregister = function(){
	dump("pushUnregister");
	try {	
		push_handle.unregister(function(){			
			dump('unregister ok');			
		},function(error) {   	   	   	   	   
			dump('unregister error');
	    });		
		
	} catch(err) {
       alert(err.message);       
    } 
};

/*ONSEN INIT*/
document.addEventListener('show', function(event) {
	dump('show page');
    var page = event.target;
    var page_id = event.target.id;   
    //alert("page_id = "+page_id); 
    switch(page_id)
    {
    	case "home":
    	 tooltip_home = getStorage("tooltip_home");
    	 if(empty(tooltip_home)){
	    	 close_button='<ons-button modifier="bluebutton_small" onclick="hideTooltip('+ "'"+ '.tooltip_home' + "'" +');" >';
	    	 close_button+=t("OK, THANKS");
	    	 close_button+='</ons-button>';
	    	 $('.tooltip_home').webuiPopover({   	     	
		     	content:'<p>'+t('Want to change address')+'?</p><p class="small">'+t('You can change your address here')+'</p><br/>'+ close_button,
		     	backdrop:false,	     	
		     	offsetLeft:90
		   	});
		   	$('.tooltip_home').webuiPopover('show');
    	 }
    	break;
    }
     
	
});

document.addEventListener('init', function(event) {
	
   dump('init page');
   /*page init*/
   
   var page = event.target;
   var page_id = event.target.id;   
   dump("page_id = "+page_id);  

   
   if( page_id!="map_select_location" || page_id!="select_location" ){
     $(".search-input").removeClass("search-input--material");
   }
      
   translatePage();
   
   if(page_id!="page_startup2"){
   	  StopStartUpBanner();
   }
   
   switch(page_id)
   {
   	
   	  case "page_settings":   	        	     
   	     $(".app_title").html( krms_config.AppTitle );
   	     processAjax('getSettings','');
   	  break;
   	  
   	  case "page_startup":   	    
   	    $(".app_title").html( krms_config.AppTitle );   	    
   	    AnalyticsTrack("page start up"); 
   	  break;
   	  
   	  case "tabbar":
   	    tabbar_loaded = true;
   	    $(".tabbar_wrap").html( tabbarMenu() );
   	  break;
   	  
   	  case "login":
   	     	   
   	    placeholder(".user_mobile", "Mobile number or Email" );
   	    placeholder("#password", "Password" );   	    
   	  
   	    next_step = getStorage("next_step");
   	    dump("next_step=>"+ next_step);
   	    if(!empty(next_step)){
   	    	$(".bt_signup").show();
   	    	$(".topbar_login_skip").hide();
   	    	$(".button--skip_button").hide();
   	    }
   	    
   	    enabledSocialLogin();
   	    AnalyticsTrack("page login"); 
   	  break;
   	  
   	  case "forgot_password":   	    
   	    placeholder(".user_mobile", "Enter your email or mobile" ); 
   	    AnalyticsTrack("page forgot password"); 
   	  break;
   	     	     	 
   	  case "create_account":
   	     	       	      	    
   	    createAccountFields();
   	  
   	    get_customField();
   	    
   	    setTimeout(function() {		
		   addTermsCondition('create_account_list');
        }, 100);    	    
   	    
   	    next_step = getStorage("next_step");
   	    dump("next_step=>"+ next_step);
   	    if(!empty(next_step)){
   	    	$(".next_step").val( next_step );
   	    }
   	    AnalyticsTrack("page create account"); 
   	    
   	  break;
   	  
   	  case "map_select_location":   	
   	     	       	  
   	     lat = page.data.lat;
   	     lng = page.data.lng;
   	     dump("lat=>"+ lat);
   	     if( !empty(lat)) {   	     	  
   	     	 initMapSelectLocation(lat, lng);
   	     } else {
   	     	 initMapSelectLocation();
   	     }
   	     
   	     placeholder(".street", t("Street") );
   	     placeholder(".city", t("City") );
   	     placeholder(".state", t("State") );
   	     placeholder(".zipcode", t("Zip Code") );
   	     placeholder(".location_name", t("Floor/unit/Room #") );
   	     
   	     AnalyticsTrack("page map selection"); 
   	     
   	  break;
   	  
   	  case "map_enter_address":
   	     	    
   	    placeholder(".search_address", t("Search for your location") );
   	    
   	    if(app_settings = getAppSettings()){
   	    	if(app_settings.map_provider.provider=="google.maps"){
		   	    setTimeout(function() {		
		 		   setFocus('search_address');
		        }, 500); 
   	    	}
   	    }
            	    
   	    initGeocomplete('.search-input');
   	       	       	    
   	    processDynamicAjax('GetRecentLocation','','recent_location_loader','GET',1 );   	     
   	    initPullHook('map_enter_address', 'recent_location_pull_hook');
   	    
   	    resetPaginate("#map_enter_address");   	    
   	    initInfiniteScroll(page, 'map_enter_address', 'map_enter_address');
   	    
   	    AnalyticsTrack("page enter address"); 
   	    
   	  break;
   	  
   	  case "page_mobilecode_list":
   	    processAjax("getMobileCodeList",'');
   	  break;
   	  
   	  case "verification":   	   	   
   	  
   	   placeholder(".code", t("Code") );   
   	   $(".customer_token").val( page.data.customer_token );
   	   $(".email_address").val( page.data.email_address );
   	   $(".contact_phone").val( page.data.contact_phone );
   	   $(".verification_type").val( page.data.verification_type );
   	   //$(".form_next_step").val( page.data.form_next_step );
   	   $(".next_step").val( page.data.next_step );
   	   
   	   icon_html = '';
   	   if ( page.data.verification_type=="verification_email"){
   	   	   icon_html = '<ons-icon icon="ion-ios-email-outline" size="60px" class="button--to_text_orange" ></ons-icon>';
   	   } else {
   	   	   icon_html = '<ons-icon icon="ion-android-phone-portrait" size="60px" class="button--to_text_orange" ></ons-icon>';
   	   }
   	   $(".verify_icon").html( icon_html );
   	   
   	   AnalyticsTrack("page verification"); 
   	   
   	  break;
   	  
   	  case "home":
 	      	    
   	    /*RTL CODE*/
   	    current_lang_code = getLanguageCode();
   	    if(isRTL(current_lang_code)){
   	       $("ons-button ons-icon").attr("icon","ion-ios-arrow-left");
   	    }
   	       	  
   	    if(isLocation()){
   	    	if ( location_res = getLocationData() ){  
   	    		dump(location_res);
   	    		$(".print_location_address").html( location_res.pretty_address );   	    		
   	    		params = "search_type=byLatLong";	
	   	    	processDynamicAjax('searchMerchant', params , 'search_results_wrapper');
	   	    	   	    		
   	    	} else {
   	    		$(".print_location_address").html( t("location not set") );
   	    	}   	    	
   	    } else {
	   	    current_latlng = getCurrentLocation();
	   	    if(!empty(current_latlng)){
	   	    	if(!empty(current_latlng.address)){
	   	    	   $(".print_location_address").html( current_latlng.address );
	   	    	} else {
	   	    		$(".print_location_address").html( t("location not set") );
	   	    	}
	   	    	params = "search_type=byLatLong";	
	   	    	processDynamicAjax('searchMerchant', params , 'search_results_wrapper');
	   	    } else {
	   	    	$(".print_location_address").html( t("location not set") );
	   	    }
   	    }
   	        	    
   	    /*LOAD ALL PAGES IN HOMEPAGE*/  
   	    loadHomePage();
   	    
   	    initPullHook('home', 'home_pull_hook');
   	    
   	    AnalyticsTrack("page home"); 
   	    
   	    ageRestriction();
   	    
   	  break;
   	  
   	  case "restaurant_list":
   	     
   	     /*page_white = document.querySelector('#restaurant_list');
         ons.modifier.remove(page_white, 'page_white');
         ons.modifier.add(page_white, 'page_column');*/
   	     
   	     if(isLocation()){
   	        $(".sort_by").val("restaurant_name");
   	     }
   	     
   	     clearForm('frm_filter');
   	        	     
   	     placeholder(".search_for_restaurant", t("Search for restaurant") );
            	  
   	     search_type = page.data.search_type;
   	     dump("search_type =>"+ search_type);   	        	     
   	     $(".search_type").val( search_type );
   	        	     
   	     setCurrentAddress();
   	     
   	     params = "search_type="+search_type;
   	     params+="&with_distance=1";
   	     params+="&sort_by=" + $(".sort_by").val();
   	     
   	     if(!empty(page.data.cuisine_id)){
   	        cuisine_id = page.data.cuisine_id;
   	        params+="&cuisine_id="+ cuisine_id;
   	        $(".cuisine_id").val( cuisine_id );
   	     }
   	        	        	        	       	       	     
   	     processAjax('searchMerchant',params , 'GET',  'skeleton2');
   	     
   	     initPullHook('restaurant_list', 'restaurant_list_pull_hook');
   	        	              
         resetPaginate("#restaurant_list");
   	     initInfiniteScroll(page, 'restaurant_list', 'list_restaurant');
   	     
   	     AnalyticsTrack("page restaurant list"); 
   	     
   	     /*try {   	     	   	     
	   	     var divGD = ons.GestureDetector(document.querySelector('#restaurant_list'));
			 divGD.on('dragup', function(event) {			
			    showPage("restaurant_list_map.html");		    
			 });
		 } catch(err) {	      
	     } */
   	     
   	  break;
   	  
   	  case "search_merchant":   	     	
   	       	    
   	    placeholder(".search_field_by_name", t("Search for restaurant") );   	  
   	    setCurrentAddress();
   	       	    
   	    setTimeout(function() {		
 		   setFocus('search_field_by_name');
        }, 500); 
   	    
   	    $( "#search_field_by_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_field_by_name_result');
				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				if(!empty(search_field_by_name)){
					data = "merchant_name="+ search_field_by_name;					
				    processDynamicAjax('searchByMerchantName',data,'search_field_by_name_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	    AnalyticsTrack("page search merchant"); 
   	     
   	  break;
   	  
   	  
   	  case "cuisine_list":   	  
   	       	    
   	    placeholder(".search_for_cuisine", t("Search for cuisine") );
   	    getCuisine();   	    
   	    initPullHook('cuisine_list',  'cuisine_list_pull_hook');   	       	    
   	    $(".frm_cuisine .paginate_total").val( 0 );
   	    $(".frm_cuisine .paginate_page").val( 0 );
   	    initInfiniteScroll(page, 'cuisine_list', 'list_cuisine');
   	    
   	    AnalyticsTrack("page cuisine list"); 
   	  break;
   	  
   	  case "search_cuisine":
   	       	       	   
   	    placeholder(".search_for_cuisine", t("Search for cuisine") );
   	  
   	    setTimeout(function() {		
 		   setFocus('search_field_by_name');
        }, 500); 
   	    
   	     $( "#search_field_by_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {				
				destroyList('search_field_by_cuisine_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				if(!empty(search_field_by_name)){
					data = "cuisine_name="+ search_field_by_name;
					data+= "&sort_fields=cuisine_name";														   
				    processDynamicAjax('searchByCuisine',data,'search_field_by_cuisine_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	   
   	    
   	    AnalyticsTrack("page Search for cuisine"); 
   	    
   	  break;
   	  
   	  case "restaurant_page":

   	     setCartTheme();	    
   	  
   	     removeStorage("click_tab");
   	     
   	     merchant_id = page.data.merchant_id;   
   	     item_id = page.data.item_id;  
   	     cat_id = page.data.cat_id;     	     
   	     
   	     $("#restaurant_page .merchant_id").val( merchant_id );
   	     processAjax('getRestaurantInfo', 'merchant_id='+merchant_id, 'GET', 'skeleton1');
   	     
   	     params = "merchant_id="+ merchant_id;
   	     if(!empty(item_id)){
   	     	params+='&item_id='+ item_id;
   	     	params+='&cat_id='+ cat_id;
   	     }   	     
	     processDynamicAjax('getMerchantMenu',params,'menu_loader','GET',1 );
   	     
   	     initPullHook('restaurant_page', 'restaurant_page_pull_hook');
   	     
   	     resetPaginate("#restaurant_page");
   	     initInfiniteScroll(page, 'restaurant_page', 'resto_list_category');
   	        	        	    
   	     setTimeout(function() {		
 		   getCartCount();
         }, 1000); 
         
         AnalyticsTrack("page merchant page"); 
                  
         cart_theme = getCartTheme();
         if(cart_theme==2){		
	         setTimeout(function() {			         	
	 		   processDynamicAjax('getActiveMerchantCategory',params );
	         }, 1); 
         }
   	     
   	  break;
   	  
   	  case "item_page":
   	     	       	       	  
   	    setCartTheme();
   	    setCloseMerchant();
   	    
   	    cat_id = page.data.cat_id;   	
   	    $("#item_page .cat_id").val( cat_id );
   	       	    
   	    merchant_id = getActiveMerchantID();
   	    
   	    params = "merchant_id="+ merchant_id;
   	    params+="&cat_id=" + cat_id ;
	    params+= "&"+$( ".frm_filter_item" ).serialize(); 
	    
	    processAjax('getItemByCategory', params , 'GET', 'skeleton2');
	    
	    initPullHook('item_page', 'resto_list_item_pull_hook');
	    
	    resetPaginate("#item_page");
   	    initInfiniteScroll(page, 'item_page', 'resto_list_item');
   	    
   	    getCartCount();
   	    
   	    AnalyticsTrack("page category id" + cat_id); 
	    
   	  break;
   	  
   	  case "search_item":   	     
   	     
   	     placeholder(".search_item_name", "Search" );    
   	     setTimeout(function() {		
 		   setFocus('search_item_name');
        }, 500); 
   	     
   	     $( "#search_item_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_item_name_result');
				
				search_item_name = $(this).val();
				merchant_id = getActiveMerchantID();				
				
				if(!empty(search_item_name)){
					data = "item_name="+ search_item_name;
					data+= "&merchant_id="+ merchant_id;
				    processDynamicAjax('searchFoodItem',data,'search_item_name_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	    AnalyticsTrack("page search item"); 
   	    
   	  break;
   	  
   	  case "item_details":
   	     	    
   	    setCloseMerchant();
   	    
   	    merchant_id = getActiveMerchantID();
   	    data = "cat_id="+page.data.cat_id;   	
   	    data += "&item_id="+page.data.item_id;   
   	    data += "&merchant_id="+merchant_id;   	   
   	       	       	   
   	    if(!empty(page.data.row)){
   	    	data += "&row="+page.data.row;   	   
   	    }
   	    
   	    processAjax("itemDetails",data,"GET", 'skeleton3');
   	    
   	    AnalyticsTrack("page item_details"); 
   	    
   	  break;
   	  
   	  case "cart":   	    
   	    
   	    if(app_settings = getAppSettings()){   	    	
   	    	$(".no_order_wrap img").attr("src", app_settings.images.image1 );
   	    }
   	    $(".min_delivery_order").val('');
   	    
   	    if(onsenNavigator.topPage.id=="cart"){
   	      loadCart();
   	    }
   	       	    
   	    initPullHook('load_cart', 'cart_pull_hook', '' );
   	    
   	    AnalyticsTrack("page cart"); 
   	    
   	  break;
   	  
   	  case "profile":   	     
   	     processDynamicAjax("getFirstCart", "" , "temp_loader");   	     
   	     AnalyticsTrack("page profile"); 
   	  break;
   	  
   	  case "dialog_transaction_type":
		  processAjax('servicesList', 'merchant_id=' +  getActiveMerchantID() );
	  break;
	  
	
	  case "address_form_select": 
   	    processAjax('getAddressBookDropDown', '');
   	       	    
   	    placeholder(".contact_phone", t("Contact Number") );
   	    placeholder(".delivery_instruction", t("Delivery instructions") );
   	    
   	    customer_number = getStorage("customer_number");
	   	if(!empty(customer_number)){
	   	   $(".contact_phone").val( customer_number );
	   	}
   	    
   	  break;
   	  
   	  case "enter_phone":
   	    placeholder(".moobile_prefix" , t("Prefix") );
   	    placeholder(".mobile_no" , t("Mobile no.") );
   	       	    
   	    setTimeout(function() {		
 		   setFocus("mobile_no");
        }, 500); 
        
        fillEnterPhone();
   	    
   	    old_phone = $(".contact_phone").val();   	       	       	       	    
   	    if(settings = getAppSettings()){
   	       if(!empty(settings.mobile_prefix)){   	       	  
   	       	  $(".moobile_prefix").val( settings.mobile_prefix );   	       	  
   	       	  if(!empty(old_phone)){
   	       	     res = old_phone.replace( settings.mobile_prefix , "");
   	       	     $(".mobile_no").val( res );
   	       	  }
   	       }
		}     	   		
   	  break;
   	  
   	   case "payment_option":   	    	         	     
   	      $(".pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	      params = "transaction_type=" + $(".transaction_type").val();
   	      params+= addMerchantParams();
   	      processAjax('loadPaymentList', params );   	      
   	      
   	      AnalyticsTrack("page payment option"); 
   	  break;
   	  
   	  case "cod_forms":
   	  case "dinein_forms":
   	  
   	     if(page_id=="dinein_forms"){   	
   	     	     	 
   	     	setTimeout(function() {		
 		      setFocus('dinein_number_of_guest');
            }, 500);   
            
   	     } else if( page_id=="cod_forms" ){
   	     	
   	     	setTimeout(function() {		
 		      setFocus('order_change');
            }, 500);   
                       
   	     }
   	     
   	     $(".pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	        	     
   	     placeholder("#dinein_number_of_guest", "Number Of Guests" );   	     
   	     placeholder("#dinein_table_number", "Table number" );
   	     placeholder(".contact_phone", "Contact Number" );  
   	     placeholder(".dinein_special_instruction", "Special instructions" );  
   	     
   	     placeholder(".order_change", "Enter amount" );  
   	        	     
   	     /*if(settings = getAppSettings()){
	   	  	 dump(settings);
	   	  	 if(settings.cod_change_required=="2"){	   	  	 	
	   	  	 	$(".order_change").attr("required",'required');
	   	  	 }   	  	 
	   	  } */
   	  
	   	  customer_number = getStorage("customer_number");
	   	  if(!empty(customer_number)){
	   	  	  $(".contact_phone").val( customer_number );
	   	  }	   	     	     
   	  break;
   	  
   	   case "receipt":   	   	   
   	    clearSetDeliveryDate();    
   	    $(".order_place_label").html( page.data.message );      	    
   	    $(".receipt_order_id").val( page.data.order_id );
   	    AnalyticsTrack("page receipt"); 
   	  break;
   	  
   	  case "address_form":   	      	    
   	    placeholder(".street", "Street" );
   	    placeholder(".city", "City" );
   	    placeholder(".state", "State" );
   	    placeholder(".zipcode", "Zip Code" );
   	    placeholder(".location_name", "Floor/unit/Room #" );
   	    placeholder(".delivery_instruction", "Delivery instructions" );   	    
   	    placeholder(".contact_phone", "Contact Number" );   	    
   	     
   	    params='';   	    
   	    processAjax('GetAddressFromCart',params);
   	  break;
   	  
   	  case "settings":   	       	    
   	    if(isLogin()){ 
   	    	settingsMenu(true);
   	    } else {
   	    	settingsMenu(false);
   	    }   	     	    
   	    processDynamicAjax('getPushSettings','','pushsetting_loader','GET',1 ); 
   	    
   	    AnalyticsTrack("page settings"); 
   	  break;   	  
   	  
   	  case "location":   	    
   	    $(".print_merchant_name").html( $(".merchant_name").val() );
   	    $(".print_merchant_address").html( $(".merchant_adddress").val() );
   	    merchantLocation('#location_map', $(".merchant_lat").val(), $(".merchant_lng").val(), $(".merchant_adddress").val() );
   	    
   	    AnalyticsTrack("page location"); 
   	    
   	  break;
   	 
   	  case "order_list":   	     	
   	    fillOrderTabs('order_tabs','all',0);   	   
   	    params = "tab="+ $(".order_tab_active").val(); 
   	    processAjax('OrderList', params , 'GET',  'skeleton2');
   	    initPullHook('order_list', 'order_list_pull_hook', params);
   	    resetPaginate("#order_list");
   	    initInfiniteScroll(page, 'order_list', 'order_list' , params);   	  
   	  break;
   	  
   	  case "booking_history":   	        	        	     
   	     fillBookingTabs('booking_tabs','all',0);	      	     
   	     params = "tab="+ $(".booking_tab_active").val(); 
   	     processAjax('BookingList', params , 'GET',  'skeleton2');   	    
   	     
   	     initPullHook('booking_history', 'booking_history_pull_hook');
   	     resetPaginate("#booking_history");
   	     initInfiniteScroll(page, 'booking_history', 'booking_history');   	        	     
   	     AnalyticsTrack("page booking history"); 
   	  break;
   	  
   	  case "favorite_list":   	     
   	     //processDynamicAjax('FavoriteList','','favorite_loader','GET',1 ); 
   	     processAjax('FavoriteList','' , 'GET',  'skeleton5');
   	     
   	     initPullHook('favorite_list', 'favorite_list_pull_hook');
   	     resetPaginate("#favorite_list");
   	     initInfiniteScroll(page, 'favorite_list', 'favorite_list');
   	     
   	     AnalyticsTrack("page favorite list"); 
   	  break;
   	  
   	  case "creditcard_list":   	      
   	      //processDynamicAjax('CrediCartList','','creditcard_loader','GET',1 ); 
   	      processAjax('CrediCartList','' , 'GET',  'skeleton2');
   	      
   	      initPullHook('creditcard_list', 'creditcard_list_pull_hook');
   	      resetPaginate("#creditcard_list");
   	      initInfiniteScroll(page, 'creditcard_list', 'creditcard_list');
   	      
   	      AnalyticsTrack("page credit card"); 
   	  break;
   	  
   	  case "addressbook_list":   	      
   	      //processDynamicAjax('AddressBookList','','addressbook_loader','GET',1 ); 
   	      processAjax('AddressBookList', '' , 'GET',  'skeleton2');
   	      initPullHook('addressbook_list', 'addressbook_list_pull_hook');
   	      resetPaginate("#addressbook_list");
   	      initInfiniteScroll(page, 'addressbook_list', 'addressbook_list');
   	      
   	      AnalyticsTrack("page address book"); 
   	  break;
   	  
   	  case "language_list":   	    
   	    processDynamicAjax('getlanguageList','','language_list_loader','GET',1 ); 
   	    initPullHook('language_list', 'language_list_pull_hook');
   	    AnalyticsTrack("page language list"); 
   	  break;
   	  
   	  case "add_review":   	       	    
   	    placeholder(".review", "What do you think of your order?" );
   	    order_id = page.data.order_id;
   	    processAjax('getOrderDetails','order_id='+ order_id, 'GET', 'skeleton4');   	    
   	    
   	    AnalyticsTrack("page add review"); 
   	    
   	  break;
   	     	  
   	  case "track_history":

   	    if(app_settings = getAppSettings()){ 
   	    	track_interval_timeout = app_settings.tracking_interval;   	    	
   	    }
   	  
   	    order_id = page.data.order_id;   	    
   	    $(".track_order_id").val( order_id );   	    
   	    params = 'order_id='+ order_id;
   	    
   	    //processDynamicAjax('getOrderHistory', params, 'track_history_loader', 'GET',1 );   	
   	    processAjax('getOrderHistory',params , 'GET',  'skeleton2');
   	    
   	    initPullHook('track_history', 'track_history_pull_hook', params );    
   	    
   	    AnalyticsTrack("page track order history"); 
   	    
   	    stopTrackHistory;
   	    setTimeout(function() {	   	       
   	       processDynamicAjax("checkRunTrackHistory",params);
   	    }, 400); 
   	    
   	  break;
   	  
   	  case "order_search":
   	    
   	    placeholder(".search_field_by_name", "Enter Order ID or Restaurant Name" );	    
   	  	    
   	    setTimeout(function() {		
 		   setFocus('search_field_by_name');
        }, 500); 
   	    
   	    $( "#search_field_by_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_order_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;
				    processDynamicAjax('searchOrder',data,'search_order_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	    AnalyticsTrack("page order search"); 
   	    
   	  break;
   	  
   	  
   	  case "view_order":   	    
   	    order_id = page.data.order_id;
   	    processAjax('ViewOrder','order_id='+ order_id ,'GET','skeleton2');   	    
   	    AnalyticsTrack("page view order"); 
   	  break;
   	  
   	  case "favorite_search":
   	  
   	     placeholder(".search_field_by_name", "Enter restaurant name" );	    
   	       	     
   	     setTimeout(function() {		
 		   setFocus('search_field_by_name');
        }, 500); 
   	     
   	    $( "#search_field_by_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('favorite_search_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;
				    processDynamicAjax('searchFavorites',data,'favorite_search_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	  break;
   	  
   	  case "creditcard_add":
   	     	   
   	    placeholder("#card_name", "Cardholders Name" );
   	    placeholder("#credit_card_number", "Credit Card Number" );
   	    placeholder("#cvv", "CVV" );
   	    placeholder("#billing_address", "Billing Address" );   	    
   	  
   	    generateMonth(); generateYear();
   	    cc_id = page.data.cc_id;
   	    if(!empty(cc_id)){
   	       processAjax('getCedittCardInfo',"cc_id=" + cc_id );
   	    }   	    
   	    document.getElementById('credit_card_number').oninput = function() {
	       this.value = CreditCardFormat(this.value)
	    };		  
	    
	    AnalyticsTrack("page credit card add");
   	  
   	  break;
   	  
   	  case "address_book":   	     	   
   	    placeholder(".street", "Street" );
   	    placeholder(".city", "City" );
   	    placeholder(".state", "State" );
   	    placeholder(".zipcode", "Zip Code" );
   	    placeholder(".location_name", "Floor/unit/Room #" );
   	    placeholder(".delivery_instruction", "Delivery instructions" );   	    
   	  
   	    id = page.data.id;
   	    if(!empty(id)){
   	       processAjax('getAddressBookByID',"id=" + id );
   	    } else {
   	       processAjax('getCountryList',"");
   	       initMapAdress('#map_address', true);
   	    }
   	    
   	    AnalyticsTrack("page address book");

   	  break;
   	  
   	  case "edit_profile":   	   
   	    placeholder("#first_name", "First Name" );
   	    placeholder("#last_name", "Last Name" );
   	    placeholder("#contact_phone", "Mobile no." );   	       	  
   	    processAjax('GetProfile',"",'GET', 'skeleton3');   	    
   	    
   	    AnalyticsTrack("page edir profile");
   	  break;
   	  
   	  case "change_password":   	     	    
   	    placeholder("#current_password", "Enter Current Password" );
   	    placeholder("#new_password", "Enter New Password" );
   	    placeholder(".cnew_password", "Confirm New Password" );
   	    processAjax('GetProfile',"");
   	    
   	    AnalyticsTrack("page change password");
   	    
   	  break;
   	  
   	  case "device_id":   	    
   	    $(".print_device_uiid").html( device_uiid );
   	    $(".print_device_id").html( device_id );
   	    
   	    AnalyticsTrack("page device");
   	  break;
   	  
   	  case "about":   	   
   	    merchant_id = getActiveMerchantID();
   	    params = "merchant_id="+ merchant_id;
   	    processAjax('GetMerchantAbout',params, 'GET', 'skeleton3');
   	    AnalyticsTrack("page about");
   	  break;
   	  
   	  case "reviews":   	    
   	     merchant_id = getActiveMerchantID();
   	     params = "merchant_id="+ merchant_id;
   	     //processDynamicAjax('ReviewList',params,'reviews_loader','GET',1 ); 
   	     processAjax('ReviewList',params , 'GET',  'skeleton2');
   	     
   	     initPullHook('reviews', 'reviews_list_pull_hook', params );
   	     resetPaginate("#reviews");
   	     initInfiniteScroll(page, 'reviews', 'reviews');
   	     AnalyticsTrack("page reviews");
   	  break;
   	  
   	  case "book_table":   	     
   	     placeholder("#number_guest", "Number Of Guests" );
   	     placeholder("#booking_name", "Name" );
   	     placeholder("#email", "Email" );
   	     placeholder("#mobile", "Mobile" );
   	     placeholder("#booking_notes", "Your Instructions" );   	     
   	     
   	     merchant_id = getActiveMerchantID();
   	     $(".book_merchant_id").val( merchant_id );
   	     processAjax('GetMerchantDateList', 'merchant_id=' +  merchant_id  ,'GET' , 'skeleton4' );
   	     AnalyticsTrack("page book table");
   	  break;
   	  
   	  case "booking_receipt":   	    
   	    message = page.data.message;
   	    $(".print_booking_message").html( message );
   	    AnalyticsTrack("page booking receipt");
   	  break;
   	  
   	  case "photo_gallery":   	     
   	     merchant_id = getActiveMerchantID();   	 
   	     params = "merchant_id="+ merchant_id;       	     
   	     //processDynamicAjax('GetGallery',params,'gallery_loader','GET',1 ); 
   	     processAjax('GetGallery',params , 'GET',  'skeleton6');
   	     initPullHook('photo_gallery', 'photo_gallery_pull_hook', params );
   	     AnalyticsTrack("page photo_gallery");
   	  break;
   	  
   	  case "information":   	    
   	    merchant_id = getActiveMerchantID();   	 
   	    params = "merchant_id="+ merchant_id;       	     
   	    //processDynamicAjax('GetMerchantInformation',params,'information_loader','GET',1 );    	    
   	    processAjax('GetMerchantInformation',params , 'GET',  'skeleton3');
   	    
   	    initPullHook('information', 'information_pull_hook', params );
   	    AnalyticsTrack("page information");
   	  break;
   	  
   	  case "promos":   	    
   	    merchant_id = getActiveMerchantID();   	 
   	    params = "merchant_id="+ merchant_id;       	     
   	    //processDynamicAjax('GetMerchantPromo',params,'promos_loader','GET',1 ); 
   	    processAjax('GetMerchantPromo',params , 'GET',  'skeleton2');
   	    initPullHook('promos', 'promos_pull_hook', params );
   	    AnalyticsTrack("page promos");
   	  break;
   	  
   	  case "points_list":   	    
   	    //processDynamicAjax('GetPointSummary','','points_list_loader','GET',1 ); 
   	    processAjax('GetPointSummary',params , 'GET',  'skeleton2');
   	    initPullHook('points_list', 'points_list_pull_hook', '' );
   	    AnalyticsTrack("page points_list");
   	  break;
   	  
   	  case "points_details":   	    
   	     point_type = page.data.point_type;
   	     params = "point_type="+ point_type;
   	     processDynamicAjax('GetPointDetails',params,'points_details_loader','GET',1 ); 
   	     initPullHook('points_details', 'points_details_pull_hook', params );
   	     
   	     resetPaginate("#points_details");
   	     initInfiniteScroll(page, 'points_details', 'points_details', params);   	  
   	     AnalyticsTrack("page points_details");
   	  break;
   	  
   	  case "search_category":   	   	     
   	     placeholder(".search_category_name", "Search" );    
   	     setTimeout(function() {		
 		   setFocus('search_category_name');
         }, 500); 
   	     
   	     $( "#search_category_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_category_name_result');
				
				search_item_name = $(this).val();
				merchant_id = getActiveMerchantID();				
				
				if(!empty(search_item_name)){
					data = "item_name="+ search_item_name;
					data+= "&merchant_id="+ merchant_id;
				    processDynamicAjax('searchFoodCategory',data,'search_category_name_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	    AnalyticsTrack("page search_category"); 
   	    
   	  break;
   	  
   	  case "search_form":   	        	    
   	    placeholder(".search_restaurant_name", "Search for restaurant,food and cuisine" );
   	  
   	     setTimeout(function() {		
 		   setFocus('search_restaurant_name');
         }, 500);    	     
   	     
   	     search_string = page.data.search_string;   	     
   	     if(!empty(search_string)){
   	     	data = "search_string="+ search_string;					
		    processDynamicAjax('searchMerchantFood',data,'search_form_result','GET',1);
		    $(".search_restaurant_name").val( search_string );
   	     }
   	     
   	     $( "#search_restaurant_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('search_form_result');
				
				search_item_name = $(this).val();
				merchant_id = getActiveMerchantID();				
				
				if(!empty(search_item_name)){
					data = "search_string="+ search_item_name;					
				    processDynamicAjax('searchMerchantFood',data,'search_form_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	   
   	    
   	    AnalyticsTrack("page search_form"); 
   	    
   	  break;
   	  
   	  case "search":
   	    placeholder(".xx", "Search for restaurant,food and cuisine" );
   	    
   	    processDynamicAjax('GetRecentSearch','','recent_search_item_loader','GET',1 );   	      
		initPullHook('search', 'recent_search_item_pull_hook');
		resetPaginate("#search");
		initInfiniteScroll(page, 'search', 'search','');
   	  break;
   	  
   	  case "driver_signup":
   	     	     
   	     placeholder(".first_name", "First Name" );   
   	     placeholder(".last_name", "Last Name" );   
   	     placeholder(".email", "Email address" );   
   	     placeholder(".phone", "Phone" );  
   	     placeholder("#username", "Username" );  
   	     placeholder("#password", "Password" );  
   	     placeholder("#cpassword", "Confirm Password" );  
   	     placeholder("#transport_description", "Transport Description (Year,Model)" );  
   	     placeholder("#licence_plate", "License Plate" );  
   	     placeholder("#color", "Color" );  
   	  
   	     html = transportationList();
   	     $(".transportation_wrap").html( html );
   	     
   	     AnalyticsTrack("page driver_signup"); 
   	  break;
   	  
   	  case "restaurant_list_map":
   	     	     	        	  
   	     if(isLocation()){		
   	     	if(app_settings = getAppSettings()){
   	     		current_latlng = app_settings.default_map_location;
   	     	}   	     	
   	     } else {
   	     	current_latlng = getCurrentLocation();
   	     }   	        	        	     
   	     
   	     if(empty(current_latlng)){
   	     	current_latlng = {
   	     		lat : 0,
   	     		lng : 0
   	     	};  	
   	     }
   	     
   	     merchantMapList("#map_list", current_latlng.lat, current_latlng.lng);
   	     
   	     search_type = $(".search_type").val();   	     
   	     params = "search_type="+search_type; 
   	     params+="&map_page=1";   	     
   	     cuisine_id = $(".cuisine_id").val();
   	     if(!empty(cuisine_id)){
   	     	params+="&cuisine_id=" + cuisine_id;
   	     }
   	     
   	     params+= "&"+$( ".frm_filter" ).serialize(); 
   	     
   	     processAjax('searchMerchant',params);
   	     
   	     AnalyticsTrack("page restaurant_list_map");    	        	     
   	  break;
   	  
   	  case "order_verification":   	    
   	     placeholder(".order_sms_code", "Enter Code" ); 
         sendOrderSMSCode();
   	  break;
   	  
   	  case "select_creditcards":
   	      $("#select_creditcards .pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	      processDynamicAjax('CrediCartList','','select_creditcards_loader','GET',1 ); 
   	      initPullHook('select_creditcards', 'select_creditcards_pull_hook');
   	  break;
   	  
   	  case "select_payondelivery":
   	     $("#select_payondelivery .pay_now_label").html( t("PAY")+ " " + $(".cart_total_value").val() );
   	     params  = addMerchantParams();
   	     processDynamicAjax('PayOnDeliveryCardList', params ,'payondelivery_loader','GET',1 ); 
   	     initPullHook('payondelivery_list', 'payondelivery_pull_hook', params );
   	  break;
   	  
   	  case "authorize_form":   	    
   	   
   	    placeholder(".first_name", "First Name" ); 
   	    placeholder(".last_name", "Last Name" ); 
   	    placeholder(".credit_card_number", "Credit Card Number" ); 
   	    placeholder(".address", "Address" ); 
   	    placeholder(".state", "State" ); 
   	    placeholder(".city", "City" ); 
   	    placeholder(".zip_code", "Zip Code" ); 
   	    placeholder(".cvv", "CVV" ); 
   	    
   	  
   	    generateMonth(); generateYear();
   	    
   	    document.getElementById('credit_card_number').oninput = function() {
	       this.value = CreditCardFormat(this.value)
	    };
   	    
   	    total_amount = page.data.total_amount;   	  
   	    $("#authorize_form .pay_now_label").html( t("PAY") + " "+ prettyPrice(total_amount) );
   	    $("#authorize_form .order_id").val( page.data.order_id  );
   	    processAjax('getCountryList',"");
   	  break;
   	  
   	  case "custom_page":   	    
   	    page_id = page.data.page_id;   
   	    dump("page_id=>"+page_id);
   	    processAjax("GetPage","page_id="+ page_id ,'GET','skeleton4');   	    
   	    initPullHook('GetPage', 'custom_page_pull_hook', "page_id="+ page_id );
   	    
   	    AnalyticsTrack("page custom_page"); 
   	  break;
   	  
   	  case "track_driver":   	    
   	     stopTrackHistory();
   	     //document.querySelector('ons-progress-bar').setAttribute('value',0);
   	     track_order_id = $(".track_order_id").val();
   	     //processAjax("TaskInformation","order_id="+ track_order_id ,'GET');   	     
   	     if(app_settings = getAppSettings()){   	     	
   	     	fillTrackTemplate(app_settings.tracking_theme);
   	     } else {
   	     	fillTrackTemplate(1);
   	     }
   	     
   	    setTimeout(function() {		
 		   document.querySelector('ons-progress-bar').setAttribute('value',0);
   	       processAjax("TaskInformation","order_id="+ track_order_id ,'GET');   	     
        }, 100);    	     
   	     
   	     AnalyticsTrack("page track_driver"); 
   	  break;
   	  
   	  case "driver_info":
   	     stopTrack(); 
   	     driver_id = page.data.driver_id; 
   	     params = "driver_id="+ driver_id; 
   	     processAjax("DriverInformation", params ,'GET');   	     
   	     initPullHook('driver_details', 'driver_details_pull_hook', params );   	        	     
   	  break;
   	  
   	  case "task_add_rating":
   	    placeholder(".review", "What do you think of your delivery?" );
   	    
   	    task_id = page.data.task_id; 
   	    params = "task_id="+ task_id; 
   	    processAjax("GetTask", params ,'GET');
   	  break;
   	  
   	  case "cancel_order_form":
   	     placeholder(".cancel_reason", "state your reason for cancellation" );	
   	     order_id = page.data.order_id;
   	     processAjax('getOrderDetailsCancel','order_id='+ order_id, 'GET', 'skeleton4');   	    
   	  break;
   	  
   	  case "notifications":
   	  
   	      processAjax('GetNotifications','' , 'GET',  'skeleton2');
   	      
   	      initPullHook('notifications', 'notifications_list_pull_hook');
   	      resetPaginate("#notifications");
   	      initInfiniteScroll(page, 'notifications', 'notifications');
   	      
   	      AnalyticsTrack("page notifications"); 
   	  
   	  break;
   	  
   	  case "booking_search":
   	  
   	     placeholder(".search_field_by_name", t("Enter booking ID or Restaurant Name") );
   	  
   	     setTimeout(function() {		
 		   setFocus('search_field_by_name');
        }, 500); 
   	    
   	    $( "#search_field_by_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('booking_search_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;
				    processDynamicAjax('searchBooking',data,'booking_search_result','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });
   	    
   	    AnalyticsTrack("page order search");   
   	  
   	  break;
   	  
   	  case "booking_details":
   	    booking_id = page.data.booking_id;   
   	    params = "booking_id="+ booking_id;
   	    processAjax("GetBookingDetails", params ,'GET','skeleton4');   	    
   	    
   	    initPullHook('booking_details', 'booking_details_pull_hook', params );   	 
   	  break;
   	  
   	  case "page_startup2":
   	    less = 220;
   	    if (ons.platform.isIPhoneX()) {
   	    	less = 300;
   	    }   	    
   	    banner_height = $("body").height();
   	    banner_height = parseInt(banner_height)-less;   	    
   	    $(".startup_carousel").css("height", banner_height+"px");
   	    
   	    fillStartupBanner('.startup_carousel');
   	    setTimeout(function() {
   	    	initStartUpBanner();
   	    }, 100);
   	  break;
   	  
   	  case "page_startup_select_language":
   	    processDynamicAjax('getlanguageList2','','language2_list_loader','GET',1 ); 
   	    initPullHook('language_list2', 'language2_list_pull_hook');
   	  break;
   	     	     	  
   	  case "select_location":   	    
   	     	    
        removeStorage("location_data_state");
   	    removeStorage("location_data_city2");
   	    
   	    LocationSearchForm('#select_location .search_wrapper');   	    
   	    setTimeout(function() {			
		  $(".search-input").removeClass("search-input--material");
	   }, 100);
	   
	   location_mode = locationMode();
	   	   
	   if(location_mode==1){
		  $( ".area_name" ).keyup(function( event ) {
	   	    	if ( event.which == 13 ) {
				    event.preventDefault();
				} else {
					$(this).val('');
				}
	   	  }); 
	   } else if( location_mode==2) {	   	  
	   	  $( ".city_name" ).keyup(function( event ) {
	   	    	if ( event.which == 13 ) {
				    event.preventDefault();
				} else {
					$(this).val('');
				}
	   	  }); 
	   }
	   
   	  break;
   	  
   	  case "location_city":
   	       	    
   	    location_mode = locationMode();
   	  
   	    placeholder("#location_city .location_city", "City" );   	     
   	     
   	    setTimeout(function() {		
 		   setFocus('field_location_city');
        }, 200); 
        
        params_city='';
        is_address_book = page.data.address_book;        
        if(is_address_book==1){
           params_city = "state_id="+ page.data.state_id;
           $(".is_address_book").val(1);
        } else {
        	removeStorage("location_data_area2");        	
        	if(location_mode==2){
        	    params_city+="&state_id=" + $("#select_location .state_id").val();
            }
        }                   
   	     
   	    processDynamicAjax('CityList',params_city,'location_city_result_loader','GET',1 ); 
   	    initPullHook('location_city_result', 'location_city_pull_hook', params_city);
   	    initInfiniteScroll(page, 'CityList', 'location_city', params_city);		
   	    
   	    $( "#field_location_city" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('location_city_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;					
					data+="&"+params_city;
				    processDynamicAjax('CityList',data,'location_city_result_loader','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	     
   	  break;
   	  
   	  case "location_area":
   	    placeholder("#location_area .field_location_area", "District / Area" );
   	    
   	    setTimeout(function() {		
 		   setFocus('field_location_area');
        }, 200); 
        
        if(page.data.address_book==1){
           $(".is_address_book").val(1);
        }
        
        params_area = "city_id="+ page.data.city_id;
        processDynamicAjax('AreaList', params_area ,'location_area_result_loader','GET',1 ); 
        initPullHook('location_area_result', 'location_area_pull_hook', params_area);
        initInfiniteScroll(page, 'AreaList', 'location_area' , params_area);		
   	    
         $( "#field_location_area" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('location_area_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;
					data+= "&"+params_area;
				    processDynamicAjax('AreaList',data,'location_area_result_loader','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	     
   	    
   	  break;
   	  
   	  case "address_book_location":
   	  
   	    removeStorage("location_data_state1");
   	    removeStorage("location_data_city1");
   	    removeStorage("location_data_area1");
   	    
   	    $( ".city_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				$(this).val('');
			}
   	    }); 
   	    
   	    $( ".area_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				$(this).val('');
			}
   	    }); 
   	    
   	    placeholder("#frm_address_book_location .street", "Street" );
   	    placeholder("#frm_address_book_location .state_name", "State/Region" );
   	    placeholder("#frm_address_book_location .city_name", "City" );
   	    placeholder("#frm_address_book_location .area_name", "Distric/Area/neighborhood" );
   	    placeholder("#frm_address_book_location .location_name", "Floor/unit/Room #" );
   	    placeholder("#frm_address_book_location .delivery_instruction", "Delivery instructions" );
   	    
   	    id = page.data.id;
   	    if(!empty(id)){
   	       processAjax('getAddressBookLocationByID',"id=" + id );
   	    } else {
   	       //processAjax('getCountryList',"");
   	       initMapAdress('#map_address', true);
   	    }
   	    
   	  break;
   	  
   	  case "location_state":   	    
   	     	    
   	    dump("is_address_book=>"+page.data.address_book);
   	    if(page.data.address_book==1){
   	       $(".is_address_book").val(page.data.address_book);
   	    }   	    
   	    placeholder("#location_state .field_location_state", "State/Region" );
   	    
   	    setTimeout(function() {		
 		   setFocus('field_location_state');
        }, 200); 
                
        processDynamicAjax('StateList', '' ,'location_state_result_loader','GET',1 ); 
        initPullHook('StateList', 'location_state_pull_hook');
        initInfiniteScroll(page, 'StateList', 'location_state');	
        
        $( "#field_location_state" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('location_state_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;					
				    processDynamicAjax('StateList',data,'location_state_result_loader','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	     
        
      break;  
      
      case "address_form_location":
                        
        is_agree_map = getStorage("is_agree_map");
        
        if(is_agree_map!=1){
	        ons.platform.select('ios');  
		    ons.notification.confirm( t("Please point your exact location on the map") ,{
				title: t("Delivery Address"),
				id : "dialog_remove_item",
				buttonLabels : [ t("OK") ]
			}).then(function(input) {
				if (input==0){			
					setStorage("is_agree_map",1);
				}
			});
        }
               
        removeStorage("location_data_state1");
   	    removeStorage("location_data_city1");
   	    removeStorage("location_data_area1");
   	    
   	    $( ".city_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				$(this).val('');
			}
   	    }); 
   	    
   	    $( ".area_name" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				$(this).val('');
			}
   	    }); 
   	    
   	    placeholder("#frm_address_form_location .street", "Street" );
   	    placeholder("#frm_address_form_location .state_name", "State/Region" );
   	    placeholder("#frm_address_form_location .city_name", "City" );
   	    placeholder("#frm_address_form_location .area_name", "Distric/Area/neighborhood" );
   	    placeholder("#frm_address_form_location .location_name", "Floor/unit/Room #" );
   	    placeholder("#frm_address_form_location .delivery_instruction", "Delivery instructions" );
   	    placeholder("#frm_address_form_location .contact_phone", "Contact Number" );
   	    
   	    processAjax('GetAddressFromCartLocation','');  	    
   	    
      break;  
      
      case "address_form_select_location":
        processAjax('getAddressLocationBookDropDown', '');
   	       	    
   	    placeholder(".contact_phone", t("Contact Number") );
   	    placeholder(".delivery_instruction", t("Delivery instructions") );
   	    
   	    customer_number = getStorage("customer_number");
	   	if(!empty(customer_number)){
	   	   $(".contact_phone").val( customer_number );
	   	}
      break;  
      
      case "location_postal_code":
        dump("is_address_book=>"+page.data.address_book);
   	    if(page.data.address_book==1){
   	       $(".is_address_book").val(page.data.address_book);
   	    }   	    
   	    placeholder("#location_postal_code .field_location_postal_code", "Postal Code/Zip Code" );
   	    
   	    setTimeout(function() {		
 		   setFocus('field_location_postal_code');
        }, 200); 
        
        processDynamicAjax('PostalCodeList', '' ,'location_postal_code_result_loader','GET',1 ); 
        initPullHook('PostalCodeList', 'location_postal_code_pull_hook');
        initInfiniteScroll(page, 'PostalCodeList', 'location_postal_code','');	
        
         $( "#field_location_postal_code" ).keyup(function( event ) {
   	    	if ( event.which == 13 ) {
			    event.preventDefault();
			} else {
				
				destroyList('location_postal_code_result');				
				search_field_by_name = $(this).val();
				dump("search_field_by_name=>"+ search_field_by_name);
				
				if(!empty(search_field_by_name)){
					data = "search_str="+ search_field_by_name;					
				    processDynamicAjax('PostalCodeList',data,'location_postal_code_result_loader','GET',1);
				} else {										
					if(!empty(ajax_array[1])){						
					    ajax_array[1].abort();
					}
				}
			}
   	    });   	      
         
   	    
      break;  
                	  
   	  case "contact_us":
   	    fillContactUsForm('contact_field_list');   	       	     
   	  break; 
   	  
   	  case "contact_us_ty":
   	    $(".contact_us_message").html( page.data.message );
   	    var page = onsenNavigator.topPage; 
   	    page.onDeviceBackButton = function(event) {   	    	
   	    	resetToPage('tabbar.html','none');
   	    };
   	  break;
   	  
   	  default:
   	  break;
   }  
   
});

/*end init page
end page init
*/

translatePage = function(){
	dump("TRANSLATE PAGE");
	
	lang = getLanguageCode();	
	
	dump("lang=>"+ lang);
	
	translator = $('body').translate({lang:  lang , t: dict});	
	
	jQuery.extend(jQuery.validator.messages, {
	   required: t("This field is required."),
	   email: t("Please enter a valid email address."),
	   number : t("Please enter a valid number")
	});
};

getLanguageCode = function(){
	lang='';
	if(app_settings = getAppSettings()){
	   lang = app_settings.mobileapp2_language;
	}	
	client_set_lang = getStorage("client_set_lang");
	if(!empty(client_set_lang)){
		lang = client_set_lang;
	}
	
	return lang;
};

setLanguage = function(lang_code){	
	if(!empty(lang_code)){
	   setStorage("client_set_lang", lang_code);
	   InitRTL(lang_code);
	   resetToPage('tabbar.html','none');
	}
};

placeholder = function(field, value){
	$(field).attr("placeholder", t(value) );
};

loadHomePage = function(){	
    app_settings = getAppSettings();	
            
    if(app_settings.home.mobile2_home_offer==1){
       params = 'search_type=special_Offers';       
       processDynamicAjax('searchMerchant', params, 'special_offers_wrapper');
    } else {
    	$("#special_offers_wrapper").hide();
    }
    
    if(app_settings.home.mobile2_home_featured==1){
       params = 'search_type=featuredMerchant';       
       processDynamicAjax('searchMerchant', params , 'featured_list_wrapper');
    } else {
    	$("#featured_list_wrapper").hide();
    }
    if(app_settings.home.mobile2_home_all_restaurant==1){
       processDynamicAjax('searchMerchant', 'search_type=allMerchant', 'all_restaurant_wrapper');
    } else {
    	$("#all_restaurant_wrapper").hide();
    }
    if(app_settings.home.mobile2_home_cuisine==1){
       processDynamicAjax('cuisineList', 'carousel=1&', 'cuisine_list_wrapper');
    } else {
    	$("#cuisine_list_wrapper").hide();
    }
    
    if(isLogin()){
	    if(app_settings.home.mobile2_home_favorite_restaurant==1){
	       processDynamicAjax('searchMerchant', 'search_type=favorites', 'favorite_restaurant_wrapper');
	    } else {
	    	$("#favorite_restaurant_wrapper").hide();
	    }
    } else {
    	$("#favorite_restaurant_wrapper").hide();
    }
    
    if(app_settings.home.mobile2_home_banner==1){
    	home_banner_count = app_settings.home_banner.length ;    	
    	if(home_banner_count>0){
    		fillHomeBanner( app_settings.home_banner , '.home_banner_wrapper');
    	} else $("#home_banner_wrapper").hide();    	
    } else {
    	$("#home_banner_wrapper").hide();
    }
}

addMerchantParams = function(){
	params = "&merchant_id=" + getActiveMerchantID();
	return params;
};

document.addEventListener('reactive', function(event) {
	dump("reactive");
	dump(event);
});


document.addEventListener('postpop', function(event) {
	dump("postpop");
	current_page = document.querySelector('ons-navigator').topPage.id
	dump("=>"+ current_page);
	
	ons.platform.select('android'); 
	
	switch (current_page){
		case "page_startup":
		break;
		
		case "page_startup2":
		  initStartUpBanner();
		break;
		
		case "tabbar":
		      removeStorage("active_merchant_category");
			  active_index = document.querySelector('ons-tabbar').getActiveTabIndex();
			  dump("active_index=>"+ active_index);
			  
			  if(active_index==0){
			  	 cart_re_order = getStorage("cart_re_order");
			  	 dump("cart_re_order=>" + cart_re_order);
			  	 if(cart_re_order==1){
			  	 	removeStorage("cart_re_order");
			  	 	getCartCount();
			  	 }			  	 
			  	 setCurrentAddress();
			  }
			  
			  if(active_index==3){
			  	document.querySelector('ons-tabbar').setActiveTab(0);
			  }		  
			  if(active_index==2){
			  	 //document.querySelector('ons-tabbar').setActiveTab(0);
			  	 /*if(isLogin()){  
			  	     processAjax("verifyCustomerToken",'action=account_menu');
			  	 } else {
			  	  	 accountMenu(false);
			  	 }*/
			  }
			break;
		
	    case "restaurant_page":	      
	      clearForm('filter_item');
	      click_tab = getStorage("click_tab");
	      if(!empty(click_tab)){
		      document.querySelector('#carousel_resto_menu').setActiveIndex(click_tab,{
		      	animation:"none"
		      });		      
		      click_tab=parseInt(click_tab)+1;		      
		      $("#carousel_resto_menu ons-carousel-item").removeClass("selected");		      
		      $("#carousel_resto_menu ons-carousel-item:nth-child("+click_tab+")").addClass("selected");		      
	      }
	      
	      ReSetBasket();
	      
	    break;
	    
	    case "favorite_list":
	      params="&page_action=pull_refresh";
		  processDynamicAjax('FavoriteList',params,'favorite_loader','GET',1 ); 
	    break;
	    
	    case "track_driver":
	      runTrack();
	    break;
	    
	    case "track_history":
	      stopTrack();
	      params = 'order_id='+ $(".track_order_id").val();;
   	      processDynamicAjax('getOrderHistory', params, 'track_history_loader', 'GET',1 );  
   	      runTrackHistory(); 	
	    break;
	    
	    case "cuisine_list":
	     $(".sortby_selected").html( t("Sequence") );
	    break;
	    
	    case "order_list":
	      stopTrackHistory();
	    break;
	    	    	    	    	  
	    case "cart":
	       enabledAsap();
	    break;
	    
	    case "address_book_location":
	    case "address_form_location":
	       data_state = getStorage("location_data_state1");	       
	       if(!empty(data_state)){
	       	  data_state = JSON.parse( data_state );	 
	          $(".state_name").val( data_state.state_name );
	          $(".state_id").val( data_state.state_id );	          	         	         
	       }
	       
	       data_city = getStorage("location_data_city1");	       	       
	       if(!empty(data_city)){
	       	  data_city = JSON.parse( data_city );	 	       	  
	          $(".city_name").val( data_city.city_name );
	          $(".city_id").val( data_city.city_id );
	       } else {
	       	   $(".city_name").val('');
	          $(".city_id").val('');
	       }
	       
	       data_area = getStorage("location_data_area1");	       	       
	       if(!empty(data_area)){
	       	  data_area = JSON.parse( data_area );	 	       	  
	          $(".area_name").val( data_area.area_name );
	          $(".area_id").val( data_area.area_id );
	       } else {
	       	  $(".area_name").val('');
	          $(".area_id").val('');
	       }	       
	    break;
	    
	    case "select_location":
	    
	       location_mode = locationMode();
	       
	       if(location_mode==1){
		       data_city = getStorage("location_data_city2");	
		       if(!empty(data_city)){
		       	  data_city = JSON.parse( data_city );	 	       	  
		          $("#select_location .city_name").val( data_city.city_name );
		          $("#select_location .city_id").val( data_city.city_id );
		       } else {
		       	   $("#select_location .city_name").val('');
		           $("#select_location.city_id").val('');
		       }
		       
		       data_area = getStorage("location_data_area2");	       	       
		       if(!empty(data_area)){
		       	  data_area = JSON.parse( data_area );	 	       	  
		          $("#select_location .area_name").val( data_area.area_name );
		          $("#select_location .area_id").val( data_area.area_id );
		       } else {
		       	  $("#select_location .area_name").val('');
		          $("#select_location .area_id").val('');
		       }	   
	       } else if ( location_mode == 2) {
	       	  data_state = getStorage("location_data_state");	
	       	  if(!empty(data_state)){
	       	  	 data_state = JSON.parse( data_state );		       	  	 
	       	  	 $("#select_location .state_id").val( data_state.state_id );
	       	  	 $("#select_location .state_name").val( data_state.state_name );
	       	  } else {
	       	  	 $("#select_location .state_id").val( '' );
	       	  	 $("#select_location .state_name").val( '' );
	       	  }
	       	  
	       	  data_city = getStorage("location_data_city2");	
	       	  if(!empty(data_city)){	       	  	 
	       	  	 data_city = JSON.parse( data_city );		       	  	 	       	  	 
	       	  	 $("#select_location .city_id").val( data_city.city_id );
	       	  	 $("#select_location .city_name").val( data_city.city_name );
	       	  } else {
	       	  	 $("#select_location .city_id").val( '' );
	       	  	 $("#select_location .city_name").val( '' );
	       	  }
	       	  
	       } else if ( location_mode == 3) {	       	   
	       	   data_postal = getStorage("location_data_postal2");	
	       	   if(!empty(data_postal)){
	       	   	   data_postal = JSON.parse( data_postal );
	       	   	   dump(data_postal);
	       	   	   $("#select_location .postal_code").val( data_postal.postal_code );
	       	   	   $("#select_location .city_id").val( data_postal.city_id );
	       	   	   $("#select_location .state_id").val( data_postal.state_id );
	       	   } else {
	       	   	  $("#select_location .postal_code").val( '' );
	       	   	  $("#select_location .city_id").val( '' );
	       	   	  $("#select_location .state_id").val( '');
	       	   }
	       }
	       
	       
	    break;	   
	    
	    case "item_page":
	      ReSetBasket();
	    break;	   
	    	    
	}
});
/*END postpop*/

document.addEventListener('preopen', function(event) {
	dump("preopen");
});	

document.addEventListener('postchange', function(event) {
	dump("postchange");
			
	current_page = document.querySelector('ons-navigator').topPage.id
	dump("=>"+ current_page);
	switch (current_page){
		case "restaurant_page":
		  if(event.carousel.id=="resto_page_carousel"){
			  console.log('Changed to ' + event.activeIndex);	
			  $(".dots li").removeClass("active");
			  $(".c"+ event.activeIndex).addClass("active");
		  }
		break;
		
		case "page_startup2":
		  if(event.carousel.id=="startup_carousel"){
			  console.log('Changed to ' + event.activeIndex);	
			  $(".dots li").removeClass("active");
			  $(".c"+ event.activeIndex).addClass("active");
			  $(".startup_banner_index").val(event.activeIndex);
		  }
		break;
		
		case "tabbar":
		
		  if (event.carousel){
		  	  dump("carousel event");
		  	  return false;
		  }
		
		  index = event.activeIndex;	
		  dump(index);
		  if ( index == 0){ // near me
		  	  
		  } else if ( index==1){ //search
		  	
		  	  /*processDynamicAjax('GetRecentSearch','','recent_search_item_loader','GET',1 );   	      
		  	  initPullHook('search', 'recent_search_item_pull_hook');
		  	  resetPaginate("#search");		  	  		  	 */
		  	
		  } else if ( index==2){ //account		  	    	
		  	  if(isLogin()){  
		  	     processAjax("verifyCustomerToken",'action=account_menu','GET','skeleton2');
		  	  } else {
		  	  	 accountMenu(false);
		  	  }
		  } else if ( index==3){ //cart
		  	  showCart();
		  }
		break;
		
		case "cart":
		  enabledAsap();
		break;
	}	
});

document.addEventListener('preshow', function(event) {
	dump("preshow");
	var page = event.target;
	var page_id = event.target.id;   
	dump("pre show : "+ page_id);
	
	translatePage();
	
	switch (page_id)
	{
		case "filter":
		  if(app_settings = getAppSettings()){		  	 	  	
		  	 filters(app_settings.filters);
		  }
		break;
				
		case "sortbyresto":
		  if(app_settings = getAppSettings()){		
		  	 count = $("#resto_sortlist ons-list-item").length;
		  	 if(count<=0){
		  	    sortList(app_settings.sort.restaurant, 'resto_sortlist');
		  	    
		  	    $( document ).on( "click", "#sortbyresto input[name=sortby]", function() {		  	    	
		  	    	if($(this).val()=="ratings"){		  	    		
		  	    		$(".sort_asc_desc").val("desc");
		  	    	}
		  	    });
		  	    
		  	 }
		  }
		break;
		
		case "sort_cuisine":		
		if(app_settings = getAppSettings()){		
		  	 count = $("#cuisine_sortlist ons-list-item").length;
		  	 if(count<=0){
		  	    sortList(app_settings.sort.cusine, 'cuisine_sortlist');
		  	 }
		  }
		break;
		
		
	  case "dialog_delivery_date":				
		   $(".delivery_date_wrap").html(icon_loader);
		   processAjax('deliveryDateList', 'merchant_id=' +  getActiveMerchantID()  );
		break;
	  
	  case "dialog_delivery_time":
		  $(".delivery_time_wrap").html(icon_loader);
		  params = 'merchant_id=' +  getActiveMerchantID();
		  params+= '&delivery_date=' +  $(".delivery_date").val();
		  processAjax('deliveryTimeList', params);
	   break;
	   
	   case "modal_notification":	       
	     $(".modal_notification").html(modal_content);
	     initRatyStatic();
	   break;
	   
	   case "filter_item":
	     if(app_settings = getAppSettings()){		  	 	  	
		  	 filtersItem(app_settings.filters);
		  }
	   break;
	   	   	
	}
});

document.addEventListener('postshow', function(event) {
	dump("postshow");
	var page = event.target;
	var page_id = event.target.id;   
	dump("postshow : "+ page_id);
	switch (page_id)
	{				
	}	
});

document.addEventListener('prehide', function(event) {
	dump("prehide");
	var page = event.target;
	var page_id = event.target.id;   
	dump("prehide : "+ page_id);
	switch (page_id)
	{		
		case "modal_notification":
		  current_page_id = onsenNavigator.topPage.id;
		  dump("current_page_id=>"+current_page_id);		  
		  modal_action = $(".modal_action").val();		  
		  if(current_page_id=="track_driver"){
		  	dump("modal_action=>"+modal_action);
		  	if(modal_action=="close_page"){
		  		popPage();
		  	} else {
		  	   runTrack(); 
		  	}
		  }
		break;
		
		case "filter_item":
		  //ReSetBasket();
		break;
		
		default:
		ons.platform.select('android');
		break;
				
				
	}
	
});

/*END ONSEN INIT*/

showLoader = function(show, loader_id) {	
		
	dump("loader_id=>"+ loader_id);
	if(!empty(loader_id)){
		var modal = document.querySelector('#'+ loader_id);
	} else {
		var modal = document.querySelector('#default_loader');	
	}
	
	if(empty(modal)){
		return ;
	}
		
	if(show){
	  modal.show();
	} else {	  
	  modal.hide();
	}		  
};

showToast = function(data) {

  if (empty(data)){
  	  data=' ';
  }	  
  toast_handler  = ons.notification.toast(data, {
    timeout: 2500
  });
   
};

showAlert = function(data) {  
  if (empty(data)){
  	  data='';
  }
  ons.platform.select('ios'); 
  ons.notification.alert({
  	  message: t(data) ,
      title: krms_config.AppTitle,
      buttonLabels : [ t("OK") ]
  });
};

t = function(data){
	return translator.get(data);
};

requestParams = function(action){
	data ='';
	data+="&device_id=" + device_id;
	data+="&device_platform=" + device_platform;
	data+="&device_uiid=" + device_uiid;
	data+="&code_version=" + code_version;
	
	token = getStorage("user_token");
	if (!empty(token)){
		data+="&user_token=" + token;
	} else {
		data+="&user_token=";
	}
	
	
	if(!empty(krms_config.ApiKey)){
		data+="&api_key=" + krms_config.ApiKey;
	}
	
	data+="&lang="+ getLanguageCode();
	
	dump("requestParams=>"+action);
	
			
	switch(action){
   	  case "setDeliveryAddress":
   	  case "SetLocation":
   	  case "StateList":
   	  case "CityList":
   	  case "AreaList":
   	  case "saveAddressBookLocation":
   	  case "setDeliveryLocation":
   	  case "mapboxgeocode":
   	  break;
   	  
   	  default:     	
   	  	if(settings = getAppSettings()){
			if(settings.search_mode=="address"){			
				if(lat_res = getCurrentLocation()){			     
					data+="&lat="+ lat_res.lat + "&lng=" + lat_res.lng;
				}
			} else {				
				if ( location_res = getLocationData() ){
					if(location_res.location_mode==1){
						data+="&city_id="+ location_res.city_id + "&area_id=" + location_res.area_id;
					} else if( location_res.location_mode==2){
						data+="&state_id="+ location_res.state_id + "&city_id=" + location_res.city_id;
					} else if( location_res.location_mode==3){
						data+="&city_id="+ location_res.city_id + "&postal_code=" + location_res.postal_code;
					}
				}
			}
		}   	   	 
   	  break;
    }						   
	
	return data;
};

/*mycall*/
processAjax = function(action, data , method, loader_type){
	
	try {
		
	
	if(empty(method)){
		method='GET';
	}
		
	var ajax_uri = ajax_url+"/"+action;
		
	data+=requestParams(action);
	
	dump("ACTION=>" + action );
	dump("METHOD=>" + method );
	dump(ajax_uri + "?"+ data);	
	
	ajax_request = $.ajax({
	  url: ajax_uri,
	  method: method ,
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	  beforeSend: function( xhr ) {
         dump("before send ajax");   
         
         clearTimeout(timer);
              
         if(ajax_request != null) {	
         	ajax_request.abort();
            clearTimeout(timer);
         } else {         	
         	showLoader(true, loader_type);         	
         	timer = setTimeout(function() {		
         		if(ajax_request != null) {		
				   ajax_request.abort();
         		}         		
         		showLoader(false, loader_type);
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout ); 
         }
      }
    });
    
    
    ajax_request.done(function( data ) {
     	dump("done ajax");
     	dump(action);
     	dump(data);
     	if(data.code==1){
     		
     		switch(action){
     			case "getSettings":         			     
     			     			     			    
     			     setStorage("app_settings", JSON.stringify(data.details.settings) );  
     			     dict = data.details.settings.dict; 
     			     
     			     if(data.details.settings.map_provider.provider=="mapbox"){
     			     	 $('head').append('<link rel="stylesheet" href="lib/leaflet/leaflet.css" type="text/css" />');
		     	   	     $('head').append('<link rel="stylesheet" href="lib/leaflet/plugin/routing/leaflet-routing-machine.css" type="text/css" />');
		     	   	     $('head').append('<link rel="stylesheet" href="lib/leaflet/plugin/geocoder/mapbox-gl-geocoder.css" type="text/css" />');
		     	   	     		     	   	 
		     	   	     $('head').append('<script src="lib/leaflet/leaflet.js"></script>');
		     	   	     $('head').append('<script src="lib/leaflet/plugin/routing/leaflet-routing-machine.min.js"></script>');
		     	   	     $('head').append('<script src="lib/leaflet/plugin/geocoder/mapbox-gl-geocoder.min.js"></script>');
     			     }     		

     			     current_lang_code = getLanguageCode();
     			     InitRTL(current_lang_code);
     			          
     			     removeStorage("cart_merchant_id");
     			     
     			     is_login = data.details.valid_token;
     			     lat = getStorage("location_lat");
     			     lng = getStorage("location_lng");
     			     
     			     /*SET ANALYTIC*/
     			     AnalyticsSet();
     			     is_location = isLocation();
     			     
     			     if(is_location){
     			        if(location_res = getLocationData()){
     			           lat=1;     			           
     			        } else { 
     			           lat='';
     			        }
     			     }
     			     
     			     if(is_login==1 && !empty(lat)){
     			     	if(!is_location){
     			     	    recheckLocation();
     			     	}     			     
     			     	onsenNavigator.resetToPage("tabbar.html",{
					  	   animation : "none" ,  	
					  	   data : {
					  	   	  lat : lat,
					  	   	  lng : lng,
					  	   }
					    });
     			     } else if( is_login==1 && empty(lat) ){        			     	  			     	
     			     	  if(is_location){     	     		
     			     	  	reset_to_page = 'select_location.html';	     	  	
     			     	  } else {     			     	  	     			     	  	
     			     	  	reset_to_page = 'map_select_location.html';
     			     	  }     		     			     	  
     			     	  onsenNavigator.resetToPage(reset_to_page,{
					  	    animation : "fade",		  	
					      });
     			     } else {
     			     	 
     			     	 removeStorage("user_token");
     			     	 
     			     	 startup = 1;
     			     	 select_language = '';
     			     	 if(!empty(data.details.settings.startup)){
     			     	   startup = data.details.settings.startup.options;
     			     	 }
     			     	 if(!empty(data.details.settings.startup)){
     			     	   select_language = data.details.settings.startup.select_language;
     			     	 }
     			     	 
     			     	 set_startup_lang = getStorage("client_set_lang");     			     	 
     			     	 if(select_language==1 && empty(set_startup_lang)){
     			     	 	onsenNavigator.resetToPage('page_startup_select_language.html',{
				  	           animation : "fade",		  	
				            });
				            return;
     			     	 }     			    
     			     	 
     			     	 if(startup==2){
     			     	 	onsenNavigator.resetToPage('page_startup2.html',{
				  	           animation : "fade",		  	
				             });
     			     	 } else {     			    
		     			     onsenNavigator.resetToPage('page_startup.html',{
				  	           animation : "fade",		  	
				             });
     			     	 }
			             
     			     }
     			          			            
     			break;
     			
     			case "getMobileCodeList":	        	  
	        	  fillMobilePrefix(data.details.data);
	        	break;
	        	
	        	case "customerLogin":	        
	        	
	        	  setStorage('user_token', data.details.client_info.token );
	        	  
	        	  next_step = getStorage("next_step");
	        	  dump("next_step=>"+ next_step);
	        	  if(!empty(next_step)){	        	  	 	        	  	
	        	  	  nextStep( next_step );
	        	  } else {	        	  		        	  	
	        	  	  showHomeOrSelect();
	        	  }	        		  	        	  
	        	break;
	        	
	        	case "createAccount":	 
	        	case "registerUsingFb":       
	        	case "googleLogin":	
	        	
	        	  dump("next step=>"+ data.details.next_step );      	
	        	
	        	 if(data.details.next_step=="verification_mobile" || data.details.next_step=="verification_email" ){
	        	 	showToast( data.msg );	        	 	
	        	 	next_step = '';
	        	 	next_step = getStorage("next_step");
	        	 	if(empty(next_step)){
	        	 		next_step='map_select_location';
	        	 	}	        	 		        	 	
	        	 	onsenNavigator.replacePage("verification.html" ,{
					  	   animation : "none" ,  	
					  	   data : {
					  	   	  "contact_phone" : data.details.contact_phone,
					  	   	  "customer_token" : data.details.customer_token,
					  	   	  "email_address" : data.details.email_address,					  	   	  
					  	   	  "next_step" : next_step ,
					  	   	  "verification_type" : data.details.next_step,
					  	   }
					 });  
					 
	        	 /*} else if ( data.details.next_step =="map_select_location"){
	        	 	setStorage('user_token', data.details.customer_token );
	        	 	loadTabbar( data.details.next_step );*/
	        	 	
	        	 } else if ( data.details.next_step == "payment_option") {	  
	        	 		        	 	 
	        	 	 setStorage('user_token', data.details.customer_token );
	        	 	 
	        	 	 if (isOrderVerificationEnabled()){	
	        	 	 	 //showPage('order_verification.html');
	        	 	 	 replacePage('order_verification.html');
	        	 	 } else {	        	 	 	 
	        	         //showPage('payment_option.html');
	        	         replacePage('payment_option.html');
	        	 	 }
	        	 } else {
	        	 	 setStorage('user_token', data.details.customer_token );
	        	 	 loadTabbar( data.details.next_step );
	        	 }	        	 
	        	break;
	        	
	        	case "verifyCode":	        	   	        	   
	        	   setStorage('user_token', data.details.token );	        	   
	        	   loadTabbar( data.details.next_step );	        	   
	        	break;
     			
	        	case "searchMerchant":
	        	  if ( data.details.map_page==1){
	        	  	  merchantMapSetList(data.details.list);
	        	  	  carouselMap(data.details.list,'.bottom-bar--bottom_toolbar_carousel');
	        	  } else {	        
		        	  $('.sort_btn').attr("disabled",false); 
		        	  $(".total_number_found").html( data.msg );
		        	  $(".sortby_selected").html( data.details.sortby_selected );
		        	  	        	  
		        	  setPaginate("#restaurant_list",  data.details.paginate_total);
		        	  
		        	  list_type = getListType(); 	
		        	  dump("list_type=>"+ list_type);
		        	  if(list_type==1){
		        	  	 restaurantList(data.details.list,'list_restaurant');
		        	  } else if ( list_type == 3) {
		        	  	 restaurantListColumn(data.details.list,'list_restaurant');
		        	  } else {
		        	  	 restaurantListWithBanner(data.details.list, 'list_restaurant');
		        	  }
		        	  initRatyStatic();
	        	  }	        	  	   
	        	  	        	  
	        	  setTimeout(function() {				     
				 	  imageLoaded(); 
				   }, 10);
	        	   	        	
	        	break;
	        	
	        	case "cuisineList":	        	  
	        	  $(".total_number_found").html( data.msg );
	        	  $(".sortby_selected").html( data.details.sortby_selected );
	        	  $("#list_cuisine").html('');
	        	  $(".frm_cuisine .paginate_total").val( data.details.paginate_total );
	        	  $(".frm_cuisine .paginate_page").val( 1 );
	        	  ListCuisine( data.details.list , 'list_cuisine' );
	        	  imageLoaded(); 
	        	break;
	        	
	        	case "getRestaurantInfo":
	        	 	        	  
	        	  $(".merchant_open_status").val( data.details.data.status_raw);
	        	  if(data.details.data.status_raw=="close"){
	        	  	 showToast(data.details.data.close_message);
	        	  }     		
	        	  
	        	  $(".merchant_lat").val( data.details.data.latitude);
	        	  $(".merchant_lng").val( data.details.data.lontitude);
	        	  $(".merchant_name").val( data.details.data.restaurant_name);
	        	  $(".merchant_adddress").val( data.details.data.complete_address);
	        	  
	        	  fav = favoriteButton(data.details.data.added_as_favorite);
	        	  $(".favorite_toolbar_wrap").html(fav);
	        	
	        	  $(".resto_name").html(data.details.data.restaurant_name);
	        	  info = fillRestoPageInfo(data.details.data);
	        	  $("#restaurant_page .white_list_wrapper").html( info );
	        	  if ( data.details.data.gallery!=2){
	        	  	  html = restoPageCarousel( data.details.data.gallery );
	        	  	  $(".carousel_banner").html(html);
	        	  } else {
	        	  	  html = restoBanner( data.details.data );
	        	  	  $(".carousel_banner").html(html);
	        	  }	        	  	   
	        	  
	        	  if ( data.details.data.tab_menu_enabled==1){
	        	     html = restoTabMenu( data.details.data.tab_menu );
	        	     $(".carousel_resto_menu").html( html );
	        	  }
	        	  
	        	  /*params = "merchant_id="+ data.details.data.merchant_id;
	        	  processDynamicAjax('getMerchantMenu',params,'menu_loader','GET',1 ) */    	
	        	  
	        	  setStorage("share_options", JSON.stringify(data.details.data.share_options) );  
	        	  
	        	  initRatyStatic();
	        	  imageLoaded(); 	        	  
	        	  setCloseMerchant();
	        	    
	        	break;
	        	
	        	case "itemDetails":
	        	  $("#item_details .center").html( data.details.data.item_name );
	        	  $(".category_id").val(data.details.cat_id);
	        	  tpl = displayItemDetails(data.details.data , data.details.cart_data);
	        	  $(".item_details_wrap").html( tpl ) ;
	        	  
	        	   if ( data.details.ordering_disabled==1){
	        	  	  showToast(data.details.ordering_msg);
	        	  	  $("#item_details ons-bottom-toolbar").hide();
	        	  }
	        	  
	        	   if(settings = getAppSettings()){
					if(settings.website_hide_foodprice=="yes"){
						$("#item_details ons-bottom-toolbar").hide();
					}
				  }
	        	  
				  imageLoaded(); 
				  
	        	break;
	        	
	        	case "loadCart":
	        	
	        	  clearBasket();
	        	  initRatyStatic();
	        	  setStorage("merchant_settings", JSON.stringify(data.details.merchant_settings) );  
	        	  
	        	  document.querySelector('ons-tabbar').setActiveTab(0);
	        	   	        	   	        	  
	        	  setStorage("next_step", 'payment_option' );
	        	   
	        	  if ( data.details.required_delivery_time=="yes"){
        		  	 $(".required_delivery_time").val(1);
        		  } else {
        		  	 $(".required_delivery_time").val('');
        		  }
        		  
        		  $(".has_addressbook").val( data.details.has_addressbook );
        		  $(".sms_order_session").val( data.details.sms_order_session);
        		  
	        	  $(".no_order_wrap").hide();
	        	  $(".bottom_toolbar_checkout").show();
	        	  tpl = displayCartDetails(data.details);
	        	  $(".cart_details").html( tpl ) ;
	        	  
	        	  if(data.details.cart_error.length>0){
	        	  	 $('.bottom_toolbar_checkout ons-button').attr("disabled",true);
	        	  	 cart_error='';     	  	
	        	  	 $.each( data.details.cart_error  , function( cart_error_key, cart_error_val ) {
	        	  		 cart_error+=cart_error_val + "\n";
	        	  	 });	        	        	  	
	        	  	 showAlert(cart_error);
	        	  } else {
	        	  	$('.bottom_toolbar_checkout ons-button').attr("disabled",false);
	        	  }
	        	  
	        	  imageLoaded();
	        	  
	        	break;
	        	
	        	case "clearCart":
	        	case "applyRedeemPoints":
	        	case "removePoints":
	        	case "applyVoucher":
	        	case "removeVoucher":
	        	case "applyTips":
	        	case "removeTip":
	        	  loadCart();	        	 
	        	break;
	        	
	        	case "servicesList":
	        	  tpl = displayList(data.details.data, 'transaction_type');
	        	  $(".services_wrap").html( tpl );
	        	break;
	        	
	        	case "deliveryDateList":
	        	  tpl = displayList(data.details.data , 'delivery_date');
	        	  $(".delivery_date_wrap").html( tpl  );
	        	break;
	        	
	        	case "deliveryTimeList":
	        	  tpl = displayList(data.details.data , 'delivery_time');
	        	  $(".delivery_time_wrap").html( tpl  );
	        	break;
	        	
	        	case "getAddressBookDropDown":
	        	  tpl = fillAddressBook(data.details.data);
	        	  $('.address_book_wrap').html( tpl );
	        	break;	        	
	        	
	        	case "setDeliveryAddress":	       
	        	case "setAddressBook": 		
	        	case "setDeliveryLocation":
	        	case "setAddressBookLocation":
	        		        	        	   	        	   	        	   	  	        	  	        	   
	        	   onsenNavigator.popPage();
	        	   
	        	   $(".delivery_address").val( data.details.complete_address );
	        	   
	        	   printDeliveryAddress(data.details.complete_address);
	        	   
	        	   if ( data.details.save_address==1){
	        	   	   setStorage("save_address",1);
	        	   } else {
	        	   	   removeStorage('save_address');
	        	   } 	        	   
	        	   setTimeout(function() {				     
				 	  loadCart();	
				   }, 10);
	        	break;
	        	
	        	case "loadPaymentList":
		    	  tpl = displayPaymentList(data.details.data);
		    	  $(".payment_list_wrap").html( tpl  );
		    	break;
		    	
		    	case "payNow":
		    	case "PayAuthorize":
		    	case "razorPaymentSuccessfull":		    	
	        	   payNowNextStep(data);
	        	break;
	        	
	        	case "verifyCustomerToken":	    
	        	   setStorage("social_strategy", data.details.social_strategy);
	        	   if ( data.details.action=="account_menu"){	        	   	
	        	   	    accountMenu(true);
	        	   } else {
	        	   	    //
	        	   }
	        	break;
	        	
	        	case "GetAddressFromCart":	      	        	
	        	   filAddress('#address_form', data.details);
	        	   fillCountry("#address_form", data.details.country_list, data.details.country_code);
	        	   
	        	   if(data.details.save_address==1){
	        	      document.querySelector('ons-checkbox').checked = true;
	        	   } else {
	        	   	  document.querySelector('ons-checkbox').checked = false;
	        	   }
	        	   
	        	   if(!empty(data.details.delivery_lat)){	      	        	   	 
	        	      fillMapAddress('#map_address', true, data.details.delivery_lat, data.details.delivery_long );
	        	      $(".lat").val( data.details.delivery_lat );
	        	      $(".lng").val( data.details.delivery_long );
	        	   } else {		        	   	  
	        	   	  initMapAdress('#map_address', true);
	        	   }
	        	break;
	        	
	        	case "getOrderDetails":
	        	  $(".review_as").html( data.details.data.review_as );
	        	  $("#add_review h5").html( data.details.data.merchant_name );
	        	  $("#add_review .print_trans").html( data.details.data.transaction );
	        	  $("#add_review .print_payment_type").html( data.details.data.payment_type );
	        	  
	        	  $("#add_review .review").val( data.details.data.review );
	        	  $("#add_review .order_id").val( data.details.data.order_id );
	        	  $("#add_review .rating").val( data.details.data.rating );
	        	  
	        	  $("#add_review .thumbnail").attr("src", data.details.data.logo);
	        	  
	        	  document.querySelector('ons-checkbox').checked = data.details.data.as_anonymous;
	        	  initRaty(data.details.data.rating);
	        	  imageLoaded(); 
	        	break;
	        	
	        	case "addReview":	        	  
	        	  onsenNavigator.popPage();
	        	  $("#order_list_item").html('');
	        	  params_tab = "tab="+ $(".order_tab_active").val();	        	  
	        	  processDynamicAjax('OrderList', params_tab ,'order_loader','GET',1 ); 
	        	break;
	        	
	        	case "CancelOrder":
	        	  popPage(); 
	        	  $("#order_list_item").html('');
	        	  params_tab = "tab="+ $(".order_tab_active").val();
	        	  processDynamicAjax('OrderList', params_tab ,'order_loader','GET',1 ); 
	        	break;
	        	
	        	case "ViewOrder":
	        	    tpl = formatOrder( data.details.data);
	        	    $(".order_details_wrap").html( tpl );
	        	    $(".order_details_html").html( data.details.html );
	        	    	        	    
	        	    if( data.details.apply_food_tax == 1){
	        	    	$(".summary-wrap").after( data.details.new_total_html );
	        	    	$(".summary-wrap").remove();
	        	    }
	        	break;
	        	
	        	case "ReOrder":
	        	  setStorage("cart_merchant_id", data.details.merchant_id );
	        	  setStorage("cart_re_order", 1 );
	        	  showPage("cart.html",'lift');	        	 
	        	break;
	        	
	        	case "RemoveFavorites":
	        	  current_page_id = onsenNavigator.topPage.id;	        	  
	        	  if(current_page_id=="favorite_search"){
	        	  	  popPage(); 
	        	  } else {
		        	  params="&page_action=pull_refresh";
				      processDynamicAjax('FavoriteList',params,'favorite_loader','GET',1 ); 
	        	  }
	        	break;
	        	
	        	case "saveCreditCard":
	        	  showToast( data.msg ); 
	        	  popPage(); 
	        	  params="&page_action=pull_refresh";
				  processDynamicAjax('CrediCartList',params,'creditcard_loader','GET',1 ); 
	        	break;
	        	
	        	case "getCedittCardInfo":
	        	  $("#card_name").val ( data.details.data.card_name);
	        	  $("#credit_card_number").val ( data.details.data.credit_card_number);
	        	  $("#cvv").val ( data.details.data.cvv);
	        	  $("#billing_address").val ( data.details.data.billing_address);
	        	  $("#expiration_yr").val ( data.details.data.expiration_yr);
	        	  $("#expiration_month").val ( data.details.data.expiration_month);	      

	        	  $(".frm_creditcard").append('<input type="hidden" name="cc_id" value="'+ data.details.data.cc_id +'"> ');
	        	   	        	
	        	break;
	        	
	        	case "DeleteCreditCard":
	        	  showToast( data.msg );
	        	  params="&page_action=pull_refresh";
				  processDynamicAjax('CrediCartList',params,'creditcard_loader','GET',1 ); 
	        	break;
	        	
	        	case "DeleteAddressBook":
	        	case "saveAddressBook":
	        	case "saveAddressBookLocation":
	        	  showToast( data.msg );
	        	  current_page_id = onsenNavigator.topPage.id;
	        	  if (current_page_id =="address_book" || current_page_id=="address_book_location"){
	        	  	   popPage(); 
	        	  }
	        	  params="&page_action=pull_refresh";
			      processDynamicAjax('AddressBookList',params,'addressbook_loader','GET',1 ); 
	        	break;
	        	
	        	case "getCountryList":
	        	  current_page_id = onsenNavigator.topPage.id;
	        	  //fillCountry("#address_book", data.details.country_list, data.details.country_code);
	        	  fillCountry("#"+ current_page_id, data.details.country_list, data.details.country_code);
	        	break;
	        		        	
	        	case "getAddressBookByID":
	        	  fillCountry("#address_book", data.details.data.country_list, data.details.data.country_code);
	        	  setValue(".street", data.details.data.street);
	        	  setValue(".city", data.details.data.city);
	        	  setValue(".state", data.details.data.state);
	        	  setValue(".zipcode", data.details.data.zipcode);
	        	  setValue(".location_name", data.details.data.location_name);	        	  
	        	  setValue(".delivery_instruction", data.details.data.delivery_instruction);
	        	  
	        	  $(".frm_address_book").append('<input type="hidden" name="id" value="'+ data.details.data.id +'"> ');
	        	  
	        	  if(data.details.data.as_default==2){
	        	      document.querySelector('ons-checkbox').checked = true;
	        	  } else {
	        	   	  document.querySelector('ons-checkbox').checked = false;
	        	  }
	        	  
	        	  lat = data.details.data.latitude;
	        	  lng = data.details.data.longitude;
	        	  if(!empty(lat)){	        	  	  
	        	  	  $("#address_book .lat").val( lat );
	        	  	  $("#address_book .lng").val( lng );
	        	  	  fillMapAddress('#map_address', true, lat , lng );
	        	  } else {
	        	  	  initMapAdress('#map_address', true);
	        	  }
	        	   
	        	break;
	        	
	        	case "GetProfile":
	        	  current_page_id = onsenNavigator.topPage.id;
	        	  dump("current_page_id=>"+ current_page_id);
	        	  if ( current_page_id=="change_password"){
	        	  	  
	        	  } else {
	        	  	  background_url='';
					  if(app_settings = getAppSettings()){
						 background_url = app_settings.images.image2;		
					  }
					  
					  $("#edit_profile .header_about").css('background-image', 'url('+ "'" + background_url + "'" +')');
					  //$("#edit_profile .header_about_img").attr("src", background_url );
					  
		        	  $(".print_customer_name").html( data.details.data.full_name);
		        	  $(".print_customer_email").html( data.details.data.email_address);
		        	  setValue("#first_name", data.details.data.first_name );
		        	  setValue("#last_name", data.details.data.last_name );
		        	  setValue("#contact_phone", data.details.data.contact_phone );		        	  
		        	  $("#edit_profile img.small_avatar").attr("src", data.details.data.avatar );
	        	  }	        	  
	        	  imageLoaded(); 
	        	break;
	        	
	        	case "GetMerchantAbout":
	        	  merchantAbout( data.details.data , "#about_wrapper");
	        	  initRatyStatic();
	        	  imageLoaded(); 
	        	break;
	        	
	        	case "GetMerchantDateList":
	        		        		        	  
	        	  if (data.details.customer.length>=1){
	        	  	  setValue("#booking_name", data.details.customer[0].name );
	        	  	  setValue("#email", data.details.customer[0].email_address );
	        	  	  setValue("#mobile", data.details.customer[0].contact_phone );
	        	  }
	        	
	        	  setDateList(data.details.data, '.date_select_wrap');
	        	  merchant_id = getActiveMerchantID();
	        	  params = "merchant_id="+ merchant_id;
	        	  params +="&date="+ $(".date_booking").val();
	        	  processDynamicAjax("GetMerchantTimeList", params, 'time_select_wrap', 'GET', 1 );
	        	break;

	        	case "SaveBooking":    
	        	   replacePage("booking_receipt.html",'lift',{
	        	   	  message : data.msg
	        	   }) 		  
	        	break;
	        	
	        	case "SetLocation": 
	        	   setStorage("location_lat", data.details.data.lat );
	               setStorage("location_lng", data.details.data.lng );		
	               setStorage("location_address", data.details.data.recent_search_address );	
	               	              	               	               	               
	               if(tabbar_loaded){
	               	  popPage();	               	  
	               	  params = "search_type=byLatLong&lat="+ data.details.data.lat +"&lng="+ data.details.data.lng ;   	    	
   	    	          processDynamicAjax('searchMerchant', params , 'search_results_wrapper');   	    	   	    	
   	    	          loadHomePage();
	               } else {
		               onsenNavigator.resetToPage("tabbar.html",{
					  	   animation : "none" ,  	
					  	   data : {
					  	   	  lat : data.details.data.lat ,
					  	   	  lng : data.details.data.lng ,
					  	   	  location_address : data.details.data.recent_search_address
					  	   }
					   });	  
	               }
	               
	               	               	               	              
	        	break;
	        	
	        	case "AddFavorite":
	        	   showToast( data.msg );
	        	   fav = favoriteButton(data.details.added);
	        	   $(".favorite_toolbar_wrap").html(fav);
	        	break;
	        	
	        	case "DriverSignup":
	        	   showPage("driver_ty.html",{
	        	   	  'message' : data.msg
	        	   });
	        	break;
	        	
	        	case "sendOrderSMSCode":
	        	  showToast( data.msg );
	        	  $(".sms_order_session").val( data.details.sms_order_session );
	        	break;
	        	
	        	case "verifyOrderSMScode":
	        	  next_step = getStorage("next_step");
   	              dump("next_step=>"+ next_step);
   	              replacePage('payment_option.html');
	        	break;
	        	
	        	case "clearRecentLocation":
	        	  processDynamicAjax('GetRecentLocation','','recent_location_loader','GET',1 );
	        	break;
	        	        
	        	case "GetPage":
	        	  $(".custom_page_title").html( data.details.data.title );
	        	  $(".custom_page_content").html( data.details.data.content );
	        	break;
	        	
	        	case "clearRecentSearches":
	        	  processDynamicAjax('GetRecentSearch','','recent_search_item_loader','GET',1 );   
	        	break;
	        	
	        	case "TaskInformation":
	        	  
	        	  dump("task status=>"+ data.details.data.status);
	        	  dump("task rating=>"+ data.details.data.rating);
	        	  	        	  
	        	  if(data.details.data.status=="successful"){	        	  	 
	        	  	  rating = parseInt(data.details.data.rating);	        	  	  
	        	  	  if(rating>0){
	        	  	  	  dump('already has rating');	        	  	  	  
	        	  	  	  modal_content = NotificationContent(data.details.data.status, data.details.data );
	        	  	  	  showModalNotification(true);
	        	  	  } else {	        	  	  	  
		        	  	  $(".bottom-bar--bottom_track").hide();
	                      $("#track_driver .button--button_small").hide();
		        	  	  setTimeout(function() {				     
			        	  	  replacePage("task_add_rating.html",'none',{
			        	  	  	'task_id' : data.details.data.task_id
			        	  	  });
		        	  	  }, 500); 	        	  	
	        	  	  }
	        	  } else if ( data.details.data.status=="failed" ){
	        	  	  modal_content = NotificationContent(data.details.data.status, data.details.data );
	        	  	  showModalNotification(true);
	        	  } else if ( data.details.data.status=="cancelled" ){
	        	  	  modal_content = NotificationContent(data.details.data.status, data.details.data);
	        	  	  showModalNotification(true);
	        	  } else if ( data.details.data.status=="declined" ){
	        	  	  modal_content = NotificationContent(data.details.data.status, data.details.data);
	        	  	  showModalNotification(true);
	        	  } else {
		        	  document.querySelector('ons-progress-bar').setAttribute('value',  data.details.data.completed );
		        	  $(".track_driver_id").val( data.details.data.driver_id );
		        	  setTrackList(data.details.data,'list_track');
		        	  iniTrackMap('#map_track', data.details.data);	  
		        	  runTrack();      	  
	        	  }
	        	break;
	        	
	        	case "DriverInformation":
	        	  if ( data.details.page_action=="pull_refresh"){ 
	        	  	  $("#driver_list_details").html('');			  	
	        	  	  $(".driver_details").html('');			  	
	        	  }
	        	  setDriverInformation(data.details.data, '.driver_details','driver_list_details');
	        	  initRatyStatic();
	        	break;
	        	
	        	case "GetTask":
	        	  $(".print_driver_name").html( data.details.data.driver_name );
	        	  $(".print_driver_phone").html( data.details.data.driver_phone );
	        	  $("#task_add_rating img.thumbnail").attr("src", data.details.data.profile_photo );
	        	  $(".print_review_as").html( data.details.data.review_as );
	        	  
	        	  $("#task_add_rating .review").val( data.details.data.rating_comment );	        	  
	        	  $("#task_add_rating .rating").val( data.details.data.rating );
	        	  $("#task_add_rating .task_id").val( data.details.data.task_id );
	        	  	        	  
	        	   if(data.details.data.rating_anonymous==1){
	        	      document.querySelector('ons-checkbox').checked = true;
	        	   } else {
	        	   	  document.querySelector('ons-checkbox').checked = false;
	        	   }
	        	  
	        	  initRaty(data.details.data.rating);
	        	  
	        	break;
	        	
	        	case "addTaskReview":
	        	   showToast( data.msg );
	        	   popPage();
	        	break;
	        	
	        	 case "getItemByCategory":	
    		  
    		     $("#item_page .center span.print_category_name").html( data.details.category.category_name );
    		     
    		         		     
    		     setCategoryCarousel( data.details.category_list , data.details.category.cat_id );    		     
    		     
    		     if ( data.details.page_action=="pull_refresh"){ 
    		     	$("#resto_list_item").html('');			  	
    			  	 setPaginate("#item_page", data.details.paginate_total);  
    			  	 //setItemList( data.details.data ,'resto_list_item' );
    			  	 setterMenu(data.details.data);
    			 } else if (data.details.page_action=="infinite_scroll") {  	    			 	
    			 	//setItemList( data.details.data,'resto_list_item' ); 
    			 	setterMenu(data.details.data);
    		     } else {
    		     	setPaginate("#item_page", data.details.paginate_total);  
    		        //setItemList( data.details.data ,'resto_list_item' );
    		        setterMenu(data.details.data);
    		     }
    		     break;
    		     
    		     
                case "OrderList":
	        	   if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#order_list_item").html('');			  	
    			  	  setPaginate("#order_list", data.details.paginate_total);  
    			  	  setOrderList( data.details.data ,'order_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setOrderList( data.details.data ,'order_list_item' );
	        	   } else {
		        	   setPaginate("#order_list", data.details.paginate_total);  
	    		       setOrderList( data.details.data ,'order_list_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded(); 
	        	break;
	        	
	        	case "getOrderHistory":	              
	        	  if(data.details.show_track){
	        	  	$("#track_driver_button").attr("disabled",false);
	        	  } else {
	        	  	$("#track_driver_button").attr("disabled",true);
	        	  }	        	  
	        	  if ( data.details.page_action=="pull_refresh"){ 
	        	  	  $(".order_details_header").html('');		
	        	  	  $("#track_history_item").html('');		
	        	  }
	        	  setOrderDetails(data.details.order_info,'.order_details_header');
	        	  setOrderHistory(data.details.data, 'track_history_item');
	        	  initRatyStatic();
	        	  imageLoaded(); 
	        	break;
	        	
	        	 case "BookingList":	
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#booking_history_item").html('');			  	
    			  	  setPaginate("#booking_history", data.details.paginate_total);  
    			  	  setBookingList( data.details.data ,'booking_history_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setBookingList( data.details.data ,'booking_history_item' );
	        	   } else {
		        	   setPaginate("#booking_history", data.details.paginate_total);  
	    		       setBookingList( data.details.data ,'booking_history_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded();
	            break;
	            
	            case "FavoriteList":
	               if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#favorite_list_item").html('');			  	
    			  	  setPaginate("#favorite_list", data.details.paginate_total);  
    			  	  setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   } else {
		        	   setPaginate("#favorite_list", data.details.paginate_total);  
	    		       setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded();
	            break;
	            
	            case "CrediCartList":
	             if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#creditcard_list_item").html('');			  	
    			  	  setPaginate("#creditcard_list", data.details.paginate_total);  
    			  	  setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   } else {
		        	   setPaginate("#creditcard_list", data.details.paginate_total);  
	    		       setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   }	        	   
	            break;
	          
	            case "AddressBookList":
	             if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#addressbook_list_item").html('');			  	
    			  	  setPaginate("#addressbook_list", data.details.paginate_total);  
    			  	  setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   } else {
		        	   setPaginate("#addressbook_list", data.details.paginate_total);  
	    		       setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   }	        	   
	            break;
	            
	            case "ReviewList":
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#reviews_list_item").html('');			  		        	   	  
    			  	  setPaginate("#reviews", data.details.paginate_total);  
    			  	  setReviewList( data.details.data ,'reviews_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setReviewList( data.details.data ,'reviews_list_item' );
	        	   } else {
		        	   setPaginate("#reviews", data.details.paginate_total);  
	    		       setReviewList( data.details.data ,'reviews_list_item' );
	        	   }	
	        	   initRatyStatic();
	        	   imageLoaded();
	            break;
	            
	            case "GetGallery":
	        	 if ( data.details.page_action=="pull_refresh"){    
    			  	  $("#list_photo_gallery").html('');			  	    			  	  
	        	 } 
	        	 setGallery( data.details.data.gallery,'list_photo_gallery');
	        	 imageLoaded(); 
	        	break;
	        	
	        	case "GetMerchantInformation":
	             setMerchantInformation(data.details.data.information, '.information_loader');
	             imageLoaded();
	            break;	       
	            
	             case "GetMerchantPromo":
		          if ( data.details.page_action=="pull_refresh"){    
	    			  	$("#promo_list_item").html('');
		          }			  	
	              setPromo( data.details.data,'promo_list_item');
	            break;    
	            
	            case "GetPointSummary":
	              if ( data.details.page_action=="pull_refresh"){
	              	$("#points_list_item").html('');
	              }
	              setPointSummary( data.details.data ,'points_list_item' );
	            break;
	            
	            case "getOrderDetailsCancel":
	              $("#cancel_order_form .order_id").val( data.details.data.order_id );
	              $("#cancel_order_form h5").html( data.details.data.merchant_name );
	        	  $("#cancel_order_form .print_trans").html( data.details.data.transaction );
	        	  $("#cancel_order_form .print_payment_type").html( data.details.data.payment_type );
	        	  $("#cancel_order_form .thumbnail").attr("src", data.details.data.logo);
	        	  imageLoaded(); 
	            break;
	            
	            case "GetNotifications":
	              notiRemoveButton(true);
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#notifications_list_item").html('');			  	
    			  	  setPaginate("#notifications", data.details.paginate_total);  
    			  	  setNotificationList( data.details.data ,'notifications_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setNotificationList( data.details.data ,'notifications_list_item' );
	        	   } else {
		        	   setPaginate("#notifications", data.details.paginate_total);  
	    		       setNotificationList( data.details.data ,'notifications_list_item' );
	        	   }	    
	            break;
	            
	            case "ReadNotification":
	            case "markAllNotifications":
	              params="&page_action=pull_refresh";
			      processDynamicAjax('GetNotifications',params,'notifications_loader','GET',1 ); 
	            break;
	            	            
	            case "GetBookingDetails":
	               if ( data.details.page_action=="pull_refresh"){ 
	               	   $("#booking_details_list").html('');	
	               } 	               
	               setBookingDetails(data.details.data,'booking_details_list');
	            break;
	            	            	            
	            case "getAddressBookLocationByID":	              
	              $.each(data.details.data, function(key, val){
	              	  if(key!="as_default"){
	              	     setValue("#address_book_location ."+key, val);	
	              	  }
	              });
	              
	              data_state = {
					state_name :data.details.data.state_name,
					state_id:data.details.data.state_id,
					country_id:data.details.data.country_id,
					country_name:''
				  };	
				  setStorage("location_data_state1", JSON.stringify(data_state) ); 
				  
				  data_city = {
					city_name :data.details.data.city_name,
					city_id:data.details.data.city_id,
					state_id:data.details.data.state_id,
					country_id:data.details.data.country_id
				  };	
				  setStorage("location_data_city1", JSON.stringify(data_city) ); 
				  
				  data_area = {
					area_id :data.details.data.area_id,
					area_name:data.details.data.area_name,		
				 };	
				  setStorage("location_data_area1", JSON.stringify(data_area) ); 
				              
	              if(data.details.data.as_default==1){
	        	      document.querySelector('ons-checkbox').checked = true;
	        	  } else {
	        	   	  document.querySelector('ons-checkbox').checked = false;
	        	  }
	        	  
	        	  lat = data.details.data.lat;
	        	  lng = data.details.data.lng;
	        	  if(!empty(lat)){	        	  	  
	        	  	  $("#address_book_location .lat").val( lat );
	        	  	  $("#address_book_location .lng").val( lng );
	        	  	  fillMapAddress('#map_address', true, lat , lng );
	        	  } else {
	        	  	  initMapAdress('#map_address', true);
	        	  }
	        	  
	            break;
	            
	            case "GetAddressFromCartLocation":
	              $.each(data.details, function(key, val){
	              	 if(key!="save_address"){
	              	    setValue("#address_form_location ."+key, val);	
	              	 }
	              });
	              
	              data_state = {
					state_name :data.details.state_name,
					state_id:data.details.state_id,
					country_id:data.details.country_id,
					country_name:''
				  };	
				  setStorage("location_data_state1", JSON.stringify(data_state) ); 
				  
				  data_city = {
					city_name :data.details.city_name,
					city_id:data.details.city_id,
					state_id:data.details.state_id,
					country_id:data.details.country_id
				  };	
				  setStorage("location_data_city1", JSON.stringify(data_city) ); 
				  
				  data_area = {
					area_id :data.details.area_id,
					area_name:data.details.area_name,		
				 };	
				  setStorage("location_data_area1", JSON.stringify(data_area) ); 
	              
	              if(data.details.save_address==1){
	        	      document.querySelector('ons-checkbox').checked = true;
	        	   } else {
	        	   	  document.querySelector('ons-checkbox').checked = false;
	        	   }
	              
	              if(!empty(data.details.lat)){
	              	 fillMapAddress('#map_address', true, data.details.lat, data.details.lng );
	              } else {
	              	 initMapAdress('#map_address', true); 
	              }     	
	              
	              if(empty(data.details.street) && empty(data.details.state_name) ){
	              	 fillAddressForm();
	              }     		
	              
	            break;
	            
	            case "getAddressLocationBookDropDown":
	        	  tpl = fillAddressBook(data.details.data);
	        	  $('#address_form_select_location .address_book_wrap').html( tpl );
	        	break;	 
	        		        	
	        	case "preCheckout":
	        	
	        	  if(data.details.future_order==1){	        	  	
	        	  	 if(data.details.future_order_confirm==1){
		        	  	ons.platform.select('ios');  
						ons.notification.confirm( data.details.future_order_message ,{
							title: dialog_title,
							id : "dialog_cancel_order",
							buttonLabels : [ t("Yes"), t("Cancel") ]
						}).then(function(input) {
							if (input==0){			
								checkout();
							}
						});		        
						return;  		  
		        	  } 	        			        	  
	        	  } 	        	  
	        	  checkout();    		
	        		        	
	        	break;
	        	
	        	case "ContactSubmit":
	        	  onsenNavigator.pushPage('contact_us_ty.html',{
				  	animation : "slide",
				  	data : { 					  	  
				  	  'message': data.msg					  	  
				  	 }
				  });  	        	  
	        	break;
	        		        	      
     			default:
     			 showToast( data.msg );
     			break;
     		}
     		
     	} else if ( data.code==3){ // token not valid
     		
     		 onsenNavigator.resetToPage('page_startup.html',{
  	           animation : "fade",		  	
             });
     		
     	} else if ( data.code==4){	
     		
     		if(action=="loadCart"){  
     		   showToast( data.msg );	 
     		   clearCartDiv();
     		}
     		
        } else if ( data.code==5){			
     		// silent     		
     		if(action=="loadCart"){   
     		   clearCartDiv();
     		}
     		     		
     	} else if ( data.code== 6 ) {  // empty list
    	  
          $(data.details.element).html( templateError(data.msg, data.details.message) );
          $(data.details.element_list).html('');
          
          if(action=="TaskInformation"){          	
             $(".bottom-bar--bottom_track").hide();
             $("#track_driver .button--button_small").hide();
          }
          if(action=="DriverInformation"){          	
             $(".driver_details").html('');	
          }
          
          if(action=="GetNotifications"){
          	 notiRemoveButton(false);
          }
          	
     	} else {
     		/*FAILED CONDITION*/
     		switch(action){
     			     			
     			case "customerLogin":     			  
     			  if( !empty(data.details.next_step) ){
     			  	next_step = '';
	        	 	next_step = getStorage("next_step");
	        	 	if(empty(next_step)){
	        	 		next_step='map_select_location';
	        	 	}	        	 	
	        	 	onsenNavigator.pushPage("verification.html" ,{
					  	   animation : "none" ,  	
					  	   data : {
					  	   	  "contact_phone" : data.details.contact_phone,
					  	   	  "customer_token" : data.details.customer_token,
					  	   	  "email_address" : data.details.email_address,					  	   	  
					  	   	  "next_step" : next_step ,
					  	   	  "verification_type" : data.details.next_step,
					  	   }
					 });  					 
     			  } else {
     			  	  showToast( data.msg );    
     			  }     	
     			break;
     			
     			case "GetPage":
     			  $(".custom_page_title").html( '' );	        	  
     			  $('.custom_page_content').html( templateError(data.msg, t("Sorry but we cannot find what you are looking for") ) );
     			break;
     			
     			case "getItemByCategory":	
     			$("#resto_list_item").html('');			  	
    		     $("#item_page .center span.print_category_name").html( data.details.category.category_name );
    		     $(".item_loader").html( "<p class=\"small padding\">"+data.msg+"</p>" );
    		    break; 
    		    
     			case "sendOrderSMSCode":
     			 showToast( data.msg );
	        	 $(".sms_order_session").val('');
	        	break;
	        	
     			case "searchMerchant":
	        	  $(".total_number_found").html( data.msg );
	        	  $('.sort_btn').attr("disabled",true);
	        	break;
	        	
	        	case "cuisineList":
	        	  $("#list_cuisine").html('');
	        	  $(".total_number_found").html( data.msg );
	        	  break;
	        	 
	        	case "loadCart": 	        	
	        	  clearCartDiv();
	        	break;
	        	
	        	case "verifyCustomerToken":	   	        	   
	        	   if ( data.details.action=="account_menu"){	        	   		        	   	    
	        	   	    removeStorage("user_token");
	        	   	    accountMenu(false);	        	   	    
	        	   } else {
	        	   	    //
	        	   }
	        	break;
	        	
	        	case "GetAddressFromCart":
	        	  $("#address_form .contact_phone").val( data.details.customer_phone);
	        	  fillCountry("#address_form", data.details.country_list, data.details.country_code);
	        	  initMapAdress('#map_address', true);
	        	break;
	        	
	        	case "getOrderDetails":	       
	        	case "getOrderDetailsCancel":
	        	  $(".white_wrapper").after( templateError( t('Record not found') ,data.msg) );	        	  
	        	  $(".white_wrapper").remove();
	        	  $(".button").attr("disabled", true);
	        	break;
	        	
	        	case "getCedittCardInfo":
	        	  $(".frm_creditcard").html( templateError( t('Record not found') ,data.msg) );
	        	  $("#save_cc_button").attr("disabled", true);
	        	break;
	        	
	        	case "AddFavorite":	        	   
	        	   fav = favoriteButton(false);
	        	   $(".favorite_toolbar_wrap").html(fav);
	        	break;
	        		        		        	  
     			default:
     			 showToast( data.msg );
     			break;
     		}
     	}
     	     	
    }); /*end done*/
    
    /*ALWAYS*/
    ajax_request.always(function() {
        dump("ajax always");
        showLoader(false, loader_type);
        ajax_request=null;  
        clearTimeout(timer);
    });
          
    /*FAIL*/
    ajax_request.fail(function( jqXHR, textStatus ) {
    	clearTimeout(timer);        	
    	showToast( t("Failed") + ": " + textStatus + "\n" + jqXHR.responseText );
        dump("failed ajax " + textStatus );        
    });     
    
   } catch(err) {
      alert(err.message);
   } 
    
};
/*END PROCESS AJAX*/


getAppSettings = function(){
	 app_settings = getStorage("app_settings");
	 if(!empty(app_settings)){
	    app_settings = JSON.parse( app_settings );	 
	    return app_settings;
	 }
	 return false;
};

getMerchantSettings = function(){
	 merchant_settings = getStorage("merchant_settings");
	 if(!empty(merchant_settings)){
	    merchant_settings = JSON.parse( merchant_settings );	 
	    return merchant_settings;
	 }
	 return false;
};

getDefaultCountry = function(){
	if(app_settings = getAppSettings()){
		geocomplete_default_country = app_settings.geocomplete_default_country;
		if(geocomplete_default_country=="yes"){		  
		  return app_settings.map_country;
		}
	} 
	return '';
};

showPage = function(page_id, animation, data){
	
   if(empty(page_id)){
   	  return;
   }
   	
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.pushPage(page_id,{
  	   animation : animation , 
  	   data : data 	
   });  
};

resetToPage = function(page_id, animation , data ){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.resetToPage(page_id,{
  	   animation : animation ,  	
  	   data : data
   });  
};

replacePage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.replacePage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

bringPageTop = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.bringPageTop(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};

insertPage = function(page_id, animation, data){
   if(empty(animation)){
   	  animation='slide';
   }
   if(empty(data)){
   	  data={};
   }
   onsenNavigator.insertPage(page_id,{
  	   animation : animation ,  
  	   data : data	
   });  
};


submitForm = function(form_name, action_name , method ){
			
		
	switch(action_name){
		case "createAccount":
		  if ($('#check_terms_condition').is(':visible')) {
				check_terms_condition = $("input[name=check_terms_condition]:checked").val();		
				if(empty(check_terms_condition)){
					showAlert( t("You must agree to terms and condition") );
					return false;
				}			
			}
		break;
		
		default:
		break;
	}
	
	$(form_name).validate({
   	    submitHandler: function(form) {
   	    	 var params = $( form_name ).serialize();   	    	 
		     processAjax(action_name, params , method );
		}
   	});
	$(form_name).submit();
};

get_customField = function(){
	html='';
	if(app_settings = getAppSettings()){
		if( app_settings.reg_custom==1){			
			$.each(app_settings.reg_custom_fields, function(key, val){
				dump( key +"=>" + val);
				html+= formatFields ( key, val);
			});
			$(".reg_last_row").after(html);
		}
	}
};


var popPage = function(){
	try {
		onsenNavigator.popPage({
		 animation :"none"	
		});		
	} catch(err) {
      dump(err.message);
   } 
};


var setMobileNuber = function(){
	$(".frm_setphone").validate({
   	   submitHandler: function(form) {
   	      prefix = $(".moobile_prefix").val();
   	      if(empty(prefix)){
   	      	 prefix='';
   	      }
   	      phone = $(".mobile_no").val();
   	      complete_phone = prefix+phone;   	      
   	      popPage();
   	      $(".contact_phone").val( complete_phone );
	   }
   	});
	$(".frm_setphone").submit();
};


showMobileCode = function(){
	var dialog = document.getElementById('dialog_mobilecode_list');   
     if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement('dialog_mobilecode_list.html', { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
};

setPrefix = function(data){
	$(".moobile_prefix").val(data);
	var dialog = document.getElementById('dialog_mobilecode_list');  
	dialog.hide();
};

resendCode = function(){
	var params = $( ".frm_verify" ).serialize();   	    	 
    processAjax("resendCode", params  );
};

/*showMainPage = function(){
	var params = $( ".frm_searchbylat" ).serializeArray(); 
	var lat = $(".lat").val();
	var lng = $(".lng").val();
	
	setStorage("location_lat", lat );
	setStorage("location_lng", lng );
		
    onsenNavigator.resetToPage("tabbar.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  lat : lat,
  	   	  lng : lng,
  	   }
    });  	
};*/

openMenu = function() {
  var menu = document.getElementById('menu');
  menu.open();
};

loadSplitterPage = function(page) {
  var content = document.getElementById('content');
  var menu = document.getElementById('menu');
  content.load(page).then(menu.close.bind(menu));
};

getCurrentLocation = function(){	
	lat = getStorage("location_lat");
    lng = getStorage("location_lng");
    location_address = getStorage("location_address");
    if(!empty(lat) && !empty(lng)){
    	return {"lat": lat , "lng": lng, "address" : location_address };
    }
    return false;
}


getTimeNow = function(){
	var d = new Date();
    var n = d.getTime(); 
    return n;
};

showLoaderDiv = function(show, target){
	
	dump("target=>"+target);
	
	if(show){
		$("."+target).html( icon_loader );
	} else {
		$("."+target).html( '' );
	}	
};

/*mycall2*/
var ajax_array = {};
var timer_array = {};
	
processDynamicAjax = function(action, data , target,  method , single_call){
			
	dump("processDynamicAjax");
	if(empty(method)){
		method='GET';
	}
	
	var timenow = getTimeNow();
	if(!empty(single_call)){
		var timenow = 1;
	}
	
	endpoint = ajax_url+"/"+action;
	
	data+=requestParams(action);
	
	dump(endpoint);
	
	dump("AJAX VARIABLE")
	dump(timenow);
	dump("END AJAX VARIABLE")
		
	ajax_array[timenow] = $.ajax({
	  url: endpoint ,
	  method: method ,
	  data: data ,
	  dataType: "json",
	  timeout: ajax_timeout ,
	  crossDomain: true,
	  beforeSend: function( xhr ) {
         dump("before send ajax");   
         
         showLoaderDiv( true, target );
         
         clearTimeout( timer_array[timenow] );
                                         
         if(ajax_array[timenow] != null) {	
         	ajax_array[timenow].abort();            
            clearTimeout( timer_array[timenow] );            
         } else {         	         	           	         	
         	timer_array[timenow] = setTimeout(function() {		
         		if(ajax_array[timenow] != null) {		
				   ajax_array[timenow].abort();
         		}         		
         		showLoaderDiv( false, target );
				//showToast( t('Request taking lot of time. Please try again') );
				
				$("."+ target).html( '<p class="small">'+ t('Request taking lot of time. Please try again') +'</p>' );
	        }, ajax_timeout ); 
         }
      }
    });
       
    ajax_array[timenow].done(function( data ) {
    	
    	showLoaderDiv( false, target );
    	
    	if(data.code==1){    		    		
    		switch (action){
    			case "searchMerchant":    			
    			    			  
    			  search_type = data.details.search_type;     			  
    			      			  
    			  if( search_type=="byLatLong"){    			  	  
    			  	 $(".search_total_number_found").html( data.msg ); 
    			  } 

    			  if ( data.details.page_action=="pull_refresh"){        			  	  
    			  	  $("#list_restaurant").html('');			  	
    			  	  setPaginate("#restaurant_list", data.details.paginate_total);  
    			  	  fillRestaurantList(data.details.list);
    			  } else if ( data.details.page_action=="infinite_scroll") {
    			  	  fillRestaurantList(data.details.list);
    			  } else {
    			  	  resp = MerchantCarousel( data.details.list );    			  	  
    			      $("."+ target).html( resp );    		    			          			     
    			  }    			
    			  
    			  initRatyStatic();    			  
    			  imageLoaded();	
    			     			  
    			break;
    			
    			case "cuisineList":      			      			  
    			  if ( data.details.page_action=="pull_refresh"){    			  	
    			  	 dump('pull_refresh');
    			  	 $(".total_number_found").html( data.msg );
	        	     $(".sortby_selected").html( data.details.sortby_selected );
	        	     $("#list_cuisine").html('');
	        	     $(".frm_cuisine .paginate_total").val( data.details.paginate_total );	        	     
	        	     $(".frm_cuisine .paginate_page").val( 1 );
	        	     ListCuisine( data.details.list , 'list_cuisine');
    			  } else if (data.details.page_action=="infinite_scroll") {    			  	
    			  	 dump('infinite_scroll');   			  	
    			  	 $(".total_number_found").html( data.msg );
	        	     $(".sortby_selected").html( data.details.sortby_selected );	        	     
	        	     $(".frm_cuisine .paginate_total").val( data.details.paginate_total );		        	     
	        	     ListCuisine( data.details.list , 'list_cuisine');    			  	
    			  } else {
    			  	 $("#cuisine_list_wrapper").show();
    			  	 resp = CuisineCarousel( data.details.list );
    			     $("."+ target).html( resp ); 
    			  }
    			  
    			  imageLoaded(); 
    			break;
    			
    			case "searchByMerchantName":
    			  restaurantListSmall( data.details.list , 'search_field_by_name_result' );
    			  imageLoaded(); 
    			break;
    			
    			case "searchByCuisine":
    			  cuisineListSmall( data.details.list , 'search_field_by_cuisine_result' );
    			  imageLoaded(); 
    			break;
    			
    			case "getMerchantMenu":
    			    			      			  
    			  if ( data.details.page_action=="pull_refresh"){ 
    			  	  $("#resto_list_category").html('');			  	
    			  	  setPaginate("#restaurant_page", data.details.paginate_total);  
    			  	  //restaurantCategory(data.details.list,'resto_list_category');
    			  	  setCategoryList( data.details.list,'resto_list_category' );
    			  } else if (data.details.page_action=="infinite_scroll") { 
    			  	 //restaurantCategory(data.details.list,'resto_list_category');
    			  	 setCategoryList( data.details.list,'resto_list_category' );
    			  } else {
    			  	 setPaginate("#restaurant_page", data.details.paginate_total);  
    			  	 //restaurantCategory(data.details.list,'resto_list_category');
    			  	 setCategoryList( data.details.list,'resto_list_category' );
    			  }     			  
    			  
    			  
    			  if(!empty(data.details.item_id)){    
    			  	setTimeout(function() {				     
				 		itemDetails(data.details.item_id, data.details.cat_id);
				    }, 500); 
    			  }
    			  
    			break;
    			
    		  case "getItemByCategory":	
    		      		     
    		     $("#item_page .center span.print_category_name").html( data.details.category.category_name );
    		     
    		     setCategoryCarousel( data.details.category_list , data.details.category.cat_id );
    		     
    		     if ( data.details.page_action=="pull_refresh"){ 
    		     	$("#resto_list_item").html('');			  	
    			  	 setPaginate("#item_page", data.details.paginate_total);  
    			  	 //setItemList( data.details.data ,'resto_list_item' );
    			  	 setterMenu(data.details.data);
    			 } else if (data.details.page_action=="infinite_scroll") {  	    			 	
    			 	//setItemList( data.details.data,'resto_list_item' ); 
    			 	setterMenu(data.details.data);
    		     } else {
    		     	setPaginate("#item_page", data.details.paginate_total);  
    		        //setItemList( data.details.data ,'resto_list_item' );
    		        setterMenu(data.details.data);
    		     }
    		     break;
    		      		  
	          case "searchFoodItem":	        	
	        	  itemListSmall( data.details.data , 'search_item_name_result' );
	        	  imageLoaded(); 
	        	break;
	        	
	           case "getFirstCart":	  
	               setStorage("cart_merchant_id", data.details.merchant_id);
	               $(".tabbar__badge").html( data.details.count );
	           break;
	           
	           case "removeCartItem":
	        	  loadCart();
	        	  clearBasket();
	        	break;
	        	
	        	case "OrderList":
	        	   if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#order_list_item").html('');			  	
    			  	  setPaginate("#order_list", data.details.paginate_total);  
    			  	  setOrderList( data.details.data ,'order_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setOrderList( data.details.data ,'order_list_item' );
	        	   } else {
		        	   setPaginate("#order_list", data.details.paginate_total);  
	    		       setOrderList( data.details.data ,'order_list_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded(); 
	        	break;
	        	
	          case "BookingList":	
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#booking_history_item").html('');			  	
    			  	  setPaginate("#booking_history", data.details.paginate_total);  
    			  	  setBookingList( data.details.data ,'booking_history_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setBookingList( data.details.data ,'booking_history_item' );
	        	   } else {
		        	   setPaginate("#booking_history", data.details.paginate_total);  
	    		       setBookingList( data.details.data ,'booking_history_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded();
	          break;
	          
	          case "FavoriteList":
	               if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#favorite_list_item").html('');			  	
    			  	  setPaginate("#favorite_list", data.details.paginate_total);  
    			  	  setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   } else {
		        	   setPaginate("#favorite_list", data.details.paginate_total);  
	    		       setFavoriteList( data.details.data ,'favorite_list_item' );
	        	   }
	        	   initRatyStatic();
	        	   imageLoaded();
	          break;
	          
	          case "CrediCartList":
	             if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#creditcard_list_item").html('');			  	
    			  	  setPaginate("#creditcard_list", data.details.paginate_total);  
    			  	  setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   } else {
		        	   setPaginate("#creditcard_list", data.details.paginate_total);  
	    		       setCreditCardList( data.details.data ,'creditcard_list_item' );
	        	   }	        	   
	          break;
	          
	           case "AddressBookList":
	             if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#addressbook_list_item").html('');			  	
    			  	  setPaginate("#addressbook_list", data.details.paginate_total);  
    			  	  setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   } else {
		        	   setPaginate("#addressbook_list", data.details.paginate_total);  
	    		       setAddressBookList( data.details.data ,'addressbook_list_item' );
	        	   }	        	   
	          break;
	          
	          case "getlanguageList":
	            if ( data.details.page_action=="pull_refresh"){ 
	            	$("#language_list_item").html('');			  	
    			  	setlanguageList( data.details.data ,'language_list_item' , data.details.lang );
	            } else {
	               setlanguageList( data.details.data ,'language_list_item' , data.details.lang );
	            }
	          break;
	          
	          case "getOrderHistory":	              
	        	  if(data.details.show_track){
	        	  	$("#track_driver_button").attr("disabled",false);
	        	  } else {
	        	  	$("#track_driver_button").attr("disabled",true);
	        	  }	        	  
	        	  if ( data.details.page_action=="pull_refresh"){ 
	        	  	  $(".order_details_header").html('');		
	        	  	  $("#track_history_item").html('');		
	        	  }
	        	  setOrderDetails(data.details.order_info,'.order_details_header');
	        	  setOrderHistory(data.details.data, 'track_history_item');
	        	  initRatyStatic();
	        	  imageLoaded(); 
	        	break;
	        	
	        case "getOrderHistory2":	  	              
	              stopTrackHistory();
	        	  if(data.details.show_track){
	        	  	$("#track_driver_button").attr("disabled",false);
	        	  } else {
	        	  	$("#track_driver_button").attr("disabled",true);
	        	  }	        	  
	        	  if ( data.details.page_action=="pull_refresh"){ 
	        	  	  $(".order_details_header").html('');		
	        	  	  $("#track_history_item").html('');		
	        	  }
	        	  setOrderDetails(data.details.order_info,'.order_details_header');
	        	  setOrderHistory(data.details.data, 'track_history_item');
	        	  initRatyStatic();
	        	  imageLoaded(); 
	        	  runTrackHistory();
	        	break;	
	        	
	          case "searchOrder":	            
	              orderListSmall( data.details.list , 'search_order_result' );
	            break;
	            
	           case "searchFavorites": 
	              FavoriteListSmall( data.details.data , 'favorite_search_result' );
	           break;
	           
	           case "ReviewList":
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#reviews_list_item").html('');			  	
    			  	  setPaginate("#reviews", data.details.paginate_total);  
    			  	  setReviewList( data.details.data ,'reviews_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setReviewList( data.details.data ,'reviews_list_item' );
	        	   } else {
		        	   setPaginate("#reviews", data.details.paginate_total);  
	    		       setReviewList( data.details.data ,'reviews_list_item' );
	        	   }	
	        	   initRatyStatic();
	        	   imageLoaded(); 
	           break;
	           
	           case "GetMerchantTimeList":
	             setTimeList(data.details.data,'.time_select_wrap');
	           break;
	           
	           case "GetGallery":
	        	 if ( data.details.page_action=="pull_refresh"){    
    			  	  $("#list_photo_gallery").html('');			  	    			  	  
	        	 } 
	        	 setGallery( data.details.data.gallery,'list_photo_gallery');
	        	 imageLoaded(); 
	        	break;
	        	
	           case "GetMerchantInformation":
	             setMerchantInformation(data.details.data.information, '.information_loader');
	             imageLoaded();
	           break;
	           
	           case "GetMerchantPromo":
		          if ( data.details.page_action=="pull_refresh"){    
	    			  	$("#promo_list_item").html('');
		          }			  	
	              setPromo( data.details.data,'promo_list_item');
	           break;
	           
	           case "GetPointSummary":
	              if ( data.details.page_action=="pull_refresh"){
	              	$("#points_list_item").html('');
	              }
	              setPointSummary( data.details.data ,'points_list_item' );
	           break;
	           
	           case "GetPointDetails":
	             $("#points_details .print_page_title").html( data.details.page_title );
	             
	             if ( data.details.page_action=="pull_refresh"){
	              	$("#points_details_item").html('');
	              	setPaginate("#points_details", data.details.paginate_total);  
	             } 
	             setPointDetails( data.details.data ,'points_details_item' );
	           break;
	           
	           case "searchFoodCategory":
	             CategoryListSmall( data.details.data , 'search_category_name_result' );
	             imageLoaded();
	           break;
	           
	           case "GetRecentLocation":
	               $(".delete_recent_loc_wrap").show();
		          if ( data.details.page_action=="pull_refresh"){	          	 
		             $("#recent_location_item").find(".recent_loc_child").remove();
		             setPaginate("#map_enter_address", data.details.paginate_total);  
		          } 
		          setPaginateTotal("#map_enter_address", data.details.paginate_total);  
	              setGetRecentLocation( data.details.data , 'recent_location_item'  );
	           break;
	           
	           case "searchMerchantFood":
	             setMerchantFoodList( data.details.data , 'search_form_result'  );
	           break;
	           
	           case "GetRecentSearch":	
	              $(".delete_recent_searches_wrap").show();
	              if ( data.details.page_action=="pull_refresh"){
	              	  $("#recent_search_item").find(".recent_search_child").remove();
	              	  setPaginate("#search", data.details.paginate_total);  
	              }
	             setPaginateTotal("#search", data.details.paginate_total);  
	             setRecentSearchList( data.details.data , 'recent_search_item'  );
	           break;
	           
	           case "PayOnDeliveryCardList":
	              if ( data.details.page_action=="pull_refresh"){	
  	              	  $("#payondelivery_list_item").html('');
	              }
	              setPayOnDeliveryCardList(data.details.list, 'payondelivery_list_item' );
	              imageLoaded();
	           break;
	           
	           case "getPushSettings":
	              if(data.details.push_enabled==1){
	                $(".enabled_push").prop('checked', true);
	              } else {
	              	$(".enabled_push").prop('checked', false);
	              }
	           break;
	           
	           case "reRegisterDevice":
	           break;
	           
	           case "mapboxgeocode":
	              identifyLocationLoader(false);
	              
	              if (!app_settings.map_auto_identity_location){			   	  	  
			   	  	  $(".identify_location_wrap").hide();
			   	  }
			   	  
			   	  $(".print_location_address").html( data.details.formatted_address );
			   	  $(".recent_search_address").val( data.details.formatted_address );
	              
	           break;
	           
	           case "DriverInformation":
	        	  if ( data.details.page_action=="pull_refresh"){ 
	        	  	  $("#driver_list_details").html('');			  	
	        	  	  $(".driver_details").html('');			  	
	        	  }
	        	  setDriverInformation(data.details.data, '.driver_details','driver_list_details');
	        	  initRatyStatic();
	        	break;
	        	
	           case "TrackDriver":	
	             stopTrack();	             
	             map_moveMarker( 1,  data.details.data.location_lat , data.details.data.location_lng );
	             map_setCenter( data.details.data.location_lat , data.details.data.location_lng );
	             
	             document.querySelector('ons-progress-bar').setAttribute('value',  data.details.data.completed );

	             //alert(data.details.data.task_status);
	             if(data.details.data.task_status=="successful"){	             	
	             	replacePage("task_add_rating.html",'none',{
	        	  	  'task_id' : data.details.data.task_id
	        	  	});             		        	  
	             } else if ( data.details.data.task_status=="inprogress" ) {
	             	 modal_content = NotificationContent(data.details.data.task_status, data.details.data);
	             	 showModalNotification(true);
	             	 
	             } else if ( data.details.data.task_status=="declined" ) {
	             	 modal_content = NotificationContent(data.details.data.task_status, data.details.data);
	             	 showModalNotification(true);
	             } else if ( data.details.data.task_status=="cancelled" ) {	
	             	 modal_content = NotificationContent(data.details.data.task_status, data.details.data);
	             	 showModalNotification(true);
	             } else if ( data.details.data.task_status=="failed" ) {		             	
	             	 modal_content = NotificationContent(data.details.data.task_status, data.details.data);
	             	 showModalNotification(true);
	             } else {
	             	runTrack();
	             }	             	                          	            
	           break;
    			
	           
	          case "loadCart":
	        	
	        	  initRatyStatic();
	        	  setStorage("merchant_settings", JSON.stringify(data.details.merchant_settings) );  
	        	  
	        	  document.querySelector('ons-tabbar').setActiveTab(0);
	        	   	        	   	        	  
	        	  setStorage("next_step", 'payment_option' );
	        	   
	        	  if ( data.details.required_delivery_time=="yes"){
        		  	 $(".required_delivery_time").val(1);
        		  } else {
        		  	 $(".required_delivery_time").val('');
        		  }
        		  
        		  $(".has_addressbook").val( data.details.has_addressbook );
        		  $(".sms_order_session").val( data.details.sms_order_session);
        		  
	        	  $(".no_order_wrap").hide();
	        	  $(".bottom_toolbar_checkout").show();
	        	  tpl = displayCartDetails(data.details);
	        	  $(".cart_details").html( tpl ) ;
	        	  
	        	  if(data.details.cart_error.length>0){
	        	  	 $('.bottom_toolbar_checkout ons-button').attr("disabled",true);
	        	  	 cart_error='';     	  	
	        	  	 $.each( data.details.cart_error  , function( cart_error_key, cart_error_val ) {
	        	  		 cart_error+=cart_error_val + "\n";
	        	  	 });	        	        	  	
	        	  	 showAlert(cart_error);
	        	  } else {
	        	  	$('.bottom_toolbar_checkout ons-button').attr("disabled",false);
	        	  }
	        	  
	        	  imageLoaded();
	        	  
	        	break; 
	        	
	        	case "GetPage":
	        	  $(".custom_page_title").html( data.details.data.title );
	        	  $(".custom_page_content").html( data.details.data.content );
	        	break;
	        	
	        	case "GetNotifications":
	        	  notiRemoveButton(true);
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#notifications_list_item").html('');			  	
    			  	  setPaginate("#notifications", data.details.paginate_total);  
    			  	  setNotificationList( data.details.data ,'notifications_list_item' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setNotificationList( data.details.data ,'notifications_list_item' );
	        	   } else {
		        	   setPaginate("#notifications", data.details.paginate_total);  
	    		       setNotificationList( data.details.data ,'notifications_list_item' );
	        	   }	    
	            break;
	            
	            case "searchBooking":
	               bookingListSmall( data.details.list , 'booking_search_result' );
	            break;
	            
	            case "GetBookingDetails":
	               if ( data.details.page_action=="pull_refresh"){ 
	               	   $("#booking_details_list").html('');	
	               } 	               
	               setBookingDetails(data.details.data,'booking_details_list');
	            break;
	            
	            case "getlanguageList2":
	              if ( data.details.page_action=="pull_refresh"){ 
	            	  $("#language2_list_item").html('');			  	
    			  	  setlanguageList2( data.details.data ,'language2_list_item' , data.details.lang );
	              } else {
	                  setlanguageList2( data.details.data ,'language2_list_item' , data.details.lang );
	              }
	            break;
	            
	            case "checkRunTrackHistory":
	               if(data.details.run_track==1){
	               	  runTrackHistory();
	               }    		
	            break;
	            	            
	            case "CityList":
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#location_city_result").html('');			  	
    			  	  setPaginate("#location_city", data.details.paginate_total);  
    			  	  setCityList( data.details.data ,'location_city_result' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setCityList( data.details.data ,'location_city_result' );
	        	   } else {
		        	   setPaginate("#location_city", data.details.paginate_total);  
	    		       setCityList( data.details.data ,'location_city_result' );
	        	   }
	            break;
	            
	            case "AreaList":
	               if ( data.details.page_action=="pull_refresh"){ 
	        	   	   $("#location_area_result").html('');			  	
    			  	   setPaginate("#location_area", data.details.paginate_total);  
    			  	   setAreaList( data.details.data ,'location_area_result' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setAreaList( data.details.data ,'location_area_result' );
	        	   } else {
		        	   setPaginate("#location_area", data.details.paginate_total);  
	    		       setAreaList( data.details.data ,'location_area_result' );
	        	   }
	            break;
	            
	             case "StateList":
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#location_state_result").html('');			  	
    			  	  setPaginate("#location_state", data.details.paginate_total);  
    			  	  setStateList( data.details.data ,'location_state_result' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setStateList( data.details.data ,'location_state_result' );
	        	   } else {
		        	   setPaginate("#location_state", data.details.paginate_total);  
	    		       setStateList( data.details.data ,'location_state_result' );
	        	   }
	            break;
	            
	            case "PostalCodeList":
	              if ( data.details.page_action=="pull_refresh"){ 
	        	   	  $("#location_postal_code_result").html('');			  	
    			  	  setPaginate("#location_postal_code", data.details.paginate_total);  
    			  	  setPotalList( data.details.data ,'location_postal_code_result' );
	        	   } else if (data.details.page_action=="infinite_scroll") {  
	        	   	   setPotalList( data.details.data ,'location_postal_code_result' );
	        	   } else {
		        	   setPaginate("#location_postal_code", data.details.paginate_total);  
	    		       setPotalList( data.details.data ,'location_postal_code_result' );
	        	   }
	            break;
	            
	            case "getActiveMerchantCategory":
	              setStorage("active_merchant_category", JSON.stringify(data.details.data) );  
	            break;
	            
    		}    		
    	} else if ( data.code== 6 ) {  // empty list
    	          
          $(data.details.element).html( templateError(data.msg, data.details.message) );
          $(data.details.element_list).html('');
                    
          if ( action=="getOrderHistory"){              	  
          	  $(".order_details_header").html('');
          	  $("#track_driver_button").attr("disabled",true);
          } else if ( action=="GetGallery"){
          	   $("#photo_gallery .white_list_wrapper").css("background-color", "transparent");
          } else if ( action=="DriverInformation"){
          	  $(".driver_details").html('');	
          } else if ( action=="GetNotifications"){
          	 notiRemoveButton(false);
          }
    	   
    	} else {
    		// FAILED CONDITION
    		dump('failed condition');
    		switch (action){
    			
    			
                case "GetPage":
     			  $(".custom_page_title").html( '' );	        	  
     			  $('.custom_page_content').html( templateError(data.msg, t("Sorry but we cannot find what you are looking for") ) );
     			break;
     			
    			case "loadCart": 	        	
	        	  clearCartDiv();
	        	break;   
    			
    			case "TrackDriver":	
	             stopTrack();
	            break;
	           
    			case "mapboxgeocode":
    			   showToast( data.msg );
    			break;
    			
    			case "searchMerchant":    
    						  
    			  search_type = data.details.search_type;
    			      			 
    			  if( search_type=="byLatLong"){    			  	  
    			  	 $(".search_total_number_found").html( data.msg ); 
    			  	 $(".search_results_wrapper").addClass("remove-min-height");       			  
    			  } else {    			  	 
    			  	 $("."+ target).addClass("remove-min-height small");
    			  	 $("."+ target).html( data.msg );
    			  }
    			  
    			  if ( data.details.page_action=="pull_refresh"){
    			  	  $("#list_restaurant").html('');
    			  	  $(".total_number_found").html( data.msg );    			  	  
    			  }
    			      			
    			   			  
    			break;

    			case "cuisineList":
    			  if ( data.details.page_action=="pull_refresh"){     			  	  
	        	      $(".total_number_found").html( data.msg );
	        	   } else if (data.details.page_action=="infinite_scroll") {    	        	   	  
	        	      $(".total_number_found").html( data.msg );
    			  } else {
    			  	  $("#cuisine_list_wrapper").hide();    			  	 
    			  }
	        	  break;   		
	        	  
	        	case "getMerchantMenu":	      
	        	case "searchFoodItem":  	
	        	case "searchFoodCategory":
	        	  if(action=="getMerchantMenu"){
	        	  	 $("#resto_list_category").html('');
	        	  }
	        	  $("."+ target).html( "<p class=\"small padding\">"+data.msg+"</p>" );
	        	 break;   		
	        	 
	        	case "getItemByCategory":		        	 
    		     $("#item_page .center span.print_category_name").html( data.details.category.category_name );
    		     setCategoryCarousel( data.details.category_list , data.details.category.cat_id );	  
    		     $("."+ target).html( "<p class=\"small padding\">"+data.msg+"</p>" );
    		    break; 
    		        		        		    
    		    case "GetRecentLocation":    		      
    		       $(".delete_recent_loc_wrap").hide();
    		      $("#recent_location_item").find(".recent_loc_child").remove();
    		    break; 
    		    
    		     case "GetRecentSearch":    		      
    		      $(".delete_recent_searches_wrap").hide();
    		      $("#recent_search_item").find(".recent_search_child").remove();    		      
    		    break; 
    		    
    		    case "reRegisterDevice":
    		    break; 
    		    
    		    case "getOrderHistory2":
    		      stopTrackHistory();
    		    break; 
    		        		    
    		    case "getActiveMerchantCategory":
    		      setStorage("active_merchant_category",'');  
    		    break; 
    		        		    
    			default:
    			  $("."+ target).html( data.msg );
    			break;
    		}
    	}
    });
        
    /*ALWAYS*/
    ajax_array[timenow].always(function() {        
        ajax_array[timenow] = null;  
        clearTimeout( timer_array[timenow] );
    });
          
    /*FAIL*/
    ajax_array[timenow].fail(function( jqXHR, textStatus ) {
    	showLoaderDiv( false, target );
    	clearTimeout( timer_array[timenow] );    	
    	//showToast( t("Failed") + ": " + textStatus );       	
    });     
	
};

showRestaurantList = function(search_type){
   onsenNavigator.pushPage("restaurant_list.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  "search_type" : search_type
  	   }
   });  
};

showRestaurantListCuisine = function(search_type, cuisine_id){
   onsenNavigator.pushPage("restaurant_list.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  "search_type" : search_type,
  	   	  "cuisine_id" : cuisine_id
  	   }
   });  
};

replaceRestaurantListCuisine = function(search_type, cuisine_id){
   onsenNavigator.replacePage("restaurant_list.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  "search_type" : search_type,
  	   	  "cuisine_id" : cuisine_id
  	   }
   });  
};

loadMerchant = function(merchant_id){	
	onsenNavigator.pushPage("restaurant_page.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  "merchant_id" : merchant_id
  	   }
   });  
};

ReplaceMerchant = function(merchant_id){	
	onsenNavigator.replacePage("restaurant_page.html",{
  	   animation : "slide" ,  	
  	   data : {
  	   	  "merchant_id" : merchant_id
  	   }
   });  
};


getListType = function(){
	
	list_type = 1;
	if(app_settings = getAppSettings()){
   	   list_type = app_settings.list_type;
   	}
   	return list_type;    
};

showSheet = function(template_id, id){		
	var dialog = document.getElementById(id);   
    if (dialog) {     	 
     	 dialog.show();
    } else {
       ons.createElement(template_id, { append: true }).then(function(dialog) {       	
        dialog.show();
      });
    }
    
};

hideSheet = function(){
	var dialog1 = document.getElementById('sortbyresto');  
	var dialog2 = document.getElementById('filter');  
	var dialog3 = document.getElementById('sort_cuisine');
	var dialog4 = document.getElementById('filter_item');
	if(!empty(dialog1)){
	   dialog1.hide(); 
	}
	if(!empty(dialog2)){
	   dialog2.hide(); 
	}
	if(!empty(dialog3)){
	   dialog3.hide(); 
	}
	if(!empty(dialog4)){
	   dialog4.hide(); 
	}
};

setSortBy = function(){
	var sort_by = $('#sortbyresto input[name=sortby]:checked').val();		
	$("#restaurant_list .sort_by").val( sort_by );
	reloadSearchResult();
};

reloadSearchResult = function(){
	$("#list_restaurant").html('');
	
	search_type = $(".search_type").val();	
    params = "search_type="+search_type;
    params+="&with_distance=1";
    params+="&sort_by=" + $("#restaurant_list .sort_by").val();
    params+="&sort_asc_desc=" + $("#sortbyresto .sort_asc_desc").val();
    params+="&cuisine_id=" + $("#restaurant_list .cuisine_id").val();
    
    params+= "&"+$( ".frm_filter" ).serialize();   	    	  
    
    hideSheet();
    processAjax('searchMerchant',params);
};

clearForm = function(form_id){
	 $("#"+form_id).find(':input').each(function() {						    	
        switch(this.type) {
            case 'password':
            case 'select-multiple':
            case 'select-one':
            case 'text':
            case 'textarea':
                $(this).val('');
                break;
            case 'checkbox':
            case 'radio':
                this.checked = false;    
                break;        
        }
   });
}

destroyList = function(element){
	dump("destroyList");
	dump(element);
	$("#"+ element +" ons-list-item").remove();
};

setFocus = function(element){
	try {	    	    
	    setTimeout(function(){
		   document.getElementById( element )._input.focus();
		},200);
	 } catch(err) {
        dump(err);
     } 
}

var pullHook = {};

/*mypull*/
initPullHook = function(id, element, data){
	
	dump("initPullHook=> "+ element);
	var timenow = getTimeNow();
	
	/*if (id=="home"){
		pullHook[timenow] = document.getElementById('home_pull_hook');		 		  
	} else if ( id = "restaurant_list"){
		pullHook[timenow] = document.getElementById('restaurant_list_pull_hook');
	}*/
	
	pullHook[timenow] = document.getElementById(element);		 		  
	
	if(pullHook[timenow]){
		pullHook[timenow].addEventListener('changestate', function(event) {
	    var message = '';		
	    switch (event.state) {
	      case 'initial':
	        message = t('Pull to refresh');
	        break;
	      case 'preaction':
	        message = t('Release');
	        break;
	      case 'action':
	        message = t('Loading...');
	        break;
	     }		
	     pullHook[timenow].innerHTML = message;
	    }); 
	}

	
	switch(id)
	{
		case "home":

		  pullHook[timenow].onAction = function(done) {
		  			  	
	   	    
   	    	params = "search_type=byLatLong";
   	    	processDynamicAjax('searchMerchant', params , 'search_results_wrapper');
	   	    			 
			 loadHomePage();
   	            
		     setTimeout(function() {				     
		 		done();
		    }, 1000); 
		  };
		  		
		break;
		
		case "restaurant_list":
		    pullHook[timenow].onAction = function(done) {
		       	search_type = $(".search_type").val();		       	
   	            params = "search_type="+search_type;
   	            params+="&with_distance=1";
   	            params+="&sort_by=" + $(".sort_by").val();
   	            params+="&page_action=pull_refresh";
   	            params+="&cuisine_id="+ $(".cuisine_id").val();
   	               	                        		    	   	            
   	            processDynamicAjax('searchMerchant',params,'restaurant_list_loader','GET','1');
   	            
		        setTimeout(function() {				     
		 		done();
		       }, 1000); 
		    };
		break;
		
		case "load_cart":
		    pullHook[timenow].onAction = function(done) {		    	
		       //loadCart();
		       loadCartPull();
		       setTimeout(function() {				     
		 		done();
		       }, 1000); 
		       
		    };
		break;
		
		case "cuisine_list":		
		    pullHook[timenow].onAction = function(done) {		       	
		    	
		    	var params = $(".frm_cuisine").serialize();
		    	params+="&page_action=pull_refresh";		    	
		    	processDynamicAjax('cuisineList',params,'cuisine_loader','GET','1');
		    	
		        setTimeout(function() {				     
		 		done();
		       }, 1000); 
		    };
		    
		break;
		
		case "restaurant_page":
		  pullHook[timenow].onAction = function(done) {		       	
		    			  	     
		  	    merchant_id = getActiveMerchantID();
		  	
		    	params = "merchant_id="+ merchant_id;
		    	params+="&page_action=pull_refresh";
	        	processDynamicAjax('getMerchantMenu',params,'menu_loader','GET',1 )     		
	        	  
		        setTimeout(function() {				     
		 		done();
		       }, 1000); 
		    };
		break;
		
		case "item_page":
		 pullHook[timenow].onAction = function(done) {		 
		 	      	
			  cat_id = $("#item_page .cat_id").val( );
			  merchant_id = getActiveMerchantID();
			  
			  params = "merchant_id="+ merchant_id;
	   	      params+="&cat_id=" + cat_id ;
	   	      params+="&page_action=pull_refresh";
	   	      params+= "&"+$( ".frm_filter_item" ).serialize(); 
		      processDynamicAjax('getItemByCategory',params,'item_loader','GET',1 );
		      
		      setTimeout(function() {				     
		 		done();
		      }, 1000); 
		       
	      };
		break;
		
		case "order_list":
			pullHook[timenow].onAction = function(done) {		 
			    params="&page_action=pull_refresh&tab="+ $(".order_tab_active").val() ;
			    processDynamicAjax('OrderList',params,'order_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "booking_history":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&tab="+ $(".booking_tab_active").val();
			    processDynamicAjax('BookingList',params,'booking_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "favorite_list":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('FavoriteList',params,'favorite_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "creditcard_list":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('CrediCartList',params,'creditcard_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "select_creditcards":
		  pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('CrediCartList',params,'select_creditcards_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "addressbook_list":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('AddressBookList',params,'addressbook_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "language_list":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('getlanguageList',params,'language_list_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "track_history":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('getOrderHistory',params,'track_history_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "reviews":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('ReviewList',params,'reviews_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "photo_gallery":
		  pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetGallery',params,'gallery_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "promos":
		  pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetMerchantPromo',params,'promos_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "points_list":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetPointSummary',params,'points_list_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "points_details":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetPointDetails',params,'points_details_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "information":
		 pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetMerchantInformation',params,'information_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "map_enter_address":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetRecentLocation',params,'recent_location_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "search":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetRecentSearch',params,'recent_search_item_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "payondelivery_list":		
		
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('PayOnDeliveryCardList',params,'payondelivery_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		
		break;
		
		case "driver_details":
		    pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('DriverInformation',params,'driver_details_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "GetPage":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetPage',params,'custom_page_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "notifications":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetNotifications',params,'notifications_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "booking_details":
		   pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh&" + data;
			    processDynamicAjax('GetBookingDetails',params,'booking_details_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "language_list2":
			pullHook[timenow].onAction = function(done) {					
			    params="&page_action=pull_refresh";
			    processDynamicAjax('getlanguageList2',params,'language2_list_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "location_city_result":		    
		    pullHook[timenow].onAction = function(done) {					
		    	destroyList('location_city_result');
			    params="&page_action=pull_refresh";
			    if(!empty(data)){
			    	params+="&"+ data;
			    }
			    processDynamicAjax('CityList',params,'location_city_result_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "location_area_result":
		   pullHook[timenow].onAction = function(done) {	
		   	    destroyList('location_area_result');				
			    params="&page_action=pull_refresh";
			    params+="&"+data;
			    processDynamicAjax('AreaList',params,'location_area_result_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "StateList":
		   pullHook[timenow].onAction = function(done) {	
		   	    destroyList('location_state_result');				
			    params="&page_action=pull_refresh";
			    if(!empty(data)){
			       params+="&"+data;
			    }
			    processDynamicAjax('StateList',params,'location_state_result_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		case "PostalCodeList":
		   pullHook[timenow].onAction = function(done) {	
		   	    destroyList('location_state_result');				
			    params="&page_action=pull_refresh";
			    if(!empty(data)){
			       params+="&"+data;
			    }
			    processDynamicAjax('PostalCodeList',params,'location_postal_code_result_loader','GET',1 ); 
			    setTimeout(function() {				     
			 		done();
			    }, 1000); 
			};    
		break;
		
		default:
		 dump("id =>"+ id);
		break;
		
	}
};
/*end initPullHook*/

fillRestaurantList = function(data){	
	list_type = getListType(); 	
	if(list_type==1){		
	    restaurantList(data,'list_restaurant');
	} else if ( list_type == 3) {
		restaurantListColumn(data,'list_restaurant');
	} else {	    
	    restaurantListWithBanner(data, 'list_restaurant');
	}
};

setterMenu = function(data){	
    menu_type = 2;
	if(app_settings = getAppSettings()){		  	 	  	
	   menu_type = app_settings.menu_type;
    }    
    dump("menu_type=>"+menu_type);
    switch (menu_type){
    	case "3":
    	  setItemListColumn(  data ,'resto_list_item' );
    	break;
    	
    	default:
    	  setItemList(  data ,'resto_list_item' );
    	break;
    }
    
    imageLoaded();
};

getCuisine = function(){
	var params = $(".frm_cuisine").serialize();		
   	processAjax('cuisineList',params,'GET','skeleton6');
};


setSortCuisine = function(){
	var sort_fields = $('#sort_cuisine input[name=sortby]:checked').val();		
	var sort_by = $( "#sort_cuisine .sort_asc_desc" ).val();
		
	$(".sort_fields").val( sort_fields );	
	$(".sort_by").val( sort_by );	
	
	hideSheet();
	getCuisine();
};

/*myscroll*/
initInfiniteScroll = function(object, action , element_id, datas){	 
	
	 dump('initInfiniteScroll');
	 object.onInfiniteScroll = function(done) {
	 	switch (action){
	 		case "cuisine_list":
	 		   data = $(".frm_cuisine").serialize();
	 		   data+="&page_action=infinite_scroll";
	 		   
	 		   paginate_page = parseInt($(".frm_cuisine .paginate_page").val());
	 		   data+="&page="+ paginate_page;
	 		   	 		   
	 		   	 		  
	 		   paginate_page = paginate_page+1;	 		   
	 		   $(".frm_cuisine .paginate_page").val(paginate_page);
	 		   
	 		   paginate_total = $(".frm_cuisine .paginate_total").val( );
	 		   if(paginate_page>paginate_total){
	 		   	  dump('finish');	 		   	  
	 		   	  done();
	 		   } else {	 		   	  
	 		   	  processDynamicAjax("cuisineList", data , "cuisine_loader",  "GET");
	 		   	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		   }
	 		break;
	 		
	 		
	 		case "restaurant_list":
	 		  
	 		  //params = "search_type="+search_type+"&lat="+current_latlng.lat+"&lng="+ current_latlng.lng ;   	     
	 		  params = "search_type="+search_type;
	          params+="&with_distance=1";
	          params+="&sort_by=" + $(".sort_by").val();
	          params+="&page_action=infinite_scroll";
   	            
	 		  paginate_page = parseInt($("#restaurant_list .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  params+="&cuisine_id="+ $(".cuisine_id").val();
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#restaurant_list .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#restaurant_list .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');
	 		  	 processDynamicAjax('searchMerchant',params,'restaurant_list_loader','GET');
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	 }, 1000);
	 		  }
	 		  
	 		break;
	 		
	 		case "restaurant_page":
	 		
	 		  params = "search_type="+search_type;
	          params+="&with_distance=1";	          
	          params+="&page_action=infinite_scroll";
   	            
	 		  paginate_page = parseInt($("#restaurant_page .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#restaurant_page .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#restaurant_page .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');
	 		  	 params+= "&merchant_id="+ getActiveMerchantID();
	        	 processDynamicAjax('getMerchantMenu',params,'menu_loader','GET' );	 		  	 
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		  }
	 		  
	 		break;
	 		
	 		case "item_page":
	 			 		 
	 		  params='';
		      paginate_page = parseInt($("#item_page .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#item_page .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#item_page .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');
	 		  	 
	 		  	  cat_id = $("#item_page .cat_id").val( );
			      merchant_id = getActiveMerchantID();
			  
			      params+="&merchant_id="+ merchant_id;
	   	          params+="&cat_id=" + cat_id ;
	   	          params+="&page_action=infinite_scroll";
	   	          params+= "&"+$( ".frm_filter_item" ).serialize(); 
	   	          
		          processDynamicAjax('getItemByCategory',params,'item_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		
	 		break;
	 		
	 		case "order_list":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		  	 
	   	          params+="&page_action=infinite_scroll&tab="+ $(".order_tab_active").val() ;
		          processDynamicAjax('OrderList',params,'order_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }	 		
	 		break;
	 		
	 		
	 		case "booking_history":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		  	 
	   	          params+="&page_action=infinite_scroll";
	   	          params+="&tab="+ $(".booking_tab_active").val();	
		          processDynamicAjax('BookingList',params,'booking_loader','GET');
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 		case "favorite_list":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		  	 
	   	          params+="&page_action=infinite_scroll";
		          processDynamicAjax('FavoriteList',params,'favorite_loader','GET' );
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 		case "creditcard_list":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		  	 
	   	          params+="&page_action=infinite_scroll";
		          processDynamicAjax('CrediCartList',params,'creditcard_loader','GET' );
		          setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  		 		  	
	 		  }
	 		break;
	 		
	 		case "addressbook_list":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		  	 
	   	          params+="&page_action=infinite_scroll";
		          processDynamicAjax('AddressBookList',params,'addressbook_loader','GET');
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 		
	 		case "reviews":	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		 		  
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 		
	 		  	  merchant_id = getActiveMerchantID();  	 
	   	          params+="&page_action=infinite_scroll";
	   	          params+="&merchant_id="+ merchant_id;	   	             	   
		          processDynamicAjax('ReviewList',params,'reviews_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 		case "points_details":
	 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		   
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 			 		  	  	
	   	          params+="&page_action=infinite_scroll&"+ datas;	   	          
		          processDynamicAjax('GetPointDetails',params,'reviews_loader','GET' );	 		  	 
	 		  	 setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		  }
	 		
	 		break;
	 		
	 		case "map_enter_address":
	 		   params='';
		       paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		   params+="&page="+ paginate_page;
	 		  
	 		   paginate_page = paginate_page+1;	 		   
	 		   dump("paginate_page=>"+ paginate_page);
	 		   
	 		   $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		   paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		   if(paginate_page>paginate_total){
	 		  	  dump('finish');
	 		   	  done();
	 		   } else {
	 		  	  dump('call ajax infinite');	 		  	 	 			 		  	  	
	   	          params+="&page_action=infinite_scroll&"+ datas;	   	          
 		          processDynamicAjax('GetRecentLocation',params,'recent_location_loader','GET' );	 		  	 
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		   }
	 		break;
	 		
	 		case "search":
	 		
	 		   params='';
		       paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		   params+="&page="+ paginate_page;
	 		  
	 		   paginate_page = paginate_page+1;	 		   
	 		   dump("paginate_page=>"+ paginate_page);
	 		   
	 		   $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		   paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		   if(paginate_page>paginate_total){
	 		  	  dump('finish');
	 		   	  done();
	 		   } else {
	 		  	  dump('call ajax infinite');	 		  	 	 			 		  	  	
	   	          params+="&page_action=infinite_scroll&"+ datas;	   	          
 		          processDynamicAjax('GetRecentSearch',params,'recent_search_item_loader','GET' );	 		  	 
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		   }
	 		
	 		break;
	 		
	 		case "notifications":
	 		
	 		   params='';
		       paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		   params+="&page="+ paginate_page;
	 		  
	 		   paginate_page = paginate_page+1;	 		   
	 		   dump("paginate_page=>"+ paginate_page);
	 		   
	 		   $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		   paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		   if(paginate_page>paginate_total){
	 		  	  dump('finish');
	 		   	  done();
	 		   } else {
	 		  	  dump('call ajax infinite');	 		  	 	 			 		  	  	
	   	          params+="&page_action=infinite_scroll&"+ datas;	   	          
 		          processDynamicAjax('GetNotifications',params,'notifications_loader','GET' );	 		  	 
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);
	 		   }
	 		   
	 		break;
	 		
	 		case "CityList":
	 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		 		  
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 			 		  	  
	   	          params+="&page_action=infinite_scroll";	
	   	          if(!empty(datas)){
	   	          	  params+="&"+datas;
	   	          }
		          processDynamicAjax('CityList',params,'location_city_result_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		
	 		break;
	 		
	 		case "AreaList":
	 			 		
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		 		  
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 			 		  	  
	   	          params+="&page_action=infinite_scroll";	  
	   	          if(!empty(datas)){
	   	          	  params+="&"+datas;
	   	          }
		          processDynamicAjax('AreaList',params,'location_area_result_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		
	 		break;
	 		
	 		case "StateList":
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		 		  
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 			 		  	  
	   	          params+="&page_action=infinite_scroll";	  
	   	          if(!empty(datas)){
	   	          	  params+="&"+datas;
	   	          }
		          processDynamicAjax('StateList',params,'location_state_result_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 		case "PostalCodeList":
	 		  params='';
		      paginate_page = parseInt($("#"+element_id+" .paginate_page").val());
	 		  params+="&page="+ paginate_page;
	 		  
	 		  paginate_page = paginate_page+1;	 		 		  
	 		  $("#"+element_id+" .paginate_page").val(paginate_page);
	 		  	 		  
	 		  paginate_total = $("#"+element_id+" .paginate_total").val( );
	 		  if(paginate_page>paginate_total){
	 		  	 dump('finish');	 		   	  
	 		   	 done();
	 		  } else {
	 		  	 dump('call ajax infinite');	 		  	 	 			 		  	  
	   	          params+="&page_action=infinite_scroll";	  
	   	          if(!empty(datas)){
	   	          	  params+="&"+datas;
	   	          }
		          processDynamicAjax('PostalCodeList',params,'location_postal_code_result_loader','GET' );
	 		  	  setTimeout(function(){	
	 		  	    done();
	 		  	  }, 1000);	 		  	 
	 		  }
	 		break;
	 		
	 	} /*end siwthc*/
	 };
};
/*end initInfiniteScroll*/

resetPaginate = function(element){
	$( element + " .paginate_total").val( 0 );
   	$( element + " .paginate_page").val( 1 );
};

setPaginate = function(element, total){
	$( element + " .paginate_total").val( total );
   	$( element + " .paginate_page").val( 1 );
};

setPaginateTotal = function(element, total){
	$( element + " .paginate_total").val( total );   	
};


setCategoryList = function(data, element){
	menu_type = 1;
	if(app_settings = getAppSettings()){		  	 	  	
	   menu_type = app_settings.menu_type;
    }
    dump("menu_typex=>"+ menu_type);
    switch(menu_type){    	
    	case "1":
    	  restaurantCategory( data , element );
    	break;
    	    	
    	case "2":
    	  restaurantCategoryTwo(data, element);
    	break;
    	    	
    	case "3":
    	 restaurantCategoryColumn(data, element);
    	break;
    	
    	default:
    	  restaurantCategoryTwo(data, element);
    	break;
    	
    }
    
    imageLoaded();
};

showItemPage = function(cat_id){
	 onsenNavigator.pushPage("item_page.html",{
  	   animation : "slide" ,  	
  	   data :{
  	   	  "cat_id" : cat_id,  	   	  
  	   }
   });  
};

reloadItemPage = function(cat_id){
	$("#resto_list_item").html('');			  	
	
	$("#item_page .cat_id").val( cat_id );
	merchant_id = getActiveMerchantID();
	
	params = "merchant_id="+ merchant_id;
   	params+="&cat_id=" + cat_id ;
   	params+= "&"+$( ".frm_filter_item" ).serialize(); 
	processDynamicAjax('getItemByCategory',params,'item_loader','GET',1 );
};

itemDetails = function(item_id, cat_id , row){		
	onsenNavigator.pushPage("item_details.html",{
  	   animation : "slide" ,  	
  	   data :{
  	   	  "item_id" : item_id,
  	   	  "cat_id" : cat_id,
  	   	  'row' : row
  	   }
   });  
};

isHidePrice = function(){
	website_hide_foodprice=false;
	if(settings = getAppSettings()){
		if(settings.website_hide_foodprice=="yes"){
			website_hide_foodprice=true;
		}
	}
	return website_hide_foodprice;
};

var addslashes = function(str)
{
	return (str + '')
    .replace(/[\\"']/g, '\\$&')
    .replace(/\u0000/g, '\\0')
};

var addQty = function(obj){	
	var parent = obj.parent().parent();	
	var ons_input = parent.find("ons-input");
	var value = ons_input.val();
	if (empty(value)){
		value=0;
	}
	if (isNaN(value)){
		value=0;
	}
	ons_input.val( parseInt(value) +1 );
};

var minusQty = function(obj){
	var parent = obj.parent().parent();	
	var ons_input = parent.find("ons-input");
	var value = ons_input.val();
	if (isNaN(ons_input.val())){
		value=0;
	}
	if (empty(value)){
		value=0;
	}
	value = parseInt(value) - 1;
	if (value>=1){
		ons_input.val( value );
	} else {
		ons_input.val( 1 );
	}
};


var addToCart = function(){
	dump('addToCart');
	
	merchant_two_flavor_option='';
	if(settings = getAppSettings()){
		var merchant_two_flavor_option = settings.merchant_two_flavor_option;		
	}
	
	
	/*CHECK IF HAS SELECTED PRICE*/
	var found_price = false;
	var params_price = $( ".frm_item").serializeArray();	
	$.each( params_price  , function( params_pricekey, params_priceval ) {
		dump(params_priceval.name);
		if(params_priceval.name=="price"){
			found_price  = true;
		}
	});
	
	is_two_flavors = $(".two_flavors").val();
		
	if(is_two_flavors==2 || is_two_flavors=="2"){
		/*CHECK IF HAS SELECT LEFT AND RIGHT FLAVOR*/
		left_flavor = $(".two_flavor_position_left  input:checked").length;		
		right_flavor = $(".two_flavor_position_right  input:checked").length;		
		
		if(left_flavor<=0){
			showToast( t("Please select left flavor") );
			return;
		}
		if(right_flavor<=0){
			showToast( t("Please select right flavor") );
			return;
		}
		
		temp_left_flavor_price = $(".two_flavor_position_left  input:checked").val();
		temp_left_flavor_price = temp_left_flavor_price.split("|");
		left_flavor_price=0;
		if(!empty(temp_left_flavor_price[1])){
		   left_flavor_price = temp_left_flavor_price[1];		
		}
		
		dump("left_flavor_price : "+ left_flavor_price);
		
		temp_right_flavor_price = $(".two_flavor_position_right  input:checked").val();
		temp_right_flavor_price = temp_right_flavor_price.split("|");
		right_flavor_price=0;
		if(!empty(temp_right_flavor_price[1])){
		   right_flavor_price = temp_right_flavor_price[1];		
		}
		
		dump("right_flavor_price : "+ right_flavor_price);
		
		final_flavor_price = 0;
		
		
		if(merchant_two_flavor_option==2){			
			sumup = parseFloat(left_flavor_price) + parseFloat(right_flavor_price);
			dump("sum up : "+ sumup);
			if(sumup>0.0001){
			   final_flavor_price = sumup/2;
			} 
		} else {
			if(left_flavor_price>right_flavor_price){
				final_flavor_price = left_flavor_price;
			} else {
				final_flavor_price = right_flavor_price;
			}
		}
		
		dump("final_flavor_price : "+ final_flavor_price);
		$(".two_flavors").after('<input type="hidden" name="price" value="'+ final_flavor_price +'" >');
		
		found_price = true;
	}

	
	if(!found_price){
		showToast( t("Please select price") );
		return;
	}
	/*END CHECK IF HAS SELECTED PRICE*/
	
	/*CHECK ADDONS IF REQUIRED*/
	if ( $(".require_addons").exists() ){
		$(".required_addon").remove();
	    var addon_required_msg = '';
		$.each( $(".require_addons")  , function( addonkey, addonval ) {
			dump(addonval);
			r_subcat_id = $(this).data("subcat_id");
			r_subcat_name = $(this).data("subcat_name");
			r_multi_option = $(this).data("multi_option");			
			r_multi_option_val = $(this).data("multi_option_val");
			
			dump( "r_subcat_id :"  + r_subcat_id);
			dump( "r_subcat_name :"  + r_subcat_name);
			dump( "r_multi_option :"  + r_multi_option);			
			dump( "r_multi_option_val :"  + r_multi_option_val);	
			
			if ( r_multi_option == "one" || r_multi_option == "multiple"  || r_multi_option == "custom" ){				
				addon_total_selected = $(".item_addon_" + r_subcat_id +" input:checked" ).length;
				dump( "addon_total_selected :"  + addon_total_selected);		
				if ( addon_total_selected<=0 ){
					 addon_err = t("You must select at least one addon for") + " " + r_subcat_name;
					 $(this).before( '<p class="required_addon">' + addon_err + '</p>' );
					 addon_required_msg += addon_err+"\n";
				}
			} else {				
				//
			}
			
		});
		
		if(!empty(addon_required_msg)){
			showToast(addon_required_msg);
			return;
		}
		
	}
	/*END CHECK ADDONS IF REQUIRED*/
	
	
	var params = $( ".frm_item").serializeArray();
	params[params.length] = { name: "qty", value: $(".item_qty").val() };
	dump(params);	
	
	/*alert('ok');
	return;	*/
	
	var ajax_uri = ajax_url+"/addToCart/?"+ requestParams();
	ajax_uri+="&merchant_id=" + getActiveMerchantID();
	
		
	ajax_cart = $.ajax({
	  type: "POST",
	  url: ajax_uri,
	  data: params,
	  dataType: "json",
	  timeout: ajax_timeout,
	  crossDomain: true,
	   beforeSend: function( xhr ) {
	   	  clearTimeout(timer);
	   	  
	   	  if(ajax_cart != null) {	
         	ajax_cart.abort();
            clearTimeout(timer);
         } else {         	
         	showLoader(true);
         	
         	timer = setTimeout(function() {		
         		if(ajax_cart != null) {		
				   ajax_cart.abort();
         		}
         		showLoader(false);
				showToast( t('Request taking lot of time. Please try again') );
	        }, ajax_timeout); 
         }
         
	   }
	});	
	
	ajax_cart.done(function( data ) {				 
		dump(data);
		if (data.code==1){
						
			setStorage("cart_merchant_id", data.details.merchant_id );
			
			showToast(data.msg);
			
			onsenNavigator.popPage({
			 animation :"none"	
			});	
			getCartCount();
			/*REFRESH CARD*/
			if (data.details.refresh==1){				
				loadCart();
			}
		} else {
			showAlert(data.msg);
		}
	});	
	
	ajax_cart.always(function( data ) {
		showLoader(false);
		dump("always")		
	});
	
	ajax_cart.fail(function( jqXHR, textStatus ) {	
		dump("failed ajax " + textStatus );
		showToast( t("Failed") + ": " + textStatus );
	});
	
};

var loadCart = function(transaction_type){	
	
	merchant_id = getActiveMerchantID();	
	      
	if(!empty(transaction_type)){
		processAjax('loadCart','transaction_type='+ transaction_type + "&merchant_id=" + merchant_id , 'GET' ,'skeleton3');
	} else {
		transaction_type_set = getStorage("transaction_type");		
		if(!empty(transaction_type_set)){
			processAjax('loadCart','transaction_type='+ transaction_type_set + "&merchant_id="+merchant_id ,'GET','skeleton3');
		} else {
			processAjax('loadCart','merchant_id=' + merchant_id ,'GET','skeleton3');
		}	    
	}
};

loadCartPull = function(){
	
	merchant_id = getActiveMerchantID();
	transaction_type = $(".transaction_type").val();	
	
	if(!empty(transaction_type)){
		processDynamicAjax('loadCart','transaction_type='+ transaction_type + "&merchant_id=" + merchant_id ,'dummy','GET', 1 );
	} else {
		transaction_type_set = getStorage("transaction_type");
		if(!empty(transaction_type_set)){
			processDynamicAjax('loadCart','transaction_type='+ transaction_type_set + "&merchant_id="+merchant_id ,'dummy','GET', 1  );
		} else {
			processDynamicAjax('loadCart','merchant_id=' + merchant_id ,'dummy','GET', 1  );
		}	    
	}
};

var getCartCount = function(){
	
	var ajax_uri = ajax_url+"/getCartCount/?temp=1"+ requestParams();	
	params = "merchant_id=" + getActiveMerchantID();
	
	transaction_type_set = getStorage("transaction_type");
	if(!empty(transaction_type_set)){
	   params+="&transaction_type="+transaction_type_set;
	}
	
	cart_theme = getCartTheme();
	
	var ajax_cart_count = $.post(ajax_uri, params , function(data){
		dump(data);		
		if(cart_theme==2){		   
		   setBasket(data.details);
		}
		if (data.code==1){
			$(".cart_count").html(data.details.count);
			$(".tabbar__badge").html(data.details.count);
		} else {			
			$(".cart_count").html('');
			$(".tabbar__badge").html('');			
		}
	}, "json")
	
	ajax_cart_count.done(function( data ) {		
	});	
	
	ajax_cart_count.always(function( data ) {
		dump("always")		
	});
	ajax_cart_count.fail(function( jqXHR, textStatus ) {	
		dump("failed ajax " + textStatus );
	});
};

getActiveMerchantID = function(){
	merchant_id = $("#restaurant_page .merchant_id").val();
	if(empty(merchant_id)){
		merchant_id = getStorage("cart_merchant_id");
	}
	return merchant_id;
};


var showCart = function(){
  onsenNavigator.pushPage('cart.html',{
  	animation : "lift"  
  });     
};

function number_format(number, decimals, dec_point, thousands_sep) 
{
  number = (number + '')
    .replace(/[^0-9+\-Ee.]/g, '');
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
    dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
    s = '',
    toFixedFix = function(n, prec) {
      var k = Math.pow(10, prec);
      return '' + (Math.round(n * k) / k)
        .toFixed(prec);
    };
  // Fix for IE parseFloat(0.55).toFixed(0) = 0;
  s = (prec ? toFixedFix(n, prec) : '' + Math.round(n))
    .split('.');
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || '')
    .length < prec) {
    s[1] = s[1] || '';
    s[1] += new Array(prec - s[1].length + 1)
      .join('0');
  }
  return s.join(dec);
}

function prettyPrice( price )
{
				
	if(settings = getAppSettings()){  	
		var decimal_place = settings.currency_decimal_place;		
		var currency_position= settings.currency_position;
		var currency_symbol = settings.currency_symbol;
		var thousand_separator = settings.currency_thousand_separator;
		var decimal_separator = settings.currency_decimal_separator;
		var currency_space = settings.currency_space;
    } else {
    	var decimal_place = 2;		
		var currency_position= "left";
		var currency_symbol = "$";
		var thousand_separator = ",";
		var decimal_separator = ".";
		var currency_space = '';	
    }   	  	
        
	/*dump("decimal_place=>"+decimal_place);	
	dump("currency_symbol=>"+currency_symbol);
	dump("thousand_separator=>"+thousand_separator);
	dump("decimal_separator=>"+decimal_separator);
	dump("currency_position=>"+currency_position);*/
			
	price = number_format(price, decimal_place, decimal_separator ,  thousand_separator ) ;
	spacer ="";
	if(currency_space==1){
		spacer =" ";
	}
	
	if ( currency_position =="left"){
		return currency_symbol+spacer+price;
	} else {
		return price+spacer+currency_symbol;
	}
}

var removeCartItem = function(row){			
    ons.platform.select('ios');  
    ons.notification.confirm( t("Are you sure you want to remove this item in your cart?") ,{
		title: t("Remove From Cart?"),
		id : "dialog_remove_item",
		buttonLabels : [ t("Remove"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){			
			processDynamicAjax('removeCartItem', 'row=' + row,'temp_loader');
		}
	});
};


confirmClearCart = function(){
  ons.platform.select('ios');  
  ons.notification.confirm( t("Are you sure you want to remove all items in your cart?") ,{
		title: t("Clear cart?"),
		id : "dialog_cancel_order",
		buttonLabels : [ t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){			
			processAjax("clearCart",'');
			removeStorage("delivery_asap_enabled");
		}
	});
};

hideDialog = function(id) {
  document.getElementById(id).hide();
};


clearCart = function(){
	hideDialog('clear_cart_dialog'); 
	processAjax("clearCart",'');
	removeStorage("delivery_asap_enabled");
};

var showTransactionList = function(){
    var dialog = document.getElementById('dialog_transaction_type');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_transaction_type.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
};


var setFieldValue = function(class_name, value , label ){
	
	$("."+ class_name).val( value );
	
	switch (class_name)
	{
		case "transaction_type":
		  setStorage("transaction_type", value);
		  $(".transaction_type_label").html( label );
		  var dialog = document.getElementById('dialog_transaction_type');
		  dialog.hide();
		  loadCart(value);
		break;
		
		case "delivery_date":  
		  setStorage("delivery_date_set", value );
		  setStorage("delivery_date_set_pretty", label );
		  $(".delivery_date_label").html( label );
		  var dialog = document.getElementById('dialog_delivery_date');
		  dialog.hide();
		  $(".delivery_time_label").html('');
		  $(".delivery_time").val('');
		  removeStorage("delivery_time_set");
		break;
		
		case "delivery_time":
		  setStorage("delivery_time_set", value );
		  $(".delivery_time_label").html( label );
		  var dialog = document.getElementById('dialog_delivery_time');
		  dialog.hide();
		  
		  var delivery_asap = document.getElementById('delivery_asap');
		  if(!empty(delivery_asap)){
		     delivery_asap.checked = false;
		     removeStorage("delivery_asap_enabled");
		  }
		  
		break;
	}
};

clearCartDiv = function(){	
	$(".no_order_wrap").show();
    $(".cart_details").html( '' ) ;
    $(".cart_count").html('');
    $(".tabbar__badge").html('');
    $(".bottom_toolbar_checkout").hide();
    clearBasket();    
};

var showDeliveryDateList = function(){
	var dialog = document.getElementById('dialog_delivery_date');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_delivery_date.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
}


var showDeliveryTime = function(){
	var dialog = document.getElementById('dialog_delivery_time');   
     if (dialog) {
     	 dialog.show();
    } else {
       ons.createElement('dialog_delivery_time.html', { append: true }).then(function(dialog) {
        dialog.show();
      });
    }
}

setAsap = function(){
	var delivery_asap = document.getElementById('delivery_asap');
	is_selected = delivery_asap.checked;	
    if (is_selected=="true" || is_selected == true){    	
    	$(".delivery_time").val('');
    	$(".delivery_time_label").html('');
    	removeStorage("delivery_time_set");  
    	setStorage("delivery_asap_enabled", 1);
    } else {
    	setStorage("delivery_asap_enabled", 0);
    }
};

initAddress = function(){
	has_addressbook = $(".has_addressbook").val();
	if(has_addressbook==1){
		if(isLocation()){
		   showPage('address_form_select_location.html');
		} else {
		   showPage('address_form_select.html');
		}
	} else {
		if(isLocation()){
			showPage('address_form_location.html');
		} else {
		   showPage('address_form.html');
		}
	}
};

var setDeliveryAddress = function(){
	$(".frm_address").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_address").serialize();
   	    	params+="&merchant_id=" + getActiveMerchantID();
   	    	processAjax('setDeliveryAddress', params );
		}
   	});
	$(".frm_address").submit();
};

var printDeliveryAddress = function(address){	
	$(".delivery_address_label").html(address);
};

placeholder = function(field, value){
	$(field).attr("placeholder", t(value) );
};

var isLogin = function(){
	var token = getStorage("user_token");
	if(!empty(token)){
		return token;
	}
	return false;
};


var checkout = function(){
		
	transaction_type = $(".transaction_type").val();
	if(empty(transaction_type)){
		showToast( t("Please select transaction type") );
		return;
	}
	
	switch (transaction_type){
		case "delivery":
		  var street = $(".delivery_address").val();
		  if(empty(street)){
		  	 showAlert( t("Please enter delivery address") );
		  	 return ;
		  }
		  
		  var delivery_asap_val = false;
		  var delivery_asap = document.getElementById('delivery_asap');		  		  
		  if(!empty(delivery_asap)){
		  	  delivery_asap_val = delivery_asap.checked;
		  }
		  
		  //alert(delivery_asap_val);
		  
		  required_delivery_time = $(".required_delivery_time").val();
		  if(required_delivery_time==1 && delivery_asap_val == false){
		  	  delivery_time_set = getStorage("delivery_time_set");		  
			  if(empty(delivery_time_set)){
			  	 showAlert( t("Delivery time is required") );
			  	 return;
			  }
		  }
		  
		  /*CHECK MINIMUM ORDER TABLE*/
		  min_delivery_order = parseFloat($(".min_delivery_order").val());		  
		  //alert(min_delivery_order);
		  if(min_delivery_order>0.0001){
		  	 cart_sub_total = parseFloat($(".cart_sub_total").val());		  	 
		  	// alert(cart_sub_total);
		  	 if(min_delivery_order>cart_sub_total){
		  	 	showAlert( t("Sorry but Minimum order is") +" "+ prettyPrice(min_delivery_order) );
			  	return;
		  	 }
		  }
		  
		break;
		
		case "pickup":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Pickup time is required") );
		  	 return;
		  }
		break;
		
		case "dinein":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Dine in time is required") );
		  	 return;
		  }
		break;
	}	
	
	setStorage("next_step",'payment_option');
			
	if(!isLogin()){				
		/*not login*/
		if (transaction_type=="dinein"){
			showPage("dinein_forms.html");			
		} else {									
			showPage('login.html');
		}
	} else {
		/*already login*/	
		if (transaction_type=="dinein"){						
			showPage("dinein_forms.html");
		} else {							
			if (isOrderVerificationEnabled()){
			 	showPage('order_verification.html');
			} else {
			    showPage('payment_option.html');
			}
		}
	}
};

isOrderVerificationEnabled = function(){	
	if (settings = getMerchantSettings() ){
		if (settings.order_verification==2){
			return true;
		}
	}
	return false;
};

continueCheckout = function(){	
	
	order_verification = false;
	if (isOrderVerificationEnabled()){	
	    order_verification=true;	
	}
	
	$(".frm_dinein").validate({
   	    submitHandler: function(form) {
   	    	if(!isLogin()){
				showPage('login.html');
			} else {
				if(order_verification){
				   showPage('order_verification.html');	
				} else {
				   showPage('payment_option.html');
				}
			}
		}
   	});
	$(".frm_dinein").submit();
};

var initPayment = function(){
	transaction_type = $(".transaction_type").val();
	var payment_provider = $("input[name=payment_provider]:checked").val();
	dump("payment_provider=>" + payment_provider);
	
	if(empty(payment_provider)){
		showToast( t("Please select payment") );
		return;
	}		  
		
	switch (payment_provider){
		case "cod":		 
		  if (transaction_type=="delivery"){
		  	 app_settings = getAppSettings();		  	 
		  	 if(app_settings.cod_change_required==2){
		  	    showPage("cod_forms.html");
		  	 } else {
		  	 	payNow();
		  	 }
		  } else {
		  	 payNow();
		  }
		break;
		
	
		case "ocr":
		  showPage("select_creditcards.html");		  
		break;
		
		case "pyr":
		  showPage("select_payondelivery.html");		  
		break;
		
		default:
		  //showToast("Please select payment");
		  payNow();
		break;
	}
};

submitCOD = function(){
	$(".frm_cod_forms").validate({
   	    submitHandler: function(form) {
   	    	payNow();   	    	
		}
   	});   	
	$(".frm_cod_forms").submit();
};

var payNow = function(payment_params){
	transaction_type = $(".transaction_type").val();
	var payment_provider = $("input[name=payment_provider]:checked").val();
	
	
	var params  = '';
	params = "transaction_type="+transaction_type;
	params += "&payment_provider="+payment_provider;	
		
	delivery_date_set = getStorage("delivery_date_set");
	if(!empty(delivery_date_set)){
	   params +='&delivery_date=' + delivery_date_set;
	}
	
	delivery_time_set = getStorage("delivery_time_set");
	if(!empty(delivery_time_set)){
	   params +='&delivery_time=' + delivery_time_set;	
	}
	
	save_address = getStorage("save_address");
	if(!empty(save_address)){
		params +='&save_address=1';
	}
	
	if(!empty(payment_params)){
		params+="&payment_params="+payment_params;
	}
	
	params += "&sms_order_session="+ $(".sms_order_session").val();
		
	switch (payment_provider){
		case "cod":
		case "obd":
		  if (transaction_type=="delivery"){
		      params+='&order_change='+ $("#order_change").val();
		  }
		  /*if (transaction_type=="dinein"){
		     params+= "&"+$( ".frm_dinein").serialize();
		  }*/
		break;
				
		case "ocr":
		  var selected_cc = $('#select_creditcards input[name=cc_id]:checked').val();
		  params+= "&cc_id=" + selected_cc;
		break;
				
		/*default:
		  showToast("Please select payment");
		  return;
		break;*/
	}
	
	switch(transaction_type){
		case "dinein":
		   params+= "&"+$( ".frm_dinein").serialize();
		break;
		
		case "delivery":
		  var delivery_asap = document.getElementById('delivery_asap');
		  if(!empty(delivery_asap)){
		     params+= "&delivery_asap=" + delivery_asap.checked;
		  }
		break;
	}
	
	params+= addMerchantParams();
	
	processAjax('payNow', params );
		
};

/*PAYMENT NEXT STEP*/
payNowNextStep = function(data){
	
	var options = { 
	  "order_id" : data.details.order_id ,
	  "total_amount" : data.details.total_amount ,
	  'message': data.msg					  	  
	};
	 	 	
	switch (data.details.next_step){
		
		case "show_home_page":
		    resetToPage('tabbar.html','none');
		  break;
		  
		case "receipt":		
		  onsenNavigator.resetToPage('receipt.html',{
		  	animation : "lift",
		  	data : options
		  });  
		  break;
		
		case "init_rzr":

		  var options = {
			  description: data.details.payment_description,
			  //image: 'https://i.imgur.com/3g7nmJC.png',
			  currency: data.details.currency_code ,
			  key:  data.details.provider_credentials.key_id ,
			  //order_id: data.details.order_id,
			  amount: data.details.total_amount_by_100 ,
			  name: data.details.merchant_name,
			  prefill: {
			    email: data.details.client_info.email_address ,
			    contact: data.details.client_info.contact_phone  ,
			    name: data.details.client_info.first_name + " " + data.details.client_info.last_name
			  },
			  theme: {
			    color: '#F37254'
			  }
		};
		
		//alert(JSON.stringify(options));  
									
		if ( krms_config.debug ){
			 processAjax('razorPaymentSuccessfull','payment_id=pay_debug_1234566&order_id='+ data.details.order_id );
		} else {
			try {
				RazorpayCheckout.on('payment.success', function(success){
					//alert('payment_id: ' + success.razorpay_payment_id);
				    //var orderId = success.razorpay_order_id;
				    /*var signature = success.razorpay_signature;
				    alert('orderId: ' + orderId);*/
				    processAjax('razorPaymentSuccessfull','payment_id='+success.razorpay_payment_id+'&order_id='+ data.details.order_id );
				});
				
				RazorpayCheckout.on('payment.cancel', function(error){
					/*if(error.code!=2 || error.code!=0){					
					   showAlert(error.description + ' (Error '+error.code+')');
					}*/				
					if(error.code==0 || error.code=="0"){
						// do nothing
					} else {
						showAlert( t(error.description) + "("+ t("Error code") + error.code  +")" );
					}
				});
				RazorpayCheckout.open(options);			
		   } catch(err) {
              showAlert(err.message);
           } 
		}		
		break;			
		
		case "init_webview":
		  setStorage("global_receipt_order_id", data.details.order_id );   
		  setStorage("global_receipt_amount_pay", data.details.total_amount );   
		  setStorage("global_receipt_message", data.msg );   
		  		  
		  payWebview( data.details.redirect_url);	
		break;
		
		case "init_atz":		  
		  onsenNavigator.pushPage('authorize_form.html',{
			  	animation : "slide",
			  	data : {
			  		order_id : data.details.order_id,
			  		total_amount : data.details.total_amount
			  	}
		  });  
		break;
				
		default:
		  showAlert( t("The payment method that you choose is not available in mobileapp") );
		break;
	}
};


logout = function(){
	
	ons.platform.select('ios'); 
	ons.notification.confirm( t("Are you sure?") ,{
		title: dialog_title,
		id : "dialog_cancel_order",
		buttonLabels : [ t("Ok"), t("Cancel") ]
	}).then(function(input) {
		if (input==0){				
						
			
			if(!isdebug()){
				social_strategy = getStorage("social_strategy");
				if(!empty(social_strategy)){
					switch (social_strategy){
						case "google_mobile":
						   window.plugins.googleplus.logout(
							    function (msg) {
							      removeStorage("social_strategy");						      
							    }
							);
						break;
						
						case "fb_mobile":
						   fbLogout();
						break;
					}
				}
			}
			
			processDynamicAjax('logout','');
			removeStorage("user_token");			
			resetToPage('tabbar.html','none');
		}
	});
	
};

Pagelogin = function(action){
	switch(action){
		case 1:
		   setStorage("next_step",'show_home_page');
		break;
	}
	showPage("login.html");
};

nextStep = function(next_step){
	dump("nextStep=>"+next_step);
	switch (next_step)
	{
		case "payment_option":
		  if (isOrderVerificationEnabled()){
		  	  replacePage('order_verification.html');
		  } else {
		      replacePage('payment_option.html');
		  }
		break;
		
		case "show_home_page":
		  resetToPage('tabbar.html','none');
		break;
		
		case "merchant_menu":		  
		  processDynamicAjax('verifyCustomerToken','','dummy',"GET",1);		  		  
		  popPage();		  
		  merchant_id = $("#restaurant_page .merchant_id").val();
		  processAjax('getRestaurantInfo', 'merchant_id='+merchant_id, 'GET', 'skeleton1');
		break;
	}
};

skip = function(page_id){
		
	if(isLocation()){		
		if ( location_res = getLocationData() ){			
			resetToPage('tabbar.html','none');
		} else {
			showPage("select_location.html");
		}		
	} else {
		if ( lat_res = getCurrentLocation()){		
		    resetToPage('tabbar.html','none',{
		    	 lat : lat_res.lat,
		  	   	 lng : lat_res.lng,
		    });
		} else {
			showPage(page_id);
		}	
	}
	
};

setAddressBook = function(){
	$(".frm_address_form_select").validate({
   	    submitHandler: function(form) {   	
   	    	
   	    	setStorage("customer_number", $(".contact_phone").val() );
   	    	
   	    	var params = $( ".frm_address_form_select").serialize();
   	    	params+= "&merchant_id=" + getActiveMerchantID();
   	    	processAjax('setAddressBook', params ); 
		}
   	});
	$(".frm_address_form_select").submit();
};

initRaty = function(score){
	$('.raty-stars-editable').raty({ 
	   score:score,
	   readOnly: false, 		
	   path: 'lib/raty/images',
	   click: function (score, evt) {	   	   
	   	   $(".rating").val( score );
	   }
   }); 	
};

initRatyStatic = function(){
	$('.raty-stars').raty({ 
		readOnly: true, 
		score: function() {
             return $(this).attr('data-score');
       },
		path: 'lib/raty/images'
    });
};

setClickTab = function(pagename, index){
	//alert(pagename+"=>"+index);
	setStorage("click_tab", index);
	showPage(pagename);
};

actionSheetOrder = function(order_id, add_review, add_cancel, add_track){
	if(order_id<=0){
		showToast( t("invalid order id") );
		return false;
	}	
		
	actions = [];
	
	actions[0] = {
		 label: t("View Order"),
	};
	actions[1] = {
		 label: t("Re-Order"),
	};
	
	if(add_review){
		actions[2] = {
			 label: t("Add Review"),
		};
	}
	
	if(add_cancel){
		actions[3] = {
			 label: t("Cancel Order"),
		};
	}
	
	if(add_track){
		actions[4] = {
			 label: t("Track Order"),
		};	
	}
	
	actions[5] = {
		 label: t("Close"),
		 icon: 'md-close'
	};
	
	//delete actions[ 2 ];
		
	ons.openActionSheet({
	    title: t("What do you want to do") + "?",
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	   console.log('index: ', index) 
  	   switch(index){
  	   	  case 0: // view receipt
  	   	    showPage('view_order.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  case 1:
  	   	    processAjax( "ReOrder" , "order_id="+ order_id );
  	   	  break
  	   	  
  	   	  case 2:
  	   	   showPage('add_review.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  case 3:  	   	    
  	   	    /*ons.platform.select('ios');  	   	     
  	   	    ons.notification.confirm( t("Are you sure you want to cancel this order?"),{
				title: t("Cancel this order?") ,		
				id : "dialog_cancel_order",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "CancelOrder" , "order_id="+ order_id );
				}
		   });
		   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");*/
  	   	    
  	   	    showPage('cancel_order_form.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
			   
  	   	  break
  	   	  
  	   	  case 4:
  	   	    showPage('track_history.html','none',{
  	   	   	 "order_id": order_id
  	   	   });
  	   	  break
  	   	  
  	   	  default:
  	   	  break
  	   }
  });
	
};

actionSheetFavorites = function(id, merchant_id){
	
	actions = [];
		
	actions[0] = {
		 label: t("Remove From Favorites"),
	};	
	
	actions[1] = {
		 label: t("View Menu"),
	};	
	
	actions[3] = {
		 label: t("Cancel"),
		 icon: 'md-close'
	};
	
	ons.openActionSheet({
	    title: t("What do you want to do") + "?",
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	   console.log('index: ', index) 
  	   if (index==0){  	   	
  	   	   removeFavorite(id);  	   	
  	   } else if( index==1){  	   	  
  	   	  loadMerchant(merchant_id);
  	   }
  });
};

actionSheetCards = function(id){	
	actions = [];	
	actions[1] = {
		 label: t("Edit"),
	};	
	actions[2] = {
		 label: t("Remove"),
	};	
	actions[3] = {
		 label: t("Cancel"),
		 icon: 'md-close'
	};
	
	ons.openActionSheet({
	    title: t("What do you want to do") + "?",
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	 console.log('index: ', index) 
  	 switch(index){
  	 	case 1:
  	 	  showPage("creditcard_add.html",'slide',{
  	 	  	cc_id : id
  	 	  });
  	 	break;
  	 	
  	 	case 2:
  	 	    ons.platform.select('ios'); 	
			ons.notification.confirm( t("Are you sure?"),{
				title: t("Delete credit card") ,		
				id : "dialog_cancel_order",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "DeleteCreditCard" , "id="+ id );
				}
		   });
		   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");  
  	 	break;
  	 }
  });
};

actionSheetBook = function(id){
	actions = [];	
	actions[1] = {
		 label: t("Edit"),
	};	
	actions[2] = {
		 label: t("Remove"),
	};	
	actions[3] = {
		 label: t("Cancel"),
		 icon: 'md-close'
	};
	
	ons.openActionSheet({
	    title: t("What do you want to do") + "?",
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	   console.log('index: ', index) 
  	   switch(index)
  	   {
  	   	 case 1:
  	   	    if(isLocation()){
  	   	    	showPage("address_book_location.html","none",{
	  	   	    	id:id
	  	   	    });
  	   	    } else {
	  	   	    showPage("address_book.html","none",{
	  	   	    	id:id
	  	   	    });
  	   	    }
  	   	 break;
  	   	 
  	   	 case 2:
  	   	    ons.platform.select('ios'); 	
			ons.notification.confirm( t("Are you sure?"),{
				title: t("Delete this address") ,		
				id : "dialog_cancel_order",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "DeleteAddressBook" , "id="+ id );
				}
		   });
		   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");  
  	   	 break;
  	   }
  });
};

hideDialog = function(element){
	 dialog = document.getElementById(element);
	 dialog.hide();
};

ViewOrder = function(order_id){	
	showPage('view_order.html','none',{
	   "order_id": order_id
	});
};

removeFavorite = function(id){
	ons.platform.select('ios'); 
	
	ons.notification.confirm( t("Are you sure?"),{
		title: t("Remove this restaurant?") ,		
		id : "dialog_cancel_order",
		modifier: " ",			
		buttonLabels : [ t("Yes") , t("Cancel") ]
	}).then(function(input) {				
		if (input==0){
			processAjax( "RemoveFavorites" , "id="+ id );
		}
   });
   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");  
};


var generateMonth = function(){
	var x;
	html='<ons-select name="expiration_month" id="expiration_month" class="expiration_month full_width" >';
	for (x = 1; x < 13; x++) {
	    month = str_pad(x,2,"0",'STR_PAD_LEFT');	   
	    html+='<option value="'+ month + '">'+ month +'</option>';
	} 
	html+='</ons-select>';	
	$(".expiration_month_wrap").html( html );
};

var generateYear = function(){
	var x;
	var d = new Date();
    var n = d.getFullYear();
	html='<ons-select name="expiration_yr" id="expiration_yr" class="expiration_yr full_width" >';
	for (x = 0; x < 13; x++) {
	    year = n+x;
	    html+='<option value="'+ year + '">'+ year +'</option>';
	} 
	html+='</ons-select>';	
	$(".expiration_yr_wrap").html( html );
};

function str_pad (input, pad_length, pad_string, pad_type) {
    var half = '',
    pad_to_go;

    var str_pad_repeater = function (s, len) {
    var collect = '',
      i;

    while (collect.length < len) {
      collect += s;
    }
    collect = collect.substr(0, len);

    return collect;
  };

  input += '';
  pad_string = pad_string !== undefined ? pad_string : ' ';

  if (pad_type != 'STR_PAD_LEFT' && pad_type != 'STR_PAD_RIGHT' && pad_type != 'STR_PAD_BOTH') {
    pad_type = 'STR_PAD_RIGHT';
  }
  if ((pad_to_go = pad_length - input.length) > 0) {
    if (pad_type == 'STR_PAD_LEFT') {
      input = str_pad_repeater(pad_string, pad_to_go) + input;
    } else if (pad_type == 'STR_PAD_RIGHT') {
      input = input + str_pad_repeater(pad_string, pad_to_go);
    } else if (pad_type == 'STR_PAD_BOTH') {
      half = str_pad_repeater(pad_string, Math.ceil(pad_to_go / 2));
      input = half + input + half;
      input = input.substr(0, pad_length);
    }
  }
  return input;
}

function CreditCardFormat(value) {
  var v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
  var matches = v.match(/\d{4,16}/g);
  var match = matches && matches[0] || ''
  var parts = []
  for (i=0, len=match.length; i<len; i+=4) {
    parts.push(match.substring(i, i+4))
  }
  if (parts.length) {
    return parts.join(' ')
  } else {
    return value
  }
}

setValue = function(element, value){
	$(element).val(value);
};

browseCamera = function(){
	if(isdebug()){
		showToast( t("upload will work on actual device") );
		loaded = 0;	 percent=0; 
		$("#save_profile_button").attr("disabled",true);		
		$("#edit_profile ons-fab").attr("disabled",true);
		$(".progress_wrapper ons-progress-bar").show();
				
		$("#edit_profile ons-back-button").attr("disabled",true);		
		
		document.querySelector('ons-progress-bar').setAttribute('value', 0);	    
		test_loader = setInterval(function(){ 
	       loaded++;
	       percent = loaded*10;
	       dump(percent);	       
	       document.querySelector('ons-progress-bar').setAttribute('value', percent);
	       if(percent>=100){
	       	  clearInterval(test_loader);
	       	  dump("stop");
	       	  $(".progress_wrapper ons-progress-bar").hide();
	       	  $("#save_profile_button").attr("disabled",false);	    
	       	  $("#edit_profile ons-fab").attr("disabled",false);   	  	       	
	       	  
	       	  $("#edit_profile img.small_avatar").parent().removeClass("loaded");
	       	  $("#edit_profile img.small_avatar").parent().addClass("is-loading xsmall-loader");
	       	  $("#edit_profile img.small_avatar").attr("src", "https://picsum.photos/450/304/?random" );
	       	  imageLoaded();	       	  
	       }	       
	    }, 1000);
		return;
	}
	
	try {		
		navigator.camera.getPicture(uploadPhoto, function(){
			//
		},{
		    destinationType: Camera.DestinationType.FILE_URI,
		    sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
		    popoverOptions: new CameraPopoverOptions(300, 300, 100, 100, Camera.PopoverArrowDirection.ARROW_ANY)
	    });
		
    } catch(err) {
       alert(err.message);       
    } 
};

uploadPhoto = function(imageURI){	
	try {
					 
		 $(".progress_wrapper ons-progress-bar").show();
	     $("#save_profile_button").attr("disabled",true);	  
	     $("#edit_profile ons-fab").attr("disabled",true);     
		 
		 document.querySelector('ons-progress-bar').setAttribute('value', 0);
		 
		 var options = new FileUploadOptions();
		 options.fileKey = "file";
		 options.fileName = imageURI.substr(imageURI.lastIndexOf('/') + 1);
		 options.mimeType = "image/jpeg";
		 	 
		 var params = {};
		 
		 params.user_token = getStorage("user_token") ;	 
		 if(!empty(krms_config.ApiKey)){
		    params.api_key = krms_config.ApiKey;
		 }
		 params.lang = getLanguageCode();
		 		 		 
		 options.params = params;
	 
		 options.chunkedMode = false;	
		 
		 var headers={'headerParam':'headerValue'};
		 options.headers = headers;
		
		 var ft = new FileTransfer();	 	 	 
		 
		 ft.onprogress = function(progressEvent) {
	     if (progressEvent.lengthComputable) {	     	    
	     	    var loaded_bytes= parseInt(progressEvent.loaded);
	     	    var total_bytes= parseInt(progressEvent.total);
	     	    
	     	    var loaded_percent = (loaded_bytes/total_bytes)*100;	        
	     	    loaded_percent=Math.ceil(loaded_percent);
	     	    	       	        		        
		        document.querySelector('ons-progress-bar').setAttribute('value', loaded_percent);
		        
		    } else {	    		    	
		        //loadingStatus.increment();
		    }
		 };
		 	 
		 ft.upload(imageURI, ajax_url+"/UploadProfile", function(result){
		     //alert(JSON.stringify(result));		     
		    
		     setTimeout(function(){				
				$(".progress_wrapper ons-progress-bar").hide();
	       	    $("#save_profile_button").attr("disabled",false);	
	       	    $("#edit_profile ons-fab").attr("disabled",false);
			 }, 2000);
			 			
			if( result.responseCode=="200" || result.responseCode==200 ){
		    
			    var response=explode("|",result.response);		
			    /*alert(JSON.stringify(response));*/
			    showToast(response[1]);
			    			    			    
			    if ( response[0]=="1" || response[0]==1){			    	
			    	
			    	$("#edit_profile img.small_avatar").parent().removeClass("loaded");
	       	        $("#edit_profile img.small_avatar").parent().addClass("is-loading xsmall-loader");
			    	$("#edit_profile img.small_avatar").attr("src", response[2] );			    				    
	       	        imageLoaded();			    	
			    	setStorage("profile_avatar", response[2] );			    	
			    }
		   
			} else {
				showToast( t("upload error :") + result.responseCode);
			}
		    
		 }, function(error){	 	
		 	 $(".progress_wrapper ons-progress-bar").hide();
	       	  $("#save_profile_button").attr("disabled",false);	 
	       	  $("#edit_profile ons-fab").attr("disabled",false);
		     showToast( t("An error has occurred: Code") + " "+ error.code);
		 }, options);
	 
	 } catch(err) {
	 	$(".progress_wrapper ons-progress-bar").hide();
	    $("#save_profile_button").attr("disabled",false);	
	    $("#edit_profile ons-fab").attr("disabled",false);
        alert(err.message);       
     } 
};

explode = function(sep,string)
{
	var res=string.split(sep);
	return res;
}


ChangeTimeList = function(){
	merchant_id = getActiveMerchantID();
    params = "merchant_id="+ merchant_id;
    params +="&date="+ $(".date_booking").val();
    processDynamicAjax("GetMerchantTimeList", params, 'time_select_wrap', 'GET', 1 );
};

pointsDetails = function(point_type){
	showPage("points_details.html",'slide',{
		point_type:point_type
	});
};

showLocationDetails = function(display){
	if(display){
		$(".search_wrap1").hide();
		$(".search_wrap2").show();
	} else {
		$(".search_wrap1").show();
		$(".search_wrap2").hide();
	}
};

identifyLocation = function(){
	lat = $(".lat").val();
	lng = $(".lng").val();	 
	identifyLocationLoader(true);
	GeocodeLat( lat, lng ) 	;
};

identifyLocationLoader = function(loading) {
	if(loading){
		$(".print_location_address").html( t("identtifying location") + '<ons-progress-bar indeterminate></ons-progress-bar>' );
		$("#confirm_location").attr("disabled",true); 
		$("#location_add_details").attr("disabled",true); 
	} else {
		$(".print_location_address").html('');
		$("#confirm_location").attr("disabled",false); 
		$("#location_add_details").attr("disabled",false); 
		$("#location_change").attr("disabled",false); 
	}
};

DragLocationLoader = function(loading){	
	if(loading){
		$("#confirm_location").attr("disabled",true); 
		$("#location_add_details").attr("disabled",true); 
		$("#location_change").attr("disabled",true); 
	} else {
		$("#confirm_location").attr("disabled",false); 
		$("#location_add_details").attr("disabled",false); 
		$("#location_change").attr("disabled",false); 
	}
};

CurrentLocation = function(){
	//map_marker = [];
	map_bounds = [];
	$(".identify_location_wrap").hide();
	locateLocation();
};

ReCurrentLocation = function(){
	popPage();	
	setTimeout(function() {		
       CurrentLocation();
    }, 100); 
};

setRecentSearch = function(address, lat, lng, street, city,  state, zipcode, location_name){
	
	if(empty(lat)){
		showToast( t('invalid latitude') );
		return false;
	}
	if(empty(lng)){
		showToast( t('invalid longitude') );
		return false;
	}
	
	popPage();	
	setTimeout(function() {		
       $(".print_location_address").html( address );
	   $(".recent_search_address").val( address );
	   
	   map_setLangLngValue( lat , lng );
	   map_setCenter( lat , lng );
	   map_moveMarker( 1, lat ,  lng );
	   
	   current_page_id = onsenNavigator.topPage.id;
	   dump("current_page_id=>"+current_page_id);
	   
	   if(!empty(street)){
	   	  $(".street").val(street);
	   }
	   if(!empty(city)){
	   	  $(".city").val(city);
	   }
	   if(!empty(state)){
	   	  $(".state").val(state);
	   }
	   if(!empty(zipcode)){
	   	  $(".zipcode").val(zipcode);
	   }
	   if(!empty(location_name)){
	   	  $(".location_name").val(location_name);
	   }
	   
    }, 100); 
};

ReSelectLocation = function(){
	hideTooltip('.tooltip_home');
	
	if(isLocation()){
		showPage("select_location.html");
		return;
	}
			
	current_latlng = getCurrentLocation();
   	if(!empty(current_latlng)){   	    	
   		showPage("map_select_location.html",'none',{
   			lat : current_latlng.lat,
   			lng : current_latlng.lng
   		});
   	} else {
   		showPage("map_select_location.html",'none');
   	}
};

AddFavorite = function(){
	if(isLogin()){ 
	   merchant_id = getActiveMerchantID();
	   params = "merchant_id="+ merchant_id;
	   processAjax('AddFavorite',params);
	} else {
	   setStorage("next_step",'merchant_menu');
	   showPage('login.html');
	}
};

favoriteButton = function(is_added){
	html='';
	if(is_added){
	   html+='<ons-toolbar-button onclick="AddFavorite()" modifier="to_text_orange">';
          html+='<ons-icon icon="ion-android-favorite"  size="22px"></ons-icon>';
       html+='</ons-toolbar-button>';
	} else {
		html+='<ons-toolbar-button onclick="AddFavorite()" >';
          html+='<ons-icon icon="ion-android-favorite-outline"  size="22px"></ons-icon>';
       html+='</ons-toolbar-button>';
	}
	return html;
}

loadMerchantWithFood = function(merchant_id, item_id, cat_id){
	dump("merchant_id=>"+ merchant_id);
	dump("item_id=>"+ item_id);
	dump("cat_id=>"+ cat_id);	
    replacePage('restaurant_page.html','slide',{
   	   'merchant_id': merchant_id,
   	   'item_id': item_id,
   	   'cat_id' : cat_id
    });
};

showSearchForm = function(search_string){
	showPage("search_form.html",'none',{
		'search_string':search_string
	});
};


loadTabbar = function(next_step){
	dump("tabbar =>"+ next_step);
	switch (next_step){
		case "map_select_location":
		case "show_home_page":		   
		   showHomeOrSelect();
		  /*if(isLocation()){		  	  
		  	  showHomeOrSelect();
		  } else {		 
			  if ( lat_res = getCurrentLocation()){
			  	   if(tabbar_loaded){		  
			  	   	   dump('bringPageTopx');		  	   	   
			  	   	   resetToPage('tabbar.html','none');
			  	   } else {
			  	   	   onsenNavigator.resetToPage("tabbar.html",{
					  	   animation : "slide" ,  	
					  	   data : {
					  	   	  lat : lat_res.lat ,
					  	   	  lng : lat_res.lng ,
					  	   	  location_address : lat_res.recent_search_address
					  	   }
					   });	  
			  	   }
			  } else {
			  	  resetToPage( "map_select_location.html" );
			  }
		  }*/
		break;
		
		case "payment_option":
		  if (isOrderVerificationEnabled()){
		  	 showPage('order_verification.html');
		  } else {
		     //showPage('payment_option.html');
		     replacePage('payment_option.html');
		  }
		break;
		
		case "merchant_menu":
		  processDynamicAjax('verifyCustomerToken','','dummy',"GET",1);		  		  
		  popPage();		  
		  merchant_id = $("#restaurant_page .merchant_id").val();
		  processAjax('getRestaurantInfo', 'merchant_id='+merchant_id, 'GET', 'skeleton1');		  
		break;
				
		default:
		  //resetToPage( "map_select_location.html" );
		  //showSelectLocation();
		  showHomeOrSelect();
		break;
	}
};

sendOrderSMSCode = function(){	
    merchant_id = getActiveMerchantID();
	params = "merchant_id="+ merchant_id;
	processAjax("sendOrderSMSCode",params,"GET");	
};


redeemPoints = function(){
	redeem_points = $(".redeem_points").val();
	if(!empty(redeem_points)){
		merchant_id = getActiveMerchantID();   
		params = "points="+redeem_points;		
   	    params+= "&merchant_id="+ merchant_id;
   	    params+= "&transaction_type=" + $(".transaction_type").val();
		processAjax("applyRedeemPoints", params  );
	} else {
		showToast( t("Please enter points") );
	}
};

removePoints = function(){
	processAjax("removePoints", '' );
};

applyVoucher = function(){
	params = 'voucher_name=' + $(".voucher_name").val();
	merchant_id = getActiveMerchantID();   
	params+= "&merchant_id="+ merchant_id;
	params+= "&transaction_type=" + $(".transaction_type").val();
	processAjax('applyVoucher', params );
};

removeVoucher = function(){
	processAjax('removeVoucher', '' );
};

applyTips = function(){
	params = 'tips=' + $(".tips").val();
	merchant_id = getActiveMerchantID();   
	params+= "&merchant_id="+ merchant_id;
	params+= "&transaction_type=" + $(".transaction_type").val();
	processAjax('applyTips', params );
};

removeTip = function(){
	processAjax('removeTip', '' );
};

browseLink = function(url){
	if(!empty(url)){
		if ( !krms_config.debug ){
		   browse_inapp = cordova.InAppBrowser.open( url  , '_blank', 'location=no' ); 	
		} else {
			window.open(url);
		}
	}
};

payWebview = function(url){
	if ( !krms_config.debug ){
		 inapp = cordova.InAppBrowser.open( url  , '_blank', 'location=no' ); 		 
		 inapp.addEventListener('loadstop', function(event){
		 	 url = event.url;
		 	 var res = url.match(/success/gi);
		 	 if(!empty(res)){
		 	   inapp.executeScript({
			      code: "document.documentElement.innerText"
			   }, function(html) {			   	  
			   	  inapp.close();
			   	  
			      setTimeout(function(){ 			      				   	
				   	   
			      	var options = { 
					  "order_id" : getStorage("global_receipt_order_id") ,
					  "total_amount" : getStorage("global_receipt_amount_pay") ,
					  'message': getStorage("global_receipt_message")
					};	
					onsenNavigator.pushPage('receipt.html',{
					  	animation : "slide",
					  	data : options
					});  
				   	
				   }, 1);			   	  			   	  
			   	  
			   });
		 	 }
		 	 
		 	 var error = url.match(/error/gi);
		 	 if(!empty(error)){
		 	   inapp.executeScript({
			      code: "document.documentElement.innerText"
			   }, function(html) {
			   	  inapp.close();
			      showAlert(html);
			   });
		 	 }
		 	 
		 	 var cancel = url.match(/cancel/gi);
		 	 if(!empty(cancel)){
		 	 	inapp.close();
		 	 }
		 	 
		 });
	} else {
	    window.open(url);
	}	
};

checkSelectedCreditCard = function(){
	selected = $('#select_creditcards input[name=cc_id]:checked').val();			
	if(empty(selected)){
		showToast( t("Please select your credit card or add your new credit card") );
	} else {
		payNow();
	}
};

setSelectedCards = function(){
	selected = $('#select_payondelivery input[name=card_id]:checked').val();	
	if(empty(selected)){
		showToast( t("Please select card on the list") );
	} else {
		payNow("&selected_card="+selected);
	}
};

EnabledPush = function(){
	var enabled_push = $("input[name=enabled_push]:checked").val();
	if(empty(enabled_push)){
		enabled_push='';
	}	
	processAjax('savePushSettings', "enabled_push="+enabled_push );
};

enabledSocialLogin = function(){
	var list = document.getElementById("login_list");
	html='';
	   
	app_settings = getAppSettings();
	if(app_settings){
	   enabled_fb = app_settings.mobile2_enabled_fblogin;
	   enabled_google = app_settings.mobile2_enabled_googlogin;
	   
	   if(enabled_fb==1 && enabled_google==1){
	   	
	   	    html+='<ons-list-item modifier="nodivider pad_right social_list">';
		   	  
		   	  html+='<div class="center_line"><h6>'+ t("Or") +'</h6></div>';
		   	  
		       html+='<ons-row>';
		       		       
		          html+='<ons-col width="50%" style="text-align:center;">';		          
		          html+='<ons-button modifier="blue_button no_shadow" onclick="fbLogin();" >';
			        html+='<div class="table">';
			          html+='<div class="col" style="width:15%;"><ons-icon icon="fa-facebook-square" size="23px"></ons-icon></div>';
			          html+='<div class="col">' + t("Facebook") +'</div>';
			        html+='</div>';
			      html+='</ons-button>';		         
		          html+='</ons-col>';          
		          
		          html+='<ons-col style="text-align:center;">';		          
		           html+='<ons-button modifier="darker_orange_button no_shadow" onclick="GLogin();" >';
			        html+='<div class="table">';
			          html+='<div class="col" style="width:15%;"><ons-icon icon="fa-google-plus-g" size="23px"></ons-icon></div>';
			          html+='<div class="col">'+  t("Google+") +'</div>';
			        html+='</div>';
			      html+='</ons-button>';		          
		          html+='</ons-col>';		          
		          
		       html+='</ons-row>';
		    html+='</ons-list-item>';  
	   	
	    } else if(enabled_fb==1){
	   	  html+='<ons-list-item modifier="nodivider pad_right social_list">';
	   	  html+='<div class="center_line"><h6>'+ t("Or") +'</h6></div>';
	   	  
	   	  html+='<ons-row>';
	   	  html+='<ons-col style="text-align:center;">';		          
          html+='<ons-button modifier="blue_button no_shadow" style="width:100%;" onclick="fbLogin();" >';
	        html+='<div class="table auto">';
	          html+='<div class="col" style="width:15%;"><ons-icon icon="fa-facebook-square" size="23px"></ons-icon></div>';
	          html+='<div class="col">' + t("Facebook") +'</div>';
	        html+='</div>';
	      html+='</ons-button>';		         
          html+='</ons-col>'; 
		  html+='</ons-row>';
	   	  
	   	  html+='</ons-list-item>';
	   	  
	   } else if(enabled_google==1){
	      html+='<ons-list-item modifier="nodivider pad_right social_list">';
	   	  html+='<div class="center_line"><h6>'+ t("Or") +'</h6></div>';
	   	  
	   	  html+='<ons-row>';
   	         html+='<ons-col style="text-align:center;">';		          
	           html+='<ons-button modifier="darker_orange_button no_shadow" style="width:100%;" onclick="GLogin();" >';
		        html+='<div class="table auto google">';
		          html+='<div class="col" style="width:15%;"><ons-icon icon="fa-google-plus-g" size="23px"></ons-icon></div>';
		          html+='<div class="col">'+  t("Google+") +'</div>';
		        html+='</div>';
		      html+='</ons-button>';		          
	          html+='</ons-col>';	
	   	  html+='</ons-row>';
	   	  
	   	  html+='</ons-list-item>';
	   }
	   
	   var newItem = ons.createElement(html);
	   list.appendChild(newItem);
	   
	} /*end if*/
		
};

fbLogin = function(){
	
	if(isdebug()){
		
		params = "email_address=testfb@yahoo.com";
		params+= "&first_name=fb_name";
		params+= "&last_name=fb_lastname";
		params+= "&social_id=123";

		next_step = getStorage("next_step");
   	    dump("next_step=>"+ next_step);
   	    if(!empty(next_step)){
   	    	$(".next_step").val( next_step );   
   	    	params+="&next_step="+ next_step;
   	    } 				
		processAjax('registerUsingFb', params );		
		return;
	}

	try {
		
		facebookConnectPlugin.login(["public_profile","email"], function(data){
			//alert(JSON.stringify(data)); 		
			fbRegister( data.authResponse.userID );		 
		}, function(error){				
			if( !empty(error.errorCode) ){
			   switch(error.errorCode){
			   			   	
			   	  case "4201":
			   	  case 4201:
			   	   // silent		   	   
			   	  break;
			   	
			   	  default:
			   	  showAlert( t("an error has occured") + " "+ JSON.stringify(error) );  
			   	  break;
			   }		   
			}
		});
	
	} catch(err) {		
       alert(err.message);
    } 
};

fbRegister = function(userID){	
	facebookConnectPlugin.api(userID+"/?fields=id,email,first_name,last_name", ["public_profile","email"], 
	function(data){
		//alert(JSON.stringify(data)); 		
		params = "email_address="+ data.email ;
		params+= "&first_name="+ data.first_name ;
		params+= "&last_name="+ data.last_name ;
		params+= "&social_id="+ data.id ;

		next_step = getStorage("next_step");
   	    dump("next_step=>"+ next_step);
   	    if(!empty(next_step)){
   	    	$(".next_step").val( next_step );
   	    	params+="&next_step="+ next_step;
   	    } 
				
		processAjax('registerUsingFb', params );
		
	}, function(error){
		showAlert( t("an error has occured") + " "+ JSON.stringify(error) );
	});
};

fbLogout = function(){		
	try{
		facebookConnectPlugin.getLoginStatus(function(status){
			//alert(JSON.stringify(status)); 
			if (status.status=="connected"){			
				facebookConnectPlugin.logout(function(success){
					//alert(JSON.stringify(success)); 
				}, function(error){				
				});
			} 
		}, function(error){	   	
		});
			
	} catch(err) {
       //alert(err.message);
    } 
};

GLogin = function(){
	if(isdebug()){		
	   var params = "email_address=test@google.com";
	   params+="&social_id=456";
	   params+="&first_name=test name";
	   params+="&last_name=test lastname";
	   params+="&imageurl=";
	   
	   next_step = getStorage("next_step");
   	   dump("next_step=>"+ next_step);
   	   if(!empty(next_step)){
   	       $(".next_step").val( next_step );
   	       params+="&next_step="+ next_step;
   	   } 		
	   
	   processAjax("googleLogin", params );
	   return;	
	}
	
	
	window.plugins.googleplus.login(
	    {      
	    },
	    function (obj) {
	    	// SUCCESS
	    	var params = "email_address=" + encodeURIComponent(obj.email);
			params+="&social_id=" + encodeURIComponent(obj.userId);			
			if(!empty(obj.givenName)){
			    params+="&first_name="+ encodeURIComponent(obj.givenName);
			} else {
				params+="&first_name="+ encodeURIComponent(obj.displayName);
			}
			params+="&last_name="+ encodeURIComponent(obj.familyName);
			
			//alert(JSON.stringify(obj));   			
			
			if(!empty(obj.imageUrl)){
			   params+="&imageurl="+ encodeURIComponent(obj.imageUrl);			
			}
			
			next_step = getStorage("next_step");
	   	    dump("next_step=>"+ next_step);
	   	    if(!empty(next_step)){
	   	    	$(".next_step").val( next_step );
	   	    	params+="&next_step="+ next_step;
	   	    } 		
				
			processAjax("googleLogin", params );	    	
	    },
	    function (msg) {
    	// FAILED
    	switch(msg){
    	   case "10":	
    	   case 10:
    	   case "16":	
    	   case 16:
    	     showAlert( t("error has occured. android keystore not valid") + " "+ t("error code:") + msg );
    	   break;
    	   
    	   case "12501":
    	   case 12501:
    	   case "The user canceled the sign-in flow":
    	   case "The user canceled the sign-in flow.":
    	     // silent
    	   break;
    	   	
    	   default:   
    	     showAlert( t("error has occured. error number") + ":" + msg );
    	   break;	
    	}	    	
    });
};

showTrackOrder = function(){
	order_id = $(".receipt_order_id").val();
	showPage('track_history.html','none',{
	   	   	 "order_id": order_id
	   	  });							   
};

clear_RecentLocation = function(){
	processAjax("clearRecentLocation", ''  );
};

FullImageView = function(url){
	if(!empty(url)){
		if(isdebug()){		  
			window.open( url );
		} else {			
			PhotoViewer.show( url , '');
		}
	} else {
		showToast( t("invalid image url") );
	}
};

loadCustomPage = function(page_id){
	showPage("custom_page.html",'slide',{
		"page_id":page_id
	})
};

clear_RecentSearches = function(){
	processAjax("clearRecentSearches", ''  );
};

showDriverInfo = function(driver_id){	
	showPage("driver_info.html",'none',{
		"driver_id":driver_id
	})
};

runTrack = function(){
	//10000
   dump("runTrack" + track_interval_timeout);
   setTimeout(function() {				     
 	 track_interval = setInterval(function(){TrackDriver()}, track_interval_timeout );	
   }, 400); 
				  
};

TrackDriver = function(){	
	params = "driver_id=" + $(".track_driver_id").val()  ;
	params+= "&track_order_id=" + $(".track_order_id").val();
	processDynamicAjax('TrackDriver',params,'track_loader','GET','1');
};

stopTrack = function(){
	dump("stopTrack");
	clearInterval(track_interval);
};

showModalNotification = function(show) {	
	var modal = document.querySelector('#modal_notification');
	if(show){
	  modal.show();
	} else {
	  modal.hide();
	}		  
};

imageLoaded = function(parent_class){

	//return;
	
	setTimeout(function() {		
		 		 		        
		loaded_class = 'loaded';
		if(!empty(parent_class)){
			loaded_class = parent_class+' loaded';
		}		
		
		$('.image_loaded').imagesLoaded()
		.always( function( instance ) {
		   //console.log('all images loaded');
		})
		.done( function( instance ) {
		   //console.log('all images successfully loaded');
		})
		.fail( function() {
		   //console.log('all images loaded, at least one is broken');
		})
		.progress( function( instance, image ) {
		var result = image.isLoaded ? 'loaded' : 'broken';
		   //console.log( 'image is ' + result + ' for ' + image.img.src );
		   //dump(image);
		   //image.img.className = image.isLoaded ? 'loaded' : 'is-broken';
		   image.img.parentNode.className = image.isLoaded ? loaded_class : 'is-broken';
		});
  
	}, 100); 
};

clearSetDeliveryDate = function(){
	removeStorage("delivery_date_set");
	removeStorage("delivery_date_set_pretty");	
	removeStorage("delivery_time_set");	
};

showNoConnection = function(show){
		
	d = document.getElementById('dialog_no_connection');   
	if(d){
	   if(show){
	     d.show();
	   } else {
	   	 d.hide();
	   }
	} else {
	   if(show){
		   ons.createElement('dialog_no_connection.html', { append: true }).then(function(dialog) {       	
	        dialog.show();
	       });
	   } 
	}
};

AnalyticsEnabled = function(){
	if(app_settings = getAppSettings()){
		if(app_settings.mobile2_analytics_enabled==1 && !empty(app_settings.mobile2_analytics_id)){
			return true;
		}
	}
	return false;
}

AnalyticsSet = function(){
	
	if(isdebug()){
		return false;
	}
	
	try {
		
		if(app_settings = getAppSettings()){
			enabled  = AnalyticsEnabled();
			if(enabled){
				analytics = navigator.analytics;
				analytics.setTrackingId( app_settings.mobile2_analytics_id );
			}
		}
	
	} catch(err) {
	   showToast(err.message);       
	} 
	
};

AnalyticsTrack = function(pagename){
		
	if(isdebug()){
		return false;
	}
	
	enabled  = AnalyticsEnabled();
	if(enabled){
	   try {   	
	      analytics.sendAppView(pagename, function(){
	      	 //alert("analytic ok");
	      }, function(){
	      	 //alert("analytic failed");
	      });		
	   } catch(err) {
	      dump(err.message);       
	   } 
	}
};


getShareOptions = function(){
	 settings = getStorage("share_options");
	 if(!empty(settings)){
	    settings = JSON.parse( settings );	 
	    return settings;
	 }
	 return false;
};

socialShare = function(share_type){
	
	message = ''; url=''; subject=''; files_share='';
	
	switch(share_type){
		case "merchant":		  
		  if (settings = getShareOptions() ){		  	  
		  	  message = settings.message;
		  	  url = settings.url;
		  	  subject = settings.subject;
		  	  files_share = settings.files;
		  }		  
		  		  		  		
		  if(isdebug()){
		  	 showToast( t("share will not work in debug mode") );	
		  } else {
		  	
		  	 try {		  	
			  	 options = {
				  	message : message ,
				  	subject : subject ,
				  	url : url,
				  	//files : files_share
				 };						 				
				 //alert(JSON.stringify(options)); 				 				 	 
			  	 window.plugins.socialsharing.shareWithOptions(options, function(result){
			  	 	//alert(JSON.stringify(result));  	
			  	 	//alert(result.completed);
			  	 }, function(msg){
			  	 	 showAlert( t("Sharing failed with message") + " :" + msg  );
			  	 });		  	 
		  	 } catch(err) {
               showAlert(err.message);
             } 
		  	 
		  }
		break;
		
		default:
		  showToast( t("invalid share type") );	
		break;
	}
};

actionSheetNotification = function(id){
	actions = [];		
	actions[1] = {
		 label: t("Remove"),
	};	
	actions[2] = {
		 label: t("Cancel"),
		 icon: 'md-close'
	};
	ons.openActionSheet({
	    title: t("What do you want to do") + "?",
	    cancelable: true,
	    buttons: actions
  }).then(function (index) { 
  	 console.log('index: ', index) 
  	 switch(index){
  	 	case 1:
  	 	    	 	
  	 	   ons.platform.select('ios'); 	
			ons.notification.confirm( t("Are you sure?"),{
				title: t("Remove from notification list") ,		
				id : "dialog_remove_notification",
				modifier: " ",			
				buttonLabels : [ t("Yes") , t("Cancel") ]
			}).then(function(input) {				
				if (input==0){
					processAjax( "ReadNotification" , "id="+ id );
				}
		   });
		   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");  
  	 	
  	 	break;  	 	  	
  	 }
  });
};

markAllNotifications = function(){
	
	ons.platform.select('ios'); 	
	ons.notification.confirm( t("Are you sure?"),{
		title: t("Remove all notification") ,		
		id : "dialog_mark_all",
		modifier: " ",			
		buttonLabels : [ t("Yes") , t("Cancel") ]
	}).then(function(input) {				
		if (input==0){
			processAjax( "markAllNotifications" , '' );
		}
   });
   $(".alert-dialog-footer").removeClass("alert-dialog-footer--rowfooter");  
		      
};

OrderListTab = function(tab, index){		
	document.querySelector('#order_tabs').setActiveIndex(index);
	$("#order_tabs ons-carousel-item").removeClass("selected");
    $("#order_tabs ons-carousel-item:eq("+index+")").addClass("selected");    
				
	$("#order_list_item").html('');		
	$(".order_tab_active").val( tab );
	params = "tab="+ tab;
	processDynamicAjax('OrderList',params,'order_loader','GET',1 ); 
};

BookingListTab = function(tab, index){
	document.querySelector('#booking_tabs').setActiveIndex(index);
	$("#booking_tabs ons-carousel-item").removeClass("selected");
    $("#booking_tabs ons-carousel-item:eq("+index+")").addClass("selected");    
				
	$("#booking_history_item").html('');		
	$(".booking_tab_active").val( tab );
	params = "tab="+ tab;
	processDynamicAjax('BookingList',params,'booking_loader','GET',1 ); 
};

hideTooltip = function(element){
	$(element).webuiPopover('hide');	
	setStorage("tooltip_home",1);
};

ViewBookingDetails = function(booking_id){
	showPage("booking_details.html",'slide',{
		'booking_id': booking_id
	});
};



/*ADDED CODE FOR VERSION 1.2*/
retryNetConnection = function(is_show){
	current_page = document.querySelector('ons-navigator').topPage.id;	
	if(current_page=="page_settings"){
		if(is_show){
			$(".retry_connection").show();
		} else {
			$(".retry_connection").hide();
		}
	}
};

setStartupLanguage = function(lang_code){	
	
	if(!empty(lang_code)){
	   setStorage("client_set_lang", lang_code);
	   InitRTL(lang_code);
	}
	
	if(app_settings = getAppSettings()){
		is_login = app_settings.valid_token;
		lat = getStorage("location_lat");
        lng = getStorage("location_lng");
        
        if(is_login==1 && !empty(lat)){
         	onsenNavigator.resetToPage("tabbar.html",{
			   animation : "none" ,  	
			   data : {
				  lat : lat,
				  lng : lng,
			   }
			});
			
        } else if( is_login==1 && empty(lat) ){
            onsenNavigator.resetToPage('map_select_location.html',{
		      animation : "fade",		  	
	        });	
        } else {
        	startup = 1;			
			if(!empty(app_settings.startup)){
			    startup = app_settings.startup.options;
			}
						
			if(startup==2){
				onsenNavigator.resetToPage('page_startup2.html',{
				   animation : "fade",		  	
				 });
			 } else {     			    
				 onsenNavigator.resetToPage('page_startup.html',{
				   animation : "fade",		  	
				 });
			 }			
        }                        
	} else {
		onsenNavigator.resetToPage('map_select_location.html',{
		   animation : "fade",		  	
	    });	
	}
};

runTrackHistory = function(){
   dump("runTrackHistory" + track_interval_timeout);      
   setTimeout(function() {				     
 	 track_history_interval = setInterval(function(){ExecRunTrackHistory()}, track_interval_timeout );	
   }, 400); 
};

ExecRunTrackHistory = function(){
	
   	order_id = $(".track_order_id").val( );   	    
   	params = 'order_id='+ order_id + "&page_action=pull_refresh"; 
   	//showToast( t("Tracking...") );
   	$(".track_history_loader").html(icon_loader);
   	processDynamicAjax('getOrderHistory2',params , 'dummy','GET', true);	
};

stopTrackHistory = function(){
	$(".track_history_loader").html('');
	dump("stopTrackHistory");
	clearInterval(track_history_interval);
};

applyFilterItem = function(){
	cat_id = $("#item_page .cat_id").val();
	merchant_id = getActiveMerchantID();
	params = "merchant_id="+ merchant_id;
   	params+="&cat_id=" + cat_id ;
   	params+="&page_action=pull_refresh";
   	params+= "&"+$( ".frm_filter_item" ).serialize();    	
   	processAjax('getItemByCategory', params , 'GET', 'skeleton2');
   	hideSheet();
};

function pad ( val ) { return val > 9 ? val : "0" + val; }

enabledAsap = function(){
	delivery_asap_enabled = getStorage("delivery_asap_enabled");	      
    if(delivery_asap_enabled==1){
        document.querySelector('#delivery_asap').checked = true;
        $(".delivery_time").val('');
    	$(".delivery_time_label").html('');
    }
};

isLocation = function(){
	if(app_settings = getAppSettings()){	
		if(app_settings.search_mode=="location"){
			return true;
		}
	}	
	return false;
};

locationMode = function(){
	if(app_settings = getAppSettings()){
		if( !empty(app_settings.location_mode) ) {
			return parseInt(app_settings.location_mode);
		}
	}
	return 1;
};

getLocationData = function(){
	location_mode = locationMode();
	dump("getLocationData=>"+location_mode);
	switch(location_mode)
	{
		case 1:
		  pretty_address='';
		  location_data_city = getStorage("location_data_city");
		  location_data_area = getStorage("location_data_area");
		  if(!empty(location_data_city) && !empty(location_data_area)){
		  	  data_city = JSON.parse( location_data_city );	 
		  	  data_area = JSON.parse( location_data_area );				  	  
		  	  if(!empty(data_city.city_name)){
		  	  	 pretty_address = data_city.city_name;
		  	  }
		  	  if(!empty(data_area.area_name)){
		  	  	 pretty_address+= ", "+data_area.area_name;
		  	  }
		  	  if(data_city.city_id>0){
			  	  return { 
			  	   "city_id": data_city.city_id , 
			  	   "city_name": data_city.city_name , 
			  	   "country_id": data_city.country_id , 
			  	   "country_name": data_city.country_name , 
			  	   "state_id": data_city.state_id , 
			  	   "state_name": data_city.state_name , 
			  	   "area_id": data_area.area_id , 
			  	   "area_name": data_area.area_name , 
			  	   "location_mode":location_mode,
			  	   'pretty_address':pretty_address
			  	  };
		  	  }
		  }
		break;
		
		case 2: 		  
		  pretty_address='';
		  location_data_state = getStorage("location_data_state");
		  location_data_city = getStorage("location_data_city");		  		  
		  if(!empty(location_data_state) && !empty(location_data_city)){
  		  	  data_state = JSON.parse( location_data_state );				  	  
		  	  data_city = JSON.parse( location_data_city );	 	
		  	  dump(data_state); dump(data_city);
		  	  if(!empty(data_state.state_name)){
		  	  	 pretty_address = data_city.state_name;
		  	  }
		  	  if(!empty(data_city.city_name)){
		  	  	 pretty_address+= ", "+data_city.city_name;
		  	  }
		  	  
		  	  if(data_state.state_id>0){
			  	  return { 
			  	   "city_id": data_city.city_id , 
			  	   "city_name": data_city.city_name , 
			  	   "country_id": data_city.country_id , 
			  	   "country_name": data_city.country_name , 
			  	   "state_id": data_city.state_id , 
			  	   "state_name": data_state.state_name , 
			  	   /*"area_id": data_area.area_id , 
			  	   "area_name": data_area.area_name , */
			  	   "location_mode":location_mode,
			  	   'pretty_address':pretty_address
			  	  };
		  	  }
		  }
		break;
		 
		case 3:		   
		  pretty_address='';
		  location_data_postal = getStorage("location_data_postal");		 
		  if(!empty(location_data_postal)){
		  	  data_postal = JSON.parse( location_data_postal );				
		  	   
		  	   if(!empty(data_postal.postal_code)){
		  	  	 pretty_address = data_postal.postal_code;
		  	  }
		  	  if(!empty(data_postal.city_name)){
		  	  	 pretty_address+= ", "+data_postal.city_name;
		  	  }
		  	    	  
		  	   return { 
			  	   "city_id": data_postal.city_id , 
			  	   "city_name": data_postal.city_name , 
			  	   "postal_code" : data_postal.postal_code,
			  	   "country_id": data_postal.country_id , 
			  	   "country_name": data_postal.country_name , 
			  	   "state_id": data_postal.state_id , 
			  	   "state_name": data_postal.state_name , 
			  	   /*"area_id": data_area.area_id , 
			  	   "area_name": data_area.area_name , */
			  	   "location_mode":location_mode,
			  	   'pretty_address':pretty_address
			  	  };
		  }
		break;
	}
	
	return false;
};

setState = function(state_name,state_id, country_id, country_name ){
	is_address_book = $("#location_state .is_address_book").val();
	location_mode = locationMode();
	
	popPage();	
	
	location_data = {
		state_name :state_name,
		state_id:state_id,
		country_id:country_id,
		country_name:country_name
	};	
	if(is_address_book==1){
	   setStorage("location_data_state1", JSON.stringify(location_data) ); 
	   removeStorage("location_data_city1");
	   removeStorage("location_data_area1");
	} else {
	   setStorage("location_data_state", JSON.stringify(location_data) );  	
	   if(location_mode==1){	   	
	   } else if(location_mode==2){
	   	  removeStorage("location_data_city2");
	   }
	}	
};

setCity = function(name, city_id, state_id, state_name, country_id, country_name){
	is_address_book = $("#location_city .is_address_book").val();
	
	popPage();
	
	location_data = {
		city_name :name,
		city_id:city_id,
		state_id:state_id,
		state_name:state_name,
		country_id:country_id,
		country_name:country_name
	};	
	
	if(is_address_book==1){
		setStorage("location_data_city1", JSON.stringify(location_data) );  
		removeStorage("location_data_area1");
	} else {
		setStorage("location_data_city2", JSON.stringify(location_data) );  
	}	
	
};

setArea = function(area_id, area_name){
	is_address_book = $("#location_area .is_address_book").val();
	popPage();
	
	location_data = {
		area_id :area_id,
		area_name:area_name,		
	};	
	
	if(is_address_book==1){
		setStorage("location_data_area1", JSON.stringify(location_data) );  
	} else {
		setStorage("location_data_area2", JSON.stringify(location_data) );  
	}
};

setPostal = function(city_id, city_name, postal_code, state_id, state_name, country_id){
	
	is_address_book = $("#location_postal_code .is_address_book").val();
	popPage();
	
	location_data = {
		city_id :city_id,
		city_name:city_name,		
		postal_code: postal_code,
		state_id:state_id,
		state_name:state_name,
		country_id:country_id
	};	
	
	if(is_address_book==1){
		setStorage("location_data_postal", JSON.stringify(location_data) );  
	} else {
		setStorage("location_data_postal2", JSON.stringify(location_data) );  
	}
	
};

q = function(data){
	return "'" + addslashes(data) + "'";
};

clickFormat = function(data){
	json = data.split("|");
	params ='';
	if(json.length>0){
		$.each(json, function(key, val){
			params+= q(val)+",";
		});
	}
	if(!empty(params)){
		lent = parseInt(params.length)-1;
		return params.substr(0, lent);
	}	
	return '';
}


setLocationData = function(){
	location_mode = locationMode();
	switch(location_mode){
		case 1:
		  city_id = $("#select_location .city_id").val();
		  area_id = $("#select_location .area_id").val();
		  if(empty(city_id)){
		  	 showToast( t("City is required") );	
		  	 return;
		  }
		  if(empty(area_id)){
		  	 showToast( t("Area is required") );	
		  	 return;
		  }
		  
		 data_city = getStorage("location_data_city2");	
		 data_area = getStorage("location_data_area2");	
		 
		 setStorage("location_data_city",data_city);
		 setStorage("location_data_area",data_area);		  		  		  		 	
		break
		
		case 2:
		
		  state_id = $("#select_location .state_id").val();
		  city_id = $("#select_location .city_id").val();
		  
		  if(empty(state_id) || state_id<1){
		  	 showToast( t("State is required") );	
		  	 return;
		  }
		  
		  if(empty(city_id) || city_id<1){
		  	 showToast( t("City is required") );	
		  	 return;
		  }		  
		  
		  data_state = getStorage("location_data_state");	
		  data_city = getStorage("location_data_city2");			  
		 
		  setStorage("location_data_state",data_state);
		  setStorage("location_data_city",data_city);	
		break
		
		case 3:

		  state_id = $("#select_location .state_id").val();
		  city_id = $("#select_location .city_id").val();
		  
		  if(empty(city_id) || city_id<1){
		  	 showToast( t("Postal Code/Zip Code is required") );	
		  	 return;
		  }		   		

		  data_postal = getStorage("location_data_postal2");
		  setStorage("location_data_postal",data_postal);
		
		break
		
		default:
		  showToast( t("Undefined location mode") );	
		break
	}
	
	 if(tabbar_loaded){
	 	popPage();	               	  
   	    params = "search_type=byLatLong";	
        processDynamicAjax('searchMerchant', params , 'search_results_wrapper');   	    	   	    	
        loadHomePage();
	 } else {
	 	onsenNavigator.resetToPage("tabbar.html",{
	  	   animation : "none" ,  	
	  	   data : {
	  	   	  lat : '' ,
	  	   	  lng : '' ,
	  	   	  location_address : ''
	  	   }
	   });	  
	 }		  
		 
};

setCurrentAddress = function(){
	if(isLocation()){
   	   location_res = getLocationData();
   	   $(".print_location_address").html( location_res.pretty_address );
   	} else {
	   current_latlng = getCurrentLocation();
	   $(".print_location_address").html( current_latlng.address );
   	}
};

showHomeOrSelect = function(){
	dump("showHomeOrSelect=>");
	if(isLocation()){
		location_mode = locationMode();
		location_data = getLocationData();
		dump("location_modex=>"+location_mode);
		switch(location_mode){
			case 1:
			  if(location_data){			  	
			  	resetToPage('tabbar.html','none',{
		  			 lat : 0,
		  			 lng : 0,
		  		});
			  } else {
			  	 resetToPage( "select_location.html",'lift' );
			  }
			break;
						
			default:
			  resetToPage( "select_location.html" );
			break;
		}
	} else {
		if ( lat_res = getCurrentLocation()){	        	  		
	  		resetToPage('tabbar.html','none',{
	  			 lat : lat_res.lat,
	  			 lng : lat_res.lng,
	  		});
	  	} else {	        	  			        	  	
    	    resetToPage( "map_select_location.html" );
	  	}
	}
};

showSelectLocation = function(){
	if(isLocation()){
		location_mode = locationMode();			
		switch(location_mode){
			case 1:
			  resetToPage( "select_location.html" );
			break;
			
			case 2:
			break;
			
			case 3:
			break;
			
			default:
			  resetToPage( "select_location.html" );
			break;
		}
	} else {
		resetToPage( "map_select_location.html" );
	}
};

switchAddressBook = function(){
	if(isLocation()){
		showPage('address_book_location.html');
	} else {
		showPage('address_book.html');
	}
};

showLocationCity = function(){
	state_id = $('.state_id').val();
	if(!empty(state_id)){
		showPage("location_city.html",'none',{
			address_book:1,
			state_id : state_id
		});
	} else {
		showToast( t("Select State") );	
	}
};

showLocationArea = function(){
	city_id = $(".city_id").val();
	if(!empty(city_id)){
		showPage('location_area.html','none',{
			address_book:1,
			city_id : city_id
		});
	} else {
		showToast( t("Select City first") );	
	}
};

showLocationArea2 = function(){
	city_id = $(".city_id").val();
	if(!empty(city_id)){
		showPage('location_area.html','none',{
			address_book:0,
			city_id : city_id
		});
	} else {
		showToast( t("Select City first") );	
	}
};

var setDeliveryLocation = function(){
	$(".frm_address_form_location").validate({
   	    submitHandler: function(form) {
   	    	var params = $( ".frm_address_form_location").serialize();
   	    	params+="&merchant_id=" + getActiveMerchantID();
   	    	processAjax('setDeliveryLocation', params );
		}
   	});
	$(".frm_address_form_location").submit();
};

setAddressBookLocation = function(){
	$(".frm_address_form_select_location").validate({
   	    submitHandler: function(form) {   	
   	    	
   	    	setStorage("customer_number", $(".contact_phone").val() );
   	    	
   	    	var params = $( ".frm_address_form_select_location").serialize();
   	    	params+= "&merchant_id=" + getActiveMerchantID();
   	    	processAjax('setAddressBookLocation', params ); 
		}
   	});
	$(".frm_address_form_select_location").submit();
};

fillAddressForm = function(){
	dump('fillAddressForm');
	if ( location_res = getLocationData() ){
		dump(location_res);
		switch(location_res.location_mode){
			case 1:			 
			
			 $.each( location_res  , function( key, val ) {
			 	setValue("#address_form_location ."+key, val);	
			 });
			
			 data_state = {
				state_name :location_res.state_name,
				state_id:location_res.state_id,
				country_id:location_res.country_id,
				country_name:location_res.country_name
			  };	
			  setStorage("location_data_state1", JSON.stringify(data_state) ); 
			  
			   data_city = {
				city_name :location_res.city_name,
				city_id: location_res.city_id,
				state_id: location_res.state_id,
				country_id: location_res.country_id
			  };	
			  setStorage("location_data_city1", JSON.stringify(data_city) ); 
				  
			  data_area = {
					area_id : location_res.area_id,
					area_name: location_res.area_name,		
		      };	
		      setStorage("location_data_area1", JSON.stringify(data_area) ); 
			  
			break;
			
			case 2:
			break;
			
			case 3:
			break;
		}
	}
};

recheckLocationMap = function(element){
	$(element).webuiPopover('hide');	
	current_latlng = getCurrentLocation();
   	if(!empty(current_latlng)){   	    	
   		showPage("map_select_location.html",'none',{
   			lat : current_latlng.lat,
   			lng : current_latlng.lng
   		});
   	} else {
   		showPage("map_select_location.html",'none');
   	}
};

recheckLocationClose = function(element){
	$(element).webuiPopover('hide');
	setStorage("recheck_location",1);
};

recheckLocation = function(){
	
	tooltip_home = getStorage("tooltip_home");
	recheck_location = getStorage("recheck_location");
	
	if(!empty(tooltip_home && empty(recheck_location))){
		setTimeout(function() {		 
			 close_button='<ons-button modifier="bluebutton_small" onclick="recheckLocationClose(\'.tooltip_home\');" >';
			 close_button+=t("NO, THANKS");
			 close_button+='</ons-button>';
			 
			 enabled_button='<ons-button modifier="whitebutton_small" onclick="recheckLocationMap(\'.tooltip_home\');" >';
			 enabled_button+=t("ENABLED LOCATION");
			 enabled_button+='</ons-button>';
			 
			 $('.tooltip_home').webuiPopover({   	     	
		     	content:'<p>'+t('Where are you?')+'</p><p class="small">'+t('Enabled your location to find fantastic food nearby')+'</p><br/>'+ close_button + enabled_button,
		     	backdrop:false,	     	
		     	offsetLeft:90
		   	});
		   	$('.tooltip_home').webuiPopover('show');   	
	   	}, 1000); 
	}
	
	return;
	
	if( isdebug() ){
		
		setTimeout(function() {									
		
			GMaps.geolocate({
				success: function(position) {
					re_your_lat = position.coords.latitude;
		  	        re_your_lng = position.coords.longitude;
		  	        //alert(re_your_lat+"=>"+re_your_lng);	  	        
		  	        if ( lat_res = getCurrentLocation()){
		  	        	//alert(lat_res.lat+"==="+lat_res.lng);
		  	        	data_recheck = "new_lat="+ re_your_lat;
		  	        	data_recheck+= "&new_lng="+ re_your_lng;
		  	        	data_recheck+= "&old_lat="+ lat_res.lat;
		  	        	data_recheck+= "&old_lng="+ lat_res.lng;	  	        	
		  	        	processDynamicAjax('recheckLocation', data_recheck );
		  	        }
		  	        
				},
				error: function(error) {
			     showToast('Geolocation failed: '+error.message);
			    },
			    not_supported: function() {
			      showToast("Your browser does not support geolocation");
			    },
			    always: function() {	    
			      showLoader(false);
			    }
			});
		
		}, 1500); 
	}
};

getCartTheme = function(){
	cart_theme = 1;
	if(app_settings = getAppSettings()){	
		if(!empty(app_settings.cart_theme)){
			if(app_settings.cart_theme>0){
		       cart_theme = app_settings.cart_theme;
			}
		}
	} 
	return cart_theme;
};

setCartTheme = function(){	
	cart_theme = getCartTheme();			
	switch(cart_theme){
		case "2":		  
		  $("ons-fab.cart_fab").remove();
		  html_basket_count = $(".basket_count").html();
		  if(empty(html_basket_count)){
		     $(".basket_count").html('<ons-icon icon="md-spinner" size="13px" spin></ons-icon>');
		     $(".basket_total").html('<ons-icon icon="md-spinner" size="13px" spin></ons-icon>');
		  }
		break;
		
		default:		 		  
		  $("ons-bottom-toolbar.basket_toolbar").remove();
		  $("ons-fab.fab_floating_category").remove();
		break;
	}
	
};

setBasket = function(data){
	$(".basket_count").html(data.basket_count);
	$(".basket_total").html(data.basket_total);
	setStorage("basket_count", data.basket_count);
	setStorage("basket_total", data.basket_total);
};

ReSetBasket = function(){
	cart_theme = getCartTheme();
	if(cart_theme==2){		
		basket_count = getStorage("basket_count");
		basket_total = getStorage("basket_total");
		if(!empty(basket_count)){
			setBasket({
				basket_count:basket_count,
				basket_total:basket_total
			});
		} else {		
			getCartCount();
		}
	} else {
		getCartCount();
	}
};

clearBasket = function(){
  cart_theme = getCartTheme();
  if(cart_theme==2){
  	 setBasket({
  	 	basket_count:"",
  	 	basket_total:""
  	 });
  }    
};

showFloatingCategory = function(){
   destroyList('floating_category_list');
   fab_dialog = document.getElementById('floating_category');
   if (fab_dialog) {
   	   setFloatingCategory('floating_category_list');
       fab_dialog.show();
   } else {
    ons.createElement('floating_category.html', { append: true })
      .then(function(fab_dialog) {
         setFloatingCategory('floating_category_list');
         fab_dialog.show();
      });
   }
};

showItemPageFloating = function(cat_id, page_type){
	document.getElementById("floating_category").hide();
	if(page_type=="1"){
	  showItemPage(cat_id);
	} else {
	  reloadItemPage(cat_id);	
	}
}

setCloseMerchant = function(){
	cart_theme = getCartTheme();
	merchant_open_status = $("#restaurant_page .merchant_open_status").val();	
	if(merchant_open_status=="close"){

	  current_page_id = onsenNavigator.topPage.id;
	  switch(current_page_id){
	  	case "item_details":
	  	   $("ons-bottom-toolbar ons-button").attr("disabled",true);	
	  	break;
	  }	  
		
	  if(cart_theme==2){
	     $('.basket_toolbar ons-button').attr("disabled",true);
	  }
	}
};


/*1.4*/
initStartUpBanner = function(){
	interval = 3000;
	if(app_settings = getAppSettings()){    	
    	if(app_settings.startup.startup_auto_scroll==1){    		
    		interval = parseInt(app_settings.startup.startup_interval)+0;        		
    		if(interval<=0){
			   interval = 3000;
			}
			if (isNaN(interval)){
				interval = 3000;
			}					
			startup_banner_interval = setInterval(function(){AutoStartUpBanner()}, interval );    		 	
    	}
    }
};

AutoStartUpBanner = function(){
	dump("StartUpBannerAutoScroll");
	var total_banner = 0;
	var startup_banner_index = $(".startup_banner_index").val();
	startup_banner_index = parseInt(startup_banner_index)+0;
	if(settings = getAppSettings()){
		total_banner  = app_settings.startup.banner.length;
		total_banner = parseInt(total_banner)-1;
	}
	dump("total_banner=>"+total_banner);
	var scroll_banner = document.getElementById('startup_carousel');
		
	if(startup_banner_index>=total_banner){
	   scroll_banner.setActiveIndex(0);
	   $(".startup_banner_index").val(0);
	} else {	
	   scroll_banner.next();
	}
};

StopStartUpBanner = function(){
    dump("StopStartUpBanner");
	clearInterval(startup_banner_interval);	  
};


/*1.4*/

preCheckout = function(){
	
	transaction_type = $(".transaction_type").val();
	if(empty(transaction_type)){
		showToast( t("Please select transaction type") );
		return;
	}
	
	switch (transaction_type){
		case "delivery":
		  var street = $(".delivery_address").val();
		  if(empty(street)){
		  	 showAlert( t("Please enter delivery address") );
		  	 return ;
		  }
		  
		  var delivery_asap_val = false;
		  var delivery_asap = document.getElementById('delivery_asap');		  		  
		  if(!empty(delivery_asap)){
		  	  delivery_asap_val = delivery_asap.checked;
		  }
		  
		  //alert(delivery_asap_val);
		  
		  required_delivery_time = $(".required_delivery_time").val();
		  if(required_delivery_time==1 && delivery_asap_val == false){
		  	  delivery_time_set = getStorage("delivery_time_set");		  
			  if(empty(delivery_time_set)){
			  	 showAlert( t("Delivery time is required") );
			  	 return;
			  }
		  }
		  
		  /*CHECK MINIMUM ORDER TABLE*/
		  min_delivery_order = parseFloat($(".min_delivery_order").val());		  
		  //alert(min_delivery_order);
		  if(min_delivery_order>0.0001){
		  	 cart_sub_total = parseFloat($(".cart_sub_total").val());		  	 
		  	// alert(cart_sub_total);
		  	 if(min_delivery_order>cart_sub_total){
		  	 	showAlert( t("Sorry but Minimum order is") +" "+ prettyPrice(min_delivery_order) );
			  	return;
		  	 }
		  }
		  
		break;
		
		case "pickup":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Pickup time is required") );
		  	 return;
		  }
		break;
		
		case "dinein":
		  delivery_time_set = getStorage("delivery_time_set");		  
		  if(empty(delivery_time_set)){
		  	 showAlert( t("Dine in time is required") );
		  	 return;
		  }
		break;
	}	
	
	var params  = '';
	params = "transaction_type="+transaction_type;	
		
	delivery_date_set = getStorage("delivery_date_set");
	if(!empty(delivery_date_set)){
	   params +='&delivery_date=' + delivery_date_set;
	}
	
	delivery_time_set = getStorage("delivery_time_set");
	if(!empty(delivery_time_set)){
	   params +='&delivery_time=' + delivery_time_set;	
	}
	
	params+="&merchant_id=" + getActiveMerchantID();
	
	processAjax("preCheckout", params );
	
};

InitRTL = function(code){	
	if(!empty(code)){
		if(app_settings = getAppSettings()){
			lang_rtl = app_settings.lang_rtl;			
			if(lang_rtl.length>0){
				if(in_array(code, lang_rtl)){
					$("body").addClass("RTL");
					return;
				} 
			}
		}	
	}
	$("body").removeClass("RTL");
};

isRTL = function(code){
	if(!empty(code)){
		if(app_settings = getAppSettings()){
			lang_rtl = app_settings.lang_rtl;			
			if(lang_rtl.length>0){
				if(in_array(code, lang_rtl)){					
					return true;
				} 
			}
		}	
	}
	return false;
}

function in_array(needle, haystack, argStrict) {
    var key = '', strict = !!argStrict;
    if (strict) {
        for (key in haystack) {
            if (haystack[key] === needle) {
                return true;
            }
        }
    }
    else {
        for (key in haystack) {
            if (haystack[key] == needle) {
                return true;
            }
        }
    }
    return false;
}

/*END OF SCRIPT*/