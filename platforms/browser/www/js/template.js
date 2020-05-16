formatFields = function(field_name, field_placeholder){

	var html='';
	
	html+='<ons-list-item class="reg_last_row">';
        //html+='<div class="left"> <ons-icon icon="ion-ios-browsers-outline" size="30px"></ons-icon> </div>';
       html+='<div class="center"><ons-input name="'+field_name+'" id="'+field_name+'" required modifier="transparent" placeholder="'+ t(field_placeholder) +'" float ></ons-input></div>';
    html+='</ons-list-item>';
    
    return html;
};

tabbarMenu = function(){
	
	var html='';
	html+='<ons-tabbar position="bottom" animation="none" modifier="is_rtl" >';
	    html+='<ons-tab page="home.html" label="'+ t("Near Me") +'" icon="ion-ios-location-outline" active  active-icon="ion-ios-location" >';
	    html+='</ons-tab>';
	    html+='<ons-tab page="search.html" label="'+ t("Search") +'" icon="ion-ios-search" active-icon="ion-search" >';
	    html+='</ons-tab>';	    
	    html+='<ons-tab page="profile.html" label="'+ t("Account") +'" icon="ion-android-contact" active-icon="ion-android-contact" >';
	    html+='</ons-tab>';	    
	    html+='<ons-tab page="cart_temp.html" label="'+ t("Cart") +'" icon="ion-ios-cart-outline" active-icon="ion-android-cart" badge="" >';
	    html+='</ons-tab>';
    html+='</ons-tabbar>';	
	
   return html;
};

fillMobilePrefix = function(data){	
	html='';
	html+='<ons-list>';
	html+='<ons-list-header>'+ t('Select your country code') +'</ons-list-header>';

	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable modifier="longdivider" onclick="setPrefix('+ "'+" + val.code + "'" +')">';
		  html+='<div class="left ">+'+ val.code +'</div>';
		  html+='<div class="center ">'+ val.name +'</div>';
		html+='</ons-list-item>';
	});
	html+='</ons-list>';
	$(".mobilecode_list").html(html);
};


MerchantCarousel = function(data){
	html = '<ons-carousel fullscreen swipeable auto-scroll overscrollable id="carousel" direction="horizontal" item-width="50%" >';	
	$.each(data, function(key, val){
		
		html +='<ons-carousel-item onclick="loadMerchant('+ val.merchant_id+')"  >';
	    html +='<ons-ripple color="#EF6625" background="#EF6625"></ons-ripple>';
		    html +='<div class="banner">';
			    //html +='<div class="header_bg" style="background-image: url('+ "'" + val.background_url + "'" +')"  ></div>';
			    
			    html +='<div>';
			    html +='<img class="hide" src="'+val.background_url+'">';
			    
			    if(val.is_sponsored==2){
			       html +='<div class="ribbon"><span>'+ val.sponsored +'</span></div>';
			    }
			    
			    html +='<div class="header_bg" style="background-image: url('+ "'" + val.background_url + "'" +')"  >';
			      html +='<div class="spinner"></div>';			      
			    html +='</div>';
			    html +='</div>';
			    
			    if (val.minimum_order_raw>0){
				    /*html +='<div class="min_tag">';
				     html += val.minimum_order+'<br><small>MIN</small>';
				    html +='</div>';*/
			    }
			    
			    if( !empty(val.offers)){
			       x=0;
			       $.each( val.offers  , function( key_offer, val_offer ) {
			       	  if(x<=0){
			       	     html +='<div class="pink_tag ">'+ val_offer.raw +'</div>';			       	  			       	 
			       	  }
			       	  x++;
			       });			       
			    }
			    
			    if(!empty(val.open_status_raw)){
			          html +='<div class="green_tag '+ val.open_status_raw +' ">'+ val.open_status +'</div>';
			       }
			    
			    //if(val.rating.ratings>0){
			       //html +='<div class="rating_wrap"><ons-icon icon="ion-star" size="13px"></ons-icon> <span>'+val.rating.ratings+'</span></div>';
			    //}
			    
			  html +='</div>';			
			  
			html +='<h4>'+ val.restaurant_name +'</h4>';
			
			if(!empty(val.cuisine)){
			html +='<p class="concat_text">'+ val.cuisine +'</p>';
			}
			
		    if( !empty(val.offers)){		
		    	offer_list='';  x=0;
		    	$.each( val.offers  , function( key_offer, val_offer ) {
		    		if(x<=0){
		    		   offer_list+=val_offer.full+'<br/>';
		    		}
		    		x++;
		    	});
		    	html +='<p class="bold">'+ offer_list  +'</p>';		
		    }
		    
		    if( !empty(val.vouchers)){
		    	voucher_list='';  xv=0;
		    	$.each( val.vouchers  , function( key_voucher, val_voucher ) {
		    		if(xv<=0){
		    		   voucher_list+=val_voucher+'<br/>';
		    		}
		    		xv++;
		    	});
		    	if(!empty(voucher_list)){
		    	   html +='<p class="bold">'+ voucher_list  +'</p>';		
		    	}
		    }		    
		    
		    /*rating*/
		    if(!empty(val.rating)){
		    html += '<ons-row class="rating_wrap">';
		    html += '<ons-col><div class="raty-stars" data-score="'+ val.rating.ratings +'"></div></ons-col>';
		    html += '<ons-col>'+ val.rating.review_count+'</ons-col>';
		    html += '</ons-row>';
		    }
			
	    html +='</ons-carousel-item>';
		
	});
	
	html +='</ons-carousel>';
	return html;
};


CuisineCarousel = function(data){
	
	html = '<ons-carousel fullscreen swipeable auto-scroll overscrollable id="carousel" direction="horizontal" item-width="50%">';	
	$.each(data, function(key, val){
		
		html +='<ons-carousel-item  onclick="showRestaurantListCuisine(\'byCuisine\','+ val.id+')" >';
	    html +='<ons-ripple color="#EF6625" background="#EF6625"></ons-ripple>';
		    html +='<div class="banner">';		
		            
		        //html +='<div class="dim_background absolute"><div class="cuisine"><h4>'+val.name+'</h4><p> '+val.total_merchant+' <ons-icon icon="ion-android-arrow-dropright-circle" size="14px"></ons-icon></p> </div></div>'; 
			    html +='<div class="header_bg" style="background-image: url('+ "'" + val.featured_image + "'" +')"  >';			       
			    
					html +='<div class="is-loading">'; 
					html +='<div class="spinner"></div>';		
					html +='<img class="hide" src="'+val.featured_image+'">';	      
					html +='</div>'; 

			    
			    html +='</div>';			    			   
			   			    
			html +='</div>';    
			
			html +='<h4>'+ val.name+'</h4>';
			html +='<p class="concat_text">'+ val.total_merchant +'</p>';
			  						
	    html +='</ons-carousel-item>';
		
	});
	
	html +='</ons-carousel>';
	return html;
	
};


restaurantList = function(data, element){
	var list = document.getElementById(element);
	html='';
	
	$.each(data, function(key, val){		
		
		html+='<ons-list-item modifier="longdivider list_item_nopadding list_type_list1" tappable onclick="loadMerchant('+ val.merchant_id+')" >';
	      html+='<div class="left">';
	        
	        html+='<div class="is-loading xsmall-loader">';
	          html +='<div class="spinner"></div>';		
	          html+='<img class="list_left_logo" src="'+ val.logo+'" />';
	          if(!empty(val.open_status_raw)){
	             html+='<div class="green_tag '+val.open_status_raw+' inherit">'+val.open_status+'</div>'
	          }
	        html+='</div>';
	        
	      html+='</div>';
	      html+='<div class="center">';
	      
	         html+='<span class="list-item__title is_rtl_text_right">'+ val.restaurant_name +'</span>';
	         	         
	         
             html+='<span class="list-item__subtitle is_rtl_text_right">';
              
                if(!empty(val.address)){
                	 html+=val.address;      
                     html+='<br/>';
                }
                if(!empty(val.cuisine)){
                     html+=val.cuisine;      
                     html+='<br/>';
                }
                if(!empty(val.distance_plot)){
                   html+=val.distance_plot;
                   html+='<br/>';
                }

                if(!empty(val.minimum_order)){               	                
	                html+= val.minimum_order+ '<br/>';
                }
                if(!empty(val.delivery_estimation)){               	                
	                html+= val.delivery_estimation+ '<br/>';
                }
                if(!empty(val.delivery_distance)){               	                
	                html+= val.delivery_distance+ '<br/>';
                }
                if(!empty(val.delivery_fee)){               	                
	                html+= val.delivery_fee+ '<br/>';
                }
                
                if(val.is_sponsored==2){
                   html+= '<ons-icon icon="ion-ios-circle-filled" size="12px" ></ons-icon>&nbsp;' +  t("Sponsored") +  '<br/>';
                }
                
                if(!empty(val.offers)){               	                                	
	                if(val.offers.length>=1){
	                	$.each(val.offers, function(offer_key, offer_val){	                		
	                		html+= '<ons-icon icon="ion-ios-circle-filled" size="12px" ></ons-icon>&nbsp;' +  offer_val.full +  '<br/>';
	                	});
	                }
                }
                
                if(!empty(val.vouchers)){               	                                	
	                if(val.vouchers.length>=1){
	                	$.each(val.vouchers, function(vouchers_key, vouchers_val){	                		
	                		html+= '<ons-icon icon="ion-ios-circle-filled" size="12px" ></ons-icon>&nbsp;' +  vouchers_val +  '<br/>';
	                	});
	                }
                }
                
                if(!empty(val.services)){               	                                	
	                if(val.services.length>=1){
	                	html+='<ons-row>';
	                	$.each(val.services, function(services_key, services_val){	                			                		
	                		html+='<ons-col width="80px" ><ons-icon icon="md-check" size="18px"></ons-icon><span class="indent">'+services_val+'</span></ons-col>';
	                	});
	                	html+='</ons-row>';
	                }
                }
                
                if(!empty(val.paymet_method_icon)){
                	if(val.paymet_method_icon.length>=1){
	                html+='<ons-row style="margin-top:10px;">';
	                  $.each(val.paymet_method_icon, function(paymet_method_icon_key, paymet_method_icon_val){	                			                			                 
	                     html+='<ons-col width="35px" ><img src="'+paymet_method_icon_val+'" class="payment_options_icon"></ons-col>';
	                  });
	                html+='</ons-row>';
                	}
                }
                              
             html+='</span>';
                          
                                       
             if(!empty(val.rating)){
	             html+='<span class="list-item__subtitle">';
	             html+='<div class="raty-stars" data-score="'+ val.rating.ratings +'"></div>';
	             html+='</span>';
             }
	      
	      html+='</div>';
	      	      
	    html+='</ons-list-item>';
				
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});
};

restaurantListWithBanner = function(data, element){
	var list = document.getElementById(element);
	html='';
	$.each(data, function(key, val){		
		
		html+='<ons-list-item modifier="nodivider list_item_nopadding" tappable  onclick="loadMerchant('+ val.merchant_id+')" >';
		 html+='<div class="banner">';
		 
			html +='<div class="is-loading large-loader">'; 
			html +='<div class="spinner"></div>';		
			html +='<img class="hide" src="'+ val.background_url +'">';	      
			html +='</div>'; 
		 
			html+='<div class="header_bg" style="background-image: url('+ "'" + val.background_url + "'" +')" >';

			    if(!empty(val.minimum_order_raw)){
				    if (val.minimum_order_raw>0){
					    html +='<div class="min_tag">';
					     html += val.minimum_order+'<br><small>MIN</small>';
					    html +='</div>';
				    }  
			    }
						   
			   if( !empty(val.offers)){
			       x=0;
			       $.each( val.offers  , function( key_offer, val_offer ) {
			       	  if(x<=0){
			       	     html +='<div class="pink_tag ">'+ val_offer.raw +'</div>';			       	  			       	 
			       	  }
			       	  x++;
			       });			       
			    }
			   
			   if(!empty(val.open_status_raw)){
			     html+='<div class="green_tag '+ val.open_status_raw+'">'+ val.open_status +'</div>';
			   }
			   
			   if(!empty(val.sponsored)){
			   	  html+='<div class="sponsored_tag">'+ val.sponsored +'</div>';
			   }
			   
			html+='</div>';
			
			html +='<div class="is-loading xxsmall-loader">'; 
			//html +='<div class="spinner"></div>';	
			html+='<img class="logo" src="' + val.logo + '">';
			html+='</div> ';
			
		 html+='</div> ';
		 
		 html+='<ons-row>';
		   html+='<ons-col width="70%" vertical-align="center" class="is_rtl_text_right" >';
			 html+='<h4>'+ val.restaurant_name +'</h4>';
			 
			 html+='<p class="concat_text">' ;
			 
			    if(!empty(val.address)){
			    	html+=val.address+'<br/>';
			    }
			    if(!empty(val.cuisine)){
			    	html+=val.cuisine+'<br/>';
			    }
			    if(!empty(val.distance_plot)){
                   html+= val.distance_plot;
                }
                
             html+='</p>';  
                
		   html+='</ons-col>';
		   
		   if(!empty(val.rating)){
			   html+='<ons-col vertical-align="center" class="raty-medium" > ';			 
				 html+='<div class="raty-stars" data-score="'+ val.rating.ratings +'"></div>';
			   html+='</ons-col>';
		   }
		   
		 html+='</ons-row>';
		 
		html+='<p class="concat_text is_rtl_text_right">' ;
			 
		   if(!empty(val.minimum_order)){               	                
                html+= val.minimum_order+ '<br/>';
            }
            if(!empty(val.delivery_estimation)){               	                
                html+= val.delivery_estimation+ '<br/>';
            }
            if(!empty(val.delivery_distance)){               	                
                html+= val.delivery_distance+ '<br/>';
            }
            if(!empty(val.delivery_fee)){               	                
                html+= val.delivery_fee+ '<br/>';
            }
            if(!empty(val.offers)){               	                                	
                if(val.offers.length>=1){
                	$.each(val.offers, function(offer_key, offer_val){	                		
                		html+= '<ons-icon icon="ion-ios-circle-filled" size="12px" class="orange_color" ></ons-icon>&nbsp;' +  offer_val.full +  '<br/>';
                	});
                }
            }
            
            if(!empty(val.vouchers)){               	                                	
                if(val.vouchers.length>=1){
                	$.each(val.vouchers, function(vouchers_key, vouchers_val){	                		
                		html+= '<ons-icon icon="ion-ios-circle-filled" size="12px" class="orange_color" ></ons-icon>&nbsp;' +  vouchers_val +  '<br/>';
                	});
                }
            }
            
            if(!empty(val.services)){               	                                	
	                if(val.services.length>=1){
	                	html+='<ons-row>';
	                	$.each(val.services, function(services_key, services_val){	                			                		
	                		html+='<ons-col  width="70px"><ons-icon icon="md-check" size="18px" class="orange_color"></ons-icon><span class="indent">'+services_val+'</span></ons-col>';
	                	});
	                	html+='</ons-row>';
	                }
                }
                
                if(!empty(val.paymet_method_icon)){
                	if(val.paymet_method_icon.length>=1){
	                html+='<ons-row style="margin-top:10px;">';
	                  $.each(val.paymet_method_icon, function(paymet_method_icon_key, paymet_method_icon_val){	                			                			                 
	                     html+='<ons-col width="35px" ><img src="'+paymet_method_icon_val+'" class="payment_options_icon"></ons-col>';
	                  });
	                html+='</ons-row>';
                	}
                }
            
         html+='</p>';  
		 
		html+='</ons-list-item>';
				
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});
};

filters = function(data){
	dump(data);
	var html='';
	
	html+='<ons-list-header>';
	  html+='<ons-row>';
	     html+='<ons-col width="50%">' + t('Filter By') +  '</ons-col>';
	     html+='<ons-col class="text-right"> <ons-button modifier="quiet sort_btn" onclick="clearForm(\'frm_filter\')">'+ t("CLEAR") +'</ons-button> </ons-col>';
	  html+='</ons-row>';
	html+='</ons-list-header>';
	
	if(!empty(data.delivery_fee)){
		html+='<ons-list-header>'+ t('Delivery Fee') +'</ons-list-header> ';
		$.each( data.delivery_fee  , function( key, val ) {			
			
			html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-radio class="filter_delivery_fee" name="filter_delivery_fee" input-id="x_'+key+'" value="1"></ons-radio>';
		      html+='</label>';
		      html+='<label for="x_'+key+'" class="center">';
		        html+= t(val);
		      html+='</label>';
		   html+='</ons-list-item>';
			
		});				
	}
	
	if(!empty(data.promos)){
		html+='<ons-list-header>'+ t('Promos') +'</ons-list-header> ';
		$.each( data.promos  , function( key, val ) {			
			
			html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-radio class="filter_delivery_fee" name="filter_promos" input-id="x_'+key+'" value="'+key+'"></ons-radio>';
		      html+='</label>';
		      html+='<label for="x_'+key+'" class="center">';
		        html+= t(val);
		      html+='</label>';
		   html+='</ons-list-item>';
			
		});				
	}
	
	if(!empty(data.services)){
		html+='<ons-list-header>'+ t('By Services') +'</ons-list-header> ';
		$.each( data.services  , function( key, val ) {
			 html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-checkbox class="filter_services" name="filter_services[]" input-id="x_'+ key +'" value="'+key+'" ></ons-checkbox>';
		      html+='</label>';
		      html+='<label for="x_'+ key +'" class="center">';
		        html+= t(val) ;
		      html+='</label>';
		    html+='</ons-list-item>';
		});
	}
	
	if(!empty(data.cuisine)){
		html+='<ons-list-header>'+ t('By Cuisine') +'</ons-list-header> ';
		$.each( data.cuisine  , function( key, val ) {
			 html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-checkbox class="filter_cuisine" name="filter_cuisine[]" input-id="cuisine_'+ key +'" value="'+ val.cuisine_id +'" ></ons-checkbox>';
		      html+='</label>';
		      html+='<label for="cuisine_'+ key +'" class="center">';
		        html+= t(val.cuisine_name) ;
		      html+='</label>';
		    html+='</ons-list-item>';
		});
	}
	
	if(!empty(data.minimum_order)){
		html+='<ons-list-header>'+ t("Minimum order") +'</ons-list-header> ';
		
		$.each( data.minimum_order  , function( key, val ) {
			html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-radio class="filter_minimum" name="filter_minimum" input-id="filter_minimum_'+key+'" value="'+key+'"></ons-radio>';
		      html+='</label>';
		      html+='<label for="filter_minimum_'+key+'" class="center">';
		        html+= t(val)
		      html+='</label>';
		   html+='</ons-list-item>';
		});
	}
	
	list_filters = $("#list_filters").html();	
	if(list_filters.length<=7){		
	   $("#list_filters").html( html );
	}
}


restaurantListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="loadMerchant('+ val.merchant_id+')" >';
		  html+='<div class="left">';
		    html +='<div class="is-loading xxsmall-loader">'; 
		      html +='<div class="spinner small"></div>';		
		      html+='<img class="list-item__thumbnail" src="'+ val.logo +'">';
		    html+='</div>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.restaurant_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.cuisine + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

ListCuisine = function(data , element ){
	if (data.length<=0){
		return;
	}
		
		
	var list = document.getElementById(element);
	html=''; col = '';
	x=1; xx=1;
	
	var total_data = parseInt(data.length)+0;
	
	//alert(total_data);
	
	$.each(data, function(key, val){
				
		 col+='<ons-col width="50%" onclick="showRestaurantListCuisine(\'byCuisine\','+ val.id+')">';
		   col+='<div class="banner">';
		      //col+='<div class="dim_background absolute"><div class="cuisine"><h4>'+ val.name +'</h4><p> '+ val.total_merchant +' <ons-icon icon="ion-android-arrow-dropright-circle" size="14px" modifier="material" style="font-size: 14px;" class="ons-icon ion-android-arrow-dropright-circle ons-icon--ion"></ons-icon></p> </div></div>';
		      col+='<div class="header_bg" style="background-image: url(' + "'" + val.featured_image + "'" + ')"></div>';
		      
				col +='<div class="is-loading">'; 
				col +='<div class="spinner"></div>';		
				col +='<img class="hide" src="'+val.featured_image+'">';	      
				col +='</div>'; 

		      
		   col+='</div>';
		   col+='<h4>'+val.name+'</h4>';
		   col+='<p class="small">'+val.total_merchant+'</p>';
		col+='</ons-col>';
		  
		if (x>=2){
			x=0;
			 html+='<ons-list-item tappable modifier="nodivider" >';
			 html+=col;
			 html+='</ons-list-item>';
			 col='';
			 
			 newItem = ons.createElement(html);
			 list.appendChild(newItem);
		     html='';
		} else {
			if(xx>=total_data){
				 html+='<ons-list-item tappable modifier="nodivider" >';
				 html+=col;
				 html+='</ons-list-item>';
				 col='';
				 
				 newItem = ons.createElement(html);
				 list.appendChild(newItem);
			     html='';
			}
		}
		
		
	    x++;	  	 
	    xx++;
		
	});
		
};



cuisineListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="replaceRestaurantListCuisine(\'byCuisine\','+ val.id+')"  >';
		  html+='<div class="left">';
		    html +='<div class="is-loading xxsmall-loader">'; 
		      html +='<div class="spinner small"></div>';	
		      html+='<img class="list-item__thumbnail" src="'+ val.featured_image +'">';
		    html+='</div>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.total_merchant + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

sortList = function(data , element_id){
	if (data.length<=0){
		return;
	}
	var list = document.getElementById( element_id );
	var html='';
	$.each( data  , function( key, val ) {
		
		html+='<ons-list-item tappable>';
	      html+='<label class="left">';
	        html+='<ons-radio id="sortby" name="sortby" input-id="'+key+'" value="'+key+'"></ons-radio>';
	      html+='</label>';
	      html+='<label for="'+key+'" class="center">';
	        html+= t(val);
	      html+='</label>';
	   html+='</ons-list-item>';
	   
	    var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	   
	});	
};

restoPageCarousel = function(data){
	html='';
	html='<ons-carousel fullscreen swipeable auto-scroll overscrollable id="resto_page_carousel">';
	$.each( data  , function( key, val ) {
		html+='<ons-carousel-item>';
		  html+='<div class="banner" style="background-image: url('+ "'" + val + "'" +')" >';
		  		 
		html +='<div class="is-loading">'; 
		html +='<div class="spinner"></div>';		
		html +='<img class="hide" src="'+ val +'">';	      
		html +='</div>'; 
		  
		  html+='</div>';
		html+='</ons-carousel-item>';
	});
	html+='</ons-carousel>';
	
	html+='<ul class="dots">';
	  $.each( data  , function( key, val ) {
	  	  is_selected='active';
	  	  if(key>=1){
	  	  	is_selected='';
	  	  }
	  	  html+='<li class="c'+key + ' ' + is_selected +'"><div class="circle"></div></li>';
	  });
	html+='</ul>';
		
	return html;
};

fillRestoPageInfo = function(data){
	html='';
	
	html+='<ons-row>';
	html+='<ons-col width="70%" vertical-align="center" >';	
	if(!empty(data.restaurant_name)){
		html+='<h4>'+data.restaurant_name+'</h4>';
	}
	if(!empty(data.cuisine)){
		html+='<p>'+data.cuisine+'</p>';
	}
	if(!empty(data.offers)){
		$.each( data.offers  , function( key_offer, val_offer ) {       	
       	   html +='<p class="bold">'+ val_offer.full +'</p>';			       	  			       	 
       });	
	}	
	html+='</ons-col>';	
	
	html+='<ons-col vertical-align="center" class="text-right raty-medium">';	
	//html+='<ons-icon icon="ion-android-star" size="14px" class="pink_color"></ons-icon> <span><b>'+ data.rating.ratings +'</b> ('+ data.rating.votes +')</span>';
	html+='<div class="raty-stars" data-score="'+ data.rating.ratings +'"></div>';
	html+='<p class="small">'+ data.rating.review_count +'</p>';
	html+='</ons-col>';	
	
	html+='</ons-row>';
	
	return html;
};

restoBanner = function(data){	
	html='<div class="banner relative" style="background-image: url('+ "'" + data.background_url + "'" +')" >';
	
			
		html +='<div class="is-loading large-loader">'; 
		  html +='<div class="spinner"></div>';		
		  html +='<img class="hide" src="'+ data.background_url +'">';	      
		html +='</div>'; 
	
	   html+='<div class="green_tag ' +  data.status_raw +'">'+ data.status +'</div>';
	   
	   html +='<div class="is-loading xxsmall-loader">'; 
	      html +='<div class="spinnerx"></div>';		
	      html+='<img class="logo" src="'+ data.logo +'">';
	   html +='</div>'; 
	   
	html+='</div>';
	return html;
};

restoTabMenu = function(data){
	x=0;
	html='<ons-carousel fullscreen swipeable auto-scroll overscrollable id="carousel_resto_menu" direction="horizontal" item-width="30%"  >';
	$.each( data  , function( key, val ) {
		is_selected = 'class="selected"';
		if (x>=1){
			is_selected='';
		}
		html+='<ons-carousel-item '+is_selected+' onclick="setClickTab('+ "'"+  val.page_name +"'," +  x  +')" >';
	     html+=val.label;
	    html+='<ons-ripple color="#EF6625" background="#ffffff"></ons-ripple>';
	    html+='</ons-carousel-item>';
	    x++;
	});
	html+='</ons-carousel>';
	return html;
};

restaurantCategory = function(data, element){
	if (data.length<=0){
		return;
	}	
	
	enabled_dish=''; disabled_image = '';
	if(app_settings = getAppSettings()){
		enabled_dish = app_settings.enabled_dish;
		disabled_image = app_settings.disabled_image_menu1;
	}
	
	/*alert("enabled_dish=>"+enabled_dish);
	alert("disabled_image=>"+disabled_image);*/
	
	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
		
		 html+='<ons-list-item expandable modifier="list_item_category">';
		   html+= '<b>'+val.category_name+'</b>';
		   
		   html+='<div class="expandable-content">';
		   
		   if(val.item.length>0){
		   	   html+='<ons-list>';
		   	   $.each( val.item  , function( item_key, item_val ) {
		   	   	 
		   	   	 html+='<ons-list-item tappable modifier="longdivider"  onclick="itemDetails('+ "'"+ item_val.item_id+"'," + "'" + val.cat_id + "'"  +')"  >';
		         html+='<div class="center">';
			     html+='<span class="list-item__title">'+ item_val.item_name +'</span>';
			     
			     if(enabled_dish==1){
				    if(item_val.dish_image.length>0){
				      html+='<ons-row>';		    
				         $.each( item_val.dish_image, function( d_key, d_val ) {      	             
				            html+='<ons-col vertical-align="top" width="35px">';
				                html +='<div class="is-loading">'; 
					            html +='<div class="spinner small"></div>';		
				                   html+='<img class="cuisine_image" src="'+d_val+'">';
				                html+='</div>';
				            html+='</ons-col>';
				       	  });
				      html+='</ons-row>';
				    }
			     }
			     
			     if(!empty(item_val.item_description)){
			         html+='<span class="list-item__subtitle">'+ item_val.item_description +' ';			         
			         
			         if(code_version=="1.4"){
			         	if (item_val.prices2.length>0){
			         		html+='<br/>';
			     			$.each( item_val.prices2  , function( pricekey, priceval ) {
			     				if(priceval.discount>0.001){
			     					html+='<ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+ '<span class="tag_discount">'+ priceval.original_price+'</span>' + priceval.discounted_price_pretty+'<price><br/>';
			     				} else {
			     					html+='<ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+priceval.original_price+'<price><br/>';
			     				}
			     			});
			     		}
			         } else {
				         if (item_val.prices.length>0){
				         	$.each( item_val.prices  , function( pricekey, priceval ) {
				         		html+='<br/><ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+priceval+'<price>';
				         	});			            
				         }
			         }
			         
			         
			         html+='</span>';
			     } else {
			     	html+='<span class="list-item__subtitle">';
			     	if(code_version=="1.4"){			     		 
			     		if (item_val.prices2.length>0){
			     			$.each( item_val.prices2  , function( pricekey, priceval ) {
			     				if(priceval.discount>0.001){
			     					html+='<ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+ '<span class="tag_discount">'+ priceval.original_price+'</span>' + priceval.discounted_price_pretty+'<price><br/>';
			     				} else {
			     					html+='<ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+priceval.original_price+'<price><br/>';
			     				}
			     			});
			     		}
			     	} else {
				     	if (item_val.prices.length>0){
				     		$.each( item_val.prices  , function( pricekey, priceval ) {
				     			html+='<ons-icon icon="ion-android-arrow-dropright" size="14px" style="color:#000;"></ons-icon> <price>'+priceval+'<price><br/>';
				     		});
				     	}		
			     	}	     	
			        html+='</span>';
			     }			     			     			     
			    html+='</div>';
			    
			    if(disabled_image!=1){
				    if(!empty(item_val.photo)){
				    html+='<div class="left">';
			          html+='<div class="list-item_square_thumbnail" style="background-image: url('+ "'" + item_val.photo + "'" +')"   >';
			          							         
						html +='<div class="is-loading small-loader">'; 
						html +='<div class="spinner"></div>';		
						html +='<img class="hide" src="'+ item_val.photo +'">';	      
						html +='</div>';   
			          
			          html+='</div>';
			        html+='</div>';        
				    }
			    }
		        
		        html+='</ons-list-item> ';
	    
		   	   }); 
		   	   html+='</ons-list>';
		   } else {
		   	  html+='<p>'+t("no item found on this category")+'</p>';
		   }
		   
		   html+='</div>';
		   
		 html+='</ons-list-item>';
		
	    var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	   
	});	
};

restaurantCategoryTwo = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	disabled_default_image = '';	
	
	$.each( data  , function( key, val ) {
					
		html+='<ons-list-item tappable onclick="showItemPage('+ "'" + val.cat_id + "'" +')">';
				 
		  if(!empty(val.category_pic)){
		  html+='<div class="left">';
		    html+='<div class="is-loading small-loader"><div class="spinner"></div><img class="list-item__thumbnail" src="'+ val.category_pic +'"></div>';
		  html+='</div>';
		  }
		  
		  html+='<div class="center">';
		    html+='<span class="list-item__title">'+ val.category_name +'</span>';
		    html+='<span class="list-item__subtitle">'+ val.category_description +'</span>';
		  html+='</div>';
		html+='</ons-list-item>';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
};

setItemList = function(data, element){
			
	
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	enabled_dish='';
	if(app_settings = getAppSettings()){
		enabled_dish = app_settings.enabled_dish;
	}
	
	$.each( data  , function( key, val ) {
				
		html+='<ons-list-item modifier="longdivider" tappable onclick="itemDetails('+ "'"+ val.item_id+"'," + "'" + val.cat_id + "'"  +')"  >';
		
		
		  if(!empty(val.photo)){
		  html+='<div class="left">';
		    html +='<div class="is-loading small-loader">'; 
		       html +='<div class="spinner"></div>';		
		       html+='<img class="list-item__thumbnail" src="'+ val.photo +'">';
		    html+='</div>';
		  html+='</div>';
		  }
		  
		  html+='<div class="center">';
		    html+='<span class="list-item__title">'+ val.item_name +'</span>';
		    
		    if(enabled_dish==1){
			    if(val.dish_image.length>0){
			      html+='<ons-row>';		    
			         $.each( val.dish_image, function( d_key, d_val ) {      	             
			            html+='<ons-col vertical-align="top" width="35px">';
			                html +='<div class="is-loading">'; 
				            html +='<div class="spinner small"></div>';		
			                   html+='<img class="cuisine_image" src="'+d_val+'">';
			                html+='</div>';
			            html+='</ons-col>';
			       	  });
			      html+='</ons-row>';
			    }
		    }
		    
		    if(!empty(val.item_description)){
		       html+='<span class="list-item__subtitle">'+ val.item_description +'</span>';
		    }
		    if (val.prices.length>0){
		    	html+='<span class="list-item__subtitle">';
		    	
		    	if(code_version=="1.4"){
		    		if (val.prices2.length>0){
		    			$.each( val.prices2  , function( pricekey, priceval ) {
		    				if(priceval.discount>0.001){
							  	html+= '<span class="tag_discount">'+ priceval.original_price+'</span>' + priceval.discounted_price_pretty + '<br/>';
							  } else {
							  	html+= ''+priceval.original_price + '<br/>';
							  }			    		  
		    			});
		    		}
		    	} else {
			    	$.each( val.prices  , function( pricekey, priceval ) {		    
			    		html+= ''+priceval + '<br/>';		    		
			    	});
		    	}
		    	
		    	html+='</span>';
		    }
		  html+='</div>';
		  
		html+='</ons-list-item>';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
	
};

setCategoryCarousel = function(data, selected_cat_id){
	
	cart_theme = getCartTheme();
	if(cart_theme==2){
		return;
	}
		
	selected_key = 0;
	if (data.length<=0){
		return;
	}		
	var html='';
	
	html+='<ons-carousel id="carousel_category" class="carousel_small" swipeable auto-scroll overscrollable direction="horizontal" item-width="30%" >';
	$.each( data  , function( key, val ) {		
		 is_selected = 'class="selected"';
		 if(val.cat_id!=selected_cat_id){
		 	is_selected='';		 	
		 } else {
		 	selected_key = key;
		 }
		 html+='<ons-carousel-item '+ is_selected +' onclick="reloadItemPage('+ "'" + val.cat_id + "'" +')" >';
		  html+= val.category_name;
		  html+='<ons-ripple color="#EF6625" background="#ffffff"></ons-ripple>';
		html+='</ons-carousel-item>';		
	});
	html+='</ons-carousel>';
	
	$(".cat_carousel_wrap").html( html );	
			
	setTimeout(function() {			
		document.querySelector('#carousel_category').setActiveIndex(selected_key);
	}, 500);
	
};



itemListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="itemDetails('+ "'"+ val.item_id+"'," + "'" + val.cat_id + "'"  +')">';
		  html+='<div class="left">';
		  
		    html +='<div class="is-loading xxsmall-loader">'; 
		       html +='<div class="spinner small"></div>';	
		       html+='<img class="list-item__thumbnail" src="'+ val.photo +'">';
		    html+='</div>';
		    
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.item_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.item_description + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};


var displayItemDetails = function(data, cart_data) {
	
	website_hide_foodprice = isHidePrice();
	
	enabled_dish='';
	if(app_settings = getAppSettings()){
		enabled_dish = app_settings.enabled_dish;
	}
	
	var html='';	
	if (!empty(cart_data.qty)){
		$(".item_qty").val( cart_data.qty );
		$(".add_to_cart").html( t("UPDATE CART") );
		html+='<input type="hidden" name="row" value="'+ cart_data.row +'">';
	}
		
	html+='<div class="item_preview" style="background-image: url('+ "'" + addslashes(data.photo) + "'" +')"  >';
		 
	html +='<div class="is-loading">'; 
	html +='<div class="spinner"></div>';		
	html +='<img class="hide" src="'+ data.photo +'">';	      
	html +='</div>'; 
	
	html+='</div>';
	
	html+='<div class="wrap">';	
	  html+= '<b>'+data.item_name+'</b>';
	  
	  html+= '<input type="hidden" name="item_id" value="'+data.item_id+'">';
	  html+= '<input type="hidden" name="two_flavors" class="two_flavors" value="'+data.two_flavors+'">';
	  	  
	  if (data.multiple_price==""){
	  	 if($.isArray(data.prices)) {	  	 	
	  	 	if(data.two_flavors!=2){
	  	 	   html+='<input type="hidden" name="price" value="'+ data.prices[0].price +'">';
	  	 	}
	  	 	if(!website_hide_foodprice){
	  	 	   size ='';
	  	 	   if( !empty(data.prices[0].size) ){
	  	 	   	   size = data.prices[0].size;
	  	 	   }
	  	 	   if ( data.prices[0].discount_price>0.0001 ){
	  	 	   	   html+= '<div class="price">'+ size +  '<span class="tag_discount">' + data.prices[0].formatted_price + '</span>' +   data.prices[0].formatted_discount_price  +'</div>';
	  	 	   } else {
	  	 	   	   html+= '<div class="price">'+ size +  '<span class="spacer">' + data.prices[0].formatted_price +'<span></div>';
	  	 	   }	  	       
	  	 	}
	  	 }
	  }
	  	  	  	  
	   if(enabled_dish==1){
	       if($.isArray(data.dish_list)) {	       
	       	  html+='<ons-row>';
	       	  $.each( data.dish_list, function( d_key, d_val ) {      	             
	            html+='<ons-col vertical-align="top" width="35px">';
	                html +='<div class="is-loading">'; 
		            html +='<div class="spinner"></div>';		
	                   html+='<img class="cuisine_image" src="'+d_val+'">';
	                html+='</div>';
	            html+='</ons-col>';
	       	  });
	       	  html+='</ons-row>';
	       }      
	   }
       
       html+='<p class="description">'+data.item_description+'</p>';
       
       /*PHOTO GALLERY*/
       if(data.gallery.length>0){
       	  html+='<div class="grey_line"></div>';
       	  html+='<div class="grey_list_wrapper">'
       	  html+= '<b>'+ t("PHOTOS") +'</b>';
       	  html+='</div>'
       	         	  
       	  html+='<div class="white_list_wrapper" style="padding:0;margin:0 0 10px;" >';       	  
       	  html+='<ons-carousel fullscreen swipeable auto-scroll overscrollable direction="horizontal" item-width="45%" >';	
       	   $.each( data.gallery, function( gallery_key, gallery_val ) {       	   	         	   	   
	       	   html+='<ons-carousel-item onclick="FullImageView(' + "'" +  addslashes(gallery_val) + "'" + ')">';       	  	       	   
	       	     html +='<div class="banner">';
	       	     
	       	     html +='<div>';
			     html +='<img class="hide" src="'+ gallery_val +'">';
			     html +='<div class="header_bg" style="height:100px;background-image: url('+ "'" + addslashes(gallery_val) + "'" +')"  >';
			      html +='<div class="spinner"></div>';			      
			     html +='</div>';
			     html +='</div>';						   
	       	     
	       	     html +='</div>';
	       	   html+='</ons-carousel-item>';
       	   });
       	  html+='</ons-carousel>';
       	  html+='</div>';
       	  
       }
	  
	html+='</div>';
	
	/*MULTIPLE PRICE*/	
	if(!website_hide_foodprice){
	if (data.multiple_price==1){
		html+='<ons-list modifier="list_grey">';
		    html+='<ons-list-header>'+ t("Price") +'</ons-list-header>';	    
		    if($.isArray(data.prices)) {
		    	$.each( data.prices, function( price_key, price_val ) {
		    		//html+='<ons-list-item>'+ price_val.formatted_price +'</ons-list-item>';	 
		    		
		    		value_price = price_val.price + "|"+ price_val.size +"|" +  price_val.size_id; 
		    		
		    		selected = '';
		    		if ( !empty(cart_data.price) ){
		    			if ( value_price ==  cart_data.price ){
		    				selected = 'checked';
		    			}
		    		} else {
		    			if(price_key<=0){
		    				selected = 'checked';
		    			} else {
		    				selected = '';
		    			}
		    		}
		    		   		
		    		html+='<ons-list-item tappable>';
		    		  html+='<label class="left">';
				        html+='<ons-radio name="price" input-id="price-'+price_key+'" value="'+ value_price +'"  '+selected+' ></ons-radio>';
				      html+='</label>';
				      
				      
				      
				      if ( price_val.discount_price>0.0001){
				      	 html+='<label for="price-'+price_key+'" class="center">' +  price_val.size + '<span class="tag_discount">'+price_val.formatted_price+'</span>' +   price_val.formatted_discount_price + '</label>';
				      } else {
				         html+='<label for="price-'+price_key+'" class="center">' + price_val.size + '<span class="spacer"></span>' +  price_val.formatted_price + '</label>';
				      }
				      
				      
		    		html+='</ons-list-item>';
		    	});
		    }
		html+='</ons-list>';
	}
	}
	
	/*SPECIAL INSTRUCTIONS*/
	html+='<ons-list modifier="list_grey">';
	  html+='<ons-list-header>' +  t("Special Request")  + '</ons-list-header>';	    	  
	html+='</ons-list>';
		
	notes_value = !empty(cart_data.notes)?cart_data.notes:'';
	html+='<textarea name="notes" class="textarea textarea--transparent full_width" rows="2" placeholder="'+ t("Your preferences or request") +'.." >'+ notes_value  +'</textarea>';	
	
	/*COOKING REF*/
	if(!empty(data.cooking_ref)) {		
	   html+='<ons-list modifier="list_grey">';
	   html+='<ons-list-header>' + t('Cooking Preference') +  '</ons-list-header>';	    	  	
		$.each( data.cooking_ref, function( cooking_ref_key, cooking_ref_val ) {
			
			selected = '';
    		if ( !empty(cart_data.cooking_ref) ){
    			if ( cooking_ref_val ==  cart_data.cooking_ref ){
    				selected = 'checked';
    			}
    		}
			
			html+='<ons-list-item tappable>';
    		  html+='<label class="left">';
		        html+='<ons-radio name="cooking_ref" value="'+cooking_ref_val+'" input-id="cooking_ref-'+cooking_ref_key+'" '+  selected +' ></ons-radio>';
		      html+='</label>';
		      html+='<label for="cooking_ref-'+cooking_ref_key+'" class="center">' + cooking_ref_val + '</label>';
    		html+='</ons-list-item>';
			
		});
	   html+='</ons-list>';
	} 
	
	/*INGREDIENTS*/
	if(!empty(data.ingredients)) {
		html+='<ons-list modifier="list_grey">';
	    html+='<ons-list-header>' + t('Ingredients') + '</ons-list-header>';	    
	    $.each( data.ingredients, function( ingredients_key, ingredients_val ) {
	    	html+='<ons-list-item tappable>';
	    	
	    	 selected = '';
    		 if ( !empty(cart_data.ingredients) ){    			
    			$.each( cart_data.ingredients, function( cart_ingredients_key, cart_ingredients_val ) {
    				if ( cart_ingredients_val == ingredients_val ){
    					selected = 'checked';
    				}
    			});
    		 }
	    	
	    	  html+='<label class="left">';
		        html+='<ons-checkbox  name="ingredients[]" value="'+ingredients_val+'" input-id="ingredients-'+ingredients_key+'"  '+ selected +' ></ons-checkbox>';
		      html+='</label>';
		      html+='<label for="ingredients-'+ingredients_key+'" class="center">'+ingredients_val+'</label>';		      
	    	
	    	html+='</ons-list-item>';
	    });
	    html+='</ons-list>';	  	
	}
	
	enabled_addon_desc = false;
	if(app_settings = getAppSettings()){
		enabled_addon_desc = app_settings.enabled_addon_desc;
	}	
	
	/*ADDDON*/
	if($.isArray(data.addon_item)) {
		$.each( data.addon_item, function( addon_key, addon_val ) {
			
			if ( !empty(addon_val.require_addons) ){
          	   if( addon_val.require_addons >=2){	          	   	   
          	   	   html+= '<input type="hidden" name="require_addons" class="require_addons" data-subcat_id="'+ addon_val.subcat_id +'" '+
          	   	   'data-subcat_name="'+ addon_val.subcat_name +'" '+
          	   	   'data-multi_option="'+ addon_val.multi_option +'" '+
          	   	   'data-multi_option_val="'+ addon_val.multi_option_val +'" '+
          	   	   'value="'+ '' +'" '+
          	   	   '/>';
          	   }
            }
			
			html+='<ons-list modifier="list_grey">';
	        html+='<ons-list-header>'+addon_val.subcat_name+'</ons-list-header>';	
	        
	          if($.isArray(addon_val.sub_item)) {
	          	  $.each( addon_val.sub_item, function( subitem_key, subitem_val ) {
	          	  		          	  	  	       
	          	  	  dump("multi_option=>"+ addon_val.multi_option)
	          	  	  switch(addon_val.multi_option)
	          	  	  {
	          	  	  	case "one":	          	  	  	 
	          	  	  	  html+= priceRadio(addon_val.subcat_id ,  subitem_val , cart_data , addon_val.two_flavor_position , enabled_addon_desc );
	          	  	  	break;
	          	  	  	
	          	  	  	case "multiple":
	          	  	  	  html+= priceCheckbox(addon_val.subcat_id ,  subitem_val , cart_data , enabled_addon_desc);
	          	  	  	break;
	          	  	  	
	          	  	  	case "custom":
	          	  	  	  html+= priceCheckboxCustom(addon_val.subcat_id , addon_val.multi_option_val,  subitem_val , cart_data, enabled_addon_desc);
	          	  	  	break;
	          	  	  	
	          	  	  }
	          	  });
	          }
	        
	        html+='</ons-list>';
		});
	}
	
	
	return html;
};


var priceRadio = function(cat_id,  data , cart_data, two_flavor_position, enabled_addon_desc) {
	
	hide_price = isHidePrice();
	
	//field_name = "subitem_"+cat_id;
	field_name = "sub_item["+cat_id+"][]";
	item_value = data.sub_item_id+"|"+data.price+"|"+data.sub_item_name + "|" + two_flavor_position;	
	
	selected = ''; 
	if(!empty(cart_data)){
		if(!empty(cart_data.sub_item)){ 
			$.each( cart_data.sub_item[cat_id], function( cart_data_key, cart_data_val ) {
				if (  item_value == cart_data_val) {
					selected = 'checked';			
				}
			});
		}
	}
	
	if(hide_price){
		data.pretty_price='';
	}
	
	html='';
	html+='<ons-list-item tappable>';
	    	
	  html+='<label class="left">';
        html+='<ons-radio class="item_addon_'+cat_id+' two_flavor_position_'+ two_flavor_position +' " name="'+field_name+'" value="'+item_value+'" input-id="addon-'+ cat_id + data.sub_item_id+'" '+ selected +' ></ons-radio>';
      html+='</label>';
      html+='<label for="addon-'+cat_id+data.sub_item_id+'" class="center">'+data.sub_item_name + '<span class="spacer"></span>' + data.pretty_price +  '</label>';		      
	
	html+='</ons-list-item>';
	
	if(enabled_addon_desc==1){
		html+='<ons-list-item>';
		 html+='<span class="list-item__subtitle">'+ data.item_description +'</span>';
		html+='</ons-list-item>';
	}	
	
	return html;
};

var priceCheckboxCustom = function(cat_id, limited_value, data , cart_data, enabled_addon_desc ) {
		
	hide_price = isHidePrice();
	
	//field_name = "subitem_"+cat_id;
	field_name = "sub_item["+cat_id+"][]";
	item_value = data.sub_item_id+"|"+data.price+"|"+data.sub_item_name;
	
	if(hide_price){
		data.pretty_price='';
	}	
	
	selected = ''; 
	if(!empty(cart_data)){
		if(!empty(cart_data.sub_item)){ 
			$.each( cart_data.sub_item[cat_id], function( cart_data_key, cart_data_val ) {
				if (  item_value == cart_data_val) {
					selected = 'checked';			
				}
			});
		}
	}
	
	html='';
	html+='<ons-list-item tappable>';
	    	
	  html+='<label class="left">';
        html+='<ons-checkbox name="'+field_name+'" class="subitem_custom item_addon_'+cat_id+'" data-limited="'+limited_value+'" data-id="'+cat_id+'" value="'+ item_value +'" input-id="addon-'+cat_id+data.sub_item_id+'" '+ selected +' ></ons-checkbox>';
      html+='</label>';
      html+='<label for="addon-'+cat_id+data.sub_item_id+'" class="center">'+data.sub_item_name + '<span class="spacer"></span>' + data.pretty_price +  '</label>';		      
	
	html+='</ons-list-item>';
	
	if(enabled_addon_desc==1){
		html+='<ons-list-item>';
		 html+='<span class="list-item__subtitle">'+ data.item_description +'</span>';
		html+='</ons-list-item>';
	}		
	
	return html;
};


var priceCheckbox = function(cat_id, data , cart_data , enabled_addon_desc ) {

	hide_price = isHidePrice();

	//field_name = "subitem_"+cat_id;
	field_name = "sub_item["+cat_id+"][]";
	item_value = data.sub_item_id+"|"+data.price+"|"+data.sub_item_name;
	

	selected = ''; qty = 1;
	if(!empty(cart_data)){	
		if(!empty(cart_data.sub_item)){
			$.each( cart_data.sub_item[cat_id], function( cart_data_key, cart_data_val ) {
				dump("cart_data_val =>" + cat_id);
				dump(cart_data_val);
				if (  item_value == cart_data_val) {
					selected = 'checked';
					qty = cart_data.addon_qty[cat_id][cart_data_key];
				}			
			});
		}
	}
	
	if(hide_price){
	   data.pretty_price='';	
	}
	
	html='';
	html+='<ons-list-item tappable modifier="qty_center">';
	    	
	  html+='<label class="left">';
        html+='<ons-checkbox class="item_addon_'+cat_id+'"  name="'+field_name+'" value="'+ item_value +'" input-id="addon-'+cat_id+data.sub_item_id+'"  '+ selected +' ></ons-checkbox>';
      html+='</label>';
      html+='<label style="width:140px;" for="addon-'+cat_id+data.sub_item_id+'" class="center">'+data.sub_item_name + '<span class="spacer"></span>' + data.pretty_price +  '</label>';		      
      
      //html+='<div class="right"><ons-input id="qty" modifier="transparent" value="1" placeholder="Qty" ></ons-input></div>';
      
       html+='<div class="right" style="width:140px;">';
       html+='<ons-row class="quantity_wrap">';
         html+='<ons-col >';    
           html+='<ons-button modifier="quiet" class="full_width" onclick="minusQty( $(this) )" ><ons-icon icon="md-minus" size="15px" ></ons-icon></ons-button>';
         html+='</ons-col>';
         
         html+='<ons-col>';
            html+='<ons-input name="addon_qty['+ cat_id +'][]" class="addon_qty numeric_only" id="addon_qty" modifier="transparent" value="'+qty+'"  ></ons-input>';
         html+='</ons-col>';
         
         html+='<ons-col >';
           html+='<ons-button modifier="quiet" class="full_width" onclick="addQty( $(this) )" ><ons-icon icon="md-plus" size="15px"></ons-icon></ons-button>';
         html+='</ons-col>';
       html+='</ons-row>  ';
      html+='</div>';
      
	
	html+='</ons-list-item>';
	
	if(enabled_addon_desc==1){
		html+='<ons-list-item>';
		 html+='<span class="list-item__subtitle">'+ data.item_description +'</span>';
		html+='</ons-list-item>';
	}
	return html;
};


/*DISPLAY CART DETAILS*/
var displayCartDetails = function(datas){
	data = datas.data;	
	dump(data);
	
	var html='';
			
	html+='<div class="cart_header" style="background-image: url('+ "'" + datas.merchant.background_url + "'" +')"   >';
	  html+='<div class="light_layer absolute"></div>';
	  	  
	html +='<div class="is-loading medium-loader">'; 
	html +='<div class="spinner"></div>';		
	html +='<img class="hide" src="'+ datas.merchant.background_url +'">';	      
	html +='</div>'; 
	  
	html+='</div>';
	html+='<div class="cart_merchant_name small_raty">';
	    html+= datas.merchant.restaurant_name;
	   html+='<div class="raty-stars" data-score="'+ datas.merchant.rating +'"></div>';
	html+='</div>';
	
	
	html+='<ons-list>';	
	if(!empty(data.item)) {		
		$.each( data.item, function( item_key, item_val ) {
			html+='<ons-list-item tappable modifier="nodivider" >';
			   html+='<div class="left" onclick="itemDetails('+ "'" + item_val.item_id +  "'," + "'" + item_val.category_id + "'," + "'" + item_key  + "'"   +')" ><span class="notification green">'+ item_val.qty +'</span></div>';
			   html+='<div class="center" onclick="itemDetails('+ "'" + item_val.item_id +  "'," + "'" + item_val.category_id + "'," + "'" + item_key  + "'"   +')"  > '+ item_val.item_name +'  </div>';
			   html+='<div class="right"><ons-button modifier="quiet" onclick="removeCartItem( '+  item_key +' )" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button></div>';
			html+='</ons-list-item>';
			
			
			html+='<ons-list-item modifier="nodivider normal_list" >';
			  if ( item_val.discount>0 ){
			  	price_used = item_val.discounted_price;
			  	html+='<div class="left">' +  item_val.size_words + " "  +  '<span class="tag_discount">'+prettyPrice(item_val.normal_price)+'</span>' + " "   + prettyPrice(item_val.discounted_price)  + '</div>';
			  } else {			  	
			  	price_used = number_format(item_val.normal_price,2,'.','');
			  	html+='<div class="left">' + item_val.size_words + " " + prettyPrice(item_val.normal_price) + '</div>';
			  }			  					  
			  html+='<div class="right">'+  prettyPrice( parseFloat(price_used)*parseFloat(item_val.qty) )  +'</div>';
			html+='</ons-list-item>';
			
			/*COOKING REF*/			
			if (!empty(item_val.cooking_ref)){
				html+='<ons-list-item modifier="nodivider normal_list" >';
				  html+=  item_val.cooking_ref;
				html+='</ons-list-item>';
			}
			
			/*NOTES*/
			if (!empty(item_val.order_notes)){
				html+='<ons-list-item modifier="nodivider normal_list" >';
				  html+=  item_val.order_notes;
				html+='</ons-list-item>';
			}
			
			/*INGREDIENTS*/
			if (!empty(item_val.ingredients)){
				html+='<ons-list-item modifier="nodivider normal_list" >';
				html+= '<div class="left">'+ t("Ingredients") +' :</div>' ;				
				ingredients_list='';   
				$.each( item_val.ingredients, function( ingredients_key, ingredients_val ) {
					 ingredients_list+= ingredients_val+',';
				});
				html+= '<div class="center">'+ingredients_list+'</div>' ;				
				html+='</ons-list-item>';
			}
			
			/*SUB ITEM*/
			if (!empty(item_val.new_sub_item)){
				$.each( item_val.new_sub_item, function( new_sub_item_key, new_sub_item_val ) {
					html+='<ons-list-item modifier="nodivider normal_list" >';
					    html+='<ons-list-header style="padding-left:0;"><span class="list-item__subtitle">'+ new_sub_item_key +'</span></ons-list-header>';
					    $.each( new_sub_item_val , function( new_sub_item_val_key, new_sub_item_val_val ) {
					    	dump(new_sub_item_val_val);
					    	html+='<ons-row>';
					    	  html+='<ons-col vertical-align="center" width="70px" >'+ new_sub_item_val_val.addon_qty + 'x' + prettyPrice(new_sub_item_val_val.addon_price)  +'</ons-col>';
					    	  html+='<ons-col vertical-align="center" >'+ new_sub_item_val_val.addon_name  +'</ons-col>';
					    	  html+='<ons-col vertical-align="center" class="text_right" width="40px" >'+  prettyPrice(parseFloat(new_sub_item_val_val.addon_qty)*parseFloat(new_sub_item_val_val.addon_price))  +'</ons-col>';
					    	html+='</ons-row>';
					    });
					html+='</ons-list-item>';
				});
			}
			
			html+='<ons-list-item modifier="divider" >';				  
			html+='</ons-list-item>';
			
			
		});
		
		
		html+='<ons-list-item modifier="nodivider normal_list" >';				  
		  html+='<div class="right">';
		  html+='<ons-button modifier="quiet small_button" onclick="confirmClearCart();" >'+ t("CLEAR CART") +'</ons-button>';
		  html+='</div>';
	    html+='</ons-list-item>';
		
	} else {
		dump('no row');
	}	
	
	/*EURO TAX*/
	var is_apply_tax = false;	
	if(!empty(datas.is_apply_tax)){
		if(datas.is_apply_tax==1){
			is_apply_tax=true;
		}
	}
	/*END EURO TAX*/
	
	/*CHECK IF THERE IS APPLY VOUCHER*/
	less_voucher = 0;
	
	if(!is_apply_tax){
		if (!empty(data.total.less_voucher)){
			less_voucher = parseFloat(data.total.less_voucher);
			if(less_voucher>0.0001){
				remove_voucher = '<ons-button modifier="quiet" onclick="removeVoucher()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
				voucher_percentage = '';
				if( !empty(data.total.voucher_type)){
					voucher_percentage  = "<span class=\"spacer\"></span>" +  data.total.voucher_type;
				}
				html+= twoColumn( t('Less Voucher') + voucher_percentage +  "<span class=\"spacer\"></span>" +  remove_voucher ,  "("+prettyPrice(less_voucher)+")" );
			}
		}
	}
	
	
	if(!is_apply_tax){
		if (!empty(data.total.discounted_amount)){
			discounted_amount = parseFloat(data.total.discounted_amount);
			discount_percentage = parseFloat(data.total.merchant_discount_amount);
			if(discounted_amount>0.0001){
				html+= twoColumn( t('Discount') + '<span class=\"spacer\"></span>' + discount_percentage +  "%<span class=\"spacer\"></span>"  ,  "("+prettyPrice(discounted_amount)+")" );
			}
		}
	}
	
	/*CHECK IF POINTS IS APPLIED*/
	if(!is_apply_tax){
		if (!empty(data.total.pts_redeem_amt_orig)){
			remove_pts = '<ons-button modifier="quiet" onclick="removePoints()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
			html+= twoColumn( t('Points Discount') +  "<span class=\"spacer\"></span>" +  remove_pts ,  "("+prettyPrice(data.total.pts_redeem_amt_orig) +")" );
		}
	}
	
		
	if(!is_apply_tax){
	   html+= twoColumn( t('Sub Total') ,  prettyPrice(data.total.subtotal) );
	}
	
	/*APPLY VOUCHER*/
	if(less_voucher>0.0001){
		
	} else {
		html+= voucherColumn();	
	}	
	
	has_tips = false;
	if (!empty(data.total.tips)){
		if(data.total.tips>0.0001){
			has_tips=true;			
		}
	}
			
	/*TIPS*/
	if(has_tips==false){	
	   html+= tipColumn(datas.tip_list);
	}
		
	/*POINTS ADDON*/
	if( datas.points_enabled==1 || datas.points_enabled=="1"){
				
		if(datas.cart_details.points_apply>0){
			html+='<div class="points_wrap">';
				if (!empty(datas.pts_label_earn)){				
					html+='<p class="green_label" style="margin-top:0;margin-bottom:0;">'+ datas.pts_label_earn +'</p>';
				}		
			html+='</div>';
		} else {
			html+='<div class="points_wrap">';
			if (!empty(datas.pts_label_earn)){				
				html+='<p class="green_label" style="margin-top:0;margin-bottom:0;">'+ datas.pts_label_earn +'</p>';
			}		
			if (empty(datas.pts_disabled_redeem)){
				if(datas.available_points>0){
					html+='<ons-list-item modifier="nodivider">';
					   html+='<div class="left"><ons-input type="number" id="redeem_points" class="redeem_points numeric_only" modifier="underbar" placeholder="' + t('Redeem Points') + '" float></ons-input></div>';
					   html+='<div class="right"><ons-button modifier="quiet quiet_green" onclick="redeemPoints()">' + t("REDEEM") + '</ons-button></div>';
					html+='</ons-list-item>';
				}
			}
			if (!empty(datas.available_points_label)){						
				if(datas.available_points>0){
				    html+='<p class="green_label" style="margin-top:0;">'+ datas.available_points_label +'</p>';
				}
			}
			html+='</div>';
		}
	}
	/*END POINTS ADDON*/
		
	
	/*SMS ORDER VERIFICATION*/
	/*if(settings = AppSettings()){
   	  	 if(settings.order_verification=="2"){
   	  	 	html+='<ons-list-item modifier="nodivider">';
			   html+='<div class="left"><ons-input id="order_sms_code" class="order_sms_code" modifier="underbar" placeholder="Enter Code" float></ons-input></div>';
			   html+='<div class="right"><ons-button modifier="quiet quiet_green" onclick="verifyOrderSMS()">APPLY</ons-button></div>';
			html+='</ons-list-item>';
			
			html+='<ons-list-item modifier="nodivider">';
			   html+='<div class="left small">This merchant has required SMS verification before you can place your order.</div>';
			   html+='<div class="right"><ons-button modifier="quiet quiet_green" onclick="getSMSCode()">GET SMS</ons-button></div>';
			html+='</ons-list-item>';
   	  	 }   	  	 
   	} */  	
	
	if (!empty(data.total.delivery_charges)){
		if(data.total.delivery_charges>0.0001){
		   html+= twoColumn( t('Delivery Fee') ,  prettyPrice(data.total.delivery_charges) );
		}
	}
	
	/*SERVICE FEE*/
	
	if (!empty(data.total.service_fee_value)){
			if(data.total.service_fee_value>0.0001){
				var per = data.total.service_fee_percentage.replace('%','');
			   html+= twoColumn( t('Service Fee') + " " + (per) + "%" ,  prettyPrice(data.total.service_fee_value) );
			}
		}
	
	if (!empty(data.total.merchant_packaging_charge)){
		if(data.total.merchant_packaging_charge>0.0001){
		   html+= twoColumn( t('Packaging'),  prettyPrice(data.total.merchant_packaging_charge) );
		}
	}
	
	if(!is_apply_tax){
		if (!empty(data.total.taxable_total)){
			if(data.total.taxable_total>0.0001){
			   html+= twoColumn( t('Tax') + " " + (data.total.tax*100) + "%" ,  prettyPrice(data.total.taxable_total) );
			}
		}
	}
	
	
	/*EURO TAX*/
	if(is_apply_tax){
		
		if (!empty(data.total.pts_redeem_amt_orig)){
			remove_pts = '<ons-button modifier="quiet" onclick="removePoints()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
			html+= twoColumn( t('Points Discount') +  "<span class=\"spacer\"></span>" +  remove_pts ,  "("+prettyPrice(data.total.pts_redeem_amt_orig) +")" );
		}
		
		if(has_tips){
		   remove_tips = '<ons-button modifier="quiet" onclick="removeTip()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
		   html+= twoColumn( t('Tips') + " "+ data.total.tips_percent + "<span class=\"spacer\"></span>" + remove_tips ,  prettyPrice(data.total.tips) );		
		}
		
		if (!empty(data.total.less_voucher)){
			less_voucher = parseFloat(data.total.less_voucher);
			if(less_voucher>0.0001){
				remove_voucher = '<ons-button modifier="quiet" onclick="removeVoucher()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
				voucher_percentage = '';
				if( !empty(data.total.voucher_type)){
					voucher_percentage  = "<span class=\"spacer\"></span>" +  data.total.voucher_type;
				}
				html+= twoColumn( t('Less Voucher') + voucher_percentage +  "<span class=\"spacer\"></span>" +  remove_voucher ,  "("+prettyPrice(less_voucher)+")" );
			}
		}
		
		if (!empty(data.total.discounted_amount)){
			discounted_amount = parseFloat(data.total.discounted_amount);
			discount_percentage = parseFloat(data.total.merchant_discount_amount);
			if(discounted_amount>0.0001){
				html+= twoColumn( t('Discount') + '<span class=\"spacer\"></span>' + discount_percentage +  "%<span class=\"spacer\"></span>"  ,  "("+prettyPrice(discounted_amount)+")" );
			}
		}
		
		html+= twoColumn( t('Sub Total') ,  prettyPrice(data.total.subtotal) );
		html+= twoColumn( t('Tax') + " " + (data.total.tax*100) + "%" ,  prettyPrice(data.total.taxable_total) );
	}
	/*END EURO TAX*/
			
	if(!is_apply_tax){
		if(has_tips){		   
		   remove_tips = '<ons-button modifier="quiet" onclick="removeTip()" ><ons-icon class="remove" icon="md-close"></ons-icon></ons-button>';
		   html+= twoColumn( t('Tips') + " "+ data.total.tips_percent + "<span class=\"spacer\"></span>" + remove_tips ,  prettyPrice(data.total.tips) );		
		}
	}
	
	$(".cart_total_value").val('');
	
	if (!empty(data.total.total)){
		if(data.total.total>0){
		   html+= twoColumn( t('Total') ,  prettyPrice(data.total.total) );
		   $(".cart_total").html( prettyPrice(data.total.total) );
		   $(".cart_total_value").val(  prettyPrice(data.total.total) );
		   $(".cart_total_value_raw").val(  data.total.total );
		   $(".cart_sub_total").val(  data.total.subtotal );
		}
	}
	
	/*MIN ORDER TABLE*/
	if(!empty(datas.cart_details.min_delivery_order)){
  	    $(".min_delivery_order").val( datas.cart_details.min_delivery_order );
	} else {
		$(".min_delivery_order").val('');
	}
	
	/*LIST THE SERVICES OFFER BY MERCHANT*/
	/*services = datas.services;
	if(!empty(services)){		
		$.each( services, function( services_key, services_val ) {
			html+='<ons-list-item tappable modifier="nodivider">';
			  html+='<label class="left">';
		        html+='<ons-radio name="transaction_type" input-id="transaction_type_'+services_key+'" value="'+services_key+'" ></ons-radio>';
		      html+='</label>';
		      html+='<label for="transaction_type_'+services_key+'" class="center">';
		        html+= services_val;
		      html+='</label>';
		    html+='</ons-list-item>';
		});
	}*/
	
	
	services = datas.services;
	
	dump(services);
	selected_services = datas.transaction_type ;  	
	selected_delivery_date = '';
	selected_delivery_time='';
	
	selected_delivery_address = t('Please enter address here');
	
	selected_delivery_date = datas.default_delivery_date;
	default_delivery_date_pretty = datas.default_delivery_date_pretty;
	
	delivery_date_set = getStorage("delivery_date_set");
	delivery_date_set_pretty = getStorage("delivery_date_set_pretty");
	if(!empty(delivery_date_set)){
		selected_delivery_date = delivery_date_set;
	} else {
		setStorage("delivery_date_set",selected_delivery_date);
	}
	if(!empty(delivery_date_set_pretty)){
		default_delivery_date_pretty = delivery_date_set_pretty;
	}
	
	delivery_time_set = getStorage("delivery_time_set");
	if(!empty(delivery_time_set)){
		selected_delivery_time = delivery_time_set;
	}
		
	if(empty(selected_services)){			
		selected_services='delivery';
	}	
	
	$(".transaction_type").val( selected_services );
	$(".delivery_date").val( selected_delivery_date );
	
	var delivery_date_list_label = '';
	var delivery_time_list_label = '';
	
	switch (datas.transaction_type){
		case "delivery":
		  delivery_date_list_label = t('Delivery Date');
		  delivery_time_list_label = t('Delivery Time');
		break;
		
		case "pickup":
		  delivery_date_list_label = t('Pickup Date');
		  delivery_time_list_label = t('Pickup Time');
		break;
		
		case "dinein":
		  delivery_date_list_label = t('Dinein Date');
		  delivery_time_list_label = t('Dinein Time');
		break;
	}
	
	
	html+='<ons-list-header>' + t('Options') +'</ons-list-header>';	
	
	html+='<ons-list-item modifier="chevron longdivider" tappable onclick="showTransactionList()" >';	
	   html+='<div class="left">'+ t('Transaction Type') +'</div>';
	   html+='<div class="right"><span class="list-item__subtitle transaction_type_label">'+ t(services[selected_services])  +'</span></div>';
	html+='</ons-list-item>';
	
	html+='<ons-list-item tappable modifier="chevron longdivider" onclick="showDeliveryDateList()" >';	
	  html+='<div class="left">'+ delivery_date_list_label +'</div>';
	   html+='<div class="right"><span class="list-item__subtitle delivery_date_label">'+ default_delivery_date_pretty +'</span></div>';
	html+='</ons-list-item>';
	
	html+='<ons-list-item tappable modifier="chevron longdivider" onclick="showDeliveryTime()" >';	
	  html+='<div class="left">' + delivery_time_list_label + '</div>';
	   html+='<div class="right"><span class="list-item__subtitle delivery_time_label">'+ selected_delivery_time +'</span></div>';
	html+='</ons-list-item>';
	
	if ( datas.transaction_type == "delivery" ){
		
		if ( datas.checkout_stats.is_pre_order!=1){
			html+='<ons-list-item>';
		      html+='<div class="center">';
		        html+= t("Delivery Asap");
		      html+='</div>';
		      html+='<div class="right">';
		        html+='<ons-switch id="delivery_asap" class="delivery_asap" value="1" onclick="setAsap()"></ons-switch>';
		      html+='</div>';
		    html+='</ons-list-item>';
		}
		
		if ( !empty(datas.cart_details)){
			if ( !empty(datas.cart_details.street)){
				selected_delivery_address = datas.cart_details.street;
				selected_delivery_address+=" ";
				selected_delivery_address+= datas.cart_details.city;
				selected_delivery_address+=" ";
				selected_delivery_address+= datas.cart_details.state;
				selected_delivery_address+=" ";
				selected_delivery_address+= datas.cart_details.zipcode;
				$(".delivery_address").val( selected_delivery_address );
			}
		}
		
		//html+='<ons-list-item tappable modifier="chevron longdivider" onclick="showPage(\'address_form.html\')" >';	
		html+='<ons-list-item tappable modifier="chevron longdivider" onclick="initAddress()" >';	
		  html+='<div class="left">' + t("Delivery Address")  +'</div>';
		   html+='<div class="right"> <span class="list-item__subtitle delivery_address_label concat-text">'+ selected_delivery_address +'</span></div>';
		html+='</ons-list-item>';
	}
	
	html+='<div style="height:40px;"></div>';	
	html+='</ons-list>';
	return html;
};

var twoColumn = function(label, value){
	var html='<ons-list-item modifier="nodivider">';
	   html+='<div class="left">'+ label +'</div>';
	   html+='<div class="right">'+ value +'</div>';
	html+='</ons-list-item>';
	return html;
};

var voucherColumn = function(){
	
	if(settings = getMerchantSettings()){
		if(settings.enabled_voucher!="yes"){
			return '';
		}
	}
	
	var html='<ons-list-item modifier="nodivider">';
	   html+='<div class="left"><ons-input id="voucher_name" class="voucher_name" modifier="underbar" placeholder="' + t('Enter voucher here') + '" float></ons-input></div>';
	   html+='<div class="right"><ons-button modifier="quiet quiet_green" onclick="applyVoucher()">' + t("APPLY") +'</ons-button></div>';
	html+='</ons-list-item>';
	return html;
};

tipColumn = function(data){
	
	if(settings = getMerchantSettings()){
		if(settings.enabled_tip!="2"){
			return '';
		}
	}
	
	merchant_tip_default = '';
	if(settings = getMerchantSettings()){
		merchant_tip_default = settings.tip_default;
	}
		
	var tip_list='';
	 tip_list+='<ons-select id="tips" class="tips" style="width:170px;" >';
	    if(!empty(data)){
	      $.each( data, function( key, val ) {
	      	selected ='';
	      	if (key==merchant_tip_default){
	      		selected='selected';
	      	}
	      	tip_list+='<option value="'+key+'" '+selected+' >'+val+'</option>';
	      });	      	      
	    }
	 tip_list+='</ons-select>';
	 	 
	
	var html='<ons-list-item modifier="nodivider">';
	   html+='<div class="left">'+  tip_list +'</div>';
	   html+='<div class="right"><ons-button modifier="quiet quiet_green" onclick="applyTips()">' + t("TIPS") + '</ons-button></div>';
	html+='</ons-list-item>';
	return html;
}

var displayList = function(data, transaction_type ){
	var html='';
	html+='<ons-list>';
	  $.each( data, function( key, val ) {
	  	 if (transaction_type=="delivery_time"){
	  	 	html+='<ons-list-item tappable modifier="longdivider" onclick="setFieldValue(' + "'" + transaction_type + "'," + "'" + val + "','" + addslashes(val) + "'"  + ' )" ><div class="center">'+ val +'</div></ons-list-item>';
	  	 } else {
	  	 	html+='<ons-list-item tappable modifier="longdivider" onclick="setFieldValue(' + "'" + transaction_type + "'," + "'" + key + "','" + addslashes(val) + "'"  + ' )" ><div class="center">'+ t(val) +'</div></ons-list-item>';
	  	 }	     
	  });
	html+='</ons-list>';
	return html;
};

fillAddressBook = function(data){
	var html='';
	html+='<ons-select name="addressbook_id" id="addressbook_id" class="full_width addressbook_id" required>';
	$.each( data, function( key, val ) {	
		 is_selected="";
		 if(val.as_default==2){
		 	is_selected='selected'
		 }
		 html+='<option value="'+ val.id +'" '+ is_selected +'>'+ val.address +'</option>';	
	});
	html+='</ons-select>'; 
	return html;
};

var displayPaymentList = function(data){
	var html='';
	html+='<ons-list>';
	  $.each( data, function( key, val ) {
	  	 html+='<ons-list-item tappable modifier="longdivider" >';
   		   html+='<label class="left">';
	        html+='<ons-radio name="payment_provider" class="payment_provider" input-id="payment_provider-'+key+'" value="'+ val.payment_code +'"  ></ons-radio>';
	       html+='</label>';
	       
	       html+='<label for="payment_provider-'+key+'" class="center">' + val.payment_name + '</label>';
	       	  	   
	  	 html+='</ons-list-item>';
	  });
	html+='</ons-list>';
	return html;
};

accountMenu = function(login){
	
	var html='';	
	
	html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'settings.html\');" >';
	  html+='<div class="left">';
	    html+='<ons-icon icon="md-settings" size="25px" class="list-item__icon"></ons-icon>';
	  html+='</div>';
	  html+='<div class="center">';
	    html+= t('Settings');
	  html+='</div>';
	html+='</ons-list-item>';
	
	if(app_settings = getAppSettings()){
		if(app_settings.addon.driver){
			html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'driver_signup.html\');" >';
			  html+='<div class="left">';
			    html+='<ons-icon icon="md-car" size="25px" class="list-item__icon"></ons-icon>';
			  html+='</div>';
			  html+='<div class="center">';
			    html+= t('Driver Signup');
			  html+='</div>';
			html+='</ons-list-item>';
		}
		
	    if(app_settings.contact_us.enabled_contact){
		html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'contact_us.html\');" >';
		  html+='<div class="left">';
		    html+='<ons-icon icon="md-email" size="25px" class="list-item__icon"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+= t('Contact Us');
		  html+='</div>';
		html+='</ons-list-item>';
		}
		
	}
		
	
	if (login){
		
		 html+='<ons-list modifier="list_menu">';
	      html+='<ons-list-item modifier="chevron" tappable onclick="showPage(\'notifications.html\')" >';
	        html+='<div class="left"><ons-icon icon="md-notifications" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Notifications') +  '</div>';
	      html+='</ons-list-item>';
		
		 //html+='<ons-list modifier="list_menu">';
	      html+='<ons-list-item modifier="chevron" tappable onclick="showPage(\'order_list.html\')" >';
	        html+='<div class="left"><ons-icon icon="fa-cocktail" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Order History') +  '</div>';
	      html+='</ons-list-item>';
	      
	      if(app_settings.merchant_tbl_book_disabled!=2){
	      html+='<ons-list-item modifier="chevron" tappable  onclick="showPage(\'booking_history.html\')" >';
	        html+='<div class="left"><ons-icon icon="md-receipt" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Booking History') +'</div>';
	      html+='</ons-list-item>';
	      }
	      
	      if(app_settings.addon.points){
		       //html+='<ons-list modifier="list_menu">';
		      html+='<ons-list-item modifier="chevron" tappable onclick="showPage(\'points_list.html\')" >';
		        html+='<div class="left"><ons-icon icon="md-view-week" size="22px"></ons-icon></div>';
		        html+='<div class="center">' + t('Points') +  '</div>';
		      html+='</ons-list-item>';
	      }
	      
	      //html+='<ons-list modifier="list_menu">';
	      html+='<ons-list-item modifier="chevron" tappable onclick="showPage(\'favorite_list.html\')" >';
	        html+='<div class="left"><ons-icon icon="md-favorite-outline" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Favorites') +  '</div>';
	      html+='</ons-list-item>';
	      
	      if(app_settings.disabled_cc_management!="yes"){
		  //html+='<ons-list modifier="list_menu">';
	      html+='<ons-list-item modifier="chevron" tappable onclick="showPage(\'creditcard_list.html\')" >';
	        html+='<div class="left"><ons-icon icon="md-card" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Your Credit Cards') +  '</div>';
	      html+='</ons-list-item>';
	      }
	            
	      html+='<ons-list-item modifier="chevron" tappable  onclick="showPage(\'addressbook_list.html\')" >';
	        html+='<div class="left"><ons-icon icon="md-pin-drop" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Your Address Book') +'</div>';
	      html+='</ons-list-item>';
	      
	      html+=getCustomPages(1);
	      
	      html+='<ons-list-item modifier="chevron" tappable  onclick="logout();" >';
	        html+='<div class="left"><ons-icon icon="ion-log-out" size="22px"></ons-icon></div>';
	        html+='<div class="center">' + t('Log out') +'</div>';
	      html+='</ons-list-item>';
	      	      
		
	} else {		
		
		html+=getCustomPages(1);
		
		html+='<ons-list-item tappable onclick="Pagelogin(1)">';
		  html+='<div class="left">';
		    html+='<ons-icon icon="md-account-o" class="list-item__icon" size="25px"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+= t('Log in');
		  html+='</div>';
		html+='</ons-list-item>';
		html+='</ons-list>';
	}
	
	$("#account_menu").html( html );
};

filAddress = function(id, data){
	$(id+" .street").val( data.street);
	$(id+" .city").val( data.city);
	$(id+" .state").val( data.state);
	$(id+" .zipcode").val( data.zipcode);
	$(id+" .location_name").val( data.location_name);
	$(id+" .contact_phone").val( data.contact_phone);
	$(id+" .delivery_instruction").val( data.delivery_instruction);
};

fillCountry = function(id, data, value){
	if (data.length<=0){
		return;
	}
	
	var html='<ons-select id="country_code" class="country_code" name="country_code" >';
    $.each( data , function( key, val ) {
    	selected = '';
    	if(key==value){
    		selected = 'selected';
    	}
    	html+='<option value="'+ key +'" ' + selected +'>'+ val +'</option>';
    });
    html+='</ons-select>';
    $(id+" .country_list_wrap").html( html );
};

settingsMenu = function(login){
	
	var html='';
	
	html+='<ons-list-title modifier="list_title_grey">'+ t("YOU") +'</ons-list-title>';
	
	if(login){
		html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'edit_profile.html\');" >';
		  html+='<div class="left">';
		    html+='<ons-icon icon="md-edit" size="25px" class="list-item__icon"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+= t('Edit profile');
		  html+='</div>';
		html+='</ons-list-item>';
		
		html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'change_password.html\');" >';
		  html+='<div class="left">';
		    html+='<ons-icon icon="md-key" size="25px" class="list-item__icon"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+= t('Change password');
		  html+='</div>';
		html+='</ons-list-item>';
	}	
	
	
	html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'language_list.html\');" >';
	  html+='<div class="left">';
	    html+='<ons-icon icon="md-globe-alt" size="25px" class="list-item__icon"></ons-icon>';
	  html+='</div>';
	  html+='<div class="center">';
	    html+= t('Language');
	  html+='</div>';
	html+='</ons-list-item>';
	
	html+='<ons-list-title modifier="list_title_grey">'+ t("ABOUT US") +'</ons-list-title>';
	
	html+='<ons-list-item tappable  >';
	  html+='<div class="left">';
	    html+='<ons-icon icon="md-tablet-android" size="25px" class="list-item__icon"></ons-icon>';
	  html+='</div>';
	  html+='<div class="center">';
	    html+= t('App version');
	  html+='</div>';	  
	  html+='<div class="right">';
	   if(isdebug()){
	   	  html+= code_version;
	   } else {
	   	  try{
	   	     html+= BuildInfo.version;
	   	  } catch(err) {
	         html+= code_version;
	      } 
	   }	  
	  html+='</div>';	  
	html+='</ons-list-item>';
	
	html+='<ons-list-item tappable modifier="chevron" onclick="showPage(\'device_id.html\');" >';
	  html+='<div class="left">';
	    html+='<ons-icon icon="md-smartphone-info" size="25px" class="list-item__icon"></ons-icon>';
	  html+='</div>';
	  html+='<div class="center">';
	    html+= t('Device Information');
	  html+='</div>';	  	  
	html+='</ons-list-item>';
	

	html+=getCustomPages(2);
	
	if(login){
	   html+='<ons-list-title modifier="list_title_grey">'+ t("RECEIVE PUSH NOTIFICATION") +'</ons-list-title>';
	   	  
      html+='<ons-list-item >';
        html+='<div class="left"><ons-icon icon="md-notifications-active" size="22px"></ons-icon></div>';
        html+='<div class="center"></div>';
        html+='<div class="right">';
          html+='<ons-switch name="enabled_push" id="enabled_push" class="enabled_push" value="1" onchange="EnabledPush()" ></ons-switch>';
        html+='</div>';
      html+='</ons-list-item>';   
	}
	
	$("#settings_menu").html( html );
};


setOrderList = function(data, element){
		
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
				
	  html+='<ons-list-item modifier="full_list list_style1" tappable onclick="actionSheetOrder('+ val.order_id+ ',' + val.add_review + ',' + val.add_cancel + ',' + val.add_track +  ')" >';
	   html+='<div class="inner">';
		   html+='<ons-row>';
		   
		     html+='<ons-col width="60px" vertical-align="center" >';
		       html+='<div class="is-loading">'; 
		          html +='<div class="spinner"></div>';	
		          html+='<img class="thumbnail" src="' + val.logo +'">';
		       html+='</div>';
		     html+='</ons-col>';
		     
		     html+='<ons-col width="160px" vertical-align="top">';
		        html+='<h5>'+ val.merchant_name +'</h5>';
		        html+='<p class="small">'+ val.transaction +'</p>';
		        html+='<p class="small">'+ val.payment_type+'</p>';
		        
		        if(!empty(val.cancel_status)){
		          html+='<p class="small blues">'+ val.cancel_status+'</p>';
		        }
		        
		        html+='<div class="raty-medium"><div class="raty-stars" data-score="'+ val.rating +'"></div></div>';
		     html+='</ons-col>';
		     
		     html+='<ons-col vertical-align="top" class="text-right" >';
		     html+='<span class="notification '+ val.status_raw +'">'+ val.status +'</span>';
		     
		     html+='</ons-col>';
		     
		   html+='</ons-row>';
		   
		   html+='<div class="grey_line"></div>   ';
		   
		   html+='<ons-row class="last" >';
		       html+='<ons-col width="80%" vertical-align="center" >';
		        html+='<p>'+  val.date_created +'</p>';
		       html+='</ons-col>';
		       html+='<ons-col vertical-align="center" class="text-right" >';
		       html+='<P class="price">' +  val.total_w_tax +   '</P>';
		       html+='</ons-col>';
		   html+='</ons-row>';
	   html+='</div>';
	  html+='</ons-list-item> ';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
	
};

setBookingList = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
				
	    html+='<ons-list-item modifier="full_list list_style1" tappable onclick="ViewBookingDetails('+ val.booking_id+')" >';
		html+='<div class="inner">';
		   html+='<ons-row>';
		     html+='<ons-col width="60px" vertical-align="center" >'
		     
		       html+='<div class="is-loading">'; 
		       html +='<div class="spinner"></div>';
		       html+='<img class="thumbnail" src="'+  val.logo +'">'
		       html+='</div>';
		       
		      html+='</ons-col>';
		      
		     html+='<ons-col width="160px" vertical-align="top">';
		        html+='<h5>'+ val.merchant_name +'</h5>';
		        html+='<p class="small">'+ val.booking_ref+'</p>';
		        html+='<p class="small">'+ val.number_guest +'</p>';
		        		        
		     html+='</ons-col>';
		     
		     html+='<ons-col vertical-align="top" class="text-right" >';
		     html+='<span class="notification '+ val.status_raw +' ">'+ val.status +'</span>';
		     html+='</ons-col>';
		     
		   html+='</ons-row>';
		   
		   html+='<ons-row class="rating_wrap raty-medium">';
			      html+='<ons-col width="95px"><div class="raty-stars" data-score="'+ val.rating.ratings +'"></div></ons-col>';
			      html+='<ons-col>'+ val.rating.review_count +'</ons-col>';
			    html+='</ons-row>';
		   
		   html+='<div class="grey_line"></div>';
		   
		   html+='<ons-row class="last" >';
		       html+='<ons-col width="80%" vertical-align="center" >';
		        html+='<p>'+ val.date_created +'</p>';
		       html+='</ons-col>';
		   html+='</ons-row>';
		html+='</div>';
		html+='</ons-list-item>';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
	
};



setFavoriteList = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
				
	   html+='<ons-list-item modifier="full_list list_style1" tappable onclick="actionSheetFavorites('+ "'"+val.id+"'," + "'"+ val.merchant_id  + "'" +')" >';
	   html+='<div class="inner raty-medium">';
		   html+='<ons-row>';
		   html+='<ons-col>';
		   
			html +='<div class="is-loading medium-loader">'; 
			html +='<div class="spinner"></div>';		
			html +='<img class="hide" src="'+val.background_url+'">';	      
			html +='</div>'; 

		   
		     html+='<div class="fav_banner" style="background-image: url('+ "'" + val.background_url + "'" +')" ></div>';
		     html+='<h5>'+ val.merchant_name +'</h5>';
		     html+='<p class="small">'+ val.date_added +'</p>';
		   
		     html+='<ons-row class="rating_wrap">';
			      html+='<ons-col width="95px"><div class="raty-stars" data-score="'+ val.rating.ratings +'"></div></ons-col>';
			      html+='<ons-col>'+ val.rating.review_count +'</ons-col>';
			  html+='</ons-row>';
		     
		   html+='</ons-col>';
		   html+='</ons-row>';   	  
	   html+='</div>';
	  html+='</ons-list-item> ';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
	
};

setCreditCardList = function(data, element){
		
	current_page_id = onsenNavigator.topPage.id;
	
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {

	  if(current_page_id == "select_creditcards"){
	  	
	  	html+='<ons-list-item tappable modifier="longdivider full_list" >';
		  html+='<label class="left">';
			html+='<ons-radio name="cc_id" input-id="radio-'+key+'" value="'+ val.id +'" ></ons-radio>';
		  html+='</label>';
		  html+='<label for="radio-'+key+'" class="center">';
			html+= val.credit_card_number;
			html+='<p class="list-item__subtitle small">'+val.card_name+'</p>';
			html+='<p class="list-item__subtitle small">'+val.date_added+'</p>';
		  html+='</label>';
		html+='</ons-list-item>';
	  	
	  } else {	 	
	  	
		  html+='<ons-list-item modifier="longdivider full_list" tappable onclick="actionSheetCards('+val.id+')">';
		      html+='<div class="left">';
		        html+='<ons-icon icon="fa-credit-card" class="list-item__icon"></ons-icon>';
		      html+='</div>';
		      html+='<div class="center">';	        
		        html+='<span class="list-item__title">'+val.credit_card_number+'</span>';
		        html+='<p class="list-item__subtitle small">'+val.card_name+'</p>';
		        html+='<p class="list-item__subtitle small">'+val.date_added+'</p>';
		      html+='</div>';
		  html+='</ons-list-item>';
	  }

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
	
};

setAddressBookList = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {

		selected = '';	
		if (val.as_default==2){
			selected = 'orange_color';	
		}
		
	  html+='<ons-list-item modifier="longdivider full_list" tappable onclick="actionSheetBook('+val.id+')">';
	      html+='<div class="left">';
	        html+='<ons-icon icon="ion-ios-home" class="list-item__icon '+ selected +' "></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';	        
	        html+='<span class="list-item__title">'+val.address+'</span>';	        
	        html+='<p class="list-item__subtitle small">'+val.date_added+'</p>';
	      html+='</div>';
	  html+='</ons-list-item>';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});	
};

setlanguageList = function(data, element, selected_lang){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {

		is_selected = '';
		if(val==selected_lang){
			is_selected='orange_color';
		}
		
	  html+='<ons-list-item modifier="longdivider full_list" tappable onclick="setLanguage('+ "'" + val + "'"  +')">';
	      html+='<div class="left">';
	        html+='<ons-icon icon="md-check" class="list-item__icon  '+is_selected+' "></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';
	        html+= val;
	      html+='</div>';
	  html+='</ons-list-item>';
	  
	  
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});	
};

setOrderDetails = function(data, element){
	
	var html='';
	
	html+='<div class="white_wrapper">';
	html+='<div class="wrap">';
		html+='<ons-row>';
		   html+='<ons-col width="58px" vertical-align="center" >';
		   
		     html+='<div class="is-loading">'; 
		       html +='<div class="spinner"></div>';		
		       html+='<img class="thumbnail" src="'+ data.logo +'">';
		     html+='</div>';
		     
		   html+='</ons-col>';
		   html+='<ons-col width="50%" vertical-align="center" >';
		    html+='<h5>'+ data.merchant_name+'</h5>';
		    html+='<p class="small print_trans">'+ data.transaction +'</p>	    ';
		    html+='<p class="small">'+ data. payment_type+'</p>	   ';
		   html+='</ons-col>';
		   
		   html+='<ons-col vertical-align="center" >';
		      html+='<div class="raty-stars" data-score="'+ data.rating+'"></div>';
		   html+='</ons-col>';
		html+='</ons-row>';
	html+='</div>';
	
	html+='<div class="grey_line tickline"></div>';

   $(element).html( html );
	
};

setOrderHistory = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
				
	  html+='<ons-list-item modifier="longdivider full_list" tappable >';
	      html+='<div class="left">';
	        html+='<ons-icon icon="ion-ios-circle-outline" class="list-item__icon"></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';	        
	        html+='<span class="list-item__title">'+val.status+'</span>';
	        html+='<p class="list-item__subtitle small">'+val.remarks+'</p>';
	        html+='<p class="list-item__subtitle small">'+val.date+'</p>';
	      html+='</div>';
	  html+='</ons-list-item>';

		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';	    
	});
};

orderListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="ViewOrder('+ val.order_id+')" >';
		  html+='<div class="left">';
		    html+='<img class="list-item__thumbnail" src="'+ val.logo +'">';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.restaurant_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.transaction + '</span>';
		    html+='<span class="list-item__subtitle">' + val.payment_type + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

formatOrder = function(data){
	var html='<ons-list modifier="transparent">';
	  
	  	  html+='<ons-list-item modifier="list_style3" >';
	  	   html+='<div class="inner">';
	  	   $.each( data, function( key, val ) {
		  	  	 html+='<ons-row>';
		  	  	   html+='<ons-col width="50%" class="label">'+ val.label +'</ons-col>';
		  	  	   html+='<ons-col >'+ val.value +'</ons-col>';
		  	  	 html+='</ons-row>';
	  	  	 });
	  	  html+='</div>';
	  	  html+='</ons-list-item>';	  
	html+='</ons-list>';
	return html;
};


FavoriteListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="removeFavorite('+ val.id+')" >';
		  html+='<div class="left">';
		    html+='<img class="list-item__thumbnail" src="'+ val.logo +'">';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.merchant_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.date_added + '</span>';		    
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

templateError = function(title, message){
	var html='';
	html+='<div class="no_order_wrap">';
	html+='<div class="center">';
	  html+='<h4>'+ title +'</h4>';
	  html+='<p class="small">'+ message +'</p>';
	html+='</div>';
	html+='</div>';
	return html;
};

merchantAbout = function(data, element){
	
	if (data.length<=0){
		return;
	}
	
	var html='';
	
	background_url='';
	if(app_settings = getAppSettings()){
		background_url = app_settings.images.image2;		
	}
	
	html+='<div class="fixed_header header_about" style="background-image: url('+ "'" + background_url + "'" +')"  >';
	
	html +='<div class="is-loading large-loader">'; 
	html +='<div class="spinner"></div>';		
	html +='<img class="hide" src="'+ background_url +'">';	      
	html +='</div>'; 

	
     html+='<div class="dim_background absolute"></div>';
    html+='</div>';
	
	html+='<div class="wrap content_page">';
	   html+='<h3>'+ data.restaurant_name +'</h3>';
	   
	   if(!empty(data.cuisine)){
	   html+='<p class="sub">'+ data.cuisine +'</p> ';
	   }
	   
	   if(!empty(data.services)){
	   html+='<p class="sub">'+ data.services +'</p> ';
	   }
	   
	   if(!empty(data.restaurant_phone)){
	   	  if(app_settings.remove_contact!=1){
	         html+='<p class="sub">'+ t("Tel#") +' :<a href="tel:'+data.restaurant_phone+' ">'+data.restaurant_phone+'</a></p> ';
	   	  }
	   }
	   
	   if(!empty(data.website)){	   	   
	   	   html+='<ons-button modifier="quiet link_button" onclick="browseLink( '+ "'" + data.website + "'" +' )" >';
	   	   html+=data.website ;
	   	   html+='</ons-button>';
	   }
	   
	   html+='<ons-row class="rating_wrap">';
	      html+='<ons-col width="110px"><div class="raty-stars" data-score="'+ data.rating.ratings +'"></div></ons-col>';
	      html+='<ons-col>'+ data.review_count +'</ons-col>';
	   html+='</ons-row>';
	 html+='</div>';
	 
	 html+='<div class="grey_line"></div>';
	 html+='<div class="wrap content_page">';
	   html+='<h4>'+ t("OPEN IN") +'</h4>';
	   html+='<ul class="opening_hours">';
	   	    	     
	    if(data.opening.length>0){
	    	$.each( data.opening  , function( key, val ) {
	    		html+='<li>';	    		
	    		 html+='<ons-row >';
	    		   html+='<ons-col width="100px">';
	    		   html+= val.day;
	    		   html+='</ons-col>';
	    		   
	    		   html+='<ons-col>';
	    		   html+= val.hours;
	    		   html+='</ons-col>';	    		   
	    		 html+='</ons-row>';
	    		 
	    		if(!empty(val.open_text)){
	    		   html+='<p class="small">'+ val.open_text +'</p>';
	    		}	    	
	    		html+='</li>';
	    	});
	    } else {
	    	html+='<p class="small">'+ t("not available") +'</p>';
	    }	    
	    
	   html+='</ul>';
	 html+='</div>';
	 html+='<div class="grey_line"></div>';
	 
	 html+='<div class="wrap content_page">';
	   html+='<h4>'+ t("PAYMENT METHOD") +'</h4>';
	   html+='<ons-list>';
	   
	    if(data.payment.length>0){
	    	$.each( data.payment  , function( key, val ) {
			     html+='<ons-list-item>';
			      html+='<div class="left">';
			        html+='<ons-icon icon="ion-card" class="list-item__icon"></ons-icon>';
			      html+='</div>';
			      html+='<div class="center">';
			        html+= val.label;
			      html+='</div>';
			    html+='</ons-list-item>';
		    });
	    } else {
	    	html+='<p class="small">'+ t("Not available") +'</p>';
	    }
	   
	   html+='</ons-list>';
	 html+='</div>';
	 
	 html+='<div class="map_half" id="map_info"  style="border:1px solid #e0dcdb;"></div>';

	 html+='<div class="wrap content_page">';
	  html+='<h4>'+ t("INFORMATION")+'</h4>';
	  html+='<p>'+ data.information +'</p>';
	 html+='</div>';
	 
	 html+='<div class="bottom_gap"></div>';
	
	$(element).html( html );
		
	setTimeout(function(){				
	   merchantLocation('#map_info', data.latitude, data.lontitude, data.complete_address );
	}, 500);
			
};


setReviewList = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
		
	 html+='<ons-list-item modifier="longdivider full_list" tappable >';
	   html+='<ons-row>';
	     html+='<ons-col width="60px" vertical-align="center" >';
	        html +='<div class="is-loading xxsmall-loader">'; 
	          html +='<div class="spinner"></div>';		
	           html+='<img class="small_avatar" src="'+ val.avatar +'">';
	        html +='</div>'; 
	     html+='</ons-col>';
	     html+='<ons-col width="160px" vertical-align="top"><h5>'+ val.customer_name +'</h5><p class="small">'+ val.date_posted +'</p></ons-col>';
	     html+='<ons-col vertical-align="top"><div class="raty-stars" data-score="'+ val.rating +'"></div></ons-col>';
	   html+='</ons-row>';
	   html+='<div class="gap"></div>';
	   html+=val.review;
	  html+='</ons-list-item> ';
	
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    	    
	    if(val.reply.length>0){
	    	$.each( val.reply  , function( key2, val2 ) {
	    		
	    	  html+='<ons-list-item modifier="longdivider full_list" tappable >';
			   html+='<ons-row>';
			     html+='<ons-col width="60px" vertical-align="center" >';
			       html +='<div class="is-loading xxsmall-loader">'; 
	                 html +='<div class="spinner"></div>'
			         html+='<img class="small_avatar" src="'+ val2.logo +'">';
			       html +='</div>'; 				
			     html+='</ons-col>';
			     html+='<ons-col width="160px" vertical-align="top"><h5>'+ val2.customer_name +'</h5><p class="small">'+ val2.date_posted +'</p></ons-col>';			     
			   html+='</ons-row>';
			   html+='<div class="gap"></div>';
			   html+=val2.review;
			  html+='</ons-list-item> ';
			  
			  var newItem = ons.createElement(html);
	          list.appendChild(newItem);
	          html='';
	    		
	    	});
	    }
	    
	});	
};

setDateList = function(data, element){
	var html='';
	html+='<ons-select id="date_booking" name="date_booking" class="date_booking full_width" onchange="ChangeTimeList()" >';
	$.each( data  , function( key, val ) {
		html+='<option value="'+key+'">'+val+'</option>';
	});	
	html+='</ons-select>'
	$(element).html(html );
};

setTimeList = function(data, element){
	var html='';
	html+='<ons-select id="booking_time" name="booking_time" class="booking_time full_width" >';
	$.each( data  , function( key, val ) {
		html+='<option value="'+key+'">'+val+'</option>';
	});	
	html+='</ons-select>'
	$(element).html(html );
};


setGallery = function(data, element){
	
	dump(data.length);
	if (data.length<=0){
		return;
	}	
	
	var list = document.getElementById(element);
	html=''; col = '';
	x=1; xx=1;
	
	var total_data = parseInt(data.length)+0;
	
	$.each(data, function(key, val){
				
		
		 col+='<ons-col width="50%" onclick="FullImageView( '+ "'" + val + "'" +' )" >';
	        col+='<div class="banner">';
	        
				col +='<div class="is-loading">'; 
				col +='<div class="spinner"></div>';		
				col +='<img class="hide" src="'+ val +'">';	      
				col +='</div>'; 
	         
			      col+='<div class="header_bg" style="background-image: url('+ "'" + val + "'" +')"  ></div>';
			   col+='</div>';
	     col+='</ons-col>';
			 
		  
		if (x==2){
			x=0;
			 html+='<ons-list-item tappable modifier="nodivider" >';
			 html+=col;
			 html+='</ons-list-item>';
			 col='';
			 
			 newItem = ons.createElement(html);
			 list.appendChild(newItem);
		     html='';
		} else {
			if(xx>=total_data){
				 html+='<ons-list-item tappable modifier="nodivider" >';
				 html+=col;
				 html+='</ons-list-item>';
				 col='';
				 
				 newItem = ons.createElement(html);
				 list.appendChild(newItem);
			     html='';
			}
		}
				
	    x++;	  	 
	    xx++;
		
	});
	
};

setMerchantInformation = function(data, element){
	
	html=''; 
	
	background_url='';
	if(app_settings = getAppSettings()){
		background_url = app_settings.images.image2;		
	}
	
	html+='<div class="fixed_header header_info" style="background-image: url('+ "'" + background_url + "'" +')"  >';
	
	html +='<div class="is-loading large-loader">'; 
	html +='<div class="spinner"></div>';		
	html +='<img class="hide" src="'+ background_url+'">';	      
	html +='</div>'; 

	
     html+='<div class="dim_background absolute"></div>';
    html+='</div>';
    
    html+='<div class="wrap content_page">';
      html+='<h4>'+ t("INFORMATION") +'</h4>';
      html+='<p>'+ data +'</p>';
    html+='</div>';
    $(element).html(html );
}

setPromo = function(data, element){
	
	var list = document.getElementById( element );
	var html='';
		
	if(!empty(data.offer)){
	if (data.offer.length>0){
		$.each(data.offer, function(key, val){			
			html+='<ons-list-item modifier="longdivider full_list" tappable >';
			   html+='<ons-row>';
			     html+='<ons-col vertical-align="top"><h5>'+t("Offers")+'</h5></ons-col>';
			   html+='</ons-row>';
			   html+='<div class="gap"></div>';
			    html+= val;
			 html+='</ons-list-item>';			
			
			var newItem = ons.createElement(html);
		    list.appendChild(newItem);
		    html='';	    
		});			
	}
	}
	
	if(!empty(data.voucher)){
	if (data.voucher.length>0){
		$.each(data.voucher, function(key, val){			
			html+='<ons-list-item modifier="longdivider full_list" tappable >';
			   html+='<ons-row>';
			     html+='<ons-col vertical-align="top"><h5>'+t("Vouchers")+'</h5></ons-col>';
			   html+='</ons-row>';
			   html+='<div class="gap"></div>';
			    html+= val;
			 html+='</ons-list-item>';			
			
			var newItem = ons.createElement(html);
		    list.appendChild(newItem);
		    html='';	    
		});			
	}
	}
	
	if(!empty(data.free_delivery)){
	if (data.free_delivery.length>0){
		$.each(data.free_delivery, function(key, val){			
			html+='<ons-list-item modifier="longdivider full_list" tappable >';
			   html+='<ons-row>';
			     html+='<ons-col vertical-align="top"><h5>'+t("Delivery")+'</h5></ons-col>';
			   html+='</ons-row>';
			   html+='<div class="gap"></div>';
			    html+= val;
			 html+='</ons-list-item>';			
			
			var newItem = ons.createElement(html);
		    list.appendChild(newItem);
		    html='';	    
		});			
	}		 
	}
};



setPointSummary = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
		
	      html+='<ons-list-item tappable modifier="chevron longdivider list_style2" onclick="pointsDetails('+ "'" + val.point_type + "'" +')" > ';
		   html+='<ons-row>';
		     html+='<ons-col width="70px" vertical-align="center" ><span class="notification">'+ val.value+'</span></ons-col>';
		     html+='<ons-col vertical-align="center" >'+ val.label +'</ons-col>';
		   html+='</ons-row>';
		  html+='</ons-list-item>';
	
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});	
};


setPointDetails = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {			     
		html+='<ons-list-item tappable modifier="longdivider full_list" >';
	    html+='<ons-row>';
	      html+='<ons-col width="70px" vertical-align="center" ><span class="notification">'+ val.points +'</span></ons-col>';
	      html+='<ons-col vertical-align="center" >';
	          html+='<h5>'+ val.label +'</h5>';
              html+='<p class="small">'+ val.date +'</p>';
	      html+='<ons-col>';
	    html+='</ons-row>';
	    html+='</ons-list-item>';
	
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});	
};



CategoryListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="showItemPage('+ "'"+ val.cat_id + "'"  +')">';
		  html+='<div class="left">';
		      html +='<div class="is-loading xxsmall-loader">'; 
		        html +='<div class="spinner small"></div>';		
		        html+='<img class="list-item__thumbnail" src="'+ val.photo +'">';
		      html+='</div>';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.category_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.category_description + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

setGetRecentLocation = function(data, element_id){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		
		//setRecentSearch = function(address, lat, lng, street, city,  state, zipcode, location_name){
		//html+='<ons-list-item class="recent_loc_child" tappable onclick="setRecentSearch('+ "'" + val.search_address + "',"+ "'"+ val.latitude + "'," +  "'"  + val.longitude + "'" +')" >';
		params_data = clickFormat( val.search_address+ "|" + val.latitude + "|"+ val.longitude + "|" + val.street  + "|" + val.city  + "|" + val.state  + "|" + val.zipcode  + "|" + val.location_name );
		html+='<ons-list-item class="recent_loc_child" tappable onclick="setRecentSearch('+ params_data +')" >';
		  html+='<div class="left">';
		    html+='<ons-icon icon="ion-ios-loop" class="list-item__icon"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		      html+='<span class="list-item__title">'+ val.search_address +'</span>';
		      html+='<span class="list-item__subtitle">'+ val.date_created +'</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

setMerchantFoodList = function(data, element_id){
	
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		
		if(val.restaurant=="restaurant"){
			html+='<ons-list-item tappable  onclick="ReplaceMerchant('+ val.merchant_id +')" >';
		} else if ( val.restaurant=="cuisine" ) {
			html+='<ons-list-item tappable  onclick="showRestaurantListCuisine('+ "'"+ 'byCuisine'  +"'," + val.id +')" >';
		} else {
		   html+='<ons-list-item tappable  onclick="loadMerchantWithFood('+ "'" +val.merchant_id + "',"+ "'" + val.id + "'," + "'" + val.category + "'" +' )" >';
		}
		  html+='<div class="left">';
		    html+='<img class="list-item__thumbnail" src="'+ val.logo +'">';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.title + '</span>';
		    html+='<span class="list-item__subtitle">' + val.sub_title + '</span>';
		    html+='<span class="list-item__subtitle">' + t("Search type") + ": " + t(val.restaurant) + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
				
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};


setRecentSearchList = function(data, element_id){
	
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
				
		html+='<ons-list-item tappable onclick="showSearchForm('+ "'" + val.search_string + "'"  +')" class="recent_search_child" >';
		  html+='<div class="left">';
		    html+='<ons-icon icon="ion-ios-search" class="list-item__icon"></ons-icon>';
		  html+='</div>';
		  html+='<div class="center">';
		      html+= val.search_string ;
		  html+='</div>';
		html+='</ons-list-item>';
						
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

transportationList = function(){
	if(settings = getAppSettings()){
		html='<ons-select name="transport_type_id" id="transport_type_id" required >';
		$.each( settings.addon.driver_transport  , function( key, val ) {
			 html+='<option value="'+key+'">'+ t(val) +'</option>';
		});
		html+='</ons-select>';
		return html;
	}
	return ;
};

orderSMSForm = function(){
	
	var html='';
	
	html+='<div class="form_wrapper">';
    html+='<ons-list>';
    
    html+='<ons-list-item class="wrap">';
      html+='<h3 style="margin:0;">SMS Verification</h3>';
      html+='<p class="small">This merchant has required SMS verification before you can place your order.';
      html+='<ons-button modifier="quiet quiet_green" onclick="sendOrderSMSCode()">Click here</ons-button> to receive your order sms code';
      html+='</p>';
    html+='</ons-list-item>';
    
    html+='<ons-list-item>';
       html+='<div class="center">';
       html+='<ons-input type="number" name="order_sms_code" id="order_sms_code" class="order_sms_code" ';
       html+='modifier="underbar" placeholder="Ente Code" max="4" min="4" float ></ons-input>';
       html+='</div>';
    html+='</ons-list-item>';
    html+='<ons-list>';
    html+='</div> ';
    
    html+='<div class="bottom_gap"></div>';    
	
    return html;
};

setPayOnDeliveryCardList = function(data, element){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	$.each( data  , function( key, val ) {
		
		html+='<ons-list-item tappable modifier="longdivider full_list" >';
		  html+='<label class="left">';
			html+='<ons-radio name="card_id" input-id="radio-'+key+'" value="'+ val.payment_name +'" ></ons-radio>';
		  html+='</label>';
		  html+='<label for="radio-'+key+'" class="center">';
		    html +='<div class="is-loading">'; 
		      html +='<div class="spinner"></div>';		
		      html+='<img class="card_list" src="'+val.payment_logo+'" />';
		    html +='</div>';
		  html+='</label>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
};

restaurantListColumn = function(data, element){
	var list = document.getElementById(element);
	html='';
	
	var list = document.getElementById(element);
	html=''; col = '';
	x=1; xx=1;
	
	var total_data = parseInt(data.length)+0;
		
	$.each(data, function(key, val){
				 
		 col+='<ons-col width="50%" vertical-align="top" onclick="loadMerchant('+ val.merchant_id+')" >';
			col+='<div class="banner">';
			
				col +='<div class="is-loading">'; 
				col +='<div class="spinner"></div>';		
				col +='<img class="hide" src="'+ val.background_url +'">';	      
				col +='</div>'; 
			
			  col+='<div class="header_bg" style="background-image: url('+ "'" + val.background_url + "'" +')"></div>';			  
			  if(!empty(val.open_status_raw)){
	             col+='<div class="green_tag '+val.open_status_raw+'">'+val.open_status+'</div>'
	          }	          
              if(!empty(val.sponsored)){
			   	  col+='<div class="sponsored_tag">'+ val.sponsored +'</div>';
			  }
			   
			col+='</div> ';
			col+='<h4 class="is_rtl_text_right">'+val.restaurant_name+'</h4>';
			col+='<p class="concat_text is_rtl_text_right">'+val.cuisine+'</p>';
			col+='<ons-row class="rating_wrap raty-small">';
			  col+='<ons-col vertical-align="top"><div class="raty-stars" data-score="'+ val.rating.ratings +'"></div></ons-col>';
			  col+='<ons-col vertical-align="top">'+ val.rating.review_count +'</ons-col>';
			col+='</ons-row>';
         col+='</ons-col>';
			 
		          
		if (x>=2){
			x=0;
			 html+='<ons-list-item tappable modifier="nodivider list_column" >';
			 html+=col;
			 html+='</ons-list-item>';
			 col='';
			 
			 newItem = ons.createElement(html);
			 list.appendChild(newItem);
		     html='';
		} else {
			//alert( "else " + total_data +"=>"+ + xx);
			if(xx>=total_data){
				 html+='<ons-list-item tappable modifier="nodivider list_column" >';
				 html+=col;
				 html+='</ons-list-item>';
				 col='';
				 
				 newItem = ons.createElement(html);
				 list.appendChild(newItem);
			     html='';
			}
		}
				
	    x++;	  	 
	    xx++;
		
	});
		
};

restaurantCategoryColumn = function(data, element){	
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	html=''; col = '';
	x=1; xx=1;
	
	var total_data = parseInt(data.length)+0;
	
	disabled_default_image = '';	
	
	$.each( data  , function( key, val ) {
				
		col+='<ons-col width="50%" vertical-align="top"  onclick="showItemPage('+ "'" + val.cat_id + "'" +')" >';
		
			/*col+='<div class="banner">';
			col+='<div class="header_bg" style="background-image: url('+ "'" + val.category_pic + "'" +')" ></div>';			
			col+='</div> ';*/
			
			col+='<div class="banner">';
			  col +='<div class="is-loading">'; 
			  col +='<div class="spinner"></div>';		
			  col +='<img class="hide" src="'+val.category_pic+'">';	      
			  col +='</div>'; 
			col+='<div class="header_bg" style="background-image: url('+ "'" + val.category_pic + "'" +')" ></div>';			
			col+='</div> ';
			
			col+='<h4>'+val.category_name+'</h4>';
			col+='<p class="concat_text">'+ val.category_description +'</p>';
         col+='</ons-col>';    
		
		if (x>=2){
			x=0;
			 html+='<ons-list-item tappable modifier="nodivider list_column" >';
			 html+=col;
			 html+='</ons-list-item>';
			 col='';
			 
			 newItem = ons.createElement(html);
			 list.appendChild(newItem);
		     html='';
		} else {			
			if(xx>=total_data){
				 html+='<ons-list-item tappable modifier="nodivider list_column" >';
				 html+=col;
				 html+='</ons-list-item>';
				 col='';
				 
				 newItem = ons.createElement(html);
				 list.appendChild(newItem);
			     html='';
			}
		}
		
		x++;	  	 
	    xx++;
	});
		
};

setItemListColumn = function(data, element){
	
	if (data.length<=0){
		return;
	}	
	
	var list = document.getElementById(element);
	html=''; col = '';
	x=1; xx=1;
	
	var total_data = parseInt(data.length)+0;
	
	enabled_dish='';
	if(app_settings = getAppSettings()){
		enabled_dish = app_settings.enabled_dish;
	}
	
	$.each( data  , function( key, val ) {
						         
         col+='<ons-col width="50%" vertical-align="top" onclick="itemDetails('+ "'"+ val.item_id+"'," + "'" + val.cat_id + "'"  +')"  >';
			col+='<div class="banner">';
			
			  col +='<div class="is-loading">'; 
			  col +='<div class="spinner"></div>';		
			  col +='<img class="hide" src="'+val.photo+'">';	      
			  col +='</div>'; 
			
			  col+='<div class="header_bg" style="background-image: url('+ "'" + val.photo + "'" +')" >';
			  col+='</div>';
			col+='</div> ';
			col+='<h4>'+ val.item_name +'</h4>';
			
			
			if(enabled_dish==1){
				if(val.dish_image.length>0){
			      col+='<ons-row>';		    
			         $.each( val.dish_image, function( d_key, d_val ) {      	             
			            col+='<ons-col vertical-align="top" width="35px">';
			                col +='<div class="is-loading">'; 
				            col +='<div class="spinner small"></div>';		
			                   col+='<img class="cuisine_image" src="'+d_val+'">';
			                col+='</div>';
			            col+='</ons-col>';
			       	  });
			      col+='</ons-row>';
			    }	   
			}
			
			col+='<p class="concat_text" style="width:155px;" >'+ val.item_description +'</p>';
			
			
			if(code_version=="1.4"){
				if (val.prices2.length>0){
					col+='<p>';
					$.each( val.prices2  , function( pricekey, priceval ) {		    		
						  if(priceval.discount>0.001){
						  	col+= '<span class="tag_discount">'+ priceval.original_price+'</span>' + priceval.discounted_price_pretty + '<br/>';
						  } else {
						  	col+= ''+priceval.original_price + '<br/>';
						  }			    		  
			    	});
			    	col+='</p>';
				}
			} else {
				if (val.prices.length>0){
					col+='<p>';
					$.each( val.prices  , function( pricekey, priceval ) {		    		
			    		  col+= ''+priceval + '<br/>';
			    	});
			    	col+='</p>';
				}
			}
			
         col+='</ons-col>';		
		
		if (x>=2){
			x=0;
			 html+='<ons-list-item tappable modifier="nodivider list_column" >';
			 html+=col;
			 html+='</ons-list-item>';
			 col='';
			 
			 newItem = ons.createElement(html);
			 list.appendChild(newItem);
		     html='';
		} else {			
			if(xx>=total_data){
				 html+='<ons-list-item tappable modifier="nodivider list_column" >';
				 html+=col;
				 html+='</ons-list-item>';
				 col='';
				 
				 newItem = ons.createElement(html);
				 list.appendChild(newItem);
			     html='';
			}
		}
		
		x++;	  	 
	    xx++;
		
	});
};

setTrackList = function(data, element){
		
	if (data.length<=0){
		return;
	}		
	
	html='';
	
	track_template = "1";
	if(app_settings = getAppSettings()){
		track_template = app_settings.tracking_theme;
	}
	
	if(track_template=="2"){
		
		html+='<ons-row style="padding:10px 10px 0;">';
	      html+='<ons-col width="80px"  vertical-align="center"><img class="thumbnail circle" src="'+ data.driver_photo +'"></ons-col>';
	      html+='<ons-col vertical-align="center" width="160px" >';
	         html+='<h5 class="concat_text">'+  data.driver_name +'</h5>';
	         html+='<p class="small concat_text">'+ t("Your Delivery Guy") +'</p>';
	      html+='</ons-col>';
	      html+='<ons-col width="80px"  vertical-align="center" >';
	              html+='<ons-button modifier="to_orange no_shadow" onclick="window.open('+ "'" + 'tel:'+  data.driver_phone + "'" +');"   >';
	                html+='<ons-icon icon="md-phone" size="25px"></ons-icon>';
	              html+='</ons-button>';	  
	             html+='</ons-col>';
	    html+='</ons-row>';		
	    $("#track_template2").html( html );	    
		return;
	} 
		
	var list = document.getElementById(element);
	
	if(data.driver_id>0){
		
		html+='<ons-list-item modifier="longdivider full_list" tappable onclick="showDriverInfo('+ data.driver_id +')" >';
		      html+='<div class="left">';
		        html+='<ons-icon icon="md-account-o" class="list-item__icon"></ons-icon>';
		      html+='</div>';
		      html+='<div class="center">';	        		       
		        html+='<span class="list-item__title">'+ data.driver_name + "&nbsp;(" + t("delivery guy") +')</span>';
		        html+='<p class="list-item__subtitle small">'+data.driver_phone+'</p>';		        
		      html+='</div>';
		  html+='</ons-list-item>';
		
		newItem = ons.createElement(html);
	    list.appendChild(newItem);
        html='';
	}
	
	if(data.dropoff_merchant>0){
			
		html+='<ons-list-item modifier="longdivider full_list" tappable onclick="map_setCenter('+ "'" + data.dropoff_lat + "','" + data.dropoff_lng + "'" +')" >';
		      html+='<div class="left">';
		        html+='<ons-icon icon="md-pin-drop" class="list-item__icon"></ons-icon>';
		      html+='</div>';
		      html+='<div class="center">';	        
		        html+='<span class="list-item__title">'+data.dropoff_contact_name+'</span>';
		        html+='<p class="list-item__subtitle small">'+data.drop_address+'</p>';		        
		      html+='</div>';
		  html+='</ons-list-item>';
		
		newItem = ons.createElement(html);
	    list.appendChild(newItem);
        html='';
	}	
	
	if(!empty(data.delivery_address)){		
		
		html+='<ons-list-item modifier="longdivider full_list" tappable onclick="map_setCenter('+ "'" + data.task_lat + "','" + data.task_lng + "'" +')" >';
	      html+='<div class="left">';
	        html+='<ons-icon icon="md-flag" class="list-item__icon"></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';	        
	        html+='<span class="list-item__title">'+data.customer_name+'</span>';
	        html+='<p class="list-item__subtitle small">'+data.delivery_address+'</p>';		        
	      html+='</div>';
	  html+='</ons-list-item>';
		
		newItem = ons.createElement(html);
	    list.appendChild(newItem);
        html='';
	}		
};

setDriverInformation = function(data, element, element2){
	
	var html='';
		
	html+='<div class="white_wrapper">';
	html+='<div class="wrap">';
		html+='<ons-row>';
		   html+='<ons-col width="58px" vertical-align="center" >';
		     html+='<img class="thumbnail circle" src="'+ data.profile_photo +'">';
		   html+='</ons-col>';
		   html+='<ons-col width="50%" vertical-align="center" >';
		    html+='<h5>'+ data.full_name +'</h5>';
		    html+='<p class="small print_trans">'+ data.email +'</p>	    ';
		    html+='<p class="small">'+ data.phone+'</p>	   ';
		   html+='</ons-col>';
		   
		   html+='<ons-col vertical-align="center" >';
		      html+='<div class="raty-stars" data-score="'+ data.rating.ratings  +'"></div>';
		   html+='</ons-col>';
		html+='</ons-row>';
	html+='</div>';
	
	html+='<div class="grey_line tickline"></div>';

   $(element).html( html );
   
   
   html+='<ons-list-item modifier="longdivider full_list" tappable onclick="map_setCenter('+ "'" + data.task_lat + "','" + data.task_lng + "'" +')" >';
	      html+='<div class="left">';
	        html+='<ons-icon icon="md-gps-dot" class="list-item__icon"></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';	        
	        html+='<span class="list-item__title">'+data.merchant_name+'</span>';
	        html+='<p class="list-item__subtitle small">'+data.merchant_address+'</p>';		        
	      html+='</div>';
	  html+='</ons-list-item>';
		
	html='';  
	  
	var list = document.getElementById(element2);
	
	html+='<ons-list-item modifier="longdivider full_list" tappable onclick="window.open('+ "'" + 'tel:'+  data.phone + "'" +');"  > ';
	  html+='<div class="center">';
	    html+='<span class="list-item__title">'+ t("CALL DRIVER") +'</span>';
	    html+='<p class="list-item__subtitle small">'+ data.phone +'</p>';	
	  html+='</div>';
	html+='</ons-list-item>';	  
	newItem = ons.createElement(html);
    list.appendChild(newItem);
    html='';
    
    
    $.each( data.sub_data  , function( key, val ) {    	
    	html+='<ons-list-item modifier="longdivider full_list"  > ';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">'+ val.label+'</span>';
		    html+='<p class="list-item__subtitle small">'+ val.value +'</p>';	
		  html+='</div>';
		html+='</ons-list-item>';	  
		newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
    	
    });
   
};

NotificationContent = function(status, data ){
	
	html='';
	switch(status){
		case "failed":
		case "cancelled":
		case "declined":
		
		
		html+='<input type="hidden" name="modal_action" class="modal_action" value="close_page" />';
		if( !empty(data.driver_photo)){
		  html+='<img class="thumbnail circle" src="'+data.driver_photo+'"> ';
		}
		html+='<div>';
		   if( !empty(data.driver_phone)){
		      html+='<ons-button modifier="quiet to_text_white" onclick="window.open('+ "'" + 'tel:'+  data.driver_phone + "'" +');"  >'+data.driver_phone+'</ons-button>';
		   }
		html+='</div>';
		html+='<p>'+ data.resp_status +'</p>  ';
		html+='<div><ons-button modifier="to_orange no_shadow" onclick="showModalNotification(false);" >'+t("OKAY")+'</ons-button></div>  ';
		
		break;
		
		case "successful":
		  html+='<input type="hidden" name="modal_action" class="modal_action" value="close_page" />';
		  if( !empty(data.driver_photo)){
		     html+='<img class="thumbnail circle" src="'+data.driver_photo+'"> ';
		  }
		  html+='<div class="raty-stars" data-score="'+ data.rating +'"></div>';
		  html+='<p>'+ data.resp_status +'</p>';		  
		  html+='<div><ons-button modifier="to_orange no_shadow" onclick="showModalNotification(false);" >'+t("OKAY")+'</ons-button></div> ';
		break;
		
		case "inprogress":
		  html+='<input type="hidden" name="modal_action" class="modal_action" value="close_modal" />';
		  if( !empty(data.driver_photo)){
		     html+='<img class="thumbnail circle" src="'+data.driver_photo+'"> ';
		  }
		  html+='<h6>'+ t("Your Delivery Guy") +'</h6>';
		  html+='<h2>'+ data.driver_name +'</h2>';
		  html+='<h5>'+ t("has arrived!") +'</h5>';
		  html+='<div><ons-button modifier="to_orange no_shadow" onclick="showModalNotification(false);" >'+t("OKAY")+'</ons-button></div>';
		break;
		
		default:				  		
		html+='<p>'+t("Sorry but we cannot find what you are looking for")+'</p>  ';
		html+='<div><ons-button modifier="to_orange no_shadow" onclick="showModalNotification(false);" >'+t("OKAY")+'</ons-button></div>  ';
		break;
				
	}
	
	return html;
	
};

setNotificationList = function(data, element){
	
	if (data.length<=0){
		return;
	}	
		
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {
		
		html+='<ons-list-item modifier="longdivider full_list" tappable onclick="actionSheetNotification('+val.id+')">';		      
		      html+='<div class="center">';	        
		        html+='<span class="list-item__title">'+val.push_title+'</span>';
		        html+='<p class="list-item__subtitle small">'+val.push_message+'</p>';
		        html+='<p class="list-item__subtitle small">'+val.date_created+'</p>';
		      html+='</div>';
		  html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});
};

notiRemoveButton = function(show){		
	html='';
	if(show) {
		html+='<ons-toolbar-button onclick="markAllNotifications()">';
	      html+='<ons-icon icon="md-delete" size="25px"></ons-icon>';
	    html+='</ons-toolbar-button>';
	}	
    $(".noti_remove_div").html( html );
};

fillOrderTabs = function(element, tab, selected_index){	
	
	var list = document.getElementById( element );
	var html='';
	
	if(empty(tab)){
		tab='all';
	}
	if(empty(selected_index)){
		selected_index=0;
	}
	
	if(app_settings = getAppSettings()){
		index = 0 ;		
		$.each( app_settings.order_tabs  , function( key, val ) {
			
			is_selected='';
			if(key==tab){
				is_selected='selected"';
			}
			html+='<ons-carousel-item class="'+ is_selected +'" onclick="OrderListTab('+ "'" + key + "'," + index  +')"  >'+ t(val) +'<ons-ripple color="#EF6625" background="#ffffff"></ons-ripple></ons-carousel-item>';						
	        index++;
	        
	        var newItem = ons.createElement(html);
	        list.appendChild(newItem);
	        html='';	        
		});					
		document.querySelector("#"+element).refresh();				
	}
};

fillBookingTabs = function(element, tab, selected_index){
	
	var list = document.getElementById( element );
	var html='';
	
	if(empty(tab)){
		tab='all';
	}
	if(empty(selected_index)){
		selected_index=0;
	}
	
	if(app_settings = getAppSettings()){
		index = 0 ;		
		$.each( app_settings.booking_tabs  , function( key, val ) {
			
			is_selected='';
			if(key==tab){
				is_selected='selected"';
			}
			html+='<ons-carousel-item class="'+ is_selected +'" onclick="BookingListTab('+ "'" + key + "'," + index  +')"  >'+ t(val) +'<ons-ripple color="#EF6625" background="#ffffff"></ons-ripple></ons-carousel-item>';						
	        index++;
	        
	        var newItem = ons.createElement(html);
	        list.appendChild(newItem);
	        html='';	        
		});					
		document.querySelector("#"+element).refresh();				
	}
	
};

bookingListSmall = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		html+='<ons-list-item tappable onclick="ViewBookingDetails('+ val.booking_id+')" >';
		  html+='<div class="left">';
		    html+='<img class="list-item__thumbnail" src="'+ val.logo +'">';
		  html+='</div>';
		  html+='<div class="center">';
		    html+='<span class="list-item__title">' + val.restaurant_name + '</span>';
		    html+='<span class="list-item__subtitle">' + val.booking_ref + '</span>';
		    html+='<span class="list-item__subtitle">' + val.number_guest + '</span>';
		  html+='</div>';
		html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};

setBookingDetails = function(data, element_id){
	if (data.length<=0){
		return;
	}
	
	var list = document.getElementById( element_id );
	var html='';
		
	$.each( data  , function( key, val ) {
		
		html+='<ons-list-item modifier="longdivider full_list">';
	      html+='<div class="center">';
	       html+='<span class="list-item__title">'+ val.label +'</span>';
	       html+='<span class="list-item__subtitle">'+ val.value +'</span>';
	     html+='</div>';
	    html+='</ons-list-item>';
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	});	
};


fillStartupBanner = function(div){
	var html='';
			
	if(app_settings = getAppSettings()){
	   banner = app_settings.startup.banner;	   
	   	   	   	 
	   if(banner.length<=0){	   	  
	   	  return;
	   }
	   	   
	   
	   html+='<ons-carousel fullscreen swipeable auto-scroll overscrollable id="startup_carousel"  >';	   
	   $.each( banner  , function( key, val ) {
	   	  html+='<ons-carousel-item>';
	   	    html+='<div class="banner" style="background-image: url('+ "'" + val + "'" +')"  >';
	   	    
	   	    html +='<div class="is-loading xlarge-loader">'; 
			html +='<div class="spinner"></div>';		
			html +='<img class="hide" src="'+ val +'">';	      
			html +='</div>'; 
			
			html +='</div>'; 
	   	    
	   	  html+='</ons-carousel-item>';
	   });
	   html+='</ons-carousel>';
	   	   
	   html+='<ul class="dots">';
		  $.each( banner  , function( key, val ) {
		  	  is_selected='active';
		  	  if(key>=1){
		  	  	is_selected='';
		  	  }
		  	  html+='<li class="c'+key + ' ' + is_selected +'"><div class="circle"></div></li>';
		  });
	   html+='</ul>';
	   
	   $(div).html( html );	   
	   imageLoaded();
	}
};


setlanguageList2 = function(data, element, selected_lang){
	if (data.length<=0){
		return;
	}	
	var list = document.getElementById( element );
	var html='';
	
	$.each( data  , function( key, val ) {

		is_selected = '';
		if(key==selected_lang){
			is_selected='orange_color';
		}
		
	  html+='<ons-list-item modifier="longdivider full_list" tappable onclick="setStartupLanguage('+ "'" + key + "'"  +')"	   >';
	      html+='<div class="left">';
	        html+='<ons-icon icon="md-check" class="list-item__icon  '+is_selected+' "></ons-icon>';
	      html+='</div>';
	      html+='<div class="center">';
	        html+= val;
	      html+='</div>';
	  html+='</ons-list-item>';
	  
	  
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    
	});	
};

filtersItem = function(data){
	
	var html='';
	
	html+='<ons-list-header>';
	  html+='<ons-row>';
	     html+='<ons-col width="50%">' + t('Filter By') +  '</ons-col>';
	     html+='<ons-col class="text-right"> <ons-button modifier="quiet sort_btn" onclick="clearForm(\'filter_item\')">'+ t("CLEAR") +'</ons-button> </ons-col>';
	  html+='</ons-row>';
	html+='</ons-list-header>';
	

	if(!empty(data.promos)){
		html+='<ons-list-header>'+ t('By Dishes') +'</ons-list-header> ';
		$.each( data.dishes_list  , function( key, val ) {			
			
			html+='<ons-list-item tappable>';
		      html+='<label class="left">';
		        html+='<ons-radio class="filter_dishes" name="filter_dishes" input-id="x_'+key+'" value="'+val.dish_id+'"></ons-radio>';
		      html+='</label>';
		      html+='<label for="x_'+key+'" class="center">';
		        html+= t(val.dish_name);
		      html+='</label>';
		   html+='</ons-list-item>';
			
		});				
	}
	
	list_filters = $("#list_filters_item").html();	
	if(list_filters.length<=7){		
	   $("#list_filters_item").html( html );
	}
	
};

fillEnterPhone = function(){
	html='';
	
	turnoff_prefix = true;
	
	if(settings = getAppSettings()){
		if(settings.mobile_turnoff_prefix==1){
			turnoff_prefix = false;
		}
	}
	
	html+='<ons-list-item>';
	    if(turnoff_prefix){
           html+='<div class="left" style="width:60px;"> <ons-input type="text" name="moobile_prefix" id="moobile_prefix" class="moobile_prefix" required  placeholder="'+ t("Prefix") +'" float value="" onclick="showMobileCode()" ></ons-input> </div>';
	    }
        html+='<div class="center"> <ons-input type="number" value="" maxlength="15" name="mobile_no" id="mobile_no" required class="mobile_no"  placeholder="'+ t("Mobile no.") +'" float ></ons-input> </div>';
    html+='</ons-list-item>';
    $("#enter_phone_list").html( html )	;
};

createAccountFields = function(){
	
	html='';
	
	settings = getAppSettings();
	
	
	html+='<ons-list-item>';        
       html+='<div class="center"><ons-input name="first_name" id="first_name" required modifier="transparent" placeholder="'+ t("First Name") +'" float ></ons-input></div>';
    html+='</ons-list-item>';
    
    html+='<ons-list-item>';       
       html+='<div class="center"><ons-input name="last_name" id="last_name" required modifier="transparent" placeholder="'+ t("Last Name") +'" float></ons-input></div>';
    html+='</ons-list-item>';
        
    if(settings.registration.phone==1){
	    html+='<ons-list-item> ';       
	       html+='<div class="center"><ons-input name="contact_phone" id="contact_phone" class="contact_phone" required modifier="transparent" placeholder="'+ t("Mobile") +'" float onclick="showPage(\'enter_phone.html\')"></ons-input></div>';
	    html+='</ons-list-item>';
    }
        
    if(settings.registration.email==1){
	    html+='<ons-list-item>   ';     
	       html+='<div class="center"><ons-input type="email" name="email_address" id="email_address" required modifier="transparent" placeholder="'+ t("Email") +'" float ></ons-input></div>';
	    html+='</ons-list-item>';
    }
    
    html+='<ons-list-item>   ';     
       html+='<div class="center"><ons-input type="password" name="password" id="password" required modifier="transparent" placeholder="'+ t("Password") +'" float ></ons-input></div>';
    html+='</ons-list-item>';
    
    html+='<ons-list-item class="reg_last_row"> ';
       html+='<div class="center"><ons-input type="password" name="cpassword" id="cpassword" required modifier="transparent" placeholder="'+ t("Confirm Password") +'" float ></ons-input></div>';
    html+='</ons-list-item>';
	
    $("#create_account_list").html( html )	;
};

fillTrackTemplate = function(options){
	html='';
	switch(options){
		case "1":
		html+='<ons-bottom-toolbar modifier="bottom_track">';
		html+='<ons-progress-bar value="0" secondary-value="100"></ons-progress-bar>';
		html+='<ons-list id="list_track" modifier="list_style1 is_rtl">';
        html+='</ons-list>';
		html+='</ons-bottom-toolbar>';
		break;
		
		case "2":
		$(".map_wrapper").css("height", "85%");
		html+='<ons-bottom-toolbar modifier="bottom_track2">';
		html+='<ons-progress-bar value="0" secondary-value="100"></ons-progress-bar>';
		    html+='<DIV id="track_template2">';		   
		    html+='</DIV>';		  
		html+='</ons-bottom-toolbar>';
		break;
	}	
	$(".track_loader").after(html);	
};

fillPaymentForm = function(data, element){
	dump(data);
	
	var list = document.getElementById( element );
	var html='';
	
	var list_data = {};	
	list_data[0] = { "label": t("Description"), "value": data.payment_description };
	
	if(data.card_fee>0){
		list_data[1] = { "label": t("Amount"), "value": prettyPrice(data.sub_less_card_fee) };	
	    list_data[2] = { "label": t("Card fee"), "value": prettyPrice(data.card_fee) };
	    list_data[3] = { "label": t("Total"), "value": prettyPrice(data.total_amount) };
	} else {
		list_data[1] = { "label": t("Total"), "value": prettyPrice(data.total_amount) };
	}				
		
	$.each( list_data  , function( key, val ) {			
		html+='<ons-list-item modifier="longdivider full_list">';
        html+='<ons-row style="padding:0;">';
          html+='<ons-col width="100px">'+ val.label +' :</ons-col>';
          html+='<ons-col>'+ val.value +'</ons-col>';
        html+='</ons-row>';
        html+='</ons-list-item>';           
		
		var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
    
	});
	
	html+='<ons-list-item>';
     html+='<div class="center">';
      html+='<ons-input name="contact_phone" id="contact_phone" class="contact_phone" modifier="transparent" value="'+ data.contact_phone +'" ';
	         html+='placeholder="'+ t("Phone") +'" float  onclick="showPage(\'enter_phone.html\')" onfocus="showPage(\'enter_phone.html\')" required ></ons-input>';
     html+='</div>';
    html+='</ons-list-item>';
    
    var newItem = ons.createElement(html);
    list.appendChild(newItem);
    html='';
    
	html+='<ons-list-item>';
     html+='<div class="center">';
      html+='<ons-input name="payer_remarks" id="payer_remarks" class="payer_remarks" modifier="transparent" ';
	         html+='placeholder="'+ t("Remarks") +'" float ></ons-input>		';
     html+='</div>';
    html+='</ons-list-item>';

    var newItem = ons.createElement(html);
    list.appendChild(newItem);
    html='';
    
};

ageRestriction = function(){
		
	age_restriction_enabled = getStorage("age_restriction_enabled");
	if(age_restriction_enabled==1){
		return;
	}
	
	if(app_settings = getAppSettings()){
		age_restriction = app_settings.age_restriction;
		age_restriction_content = app_settings.age_restriction_content;
		if(age_restriction==1 && !empty(age_restriction_content) ){
			
			ons.platform.select('ios'); 
			ons.notification.confirm( t(age_restriction_content) ,{
				title: dialog_title,
				id : "dialog_cancel_order",
				buttonLabels : [ t("I'M OVER 18"), t("EXIT") ]
			}).then(function(input) {
				if(input<=0){
					setStorage("age_restriction_enabled",1);
				} else {
					if (navigator.app) {
					   navigator.app.exitApp();
					 } else if (navigator.device) {
					   navigator.device.exitApp();
					 } else {
					   window.close();
					 }
				}
			});
		}
	}
};


fillHomeBanner = function(data, div){
	
	app_settings = getAppSettings();	
	
	item_width ='item-width="60%"';
	if(app_settings.home.mobile2_home_banner_full==1){
		item_width='';
	}
	
	html='<ons-carousel fullscreen swipeable auto-scroll overscrollable id="carousel" direction="horizontal" '+ item_width +'   >';
	$.each( data  , function( key, val ) {
		
      html+='<ons-carousel-item >';
      html+='<div class="banner">';
        html+='<div class="header_bg" style="background-image: url('+ "'" + val + "'" +')"  >';
        html+='<div class="">';
        html+='<div class="spinner"></div>';
           html+='<img class="hide" src="'+ val +'"></div>';
        html+='</div>';
        html+='</div>';
      html+='</ons-carousel-item>';
		
	});
	html+='</ons-carousel>';
	
	$(div).html( html );
	
	imageLoaded(); 
};


carouselMap = function(data, div){	
	
	if(data.length<=0){
		return false;
	}
	
	html='<ons-carousel fullscreen swipeable auto-scroll overscrollable  direction="horizontal" item-width="90%"  >';
	$.each(data, function(key, val){
		html+='<ons-carousel-item onclick="loadMerchant('+ val.merchant_id+')"  >';
		html +='<ons-ripple color="#EF6625" background="#EF6625"></ons-ripple>';
        
		html+='<ons-row>';
		  html+='<ons-col width="120px">';
		  
		  html+='<div class="banner">';
		  html+='<div >';
		    html+='<img class="hide" src="'+ val.background_url +'">';
		     html+='<div class="header_bg" style="background-image: url('+ "'" + val.background_url + "'" +')"  >';
		         html+='<div class="spinner"></div>';
		     html+='</div>';
		    html+='</div>';
		  html+='</div>';
		  
		  html+='</ons-col>';
		  
		  html+='<ons-col width="5px"></ons-col>';
		  
		  html+='<ons-col width="120px">';
		    html+='<h4>'+ val.restaurant_name +'</h4>';
		    html+='<p class="concat_text">'+ val.cuisine +'</p>';
		    
		    html+='<ons-row class="rating_wrap small">';
		      html+='<ons-col><div class="raty-stars" data-score="'+ val.rating.ratings +'"></div></ons-col>';
		      html+='<ons-col>'+ val.rating.review_count +'</ons-col>';
		    html+='</ons-row>';
		    
		  html+='</ons-col>';
		html+='</ons-row>';
    
        html+='</ons-carousel-item>';
	});	
	
	html+='</ons-carousel>';
	
	$(div).html( html );
	
	initRatyStatic();
};

LocationSearchForm = function(div){
	
	html='';
	
	location_mode = locationMode();
	dump("location_mode=>"+location_mode);

	switch(location_mode){
		case 1:

		 html+='<div class="content_wrapper">';
		  html+='<ons-row>';
		    html+='<ons-col vertical-align="center"  >';
		      html+='<ons-search-input id="city_name" class="city_name" required placeholder="'+ t("City") +'" onclick="showPage(\'location_city.html\',\'none\',\'{address_book:0,state_id:0}\')"  ></ons-search-input>';
		    html+='</ons-col>';
		  html+='</ons-row>';
		  html+='</div>';
		  
		  html+='<div class="content_wrapper">';
		  html+='<ons-row>';
		    html+='<ons-col vertical-align="center"  >';
		      html+='<ons-search-input id="area_name" class="area_name" required placeholder="'+ t("District / Area") +'"  onclick="showLocationArea2();" ></ons-search-input>';
		    html+='</ons-col>';
		  html+='</ons-row>';
		  html+='</div>';
		
		break;
		
		case 2: 
		
		
		html+='<div class="content_wrapper">';
		  html+='<ons-row>';
		    html+='<ons-col vertical-align="center"  >';
		      html+='<ons-search-input id="state_name" class="state_name" required placeholder="'+ t("State") +'" onclick="showPage(\'location_state.html\',\'none\',\'{address_book:0,state_id:0}\')"  ></ons-search-input>';
		    html+='</ons-col>';
		  html+='</ons-row>';
		  html+='</div>';
		
		 html+='<div class="content_wrapper">';
		  html+='<ons-row>';
		    html+='<ons-col vertical-align="center"  >';
		      html+='<ons-search-input id="city_name" class="city_name" required placeholder="'+ t("City") +'" onclick="showPage(\'location_city.html\',\'none\',\'{address_book:0,state_id:0}\')"  ></ons-search-input>';
		    html+='</ons-col>';
		  html+='</ons-row>';
		  html+='</div>';
		  
		break;
		
		case 3:
		
		html+='<div class="content_wrapper">';
		  html+='<ons-row>';
		    html+='<ons-col vertical-align="center"  >';
		      html+='<ons-search-input id="postal_code" class="postal_code" required placeholder="'+ t("Postal Code/Zip Code") +'" onclick="showPage(\'location_postal_code.html\',\'none\',\'{address_book:0,state_id:0}\')"  ></ons-search-input>';
		    html+='</ons-col>';
		  html+='</ons-row>';
		  html+='</div>';
		
		break;
		
		default:
		  showToast( t("Location mode is not defined") );	
		break;
	}
	
	$(div).html( html );			
	
};

setCityList = function(data, element){	
	html='';
	
	var list = document.getElementById(element);
	
	$.each( data  , function( key, val ) {
		dump(val);
		//setCity = function(name, city_id, state_id, state_name, country_id, country_name){
		html+='<ons-list-item tappable onclick="setCity('+ clickFormat(val.name+"|"+val.city_id+"|"+val.state_id+"|"+ val.state_name + "|"+val.country_id +"|" + val.country_name ) +')">';
	       html+='<div class="center">';
	         html+='<span class="list-item__title">'+ val.city_name +'</span>';
	         html+='<span class="list-item__subtitle">'+ val.state_name +'</span>';
	       html+='</div>';
	     html+='</ons-list-item>';
	     
	     var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    	     
	});
};

setAreaList = function(data, element){	
	
	html='';	
	var list = document.getElementById(element);
	
	$.each( data  , function( key, val ) {
		dump(val);
		html+='<ons-list-item tappable onclick="setArea('+ clickFormat(val.area_id+"|"+val.name) +')">';
	       html+='<div class="center">';
	         html+='<span class="list-item__title">'+ val.area_name +'</span>';
	         html+='<span class="list-item__subtitle">'+ val.city_name +'</span>';
	       html+='</div>';
	     html+='</ons-list-item>';
	     
	     var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    	     
	});
};

setStateList = function(data, element){
	
	html='';
	
	var list = document.getElementById(element);
	
	$.each( data  , function( key, val ) {
		dump(val);
		html+='<ons-list-item tappable onclick="setState('+ clickFormat(val.state_raw+"|"+val.state_id+"|"+val.country_id+"|"+val.country_name) +')" >';
	       html+='<div class="center">';
	         html+='<span class="list-item__title">'+ val.state +'</span>';
	         html+='<span class="list-item__subtitle">'+ val.country_name +'</span>';
	       html+='</div>';
	     html+='</ons-list-item>';
	     
	     var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    	     
	});
	
};

setPotalList  = function(data, element){
	
	html='';
		
	var list = document.getElementById(element);
	
	$.each( data  , function( key, val ) {
		dump(val);
		html+='<ons-list-item tappable onclick="setPostal('+ clickFormat(val.city_id+"|"+val.city_name+"|"+val.postal_code_raw+"|"+val.state_id + "|" + val.state_name +"|" + val.country_id ) +')" >';
	       html+='<div class="center">';
	         html+='<span class="list-item__title">'+ val.postal_code +'</span>';
	         html+='<span class="list-item__subtitle">'+ val.city_name +'</span>';
	       html+='</div>';
	     html+='</ons-list-item>';
	     
	     var newItem = ons.createElement(html);
	    list.appendChild(newItem);
	    html='';
	    	     
	});
	
};

setFloatingCategory = function(element){
	
	html='';		
	var list = document.getElementById(element);
	
	data = getStorage("active_merchant_category");	
	if(empty(data)){
		return;
	}
	
	current_page_id = onsenNavigator.topPage.id;	
	
	data = JSON.parse( data );	 
	if(!empty(data)){
		$.each( data  , function( key, val ) {
			
			if(current_page_id=="restaurant_page"){
			   html+='<ons-list-item modifier="nodivider full_list" tappable onclick="showItemPageFloating('+ clickFormat(val.cat_id+"|"+"1") +')" >';
			} else {
			   html+='<ons-list-item modifier="nodivider full_list" tappable onclick="showItemPageFloating('+ clickFormat(val.cat_id+"|"+"2") +')"  >';
			}
		      html+='<div class="center">';
		      html+='<span class="list-item__title">'+ val.category_name +'</span>';
		      html+='<span class="list-item__subtitle">'+ val.item_count +'</span>';
		    html+='</div>';
		    html+='</ons-list-item>';
		    
		    var newItem = ons.createElement(html);
		    list.appendChild(newItem);
		    html='';
			
		});
	}
};


getCustomPages = function(is_location){
	/*ADD CUSTOM PAGE*/
	html='';
	if(app_settings = getAppSettings()){		
		custom_pages_location = app_settings.custom_pages_location;		
		//alert(is_location+"=>"+custom_pages_location);
		if(custom_pages_location==is_location){
			if(app_settings.custom_pages.length>0){
				$.each( app_settings.custom_pages  , function( page_key, page_val ) {
					
					html+='<ons-list-item tappable modifier="chevron" onclick="loadCustomPage('+ page_val.page_id +')" >';
					  html+='<div class="left">';
					   
					    if(!empty(page_val.icon)){
					       icon = page_val.icon;
					    } else {
					       icon = "ion-ios-circle-outline";
					    }
					  
					    html+='<ons-icon icon="'+ icon +'" size="25px" class="list-item__icon"></ons-icon>';
					  html+='</div>';
					  html+='<div class="center">';
					    html+= t(page_val.title);
					  html+='</div>';	  	  
					html+='</ons-list-item>';
					
				});
				return html;
			}
		}
	}	
	return '';
};

/*1.4*/
addTermsCondition = function(element){
	
	 var list = document.getElementById(element);
	 html='';
	        
	 html+='<ons-list-item modifier="list_small nodivider">';
	 html+='<p>'+ t("By creating an account, you agree to receive sms from vendor.") +'</p>';
	 html+='</ons-list-item>';
	 
	 var newItem = ons.createElement(html);
    list.appendChild(newItem);	    
    html='';  
	
	if(app_settings = getAppSettings()){
		if(app_settings.signup_settings.enabled_terms_condition==1){
			terms_url = app_settings.signup_settings.terms_url;			
	        
	        html+='<ons-list-item modifier="list_small">';
			html+='<label class="left">';
			html+='<ons-checkbox name="check_terms_condition" input-id="check_terms_condition" class="check_terms_condition" value="1" ></ons-checkbox>';
			html+='</label>';
			html+='<label for="check_terms_condition" class="center ">';
			html+='<span class="trn">'+ t("I Agree To The") +'</span>&nbsp;<a href="javascript:;" class="small" onclick="browseLink('+ "'" + terms_url + "'" +')">';
			html+='<span class="trn">'+ t("Terms and condition") +'</span>';
			html+='</a>';
			html+='</label>';
			html+='</ons-list-item>';
	     
			var newItem = ons.createElement(html);
            list.appendChild(newItem);	    
            html='';   
		}
	}
};

fillContactUsForm = function(element){
	var list = document.getElementById(element);
	 html='';
	 
	if(app_settings = getAppSettings()){
		dump(app_settings.contact_us.contact_content);
		if(!empty(app_settings.contact_us.contact_content)){
			 html+='<ons-list-item modifier="nodivider">';
		         html+='<p class="small">'+ app_settings.contact_us.contact_content +'</p>';
		      html+='</ons-list-item>';
		      var newItem = ons.createElement(html);
              list.appendChild(newItem);	    
              html='';   
		}		
				
		$.each( app_settings.contact_us.contact_field  , function( key, val ) {
			
			label = '';
			click_action='';
			field_type='text';
			
			switch(val){
				case "name":
				  label = t("Name");
				break;
				
				case "email":
				  label = t("Email address");
				  field_type ="email";
				break;
				
				case "phone":
				  val = 'contact_phone';
				  label = t("Contact Number");
				  click_action='onclick="showPage(\'enter_phone.html\')"';
				break;
				
				case "country":
				  label = t("Country");
				break;
				
				case "message":
				  label = t("Message");
				break;
			}
			
			html+='<ons-list-item>';
	         html+='<div class="center">';
	           html+='<ons-input type="'+ field_type +'" name="'+val+'" id="'+val+'" class="'+ val +'" required modifier="transparent" '+ click_action +' ';
	           html+='placeholder="'+ label +'" float ></ons-input>';
	          html+='</div>';
	        html+='</ons-list-item>';
	        
	        var newItem = ons.createElement(html);
            list.appendChild(newItem);	    
            html='';   
			
		});
		
		background_url = app_settings.images.image3;
		$("#contact_us .header_contact").css('background-image', 'url('+ "'" + background_url + "'" +')');
		
	}
};