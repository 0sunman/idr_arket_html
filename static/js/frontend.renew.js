//renewCommon
var renewCommon = renewCommon || function(){};
renewCommon = (function(doc, win){
    var obj = {};

    obj.initialize = function(){
        renewCommon.accordion.init();
        renewCommon.aTab.init();
        renewCommon.rdToggle.init();
        renewCommon.chckToggle.init();
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
                        let _targetCon = doc.querySelector('.' + _targetClass);

                        renewCommon.rdToggle.resetActive(_targetName);

                        if(_targetCon){
                            let _targetConName = _targetCon.getAttribute('data-name');
                            if(_this.checked  && _targetName == _targetConName){
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

    return obj;
})(document, window);

(function() {
    'use strict';
    // console.log('frontend.renew.js start!');
    renewCommon.initialize();
})();