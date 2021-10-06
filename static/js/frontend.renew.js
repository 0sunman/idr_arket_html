//renewCommon
//오픈되어 있는 o-lightbox 내에 html 가져오기
function makeHtml(){
    let tempHtml = document.querySelector('.o-lightbox.is-open').innerHTML
    const obj = {html : ''};
    let html = '<div class="o-lightbox is-open">';
    html += tempHtml;
    html += '</div>';
    obj.html = html;
    return obj;
}

//프린트를 위한 임시 window
function openTempPrintWin(param){
    const setting = "width=auto, height=auto";
    const objWin = window.open('', 'print', setting);
    objWin.document.open();
    objWin.document.write('<html><head><title>Print</title>');
    objWin.document.write('<link rel="stylesheet" type="text/css" href="../css/frontend.renew.css"/>');
    objWin.document.write('</head><body class="temp-win-for-print">');
    objWin.document.write(param.html);
    objWin.document.write('</body></html>');
    objWin.focus();
    objWin.document.close();

    setTimeout(function(){
        objWin.print();
        objWin.close();
    }, 1000);
}

//lightbox popup print call
function lpPrint() {
    // let printHtml = makeHtml();
    // openTempPrintWin(printHtml);
    window.print()
}

function formatDate(a) {
    if (a < 9) {
        return "0" + a
    }
    return a
}

//IE browser Check
function isBrowserIE(){
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
        // ie일 경우
        return true;
    }else{
        // ie일 아닐 경우
        return false;
    }
}

//샵인샵 PC 띠배너 체크 후 header position 재정의
function setSisHeaderPosition(ntfbnnrVarlue){
    //css 가상프로퍼티 생성
    document.documentElement.style.setProperty('--ntfbnnrh', ntfbnnrVarlue + 'px');

    //IE 브라우저 체크
    if(isBrowserIE()){
        let hasSisHeader = $('header.o-header.has-sis-header'),
        hasSisHeaderWithNotification = $('header.o-header.has-sis-header.has-sis-notification'),
        navigationCurtain = hasSisHeaderWithNotification.find('.o-navigation .navigation-curtain');

        // header.o-header.has-sis-header.has-sis-notification .o-navigation .navigation-curtain { top: calc(56px + 37px + var(--ntfbnnrh, 1ntfbnnrh)); }
        let tempCssVal3 = 56 + 37 + ntfbnnrVarlue;
        navigationCurtain.css('top',tempCssVal3+'px');
    }
}

//띠배너 카운터
function displaySiteBannerCountDown() {
    var e, g = null;
    var t = new Date();
    if (t) {
        var m = t.getFullYear() + "/" + formatDate(parseInt(t.getMonth() + 1)) + "/" + formatDate(t.getDate()) + " " + formatDate(t.getHours()) + ":" + formatDate(t.getMinutes()) + ":00";
        var q = new Date(m);
        var d = document.getElementById("sitebannercountsd");
        var n = document.getElementById("sitebannercounted");
        var f = false;
        var u = false;
        var k = false;
        var c = false;
        var a = false;
        if (d && n) {
            e = new Date(document.getElementById("sitebannercountsd").value);
            if (e && e > q) {
                f = true
            }
        }
        if (n) {
            g = new Date(document.getElementById("sitebannercounted").value);
            if (g) {
                c = true;
                if (g <= q) {
                    k = true
                }
            } else {
                u = true
            }
        } else {
            u = true
        }
        var i = document.getElementById("desktoptimer");
        var j = document.getElementById("mobiletimer");
        var h = document.getElementById("desktopMessageAfterDueDateid");
        var r = document.getElementById("mobileMessageAfterDueDateid");
        var s = document.getElementById("site-banner-id");
        var b = document.getElementById("site-banner-desktop-timer");
        if (f) {
            s.parentNode.removeChild(s)
        } else {
            if (i) {
                if (k) {
                    if (h) {
                        b.innerHTML = h.value
                    } else {
                        if (s) {
                            // b.parentNode.removeChild(b);
                            i.parentNode.removeChild(i);
                            a = true
                        }
                    }
                } else {
                    if (c && !u) {
                        i.classList.remove("is-hidden");
                        var p = new Date(g).getTime();
                        var o = setInterval(function () {
                            var x = new Date().getTime();

                            var w = p - x;
                            if (w > 0) {
                                var E = document.getElementById("desktopdaysid");
                                var y = document.getElementById("desktophoursid");
                                var A = document.getElementById("desktopminutesid");
                                var v = document.getElementById("desktopsecondsid");
                                if (E) {
                                    var D = Math.floor(w / (1000 * 60 * 60 * 24));
                                    if (D == 0) {
                                        E.className = "is-hidden"
                                        document.getElementById("desktopdayspan").className = "is-hidden"
                                    } else {
                                        if (D < 10) {
                                            D = ("0" + D).slice(-2)
                                        }
                                        document.getElementById("desktopdaysid").value = D
                                    }
                                    var B = Math.floor((w % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                    var z = Math.floor((w % (1000 * 60 * 60)) / (1000 * 60));
                                    if (z < 10) {
                                        z = ("0" + z).slice(-2)
                                    }
                                    var C = Math.floor((w % (1000 * 60)) / 1000);
                                    if (C < 10) {
                                        C = ("0" + C).slice(-2)
                                    }
                                } else {
                                    var B = Math.floor(w / (1000 * 60 * 60));
                                    if (B > 99) {
                                        var B = 99
                                    } else {
                                        if (B < 10) {
                                            B = ("0" + B).slice(-2)
                                        }
                                    }
                                    var z = Math.floor((w % (1000 * 60 * 60)) / (1000 * 60));
                                    if (z < 10) {
                                        z = ("0" + z).slice(-2)
                                    }
                                    var C = Math.floor((w % (1000 * 60)) / 1000);
                                    if (C < 10) {
                                        C = ("0" + C).slice(-2)
                                    }
                                }
                                if (y) {
                                    document.getElementById("desktophoursid").value = B
                                }
                                if (A) {
                                    document.getElementById("desktopminutesid").value = z
                                }
                                if (v) {
                                    document.getElementById("desktopsecondsid").value = C
                                }
                            } else {
                                clearInterval(o);
                                if (h) {
                                    document.getElementById("site-banner-desktop-timer").innerHTML = h.value
                                } else {
                                    if (s) {
                                        s.parentNode.removeChild(s)
                                    }
                                }
                            }
                        }, 1000)
                    }
                }
            }
            if (j) {
                if (k) {
                    if (r) {
                        document.getElementById("site-banner-mobile-timer").innerHTML = r.value
                    } else {
                        if (a) {
                            s.parentNode.removeChild(s)
                        } else {
                            if (s && s.parentNode) {
                                document.getElementById("site-banner-mobile-timer").parentNode.removeChild(document.getElementById("site-banner-mobile-timer"))
                            }
                        }
                    }
                } else {
                    if (c && !u) {
                        j.classList.remove("is-hidden");
                        var p = new Date(g).getTime();
                        var l = setInterval(function () {
                            var w = new Date().getTime();
                            var v = p - w;
                            if (v > 0) {
                                var y = document.getElementById("mobiledaysid");
                                var E = document.getElementById("mobilehoursid");
                                var C = document.getElementById("mobileminutesid");
                                var z = document.getElementById("mobilesecondsid");
                                if (y) {
                                    var D = Math.floor(v / (1000 * 60 * 60 * 24));
                                    if (D == 0) {
                                        // [ARKET] DAY input 숨김 - 시작
                                        y.className = "is-hidden"
                                        // [ARKET] DAY input 숨김 - 끝
                                        document.getElementById("mobiledayspan").className = "is-hidden"
                                    } else {
                                        if (D < 10) {
                                            D = ("0" + D).slice(-2)
                                        }
                                        document.getElementById("mobiledaysid").value = D
                                    }
                                    var A = Math.floor((v % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    if (A < 10) {
                                        A = ("0" + A).slice(-2)
                                    }
                                    var x = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                    if (x < 10) {
                                        x = ("0" + x).slice(-2)
                                    }
                                    var B = Math.floor((v % (1000 * 60)) / 1000);
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                } else {
                                    var A = Math.floor(v / (1000 * 60 * 60));
                                    if (A > 99) {
                                        var A = 99
                                    } else {
                                        if (A < 10) {
                                            A = ("0" + A).slice(-2)
                                        }
                                    }
                                    var x = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                    if (x < 10) {
                                        x = ("0" + x).slice(-2)
                                    }
                                    var B = Math.floor((v % (1000 * 60)) / 1000);
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                }
                                if (E) {
                                    document.getElementById("mobilehoursid").value = A
                                }
                                if (C) {
                                    document.getElementById("mobileminutesid").value = x
                                }
                                if (z) {
                                    document.getElementById("mobilesecondsid").value = B
                                }
                            } else {
                                clearInterval(l);
                                if (r) {
                                    document.getElementById("site-banner-mobile-timer").innerHTML = r.value
                                } else {
                                    if (s && s.parentNode) {
                                        s.parentNode.removeChild(s)
                                    }
                                }
                            }
                        }, 1000)
                    }
                }
            }
        }
    }
}

var renewCommon = renewCommon || function(){};
renewCommon = (function(doc, win){
    var obj = {};

    obj.initialize = function(){
        renewCommon.accordion.init();
        renewCommon.aTab.init();
        renewCommon.rdToggle.init();
        renewCommon.chckToggle.init();
        renewCommon.infoLineToggle.init();
        renewCommon.aTooltip.init();
        renewCommon.toggleBx.init();
        renewCommon.dialogBtn.init();
    }

    //accordion
    obj.accordion = {
        resetActive: function(){
            let accordionTit = doc.querySelectorAll('.accordion-tit');
            Array.prototype.slice.call(accordionTit).forEach( function (_obj) {
                _obj.classList.remove("active")
            });
        },
        init: function(){
            let accordionTit = doc.querySelectorAll('.accordion-tit'),
                accordionCon = doc.querySelectorAll('.accordion-con');
            if(accordionTit) {
                Array.prototype.slice.call(accordionTit).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        renewCommon.accordion.resetActive();
                        _obj.classList.add("active");
                        let _targetClass = this.getAttribute('data-target');
                        let _target = doc.querySelector('.' + _targetClass);
                        Array.prototype.slice.call(accordionCon).forEach(function (_con) {
                            _con.classList.remove("active")
                        });
                        if(_target) {
                            if (_target.classList.contains("active")) {
                                _target.classList.remove("active");
                            } else {
                                _target.classList.add("active");
                            }
                        }
                    });
                });
            }
        }
    }

    //aTab
    obj.aTab = {
        resetActive: function(){
            let aTab = doc.querySelectorAll('.a-tab');
            Array.prototype.slice.call(aTab).forEach( function (_obj) {
                _obj.classList.remove("active")
            });
        },
        init: function(){
            let aTab = doc.querySelectorAll('.a-tab'),
                aTabCon = doc.querySelectorAll('.a-tab-con');
            if(aTab) {
                Array.prototype.slice.call(aTab).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        renewCommon.aTab.resetActive();
                        _obj.classList.add("active");
                        let _targetClass = this.getAttribute('data-target');
                        let _target = doc.querySelector('.' + _targetClass);
                        Array.prototype.slice.call(aTabCon).forEach(function (_con) {
                            _con.classList.remove("active")
                        });
                        if (_target.classList.contains("active")) {
                            _target.classList.remove("active");
                        } else {
                            _target.classList.add("active");
                        }
                    });
                });
            }
        }
    }

    //rd-toggle
    obj.rdToggle = {
        resetActive: function(_name){
            let rdToggleCon = doc.querySelectorAll('.rd-toggle-con');
            Array.prototype.slice.call(rdToggleCon).forEach( function (_obj) {
                if(_obj.getAttribute('data-name') == _name){
                    _obj.classList.add("is-hidden-strong");
                }

            });
        },
        init: function(){
            let rdToggle = doc.querySelectorAll('.rd-toggle');
            if(rdToggle) {
                Array.prototype.slice.call(rdToggle).forEach( function (_obj) {
                    _obj.addEventListener('change', function (_evt) {
                        let _this = this;
                        let _targetName = this.getAttribute('name');
                        let _targetClass = this.getAttribute('data-toggle-target');
                        let _targetCon = doc.querySelectorAll('.' + _targetClass);

                        renewCommon.rdToggle.resetActive(_targetName);

                        if(_targetCon){
                            Array.prototype.slice.call(_targetCon).forEach( function (_obj) {
                                let _targetConName = _obj.getAttribute('data-name');
                                if(_this.checked  && _targetName == _targetConName){
                                    _obj.classList.remove('is-hidden-strong');
                                }else{
                                    _obj.classList.add('is-hidden-strong');
                                }
                            })
                        }
                    });
                });
            }
        }
    }

    //chck-toggle
    obj.chckToggle = {
        init: function(){
            let chckToggle = doc.querySelectorAll('.chck-toggle');
            if(chckToggle) {
                Array.prototype.slice.call(chckToggle).forEach( function (_obj) {
                    _obj.addEventListener('change', function (_evt) {
                        let _this = this;
                        let _targetClass = this.getAttribute('data-toggle-target');
                        let _targetCon = doc.querySelector('.' + _targetClass);
                        if(_targetCon){
                            if(_this.checked){
                                _targetCon.classList.remove('is-hidden-strong');
                            }else{
                                _targetCon.classList.add('is-hidden-strong');
                            }
                        }
                    });
                });
            }
        }
    }

    //info-line-toggle
    obj.infoLineToggle = {
        changeBtnMode: function(_obj){
            // let tempLi = _obj.closest('li');
            // if(tempLi.classList.contains('mode-edit')){
            //     tempLi.classList.remove('mode-edit');
            // }else{
            //     tempLi.classList.add('mode-edit');
            // }
            let tempLi = _obj.parents('li');
            if(tempLi.hasClass('mode-edit')){
                tempLi.removeClass('mode-edit');
            }else{
                tempLi.addClass('mode-edit');
            }
        },
        init: function(){
            let toggleTrigger= doc.querySelectorAll('.toggle-info-line-li-btn');
            if(toggleTrigger) {
                Array.prototype.slice.call(toggleTrigger).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // renewCommon.infoLineToggle.changeBtnMode(this);
                        // let tempUl = this.closest('ul');
                        // let tempLi = tempUl.querySelectorAll('.info-line-toggle-li');
                        // if(tempLi){
                        //     Array.prototype.slice.call(tempLi).forEach( function (_obj) {
                        //         if(_obj.classList.contains('mode-edit')){
                        //             _obj.classList.remove('mode-edit')
                        //         }else {
                        //             _obj.classList.add('mode-edit')
                        //         }
                        //     })
                        // }
                        renewCommon.infoLineToggle.changeBtnMode($(this))
                        let tempUl = $(this).parents('ul');
                        let tempLi = tempUl.find('.info-line-toggle-li');
                        if(tempLi){
                            Array.prototype.slice.call(tempLi).forEach( function (_obj) {
                                if($(_obj).hasClass('mode-edit')){
                                    $(_obj).removeClass('mode-edit')
                                }else {
                                    $(_obj).addClass('mode-edit')
                                }
                            })
                        }
                    });
                });
            }
        }
    }

    //aTab
    obj.aTooltip = {
        init: function(){
            let openTooltipBtns = doc.querySelectorAll('.open-tooltip-btn');
            if(openTooltipBtns) {
                Array.prototype.slice.call(openTooltipBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        if (this.parentNode.classList.contains("is-open")) {
                            this.parentNode.classList.remove("is-open");
                        }else{
                            this.parentNode.classList.add("is-open");
                        }
                    });
                });
            }
        }
    }

    //배송지 수정, 삭제 버튼 클릭이벤트
    obj.deliverListEdit = {
        init: function(){
            let btnDlvrEdit = document.querySelectorAll('.delivery-item-edit');
            let btnDlvrDel = document.querySelectorAll('.delivery-item-del');
            if(btnDlvrEdit) {
                Array.prototype.slice.call(btnDlvrEdit).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempLi = this.closest('li');
                        // if(tempLi && !tempLi.classList.contains('mode-edit')){
                        //     tempLi.classList.add('mode-edit')
                        // }
                        let tempLi = $(this).parents('li');
                        if(tempLi && !tempLi.hasClass('mode-edit')){
                            tempLi.addClass('mode-edit')
                        }
                    });
                });
            }
            let btnDlvrEditCancle = document.querySelectorAll('.btn-my-dlvr-cancle');
            if(btnDlvrEditCancle){
                Array.prototype.slice.call(btnDlvrEditCancle).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempLi = this.closest('li');
                        // if(tempLi && tempLi.classList.contains('mode-edit')){
                        //     tempLi.classList.remove('mode-edit')
                        // }
                        let tempLi = $(this).parents('li');
                        if(tempLi && tempLi.hasClass('mode-edit')){
                            tempLi.removeClass('mode-edit')
                        }
                    });
                });
            }
        }
    }

    //mode-wrap 수정, 취소버튼 클릭이벤트
    obj.modeEditView = {
        init: function(){
            let editBtn = document.querySelectorAll('.mode-edit-btn');
            if(editBtn) {
                Array.prototype.slice.call(editBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempModeWrap = this.closest('.mode-wrap');
                        // if(tempModeWrap){
                        //     tempModeWrap.classList.remove('mode-view')
                        //     tempModeWrap.classList.add('mode-edit')
                        // }
                        let tempModeWrap = $(this).parents('.mode-wrap');
                        if(tempModeWrap){
                            tempModeWrap.removeClass('mode-view')
                            tempModeWrap.addClass('mode-edit')
                        }
                    });
                });
            }
            let viewBtn = document.querySelectorAll('.mode-view-btn');
            if(viewBtn){
                Array.prototype.slice.call(viewBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempModeWrap = this.closest('.mode-wrap');
                        // if(tempModeWrap){
                        //     tempModeWrap.classList.add('mode-view')
                        //     tempModeWrap.classList.remove('mode-edit')
                        // }
                        let tempModeWrap = $(this).parents('.mode-wrap');
                        if(tempModeWrap){
                            tempModeWrap.addClass('mode-view')
                            tempModeWrap.removeClass('mode-edit')
                        }
                    });
                });
            }
        }
    }

    //toggle-bx
    obj.toggleBx = {
        resetBtn: function(_this){
            let toggleBxBtn = doc.querySelectorAll('.toggle-bx-btn');
            Array.prototype.slice.call(toggleBxBtn).forEach( function (_obj) {
                if(_obj != _this){
                    _obj.classList.remove("active")
                }
            });
        },
        init: function(){
            let toggleBxBtn = doc.querySelectorAll('.toggle-bx-btn'),
                toggleBxCon = doc.querySelectorAll('.toggle-bx-con');
            if(toggleBxBtn) {
                Array.prototype.slice.call(toggleBxBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        let _this = this;
                        let _targetClass = this.getAttribute('data-target');
                        let _target = doc.querySelector('.toggle-bx-con.' + _targetClass);
                        if(_target){
                            if(toggleBxCon) {
                                renewCommon.toggleBx.resetBtn(_this);
                                Array.prototype.slice.call(toggleBxCon).forEach(function (_con) {
                                    _con.classList.remove("active")
                                });
                            }
                            if (this.classList.contains("active")) {
                                this.classList.remove("active");
                                _target.classList.remove("active");
                            } else {
                                this.classList.add("active");
                                _target.classList.add("active");
                            }
                        }
                    });
                });
            }
        }
    }

    //dialogBtn
    obj.dialogBtn = {
        bodyHold: function(flag){
            let body = doc.querySelector('body');
            if(flag){
                body.classList.add('u-overflow-hidden');
            }else{
                body.classList.remove('u-overflow-hidden');
            }
        },
        init: function(){
            let dialogBxs = doc.querySelectorAll('.dialog-bx');
            if(dialogBxs){
                Array.prototype.slice.call(dialogBxs).forEach( function (_obj) {
                    let _tempId = _obj.getAttribute('id');
                    if(_obj.classList.contains('basic')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-basic",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                    if(_obj.classList.contains('alert')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-alert",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                    if(_obj.classList.contains('confirm')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-confirm",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                });
            }
            let dialogBtns = doc.querySelectorAll('.open-dialog-btn');
            if(dialogBtns) {
                Array.prototype.slice.call(dialogBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        let _targetDialogId = this.getAttribute('data-target');
                        $('#'+_targetDialogId).dialog('open');
                        renewCommon.dialogBtn.bodyHold(true);
                    });
                });
            }
            let dialogCloseBtns = doc.querySelectorAll('.dialog-close-btn');
            if(dialogCloseBtns) {
                Array.prototype.slice.call(dialogCloseBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        // let _targetDialogId = this.closest('.dialog-bx').getAttribute('id');
                        let _targetDialogId = $(this).parents('.dialog-bx').attr('id');
                        $('#'+_targetDialogId).dialog('close');
                        renewCommon.dialogBtn.bodyHold(false);
                    });
                });
            }
            let uiDialogCloseBtns = doc.querySelectorAll('.ui-dialog-titlebar-close');
            if(uiDialogCloseBtns) {
                Array.prototype.slice.call(uiDialogCloseBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        renewCommon.dialogBtn.bodyHold(false);
                    });
                });
            }

        }
    }

    //loading
    obj.loadingDisplay = {
        page: function (flag) {
            let body = doc.querySelector('body');
            if(flag){
                body.classList.add('is-page-loading');
            }else{
                body.classList.remove('is-page-loading');
            }
        }
    }

    return obj;
})(document, window);

(function() {
    'use strict';
    // console.log('frontend.renew.js start!');
    renewCommon.initialize();
})();