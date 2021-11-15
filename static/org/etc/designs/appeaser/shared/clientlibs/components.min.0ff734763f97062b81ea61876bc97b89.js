function subscribeNewsLetter(b,c,a){sessionStorage.setItem("newsletterSubmitted","true");
thankYoupagePath=getThankYouPage(c);
enablePersonal=$("#enablePersonal").val();
email=$("#txt-email").val();
country=$("#country-options").find(".is-dropdown-value.is-selected").data("value");
nonTrans=$("#country-options").find(".is-dropdown-value.is-selected").data("isnontrans");
var e=b;
if(!country){country=""
}kid=$("#newsletter-i-am-kids").is(":checked");
frequency=true;
if(enablePersonal=="true"){gender=$("[name=gender]:checked").val()==undefined?0:$("[name=gender]:checked").val();
postalCode=$("#txt-postal-code").val()==undefined?"":$("#txt-postal-code").val()
}if(nonTrans){var d='{"email":"'+email+'","countryCode":"'+country+'","languageCode":"en","genderCode":'+gender+',"zipCode":"'+postalCode+'"}';
e=a
}else{var d='{"email":"'+email+'","firstName":"","lastName":"","gender":'+gender+',"postalCode":"'+postalCode+'","kids":"'+kid+'","frequency":"'+frequency+'","birthYear":"","birthMonth":"","birthDay":"","country":"'+country+'"}'
}$.ajax({type:"POST",url:e,dataType:"json",contentType:"application/json; charset=utf-8",data:d,success:function(i){sessionStorage.removeItem("newsletterSubmitted");
sessionStorage.removeItem("trackNewsletterAlreadyExist");
if(i){var h=i.responseStatusCode;
var j=i.responseAlreadyExists;
var g=i.doubleOptInRequired;
var f=i.responseInvalidCountry;
if(h=="ok"&&(f==false||nonTrans)){if(j==true){window.location=(thankYoupagePath+"?statusCode=successalreadyExist");
TealiumUtils.trackFunnelLocation("error_message","newsletter_page")
}else{if(g==true){window.location=(thankYoupagePath+"?statusCode=doubleOptInRequired");
TealiumUtils.trackFunnelLocation("newsletter_signup_completed","newsletter_page")
}else{window.location=(thankYoupagePath+"?statusCode=success");
Cookies.set("newsletter-popup","viewed");
Cookies.set("teaser-popup","viewed");
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterSubscribed();
TealiumUtils.trackNewsletter()
}}}}else{if(nonTrans){window.location=(thankYoupagePath+"?statusCode=invalid")
}else{window.location=(thankYoupagePath+"?statusCode=error")
}TealiumUtils.trackFunnelLocation("error_message","newsletter_page")
}}}})
}function unsubscribeNewsLetter(b,a,d){sessionStorage.setItem("newsletterSubmitted","true");
email=$("#txt-email").val();
var c=decodeURIComponent(getUrlParam("email",""));
if(c!==null&&c!==""&&!email){email=c
}frequency=false;
confirmUnsubscribePath=getThankYouPage($("#unsubscribepage").val());
if(d!=null&&d!=""){var e='{"email":"'+email+'","bpid":"'+d+'","frequency":"'+frequency+'"}'
}else{var e='{"email":"'+email+'","frequency":"'+frequency+'"}'
}$.ajax({type:"POST",url:b,dataType:"json",contentType:"application/json; charset=utf-8",success:function(g){sessionStorage.removeItem("newsletterSubmitted");
if(g){var f=g.responseStatusCode;
if(f=="ok"){window.location=(confirmUnsubscribePath+"?statusCode=success");
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterUnsubscribed()
}}else{if(f=="no-response"){callUnsubscribeServlet(a,e,c,confirmUnsubscribePath)
}else{if(c){window.location=(confirmUnsubscribePath+"?statusCode=error&email=true")
}else{window.location=(confirmUnsubscribePath+"?statusCode=error")
}}}}},data:e})
}function getThankYouPage(c){var a=getPageFromPath(c);
if(a==null||a==""){a=window.location.pathname.replace("newsletter","thank-you");
var b=a.indexOf(".html")+(".html").length;
a=a.substring(0,b)
}return a
}function getPageFromPath(a){if(a!==null&&a!==""){if(a.indexOf(".html")<0){a=a+".html"
}return a
}}function subscribeNewsLetterWithPopup(b,c,a){sessionStorage.setItem("newsletterSubmitted","true");
thankYoupagePath=getThankYouPage(c);
enablePersonal=$("#enablePersonal").val();
email=$("#txt-email").val();
country=$("#country-options").find(".is-dropdown-value.is-selected").data("value");
nonTrans=$("#country-options").find(".is-dropdown-value.is-selected").data("isnontrans");
var e=b;
if(!country){country=""
}kid=$("#newsletter-i-am-kids").is(":checked");
frequency=true;
if(enablePersonal=="true"){gender=$("[name=gender]:checked").val()==undefined?0:$("[name=gender]:checked").val();
postalCode=$("#txt-postal-code").val()==undefined?"":$("#txt-postal-code").val()
}if(nonTrans){var d='{"email":"'+email+'","countryCode":"'+country+'","languageCode":"en","genderCode":'+gender+',"zipCode":"'+postalCode+'"}';
e=a
}else{var d='{"email":"'+email+'","firstName":"","lastName":"","gender":'+gender+',"postalCode":"'+postalCode+'","kids":"'+kid+'","frequency":"'+frequency+'","birthYear":"","birthMonth":"","birthDay":"","country":"'+country+'"}'
}$.ajax({type:"POST",url:e,dataType:"json",contentType:"application/json; charset=utf-8",data:d,success:function(i){sessionStorage.removeItem("newsletterSubmitted");
if(i){var h=i.responseStatusCode;
var j=i.responseAlreadyExists;
var g=i.doubleOptInRequired;
var f=i.responseInvalidCountry;
if(h=="ok"&&f==false){if(j==true){thankYoupagePath+="?statusCode=successalreadyExist"
}else{if(g==true){thankYoupagePath+="?statusCode=doubleOptInRequired"
}else{thankYoupagePath+="?statusCode=success"
}}}else{if(nonTrans){thankYoupagePath+="?statusCode=invalid"
}else{thankYoupagePath+="?statusCode=error"
}}if(!appeaser.Utils.isMobile()&&$(".o-lightbox.is-open .lightbox-content").length>0){$.ajax({url:thankYoupagePath,success:function(l){var k=$("<div/>")[0].innerHTML=l;
l=$(k).find("#newsletter_subscription");
$(l).find(".richTextSpan:not(:has(p))").wrapInner("<p></p>");
$(l).find(".richTextSpan p").addClass("a-paragraph");
$(l).find("a").addClass("a-link");
if($(".o-lightbox .lightbox-content").length>1){$(".lightbox-content").first().html(l)
}else{$(".lightbox-content").html(l)
}if((thankYoupagePath).includes("statusCode=success")&&typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterPopupSubscribed();
TealiumUtils.trackNewsletter()
}}})
}else{window.location=(thankYoupagePath)
}}}})
}function getLang(){var b=new RegExp(/[a-z]*_[A-Z]*/i),c=window.location.pathname.match(b),d="en_eur",a;
if(c&&c.length){a=c[0];
if((a.length>4)&&(a.length<7)&&(a.substr(2,1)=="_")){d=a
}}return d
}var COOKIE_COUNTRY_CODE="HMCORP_locale";
var readCookieValue=function(a){var c=document.cookie.split(";"),b;
if(c&&c.length){c.some(function(e){e=e.trim();
var d=e.split("=");
if(d[0]==a){b=decodeURIComponent(d[1]);
return true
}})
}return b
};
var getCountryCode=function(){var c=readCookieValue(COOKIE_COUNTRY_CODE),a="";
if(c){var b=/(?:^[a-z]{2}_)?([A-Z]{2})$/.exec(c);
if(b){a=b[1]
}}return a
};
function subscribeNewsLetterPopup(b,a){sessionStorage.setItem("newsletterSubmitted","true");
enablePersonal=$("#enablePersonal").val();
email=$("#txt-email").val();
kid=$("#newsletter-i-am-kids").is(":checked");
country=$("#country-options").find(".is-dropdown-value.is-selected").data("value");
nonTrans=$("#country-options").find(".is-dropdown-value.is-selected").data("isnontrans");
var d=b;
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterPopupSubscribeStart();
TealiumUtils.trackNewsletter()
}if(!country){country=""
}frequency=true;
if(enablePersonal=="true"){gender=$("[name=gender]:checked").val()==undefined?0:$("[name=gender]:checked").val();
postalCode=$("#txt-postal-code").val()==undefined?"":$("#txt-postal-code").val()
}if(nonTrans){var c='{"email":"'+email+'","countryCode":"'+country+'","languageCode":"en","genderCode":'+gender+',"zipCode":"'+postalCode+'"}';
d=a
}else{var c='{"email":"'+email+'","firstName":"","lastName":"","gender":'+gender+',"postalCode":"'+postalCode+'","kids":"'+kid+'","frequency":"'+frequency+'","birthYear":"","birthMonth":"","birthDay":"","country":"'+country+'"}'
}$.ajax({type:"POST",url:d,dataType:"json",contentType:"application/json; charset=utf-8",data:c,success:function(h){sessionStorage.removeItem("newsletterSubmitted");
if(h){var g="ok";
var j=h.responseAlreadyExists;
var f=h.doubleOptInRequired;
var e=h.responseInvalidCountry;
if(g=="ok"&&e==false){if(j==true){var i=$(".newsletterEmailExistContent .m-error").html();
if(!$(".o-newsletter-popup .right-section .o-newsletter-padding .m-error.is-hidden").length>0){$(".o-newsletter-popup .right-section .o-newsletter-padding .m-error").html(i)
}else{$(".o-newsletter-popup .right-section .o-newsletter-padding .m-error").removeClass("is-hidden").html(i)
}}else{if(f==true){$(".is-newsletter-popup").addClass("newsletter-subscribe-popup");
var i=$(".newsletterOptInContent").html();
$(".o-newsletter-popup").html(i);
$(".newsletterPopUp-btn").click(function(){$(".is-newsletter-popup .a-icon-close").trigger("click");
$(".is-newsletter-popup").removeClass("newsletter-subscribe-popup")
})
}else{$(".is-newsletter-popup").addClass("newsletter-subscribe-popup");
var i=$(".newsletterSuccessContent").html();
$(".o-newsletter-popup").html(i);
$(".newsletterPopUp-btn").click(function(){$(".is-newsletter-popup .a-icon-close").trigger("click");
$(".is-newsletter-popup").removeClass("newsletter-subscribe-popup")
});
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterPopupSubscribed();
TealiumUtils.trackNewsletter()
}}}}else{$(".is-newsletter-popup").addClass("newsletter-subscribe-popup");
var i=$(".newsletterErrorContent").html();
$(".o-newsletter-popup").html(i);
$(".newsletterPopUp-btn").click(function(){$(".is-newsletter-popup .a-icon-close").trigger("click");
$(".is-newsletter-popup").removeClass("newsletter-subscribe-popup")
})
}$(".o-lightbox.newsletter-subscribe-popup").on("click",function(k){if($(k.target).hasClass("newsletter-subscribe-popup")){$(".is-newsletter-popup").removeClass("newsletter-subscribe-popup")
}});
$(".o-lightbox.newsletter-subscribe-popup .a-icon-close").on("click",function(){$(".is-newsletter-popup").removeClass("newsletter-subscribe-popup")
})
}}})
}function arketNewsLetterPopup(b,a){sessionStorage.setItem("newsletterSubmitted","true");
enablePersonal=$("#enablePersonal").val();
country=$("#country-options-popup").find(".is-dropdown-value.is-selected").data("value");
nonTrans=$("#country-options-popup").find(".is-dropdown-value.is-selected").data("isnontrans");
var d=b;
email=$("#txt-email-id").val();
if(!country){country=""
}kid=$("#connected_child").is(":checked");
frequency=true;
if(enablePersonal=="true"){gender=$("[name=gender]:checked").val()==undefined?0:$("[name=gender]:checked").val();
postalCode=$("#txt-postal-code").val()==undefined?"":$("#txt-postal-code").val()
}if(nonTrans){var c='{"email":"'+email+'","countryCode":"'+country+'","languageCode":"en","genderCode":'+gender+',"zipCode":"'+postalCode+'"}';
d=a
}else{var c='{"email":"'+email+'","firstName":"","lastName":"","gender":'+gender+',"postalCode":"'+postalCode+'","kids":"'+kid+'","frequency":"'+frequency+'","birthYear":"","birthMonth":"","birthDay":"","country":"'+country+'"}'
}$(".is-newsletter-ntn .a-icon-lg-close-circle").on("click",function(){$(".is-newsletter-ntn .newsletter-signup").show();
$(".is-newsletter-ntn .subscription-doubleoptin").hide();
$(".is-newsletter-ntn .subscription-confirmation").hide()
});
$.ajax({type:"POST",url:d,dataType:"json",contentType:"application/json; charset=utf-8",data:c,success:function(k){sessionStorage.removeItem("newsletterSubmitted");
sessionStorage.removeItem("trackNewsletterAlreadyExist");
if(k){var l=k.responseStatusCode;
var q=k.responseAlreadyExists;
var e=k.doubleOptInRequired;
var g=k.responseInvalidCountry;
var m=Granite.I18n.get("Verify your e-mail","","shared.clientlibs.components.js.newsletter.VerifyEmail");
var i=Granite.I18n.get("Please confirm your registration by clicking on the link in the email we sent to the e-mail address you signed up with.","","shared.clientlibs.components.js.newsletter.ConfirmRegistration");
var f=Granite.I18n.get("Thank you for subscribing","","shared.clientlibs.components.js.newsletter.ThankYou");
var o=Granite.I18n.get("You will receive an email confirmation shortly.","","shared.clientlibs.components.js.newsletter.SubscriptionConfirmation");
var j=Granite.I18n.get("You will receive an email with the discount code shortly.","","shared.clientlibs.components.js.newsletter.SubscriptionDiscount");
var n=Granite.I18n.get("Something went wrong","","shared.clientlibs.components.js.newsletter.SomethingWentWrong");
var p=Granite.I18n.get("Please try again later.","","shared.clientlibs.components.js.newsletter.TryAgainLater");
if(l=="ok"){if(q==true||g==true){var h=$(".o-newsletter-popup .email-value").find("#txt-email-id").data("alreadyexist-pattern-text");
$(".o-newsletter-popup .email-value").find(".a-label").last().html(h);
$(".o-newsletter-popup .email-value").addClass("has-error");
TealiumUtils.trackFunnelLocation("error_message","lightbox")
}else{if(e==true){$(".o-newsletter-popup:not(.is-newsletter-ntn) .newsletter-signup").hide();
$(".subscription-doubleoptin").append("<img class='a-image' src='/etc/designs/appeaser/p11/clientlibs/pattern-lib/images/newsletter-delivery-transparent.gif'><h2 class='a-heading-2'>"+m+"</h2><p class='a-paragraph'>"+i+"</p>");
$(".o-newsletter-popup:not(.is-newsletter-ntn) .subscription-doubleoptin").show()
}else{if(nonTrans){$(".o-newsletter-popup.is-newsletter-ntn .newsletter-signup").hide();
if(!$(".subscription-confirmation-ntn").find(".a-image").length>0){$(".subscription-confirmation-ntn").append("<img class='a-image' src='/etc/designs/appeaser/p11/clientlibs/pattern-lib/images/newsletter-delivery-transparent.gif'><h2 class='a-heading-2'>"+f+"</h2><p class='a-paragraph'>"+o+"</p>")
}$(".o-newsletter-popup.is-newsletter-ntn .subscription-confirmation").show()
}else{$(".o-newsletter-popup:not(.is-newsletter-ntn) .newsletter-signup").hide();
$(".subscription-confirmation").append("<img class='a-image' src='/etc/designs/appeaser/p11/clientlibs/pattern-lib/images/newsletter-delivery-transparent.gif'><h2 class='a-heading-2'>"+f+"</h2><p class='a-paragraph'>"+j+"</p>");
$(".o-newsletter-popup:not(.is-newsletter-ntn) .subscription-confirmation").show()
}TealiumUtils.newsletterPopupSubscribed();
TealiumUtils.trackNewsletter()
}}}else{if(nonTrans){$(".o-newsletter-popup.is-newsletter-ntn .newsletter-signup").hide();
if(!$(".subscription-confirmation-ntn").find(".status-error").length>0){$(".subscription-confirmation").append("<img class='a-image' src='/etc/designs/appeaser/p11/clientlibs/pattern-lib/images/newsletter-delivery-transparent.gif'><h2 class='a-heading-2 status-error'>"+n+"</h2><p class='a-paragraph'>"+p+"</p>")
}$(".o-newsletter-popup.is-newsletter-ntn .subscription-confirmation").show()
}else{$(".o-newsletter-popup:not(.is-newsletter-ntn) .newsletter-signup").hide();
$(".subscription-confirmation").append("<img class='a-image' src='/etc/designs/appeaser/p11/clientlibs/pattern-lib/images/newsletter-delivery-transparent.gif'><h2 class='a-heading-2'>"+n+"</h2><p class='a-paragraph'>"+p+"</p>");
$(".o-newsletter-popup:not(.is-newsletter-ntn) .subscription-confirmation").show()
}}}}})
}function weekDayNewsLetterPopup(b,a){var d=b;
sessionStorage.setItem("newsletterSubmitted","true");
enablePersonal=$("#enablePersonal").val();
email=$("#email-id-txt").val();
country=$("#country-options-popup").find(".is-dropdown-value.is-selected").data("value");
nonTrans=$("#country-options-popup").find(".is-dropdown-value.is-selected").data("isnontrans");
if(!country){country=""
}kid=$("#connected_child").is(":checked");
frequency=true;
if(enablePersonal=="true"){gender=$("[name=gender]:checked").val()==undefined?0:$("[name=gender]:checked").val();
postalCode=$("#txt-postal-code").val()==undefined?"":$("#txt-postal-code").val()
}if(nonTrans){var c='{"email":"'+email+'","countryCode":"'+country+'","languageCode":"en","genderCode":'+gender+',"zipCode":"'+postalCode+'"}';
d=a
}else{var c='{"email":"'+email+'","firstName":"","lastName":"","gender":'+gender+',"postalCode":"'+postalCode+'","kids":"'+kid+'","frequency":"'+frequency+'","birthYear":"","birthMonth":"","birthDay":"","country":"'+country+'"}'
}$.ajax({type:"POST",url:d,dataType:"json",contentType:"application/json; charset=utf-8",data:c,success:function(j){sessionStorage.removeItem("newsletterSubmitted");
sessionStorage.removeItem("trackNewsletterAlreadyExist");
if(j){var i="ok";
var k=j.responseAlreadyExists;
var g=j.doubleOptInRequired;
var f=j.responseInvalidCountry;
var e=j.responseStatusCode;
if(i=="ok"){if(k==true||f==true){var h=$(".o-newsletter-popup .no-description").find("#email-id-txt").data("alreadyexist-pattern-text");
$(".o-newsletter-popup .no-description").find(".a-label").last().html("<span>"+h+"</span>");
$(".o-newsletter-popup .no-description").addClass("has-error");
TealiumUtils.trackFunnelLocation("error_message","lightbox")
}else{if(nonTrans&&e!="ok"){$(".newsletter-popup-container").hide();
$(".subscription-error-ntl").show();
TealiumUtils.trackFunnelLocation("error_message","lightbox")
}else{$(".newsletter-popup-container").hide();
$(".subscription-confirmation").show();
Cookies.set("newsletter-popup","viewed",{expires:30});
Cookies.set("teaser-popup","viewed");
TealiumUtils.newsletterPopupSubscribed();
TealiumUtils.trackNewsletter()
}}}}}})
}function unsubscribeNewsLetterValidUser(c,g,d){var e=getUrlParam("bpid","");
var b=getUrlParam("guid","");
confirmUnsubscribePath=getThankYouPage($("#unsubscribepage").val());
var a='{"guid":"'+b+'","bpid":"'+e+'","isNonTransactional":"'+d+'"}';
if(b!=""&e!=""){var f=getGUIDValidation(g,h,a);
function h(i){if(i&&d=="true"){window.location=(confirmUnsubscribePath+"?statusCode=successNT");
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterUnsubscribed()
}}else{if(i){unsubscribeNewsLetter(c,g,e)
}else{window.location=(confirmUnsubscribePath+"?statusCode=error&email=true")
}}}}else{if(e!=""){unsubscribeNewsLetter(c,g,e)
}else{unsubscribeNewsLetter(c,g)
}}}function getUrlParam(c,b){var a=b;
if(window.location.href.indexOf(c)>-1){a=getUrlVars()[c]
}return a
}function getUrlVars(){var b={};
var a=window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,function(c,d,e){b[d]=e
});
return b
}function getGUIDValidation(c,b,a){$.ajax({type:"POST",url:c,dataType:"json",contentType:"application/json; charset=utf-8",success:function(f){var e;
if(f){var d=f.validEmail;
if(d=="success"||d=="ok"){e=true
}else{e=false
}b(e)
}},data:a})
}function callUnsubscribeServlet(c,d,a,b){$.ajax({type:"POST",url:c,dataType:"json",contentType:"application/json; charset=utf-8",success:function(f){if(f){var e=f.validEmail;
if(e=="success"||e=="ok"){window.location=(b+"?statusCode=success");
if(typeof(TealiumUtils)!=="undefined"){TealiumUtils.newsletterUnsubscribed()
}}else{if(a){window.location=(b+"?statusCode=error&email=true")
}else{window.location=(b+"?statusCode=error")
}}}},data:d})
};