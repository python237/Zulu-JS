/**
** Code for managing evaluations and checking data in forms. In particular,
** check if a number is valid, if an e-mail is valid, etc.
**
** @version 1.0.1
*/
;(function(document, fn) {
    "use strict";

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check Version
    if (!fn.factory.requires('1.0.1')) throw new Error("Zulu eval extension requires V1.0.1");

    var context = fn.factory.modules;
    var unicode = 'éèçàöùôœïüëêâäæß´`ŀð€þÿûî?$';  // Unicode
    var digits = '0123456789';  // Digits
    var alpha = '@`!@#%^&*()_-+={}[];:,<.>/\\’‘»«≤©¿÷¡ø';  // Alpha

    /**
     * @param {Object} dict
     * @returns {undefined}
     */
    function zEval(dict) {
        "use strict";

        var defaultConfig = {
            min_length: !(typeof dict.min_length === 'undefined') ? dict.min_length : 0,
            max_length: !(typeof dict.max_length === 'undefined') ? dict.max_length : 3000000,
            unicode: !(typeof dict.unicode === 'undefined') ? dict.unicode : true,
            digits: !(typeof dict.digits === 'undefined') ? dict.digits : true,
            alpha: !(typeof dict.alpha === 'undefined') ? dict.alpha : true,
            not_contains: !(typeof dict.not_contains === 'undefined') ? dict.not_contains : [],
            not_start: !(typeof dict.not_start === 'undefined') ? dict.not_start : [],
            not_end: !(typeof dict.not_end === 'undefined') ? dict.not_end : [],
            contains: !(typeof dict.contains === 'undefined') ? dict.contains : [],
            endswith: !(typeof dict.endswith === 'undefined') ? dict.endswith : [],
            startswith: !(typeof dict.startswith === 'undefined') ? dict.startswith : [],
            _null: !(typeof dict._null === 'undefined') ? dict._null : false
        };
        var string = dict.value;

        if (typeof string === 'undefined') return undefined;
        else if (!(typeof defaultConfig.min_length === 'undefined')) {
            defaultConfig.min_length = parseInt( '' + defaultConfig.min_length);

            if (defaultConfig.min_length < 0) return undefined;
        }
        else if (!(typeof defaultConfig.max_length === 'undefined')) {
            defaultConfig.max_length = parseInt('' + defaultConfig.max_length);

            if (defaultConfig.max_length <= defaultConfig.min_length) return undefined;
        }

        /**
         * Check if string data respect regex clause.
         *
         * @param regex The regExp Object.
         * @returns {boolean}
         */
        zEval.prototype.regExp = function(regex) {
            if (typeof regex === 'undefined') return false;
            else {
                if (typeof string.valueOf() === 'string') return (new RegExp(regex)).test(string);
                else {
                    for (var i=0; i<string.length; i++)
                        if ((new RegExp(regex)).test(string[i])) return true;

                    return false;
                }
            }
        };

        /**
         * Check if string data has valid email address.
         * @returns {boolean}
         */
        zEval.prototype.isEmail = function() {
            return this.regExp(new RegExp('^[a-zA-Z0-9]+[a-zA-Z0-9.\-_]*[a-zA-Z0-9]+@[a-zA-Z0-9_\-]{2,}\.[a-z]{2,6}$'));
        };

        /**
         * Check if string data has valid phone number.
         * @returns {boolean}
         */
        zEval.prototype.isPhoneNumber = function() {
            return this.regExp(new RegExp('^\+[0-9]{1,3}[0-9 ]{8,}$')) || this.regExp(new RegExp('^[0]{2}[0-9 ]{8,}$'))
                || this.regExp(new RegExp('^[[0-9 ]{8,}$'));
        };

        /**
         * execute evaluation.
         * @returns {boolean}
         */
        zEval.prototype.execute = function() {
            string = typeof string.valueOf() === 'string' ? [string] : string;

            for(var i=0; i<string.length; i++) {
                if (string[i].length === 0) {
                    if (defaultConfig._null) return true;
                    else continue;
                }

                // Analyze
                if(string[i].length < defaultConfig.min_length) continue;
                else if(string[i].length > defaultConfig.max_length) continue;

                var _opposite = [],
                    _requires = [],
                    j, has_break;

                if(!defaultConfig.unicode) for(j = 0; j<unicode.length; j++) _opposite.push(unicode[j]);
                if(!defaultConfig.digits) for(j = 0; j<digits.length; j++) _opposite.push(digits[j]);
                if(!defaultConfig.alpha) for(j = 0; j<alpha.length; j++) _opposite.push(alpha[j]);
                if (typeof defaultConfig.not_contains.valueOf() === 'string') _opposite.push(defaultConfig.not_contains);
                else _opposite = _opposite.concat(defaultConfig.not_contains);

                if (typeof defaultConfig.contains.valueOf() === 'string') _requires.push(defaultConfig.contains);
                else _requires = _requires.concat(defaultConfig.contains);

                if(typeof defaultConfig.not_start.valueOf() === 'string') {
                    if(string[i].startsWith(defaultConfig.not_start)) continue;
                }
                else {
                    has_break = false;

                    for(j = 0; j<defaultConfig.not_start.length; j++)
                        if(string[i].startsWith(defaultConfig.not_start[j])) {
                            has_break = true;
                            break;
                        }

                    if (has_break) continue;
                }

                if(typeof defaultConfig.not_end.valueOf() === 'string') {
                    if(string[i].endsWith(defaultConfig.not_end)) continue;
                }
                else {
                    has_break = false;

                    for(j = 0; j<defaultConfig.not_end.length; j++)
                        if(string[i].endsWith(defaultConfig.not_end[j])) {
                            has_break = true;
                            break;
                        }

                    if (has_break) continue;
                }

                if(typeof defaultConfig.endswith.valueOf() === 'string') {
                    if(!string[i].endsWith(defaultConfig.endswith)) continue;
                }
                else {
                    has_break = false;

                    for(j = 0; j<defaultConfig.endswith.length; j++)
                        if(!string[i].endsWith(defaultConfig.endswith[j])) {
                            has_break = true;
                            break;
                        }

                    if (has_break) continue;
                }

                if(typeof defaultConfig.startswith.valueOf() === 'string') {
                    if(!string[i].startsWith(defaultConfig.startswith)) continue;
                }
                else {
                    has_break = false;

                    for(j = 0; j<defaultConfig.startswith.length; j++)
                        if(!string[i].startsWith(defaultConfig.startswith[j])) {
                            has_break = true;
                            break;
                        }

                    if (has_break) continue;
                }

                var ignore = false;

                if(_opposite.length > 0) {
                    for(j = 0; j<_opposite.length; j++)
                        if(!(string[i].indexOf(_opposite[j]) === '-1')) {
                            ignore  = true;
                            break;
                        }
                }
                if(_requires.length > 0) {
                    for(j = 0; j<_requires.length; j++)
                        if(string[i].indexOf(_requires[j]) === '-1') {
                            ignore = true;
                            break;
                        }
                }

                return true;
            }

            return false;
        };

        /**
         * execute check.
         * @returns {boolean}
         */
        zEval.prototype.isMobile = function () {
            return /mobile/i.test(navigator.userAgent);
        };

        zEval.prototype.isTabvar = function () {
            return /tablet/i.test(navigator.userAgent);
        };

        zEval.prototype.isComputer = function () {
            return !this.isMobile() && !this.isTablet();
        };
    }

    /**
     * Add substitution from zulu constructor.
     * @param attrName The attribute name.
     * @param dict
     * @returns {Object, zEval}
     */
    context.prototype.eval = function(attrName, dict) {
        if (this.array) return undefined;

        dict['value'] = z(this.node).attr(attrName, undefined) || "";
        return fn.eval(dict);
    };

    // Add toolkit
    fn.prototype.eval = function(dict) {
        return new zEval(dict);
    };
    fn.factory.extensions.eval = zEval;
})(
    document,
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux)
);
