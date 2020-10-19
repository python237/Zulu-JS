/*!
* Copyright (c) 2020-present, Comparo Group. All rights reserved.
* Zulu JavaScript Library v1.0.0 - Ajax Tools
*
* Copyright Comparo Group and other contributors
* Released under the MIT license
*
* @author Didier Tagne
* @mail tagnedidier@gmail.com
*/


;(function(fn, context) {
    "use strict";

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check version
    if (!fn.factory.requires('1.0.0')) throw new Error("zulu ajax extension requires V1.0.0");

    const xhrListener = {
        /**
         * Launch manually callback or list callback define.
         *
         * @param callback The functions or list callback.
         * @param args The arguments must be send in callback params.
         */
        launchCallback: function (callback, args) {
            if (typeof callback === 'object')
                for (let i = 0; i < callback.length; i++) callback[i](args);
            else callback(args);
        },

        /**
         * Check if new callback functions has correct.
         *
         * @param {Function, Function[]} callback The functions or list functions.
         * @returns {Function}
         */
        checkCallback: function (callback) {
            if (typeof callback === 'function') return callback;
            else if (typeof callback === 'object') {
                for (let i = 0; i < callback.length; i++) this.checkCallback(callback[i]);
                return callback;
            }
            else throw new Error("callback requires function or list functions");
        }
    };

    /**
     * @param url The url of website (server connection).
     * @constructor Xhr (Ajax) constructors.
     */
    function Ajax(url) {
        this.xhr = undefined;
        this.url = url;
        this.type = 'json';
        this.credentials = true;
        this.mimeType = 'text/json';
        this.timeout = 1000 * 60 * 5;  // 5 Minutes
        this.responseCallback = function() {};
        this.oldNavigatorCallback = function() {};
        this.collisionCallback = function() {};
        this.serverErrorCallback = function() {};
        this.requestBeginCallback = function() {};
        this.requestEndCallback = function() {};
        this.downloadProgressCallback = function() {};
        this.timeoutExceptionCallback = function() {};
        this.requestErrorCallback = function() {};
        this.requestAbortCallback = function() {};
        this.requestHeaders = {};
        this.allowAllOrigin = false;

        let isOldNavigator = false;
        let running = false;
        let data = undefined;
        const $this = this;

        ////////////////
        // Object Method

        Ajax.prototype.valueOf = {};
        Ajax.prototype.isZulu = "Zulu XHR Object";

        /**
         * Check if request operation has true or false in progress.
         * @returns {boolean}
         */
        Ajax.prototype.running = function() {
            return running;
        };

        /**
         * Define if true or false xhr request send all data on server request (cookies, session, ... data).
         *
         * @param {boolean} values Define if authorize send request data to server.
         * @returns {Ajax}
         */
        Ajax.prototype.setCredentials = function(values) {
            this.credentials = values;
            return this;
        };

        /**
         * Define the recommendation usages to server request.
         *
         * @param {String} values The data type who server will be response.
         * @param {String} mimeType The data type will be send to server.
         * @returns {Ajax}
         */
        Ajax.prototype.setType = function(values, mimeType) {
            this.type = values;
            this.mimeType = mimeType;
            return this;
        };

        /**
         * Define the maximal time of each xhr request to server.
         *
         * @param {number} time The maximal time of each request.
         * @returns {Ajax}
         */
        Ajax.prototype.setTimeout = function(time) {
            this.timeout = time;
            return this;
        };
        
        /*
         * Set the headers property to ajax request
         * @param {JSON} data The list of all headers property will be added.
        */
        Ajax.prototype.setRequestHeaders = function(data) {
        	this.requestHeaders = data;
        };

        /**
         * Send xhr request.
         *
         * @param {{}} serverData The server data.
         * @returns {Ajax}
         */
        Ajax.prototype.start = function(serverData) {
            if (typeof serverData.method === 'undefined') throw new Error("method request requires");

            this.responseCallback = xhrListener.checkCallback(serverData.response || this.responseCallback);
            this.oldNavigatorCallback = xhrListener.checkCallback(serverData.oldNavigator || this.oldNavigatorCallback);
            this.collisionCallback = xhrListener.checkCallback(serverData.collision || this.collisionCallback);
            this.serverErrorCallback = xhrListener.checkCallback(serverData.serverError || this.serverErrorCallback);
            this.requestBeginCallback = xhrListener.checkCallback(serverData.requestBegin || this.requestBeginCallback);
            this.requestEndCallback = xhrListener.checkCallback(serverData.requestEnd || this.requestEndCallback);
            this.downloadProgressCallback = xhrListener.checkCallback(serverData.downloadProgress || this.downloadProgressCallback);
            this.timeoutExceptionCallback = xhrListener.checkCallback(serverData.timeoutException || this.timeoutExceptionCallback);
            this.requestErrorCallback = xhrListener.checkCallback(serverData.requestError || this.requestErrorCallback);
            this.requestAbortCallback = xhrListener.checkCallback(serverData.requestAbort || this.requestAbortCallback);
            this.credentials = serverData.credentials || this.credentials;
            this.type = serverData.type || this.type;
            this.mimeType = serverData.mimeType || this.mimeType;
            this.timeout = serverData.timeout || this.timeout;
            this.requestHeaders = serverData.headers || this.requestHeaders;
            this.allowAllOrigin = serverData.allowAllOrigin || this.allowAllOrigin;

            const authenticate = serverData.authenticate || false;

            if (isOldNavigator) xhrListener.launchCallback(this.oldNavigatorCallback);
            else if (running) xhrListener.launchCallback(this.collisionCallback, serverData);  // Other operation in progress.
            else {
                let i;
                data = "" + (serverData.data || '');

                this.xhr.open(serverData.method, this.url, true);
                this.xhr.withCredentials = this.credentials;
                this.xhr.overrideMimeType(this.mimeType);
                this.xhr.timeout = this.timeout;
                
                for (i in this.requestHeaders) this.xhr.setRequestHeader(i, this.requestHeaders[i]);
                // Allow all origin
                if (this.allowAllOrigin) this.xhr.setRequestHeader("Access-Control-Allow-Origin", "*");

                if (serverData.method === "POST") {
                    const field = serverData.data || [];
                    let dgram = null;

                    if (!(typeof field === 'undefined') && typeof field != null) {
                        if (field.isZulu === fn.factory.type) dgram = new FormData(field.node);
                        else {
                            dgram = new FormData();

                            for(i = 0; i<field.length; i++) {
                                if (!(typeof field[i] === 'object')) throw new Error("data array error");
                                dgram.append(field[i][0], field[i][1]);
                            }
                        }
                    }

                    if (authenticate) {
                        const auth = context("input[name=csrfmiddlewaretoken][type=hidden]");

                        if (!(typeof auth === 'undefined')) {
                            if (dgram != null) dgram.append(
                                "csrfmiddlewaretoken", auth.take(0).attr('value', undefined) || ''
                            );
                            else {
                                dgram = new FormData();
                                dgram.append(
                                    "csrfmiddlewaretoken", auth.take(0).attr('value', undefined) || ''
                                );
                            }
                        }
                    }

                    this.xhr.send(dgram);
                }
                else this.xhr.send(null);
            }

            return this;
        };

        /**
         * Send request with post method.
         *
         * @param {Object} data The server data.
         * @returns {Ajax}
         */
        Ajax.prototype.post = function(data) {
            data.method = "POST";
            return this.start(data);
        };

        /**
         * Send request with get method.
         *
         * @param {Object} data The server data.
         * @returns {Ajax}
         */
        Ajax.prototype.get = function(data) {
            data.method = "GET";
            return this.start(data);
        };

        /**
         * Abort request in progress.
         * @returns {Ajax}
         */
        Ajax.prototype.abort = function() {
            this.xhr.abort();
            return this;
        };
        
        Ajax.prototype.setResponseCallback = function(callback) {
            this.responseCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setOldNavigatorCallback = function(callback) {
            this.oldNavigatorCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setCollisionCallback = function(callback) {
            this.collisionCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setServerErrorCallback = function(callback) {
            this.serverErrorCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setRequestBeginCallback = function(callback) {
            this.requestBeginCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setRequestEndCallback = function(callback) {
            this.requestEndCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setDownloadProgressCallback = function(callback) {
            this.downloadProgressCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setTimeoutExceptionCallback = function(callback) {
            this.timeoutExceptionCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setRequestErrorCallback = function(callback) {
            this.requestErrorCallback = xhrListener.checkCallback(callback);
            return this;
        };

        Ajax.prototype.setRequestAbortCallback = function(callback) {
            this.requestAbortCallback = xhrListener.checkCallback(callback);
            return this;
        };

        // Execute constructors.
        if (window.XMLHttpRequest) this.xhr = new XMLHttpRequest();
        else if (window.ActiveXObject)
            try {
                this.xhr = new ActiveXObject("Msxml2.XMLHTTP");
                if (typeof this.xhr === 'undefined' || this.xhr === null) throw new Error(); 
            }
            catch (e) {
                try { 
                    this.xhr = new ActiveXObject("Microsoft.XMLHTTP");
                }
                catch(e) {
                   isOldNavigator = true;
                }
            }

        // Event Listener
        if (typeof this.xhr === 'undefined' || this.xhr === null) isOldNavigator = true;
        else {
            this.xhr.onabort = function() {
                xhrListener.launchCallback($this.requestAbortCallback);
                running = false;
            };

            this.xhr.onerror = function() {
                xhrListener.launchCallback($this.requestErrorCallback);
                running = false;
            };

            this.xhr.ontimeout = function() {
                xhrListener.launchCallback($this.timeoutExceptionCallback);
                running = false;
            };

            this.xhr.onprogress = function(e) {
                xhrListener.launchCallback($this.downloadProgressCallback, e);
            };

            this.xhr.onloadstart = function() {
                xhrListener.launchCallback($this.requestBeginCallback);
                running = true;
            };

            this.xhr.onreadystatechange = function() {
                if ($this.xhr.readyState === 4) {
                    if ($this.xhr.status === 200) {
                        let response = undefined;

                        if ($this.type === 'xml') response = $this.xhr.responseXML;
                        else if ($this.type === 'json') response = JSON.parse($this.xhr.responseText);
                        else response = $this.xhr.responseText;

                        xhrListener.launchCallback($this.responseCallback, response);
                    } 
                    else if (!($this.xhr.status === 301) && !($this.xhr.status === 302))
                        xhrListener.launchCallback($this.serverErrorCallback, $this.xhr.status);

                    xhrListener.launchCallback($this.requestEndCallback);
                    running = false;
                }
            }
        }
    }

    fn.prototype.xhr = function(url) {
        if (typeof url === 'undefined' || !(typeof url.valueOf() === 'string')) throw new Error("url requires");
        return new Ajax(url);
    };
    fn.factory.extensions.xhr = Ajax;
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
