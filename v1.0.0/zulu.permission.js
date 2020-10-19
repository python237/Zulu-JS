/*!
* Copyright (c) 2020-present, Comparo Group. All rights reserved.
* Zulu JavaScript Library v1.0.0 - Permission Tools
*
* Copyright Comparo Group and other contributors
* Released under the MIT license
*
* @author Didier Tagne
* @mail tagnedidier@gmail.com
*/


;(function (fn, context) {
    'use strict';

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check version
    if (!fn.factory.requires('1.0.0')) throw new Error("zulu ajax extension requires V1.0.0");

    function Location(successCallback, failedCallback) {
        this.oldBrowserState = 0;
        this.permissionDeniedState = 1;
        this.positionUnavailableState = 2;
        this.timeoutState = 3;
        this.unknownErrorState = 4;

        const $this = this;

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                function (position) {
                    // Get Latitude and longitude
                    successCallback(position.coords.latitude, position.coords.longitude);
                },
                function (positionError) {
                    let state;

                    switch(positionError.code) {
                        case positionError.PERMISSION_DENIED:
                            state = $this.permissionDeniedState;
                            break;

                        case positionError.POSITION_UNAVAILABLE:
                            state = $this.positionUnavailableState;
                            break;

                        case positionError.TIMEOUT:
                            state = $this.timeoutState;
                            break;

                        default:
                            state = $this.unknownErrorState;
                          break;
                    }

                    if (typeof failedCallback === 'function') failedCallback(state);
                }
            )
        }
        else if (typeof failedCallback === 'function') failedCallback($this.oldBrowserState);
    }

    /**
     * @param {{}, string} data
     * @constructor
     */
    function Notify(data) {
        // Define variable
        this.title = '';
        this.body = '';
        this.lang = '';
        this.icon = '';
        this.image = '';
        this.dir = 'auto';
        this.tag = '';
        this.renotify = false;
        this.requireInteraction = false;
        this.onclick = null;
        this.onerror = null;
        this.onshow = null;
        this.onclose = null;
        this.permissionDeniedCallback = function() {};
        this.oldBrowserCallback = function() {};

        // Check if user grant notification
        Notify.prototype.isGranted = Notification.permission === 'granted';

        // Check if navigator not implements notification
        Notify.prototype.isOldBrowser = !("Notification" in window);

        /**
         * Demand permission and save result
         * @return {boolean} values define if notification permission is accept or denied
         */
        Notify.prototype.init = function () {
            if (this.isOldBrowser) {
                return false;
            }
            else if (this.isGranted) {
                // Permission is grant
                return true;
            }
            else if (Notification.permission !== 'denied') {
                // Demand permission
                Notification.requestPermission(function (permission) {
                    // Save state
                    if(!('permission' in Notification)) {
                        Notification.permission = permission;
                    }
                });
                return this.init();
            }
            else {
                // Permission is denied
                return false;
            }
        };

        /**
         * @param {{}} options Notification options
         */
        Notify.prototype.setOptions = function(options) {
            if (options === undefined) return;
            else if (typeof options.valueOf() === 'string') this.title = options;
            else {
                this.title = options.title || this.title;
                this.body = options.body || this.body;
                this.lang = options.lang || this.lang;
                this.icon = options.icon || this.icon;
                this.image = options.image || this.image;
                this.dir = options.dir || this.dir;
                this.tag = options.tag || this.tag;
                this.renotify = options.renotify || this.renotify;
                this.requireInteraction = options.requireInteraction || this.requireInteraction;
                this.onclick = options.onclick || this.onclick;
                this.onerror = options.onerror || this.onerror;
                this.onshow = options.onshow || this.onshow;
                this.onclose = options.onclose || this.onclose;
                this.permissionDeniedCallback = options.permissionDeniedCallback || this.permissionDeniedCallback;
                this.oldBrowserCallback = options.oldBrowserCallback || this.oldBrowserCallback;
            }
        };

        /**
         * @param {{}} options Notification options
         */
        Notify.prototype.show = function (options) {
            this.setOptions(options);

            if (this.isOldBrowser) this.oldBrowserCallback();
            else if (!this.isGranted) this.permissionDeniedCallback();
            else {
                new Notification(this.title, {
                    'body': this.body,
                    'lang': this.lang,
                    'icon': this.icon,
                    'image': this.image,
                    'dir': this.dir,
                    'tag': this.tag,
                    'renotify': this.renotify,
                    'requireInteraction': this.requireInteraction,
                    'onclick': this.onclick,
                    'onerror': this.onerror,
                    'onshow': this.onshow,
                    'onclose': this.onclose
                });
            }
        };

        this.setOptions(data);
    }

    fn.prototype.location = Location;
    fn.prototype.notify = function (data) {
        if (typeof data === 'undefined') throw new Error('System requires data arguments');
        else return new Notify(data);
    };

    fn.factory.extensions.location = Location;
    fn.factory.extensions.notify = Notify;
})(
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux),
    (function(func) {
        if (!(typeof func === 'undefined') && typeof func === 'function') return func;
        else throw new Error("Requires zulu");
    })(z || window.zulu)
);
