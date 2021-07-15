//renewCommon
function lpPrint() {
    window.print();
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
            let tempLi = _obj.closest('li');
            console.log(tempLi.classList)
            if(tempLi.classList.contains('mode-edit')){
                tempLi.classList.remove('mode-edit');
            }else{
                tempLi.classList.add('mode-edit');
            }
        },
        init: function(){
            let toggleTrigger= doc.querySelectorAll('.toggle-info-line-li-btn');
            if(toggleTrigger) {
                Array.prototype.slice.call(toggleTrigger).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        renewCommon.infoLineToggle.changeBtnMode(this);
                        let tempUl = this.closest('ul');
                        let tempLi = tempUl.querySelectorAll('.info-line-toggle-li');
                        if(tempLi){
                            Array.prototype.slice.call(tempLi).forEach( function (_obj) {
                                if(_obj.classList.contains('mode-edit')){
                                    _obj.classList.remove('mode-edit')
                                }else {
                                    _obj.classList.add('mode-edit')
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
            let openTooltipBtns = doc.querySelectorAll('.open-tooltip-btn'),
                aTabCon = doc.querySelectorAll('.a-tab-con');
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
                        let tempLi = this.closest('li');
                        if(tempLi && !tempLi.classList.contains('mode-edit')){
                            tempLi.classList.add('mode-edit')
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
                        let tempLi = this.closest('li');
                        if(tempLi && tempLi.classList.contains('mode-edit')){
                            tempLi.classList.remove('mode-edit')
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

    return obj;
})(document, window);

(function() {
    'use strict';
    // console.log('frontend.renew.js start!');
    renewCommon.initialize();
})();