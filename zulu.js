/**
** Main zulu code, allowing you to select a DOM element,
** manage and generate events, modify the DOM and much more.
**
** @version 1.0.1
*/
;(function(document) {
    "use strict";

    // Define namespace
    var DomElement = {
            /**
             * Remove double selection of node.
             *
             * @param {Node} node
             * @param {Array} array
             * @return {Array}
             */
            removeDouble: function (node, array) {
                if (typeof node === 'undefined' || !node) return array;
                else {
                    array.push(node);
                    return array;
                }
            },
            /**
             * Remove node where tag equals tag gives in params.
             *
             * @param {String, Array} tagList
             * @param {Array} array
             * @return {Array}
             */
            removeTag: function (tagList, array) {
                var node = [];
                tagList = typeof tagList.valueOf() === 'string' ? [tagList] : tagList;

                for (var i = 0; i < array.length; i++) {
                    var removes = false;

                    for (var j = 0; j < tagList.length; j++)
                        if (array[i].nodeName.toLowerCase() === tagList[j].toLowerCase()) {
                            removes = true;
                            break;
                        }

                    if (!removes) node.push(array[i]);
                }
                return node;
            },
            extract: function (document, filter) {
                var containsChild;
                var filterResult;
                var finalResult;
                var j;
                var result;
                var i;

                if (filter.length === 0) return [];

                var $ = [
                    ':visible',
                    ':hidden',
                    ':text',
                    ':password',
                    ':radio',
                    ':checkbox',
                    ':form',
                    ':reset',
                    ':submit',
                    ':button',
                    ':image',
                    ':file',
                    ':date',
                    ':url',
                    ':time',
                    ':search',
                    ':number',
                    ':month',
                    ':tel',
                    ':range',
                    ':readonly',
                    ':not(:parent)',
                    ':not(:empty)',
                    ':header',
                    ':link'
                ], $Definition = {};
                $Definition[':visible'] = ['input[type!=hidden]', '[style*!=hidden]'];
                $Definition[':hidden'] = ['input[type=hidden]', '[style*=hidden]'];
                $Definition[':text'] = 'input[type=text]';
                $Definition[':password'] = '[type=password]';
                $Definition[':radio'] = '[type=radio]';
                $Definition[':checkbox'] = '[type=checkbox]';
                $Definition[':form'] = ['input', 'button', 'select', 'textarea'];
                $Definition[':reset'] = 'input[type=reset]';
                $Definition[':submit'] = 'input[type=submit]';
                $Definition[':button'] = 'button,:submit';
                $Definition[':image'] = 'input[type=image]';
                $Definition[':file'] = 'input[type=file]';
                $Definition[':date'] = 'input[type=date]';
                $Definition[':url'] = 'input[type=url]';
                $Definition[':time'] = 'input[type=time]';
                $Definition[':search'] = 'input[type=search]';
                $Definition[':number'] = 'input[type=number]';
                $Definition[':month'] = 'input[type=month]';
                $Definition[':tel'] = 'input[type=tel]';
                $Definition[':range'] = 'input[type=range]';
                $Definition[':readonly'] = '[readonly]';
                $Definition[':not(:parent)'] = ':empty';
                $Definition[':not(:empty)'] = ':parent';
                $Definition[':header'] = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header', 'head'];
                $Definition[':link'] = 'a[href]';

                if (!(filter.indexOf(',') === -1)) {
                    // Multiple Selection

                    var $result = [];
                    filter = filter.split(',');

                    for (i = 0; i < filter.length; i++) {
                        result = this.extract(document, filter[i]);

                        for (j = 0; j < result.length; j++)
                            $result = this.removeDouble(result[j], $result);
                    }
                    return $result;
                }
                else {
                    for (i = 0; i < $.length; i++) {
                        if (!(filter.indexOf($[i]) === -1)) {
                            // Quick Selection

                            do {
                                if (typeof $Definition[$[i]].valueOf() === 'string')
                                    filter = filter.replace($[i], $Definition[$[i]]);

                                else {
                                    var origin = '';

                                    for (j = 0; j < $Definition[$[i]].length; j++) {
                                        origin += filter.substring(0, filter.indexOf($[i])) + $Definition[$[i]][j];
                                        origin += filter.substring(filter.indexOf($[i]) + $[i].length, filter.length);

                                        if (j < $Definition[$[i]].length - 1)
                                            origin += ',';
                                    }

                                    filter = filter.replace($[i], origin);
                                }
                            }
                            while (!(filter.indexOf($[i]) === -1));

                            return this.extract(document, filter);
                        }
                    }
                    if (!(filter.indexOf('!=') === -1)) {
                        //  Negation Usage

                        do {
                            var negationIndexStart = filter.indexOf('!='),
                                negationIndexStartWithNot = negationIndexStart,
                                negationIndexEnd = negationIndexStart,
                                negationIndexEndWithNot = negationIndexStart,
                                blockFilter = '',
                                originalFilter = '';

                            while (negationIndexStartWithNot > 0) {
                                negationIndexStartWithNot--;

                                if (filter[negationIndexStartWithNot] === '[') {
                                    negationIndexStart = negationIndexStartWithNot;

                                    if ((negationIndexStartWithNot - 1) > 0) {
                                        if (!(filter[negationIndexStartWithNot - 1] === '(')) break;
                                    } else break;
                                } else if (filter[negationIndexStartWithNot] === ':') break;
                            }
                            while (negationIndexEndWithNot < filter.length) {
                                negationIndexEndWithNot++;

                                if (filter[negationIndexEndWithNot] === ']') {
                                    negationIndexEnd = negationIndexEndWithNot;

                                    if (filter[negationIndexEndWithNot + 1] === ')')
                                        negationIndexEndWithNot++;

                                    break;
                                }
                            }

                            blockFilter = filter.substring(negationIndexStartWithNot, negationIndexEndWithNot + 1);
                            originalFilter = filter.substring(negationIndexStart, negationIndexEnd + 1).replace('!', '');
                            filter = filter.replace(blockFilter, blockFilter[0] === ':' ? originalFilter : ':not(' + originalFilter + ')');
                        }
                        while (!(filter.indexOf('!=') === -1));

                        return this.extract(document, filter);
                    }
                    else if (!(filter.indexOf('!>') === -1)) {
                        var parentNodeResult = this.extract(document, filter.substring(0, filter.lastIndexOf('!>'))),
                            childNodeResult = this.extract(document, filter.substring(filter.lastIndexOf('!>') +
                                '!>'.length, filter.length));
                        result = [];

                        for (i = 0; i < childNodeResult.length; i++) {
                            var parentInResult = false;

                            for (j = 0; j < parentNodeResult.length; j++)
                                if (childNodeResult[i].parentNode.isEqualNode(parentNodeResult[j])) {
                                    parentInResult = true;
                                    break;
                                }

                            if (!parentInResult) result = this.removeDouble(childNodeResult[i], result);
                        }

                        return result;
                    }
                    else if (!(filter.indexOf(':parent(') === -1)) {
                        var negationUsage = filter[filter.indexOf(':parent(') - 1] === '(',
                            parentName = '',
                            startIndexWithParentName = filter.indexOf(':parent(') + ':parent('.length;

                        while (startIndexWithParentName < filter.length && !(filter[startIndexWithParentName] === ')')) {
                            parentName += filter[startIndexWithParentName];
                            startIndexWithParentName++;
                        }

                        if (!negationUsage)
                            filter = parentName + '>' + (filter.replace(':parent(' + parentName + ')', '') || '*');
                        else
                            filter = parentName + '!>' + (filter.replace(':not(:parent(' + parentName + '))', '') || '*');

                        return this.extract(document, filter);
                    }
                    else if (!(filter.indexOf(':parent') === -1) || !(filter.indexOf(':empty') === -1)) {
                        var emptyChild = !(filter.indexOf(':empty') === -1);
                        filterResult = undefined;
                        finalResult = [];

                        if (emptyChild)
                            filterResult = this.extract(document, (filter.replace(':empty', '') || '*'));
                        else
                            filterResult = this.extract(document, (filter.replace(':parent', '') || '*'));

                        for (i = 0; i < filterResult.length; i++) {
                            containsChild = false;

                            for (j = 0; j < filterResult[i].childNodes.length; j++)  // IE
                                if (filterResult[i].childNodes[j].nodeType === 1) {
                                    containsChild = true;
                                    break;
                                }

                            if (containsChild && !emptyChild)
                                finalResult = this.removeDouble(filterResult[i], finalResult);
                            else if (!containsChild && emptyChild)
                                finalResult = this.removeDouble(filterResult[i], finalResult);
                        }

                        return finalResult;
                    }
                    else if (!(filter.indexOf(':child') === -1)) {
                        // Child Check

                        var indexStart = filter.indexOf(':child'),
                            indexEnd = indexStart,
                            childNameStartIndex = indexStart,
                            childNameEndIndex = indexStart,
                            childName = '',
                            useNegation = false;
                        result = undefined;
                        finalResult = [];

                        if (filter[indexStart - 1] === '(') {
                            indexStart -= ':not('.length;
                            useNegation = true;
                        }
                        while (indexEnd < filter.length) {
                            indexEnd++;
                            if (filter[indexEnd] === '(') childNameStartIndex = indexEnd + 1;
                            if (filter[indexEnd] === ')') {
                                childNameEndIndex = indexEnd;
                                if (filter[indexEnd + 1] === ')') indexEnd++;
                                break;
                            }
                        }

                        childName = filter.substring(childNameStartIndex, childNameEndIndex);
                        filter = filter.replace(filter.substring(indexStart, indexEnd + 1), '') || '*';
                        result = this.extract(document, filter);

                        for (i = 0; i < result.length; i++) {
                            var zuluChild = z(result[i]).child(undefined);
                            containsChild = false;

                            if (!(typeof zuluChild === 'undefined')) {
                                zuluChild = zuluChild.array ? zuluChild.node : [zuluChild.node];

                                for (j = 0; j < zuluChild.length; j++)
                                    if (zuluChild[j].nodeName.toLowerCase() === childName.toLowerCase()) {
                                        containsChild = true;
                                        break;
                                    }
                            }
                            if (containsChild && !useNegation)
                                finalResult = this.removeDouble(filterResult[i], finalResult);
                            else if (!containsChild && useNegation)
                                finalResult = this.removeDouble(filterResult[i], finalResult);
                        }

                        return finalResult;
                    }

                    //////////////////
                    // Query Selection
                    var theResult = document.querySelectorAll(filter),
                        final = [];

                    for (var pk = 0; pk < theResult.length; pk++)
                        final = this.removeDouble(theResult[pk], final);

                    return this.removeTag(['html', 'style', 'script'], final);
                }
            }
        },
        eventSpace = {
            /**
             * Connect event to DOM element. Resolve the automatics propagation event problem and lock event
             * (event can't be disable after define from tag).
             *
             * @param {Node} node The html element.
             * @param {String, Array} eventName The event name or list event name.
             * @param {Function, Array} callback The function or list functions.
             */
            trigger: function (node, eventName, callback) {
                var params = this.checkParam(eventName, callback);
                eventName = params['event'];
                callback = params['callback'];

                for (var i = 0; i < eventName.length; i++)
                    (function (obj, event, func) {
                        if (obj.addEventListener)
                            // W3C DOM.
                            obj.addEventListener(event, function (e) {
                                if (eventSpace.correctSignal(event, obj, e)) func(obj, e);
                            }, false);
                        else if (obj.attachEvent)
                            // IE DOM < 9.
                            obj.attachEvent('on' + event, function (e) {
                                if (eventSpace.correctSignal(event, obj, e)) func(obj, e);
                            });
                        else {
                            // Fallback (DOM 1).
                            var fallback = obj['on' + event];

                            obj['on' + event] = function (e) {
                                if (fallback != null && !(typeof fallback === 'undefined')) fallback(e);
                                if (eventSpace.correctSignal(event, obj, e)) func(obj, e);
                            }
                        }
                    })(node, eventName[i], callback[i]);
            },
            /**
             * Connect event to DOM element. Can't Resolve the automatics propagation event problem and unlock event
             * (event can be disable to every time after define from tag).
             *
             * @param {Node} node The html element.
             * @param {String, Array} eventName The event name or list event name.
             * @param {Function, Array} callback The function or list functions.
             */
            bind: function (node, eventName, callback) {
                var params = this.checkParam(eventName, callback);
                eventName = params['event'];
                callback = params['callback'];

                for (var i = 0; i < eventName.length; i++)
                    (function (obj, event, func) {
                        if (obj.addEventListener)
                            // W3C DOM
                            obj.addEventListener(event, func, false);
                        else if (obj.attachEvent)
                            // IE DOM < 9
                            obj.attachEvent('on' + event, func);
                        else {
                            // Fallback (DOM 1)
                            var fallback = obj['on' + event];

                            obj['on' + event] = function (e) {
                                if (fallback != null && !(typeof fallback === 'undefined')) fallback(e);
                                func(e);
                            }
                        }
                    })(node, eventName[i], callback[i]);
            },
            /**
             * Disconnect event to DOM element.
             *
             * @param {Node} node The html element.
             * @param {String, Array} eventName The event name or list event name.
             * @param {Function, Array} callback The function or list functions.
             */
            unbind: function (node, eventName, callback) {
                var params = this.checkParam(eventName, callback);
                eventName = params['event'];
                callback = params['callback'];

                for (var i = 0; i < eventName.length; i++)
                    (function (obj, event, func) {
                        if (obj.removeEventListener)
                            // W3C DOM
                            obj.removeEventListener(event, func);
                        else if (obj.detachEvent)
                            // IE DOM < 9
                            obj.detachEvent('on' + event, func);
                        else
                            // Fallback (DOM 1)
                            delete obj['on' + event];
                    })(node, eventName[i], callback[i]);
            },
            /**
             * Launch manually one or more event.
             *
             * @param {Node} node The html element.
             * @param {String, Array} eventName The event name or list event name.
             */
            dispatch: function (node, eventName) {
                eventName = typeof eventName.valueOf() === 'string' ? [eventName] : eventName;

                for (var i = 0; i < eventName.length; i++)
                    if (node.dispatchEvent)
                        // W3C
                        node.dispatchEvent((new Event(eventName[i])));
                    else if (eventName[i] in (node != null))
                        node[eventName[i]]();
                    else if ('on' + eventName[i] in (node != null))
                        if (node['on' + eventName[i]]) node['on' + eventName[i]]();
            },
            /**
             * Check if event args and callback args has valid.
             *
             * @param {String, Array} eventName The event name or list event name.
             * @param {Function, Array} callback The function or list functions.
             * @returns {Object} dictionary
             */
            checkParam: function (eventName, callback) {
                var i;

                if (typeof eventName.valueOf() === 'string' && typeof callback === 'function') {
                    eventName = [eventName];
                    callback = [callback];
                }
                else if (typeof eventName.valueOf() === 'object' && typeof callback === 'object') {
                    if (!(eventName.length === callback.length)) throw new Error('zulu event args error');
                    var argsError = false;

                    for (i = 0; i < eventName.length; i++)
                        if (!(typeof eventName[i].valueOf() === 'string') || !(typeof callback[i] === 'function')) {
                            argsError = true;
                            break;
                        }

                    if (argsError) throw new Error('zulu event args error');
                }
                else {
                    var gotoObj = [],
                        obj = typeof eventName.valueOf() === 'string' ? callback : eventName,
                        notObj = typeof eventName.valueOf() === 'string' ? eventName : callback;

                    for (i = 0; i < obj.length; i++) gotoObj.push(notObj);

                    if (notObj === eventName) eventName = gotoObj;
                    else callback = gotoObj;

                    return this.checkParam(eventName, callback);
                }

                return {
                    'event': eventName,
                    'callback': callback
                }
            },
            /**
             * Check if event dispatcher has correct (not provide by cascade event propagation).
             *
             * @param {String, Array} eventName The event name or list event name.
             * @param {Node} node The html element.
             * @param {Event} event The event dispatcher.
             * @returns {boolean}
             */
            correctSignal: function (eventName, node, event) {
                var propagation = {
                        'mouseover': event.relatedTarget || event.fromElement,
                        'mouseout': event.relatedTarget || event.toElement,
                        'mousemove': event.relatedTarget || event.fromElement
                    },
                    relatedTarget = undefined;

                if (event)
                    if (eventName in propagation) {
                        relatedTarget = propagation[eventName];

                        while (!relatedTarget.isEqualNode(node) && !(relatedTarget.nodeName.toLowerCase() === 'body')
                        && !relatedTarget.isEqualNode(document))
                            relatedTarget = relatedTarget.parentNode;

                        return !relatedTarget.isEqualNode(node);
                    }
                return true;
            }
        },
        settingsSpace = {
            type: 'Zulu Object',
            version: '1.0.1',
            nodeSpace: DomElement,
            eventSpace: eventSpace,
            modules: Zulu,
            extensions: {},

            /**
             * Check if the zulu version requires by other zulu extension has requires.
             *
             * @param {String} version The Minimal version requires.
             * @returns {boolean}
             */
            requires: function (version) {
                if (typeof version === 'undefined' || !(typeof version.valueOf() === 'string'))
                    return false;

                var versions = version.split('.');
                var actualVersion = this.version.split('.');

                if (!(versions.length === 3)) return false;

                for (var i = 0; i < versions.length; i++) {
                    versions[i] = parseInt(versions[i]);
                    actualVersion[i] = parseInt(actualVersion[i]);

                    if (!versions[i] && versions[i] !== 0) return false;
                }

                if (actualVersion[0] === versions[0]) {
                    if (actualVersion[1] === versions[1]) return actualVersion[2] >= versions[2];
                    else return actualVersion[1] > versions[1];
                }
                else return actualVersion[0] > versions[0];
            }
        };

    /**
     * Zulu constructors.
     *
     * @param {Object, String, Node, Document, Zulu} factory The element where zulu must be execute operation.
     * @returns {Zulu}
     * @constructor The zulu object.
     */
    function Zulu(factory) {
        this.array = false;
        this.node  = [];

        var $this = this;

        /**
         * Check node object result and affine correctly data.
         *
         * @param {Array} array The HTML Element selected or Document.
         * @returns {Object, Zulu}
         */
        var migrate = function (array) {
            $this.node = DomElement.removeTag(['html', 'style', 'script'], array);

            if ($this.node.length === 1) {
                $this.node = $this.node[0];
                $this.array = false;
            }
            else $this.array = true;

            return $this;
        };

        var eventListener = function (args, event, trigger) {
            trigger = typeof trigger === "undefined" ? true : trigger;
            var array = [];

            for (var i = 0; i < args.length; i++) array.push(args[i]);
            return trigger ? $this.on(event, array) : $this.bind(event, array);
        };

        //! Prototype Usage

        Zulu.prototype.valueOf = {};
        Zulu.prototype.valueOf = function() {
            return {};
        };
        Zulu.prototype.isZulu = settingsSpace.type;

        /**
         * Get or change the attribute name of 1 or more node selected.
         *
         * @param {String} attrName The attribute name.
         * @param {String} attrValue The attribute values.
         * @returns {String, Zulu}
         */
        Zulu.prototype.attr = function(attrName, attrValue) {
            if (!(typeof attrValue === 'undefined')) {
                this.each(function (node) {
                    if (node[attrName] && !(attrName === 'style')) node[attrName] = attrValue;
                    else node.setAttribute(attrName, attrValue);
                });

                return this;
            }
            else if (this.array) return undefined;
            else return this.node[attrName] && !(attrName === 'style') ? this.node[attrName] || undefined :
                    this.node.getAttribute(attrName) || undefined;
        };

        /**
         * Change the attribute name of all node selected.
         *
         * @param {{}} values The json attrs will be add.
         * @returns {Zulu}
         */
        Zulu.prototype.attrs = function(values) {
            for (var key in values) {
                this.attr(key, values[key]);
            }

            return this;
        };

        /**
         * Check if node contains minimum 1 attribute in list give by params.
         * @returns {boolean}
         */
        Zulu.prototype.hasAttr = function() {
            if (this.array) return false;
            else {
                for (var i=0; i<arguments.length; i++)
                    if (this.node.hasAttribute(arguments[i])) return true;

                return false;
            }
        };

        /**
         * Remove all attribute name in params from all node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.removeAttr = function() {
            var args = arguments;

            this.each(function (node) {
                for (var j=0; j<args.length; j++) node.removeAttribute(args[j]);
            });

            return this;
        };

        /**
         * Check if node selected contains minimum 1 class name in list give by params.
         * @returns {boolean}
         */
        Zulu.prototype.hasClass = function() {
            if (this.array) return false;
            else {
                for (var i=0; i<arguments.length; i++)
                    if (this.node.classList.contains(arguments[i])) return true;

                return false;
            }
        };

        /**
         * Remove all class name give in params to all node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.removeClass = function() {
            var args = arguments;

            this.each(function (node) {
                for (var j=0; j<args.length; j++) node.classList.remove(args[j]);
            });

            return this;
        };

        /**
         * Add class name or list class name in params to all node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.addClass = function() {
            var args = arguments;

            this.each(function (node) {
                for (var j=0; j<args.length; j++) node.classList.add(args[j]);
            });

            return this;
        };

        /**
         * Delete class name if is presents to node else Add it. All node selected has uses.
         * @returns {Zulu}
         */
        Zulu.prototype.toggleClass = function() {
            var args = arguments;

            this.each(function (node) {
                for (var j=0; j<args.length; j++)
                    if (z(node).hasClass(args[j])) z(node).removeClass(args[j]);
                    else z(node).addClass(args[j]);
            });

            return this;
        };

        /**
         * Get the outer html code provides of all node selected.
         * @returns {string}
         */
        Zulu.prototype.outer = function() {
            var outer = '';

            this.each(function (node) {
                outer += node.outerHTML;
            });

            return outer;
        };

        /**
         * Get or put innerHTML values of all node selected.
         * @returns {String, Zulu}
         */
        Zulu.prototype.inner = function() {
            var i;
            var html = '';

            if (arguments.length === 0) {
                // Get
                this.each(function (node) {
                    html += node.innerHTML;
                });

                return html;
            }
            else {
                // Put
                for (i = 0; i<arguments.length; i++)
                    if (typeof arguments[i] === 'undefined') html += "";
                    else if (typeof arguments[i].valueOf() === 'string') html += arguments[i];
                    else if (arguments[i].isZulu === this.isZulu) html += arguments[i].inner();
                    else html += arguments[i].innerHTML;

                this.each(function (node) {
                    node.innerHTML = html;
                });

                return this;
            }
        };

        /**
         * Get the text content in node selected.
         * @returns {String}
         */
        Zulu.prototype.text = function() {
            if (this.array) {
                var text = '';

                this.each(function(node) {
                    text += ' ' + z(node).text();
                });

                return text;
            }
            else return this.node.textContent || this.node.innerText || '';
        };

        /**
         * Check if array node selected is empty
         * @returns {boolean}
         */
        Zulu.prototype.isEmpty = function() {
            return !this.array ? true : this.node.length > 0;
        }

        /**
         * Move selection node to parent of node selected.
         *
         * @param {boolean} allParent Define if we get all parent of each node or only direct parent.
         * @returns {Zulu|Object}
         */
        Zulu.prototype.parent = function(allParent) {
            var newNode = [];

            allParent = !(typeof allParent === "undefined") ? allParent : false;

            this.each(function (node) {
                var parent = node.parentNode;
                
                do {
                    newNode = DomElement.removeDouble(parent, newNode);
                    parent = parent.parentNode;
                }
                while (allParent && !(parent.nodeName.toLowerCase() === 'body') && !(parent.nodeName.toLowerCase() === 'html'));
            });

            return migrate(newNode);
        };

        /**
         * Move selection node to child of node selected.
         *
         * @param {String} filter The filter (factory).
         * @returns {Zulu|Object}
         */
        Zulu.prototype.child = function(filter) {
            var j;
            var newNode = [];

            if (!(typeof filter === 'undefined')) {
                this.each(function (node) {
                    var child = DomElement.extract(node, filter);

                    for (j = 0; j<child.length; j++) newNode = DomElement.removeDouble(child[j], newNode);
                });

                return migrate(newNode);
            }
            else {
                this.each(function (node) {
                    if (typeof node.childElementCount === 'number')
                        // W3C
                        for (j = 0; j<node.childElementCount; j++)
                            newNode = DomElement.removeDouble(node.children[j], newNode);

                    else
                        // IE < 9
                        for (j = 0; j<node.childNodes.length; j++)
                            if (node.childNodes[j].nodeType === 1)
                                newNode = DomElement.removeDouble(node.childNodes[j], newNode);
                });

                return migrate(newNode);
            }
        };

        /**
         * Move selection to first child of all node selected.
         *
         * @param {String} filter The filter (factory).
         * @returns {Zulu|Object}
         */
        Zulu.prototype.firstChild = function(filter) {
            var newNode = [];

            if (!(typeof filter === 'undefined')) {
                this.each(function (node) {
                    var child = DomElement.extract(node, filter);

                    if (child.length > 0) newNode = DomElement.removeDouble(child[0], newNode);
                });
            }
            else {
                this.each(function (node) {
                    if (typeof node.childElementCount === 'number') {
                        // W3C
                        if (node.childElementCount > 0)
                            newNode = DomElement.removeDouble(node.firstElementChild, newNode);
                    }
                    else {
                        // IE < 9
                        var index = 0;

                        while (index < node.childNodes.length) {
                            if (node.childNodes[index].nodeType === 1) {
                                newNode = DomElement.removeDouble(node.childNodes[index], newNode);
                                break;
                            }
                            index++;
                        }
                    }
                });
            }

            return migrate(newNode);
        };

        /**
         * Move selection to last child of all node selected.
         *
         * @param {String} filter The filter (factory).
         * @returns {Zulu|Object}
         */
        Zulu.prototype.lastChild = function(filter) {
            var newNode = [];

            if (!(typeof filter === 'undefined')) {
                this.each(function (node) {
                    var child = DomElement.extract(node, filter);

                    if (child.length > 0) newNode = DomElement.removeDouble(child[child.length - 1], newNode);
                });
            }
            else {
                this.each(function (node) {
                    if (typeof node.childElementCount === 'number') {
                        // W3C
                        if (node.childElementCount > 0)
                            newNode = DomElement.removeDouble(node.lastElementChild, newNode);
                    }
                    else {
                        // IE < 9
                        var index = node.childNodes.length - 1;

                        while (index >= 0) {
                            if (node.childNodes[index].nodeType === 1) {
                                newNode = DomElement.removeDouble(node.childNodes[index], newNode);
                                break;
                            }
                            index--;
                        }
                    }
                });
            }

            return migrate(newNode);
        };

        /**
         * Move selection to next friend of node selected.
         *
         * @param {boolean} allFriend Define if we select all friend in next position.
         * @returns {Zulu|Object}
         */
        Zulu.prototype.nextFriend = function(allFriend) {
            var newNode = [];

            allFriend = !(typeof allFriend === "undefined") ? allFriend : false;

            this.each(function (node) {
                var friend = node;

                do {
                    if (friend.nextElementSibling) {
                        // W3C DOM
                        friend = friend.nextElementSibling;
                        newNode = DomElement.removeDouble(friend, newNode);
                    }
                    else
                        // IE DOM < 9
                        while (!(typeof friend === 'undefined') && friend != null) {
                            friend = friend.nextSibling;

                            if (friend !== null && friend.nodeType === 1) {
                                newNode = DomElement.removeDouble(friend, newNode);
                                break;
                            }
                        }
                }
                while (allFriend && !(typeof friend === 'undefined') && friend != null)
            });

            return migrate(newNode);
        };

        /**
         * Move selection to previous friend of node selected.
         *
         * @param {boolean} allFriend Define if we select all friend in previous position.
         * @returns {Zulu|Object}
         */
        Zulu.prototype.previousFriend = function(allFriend) {
            var newNode = [];

            allFriend = !(typeof allFriend === "undefined") ? allFriend : false;

            this.each(function (node) {
                var friend = node;

                do {
                    if (friend.previousElementSibling) {
                        // W3C DOM
                        friend = friend.previousElementSibling;
                        newNode = DomElement.removeDouble(friend, newNode);
                    }
                    else
                        // IE DOM < 9
                        while (!(typeof friend === 'undefined') && friend !== null) {
                            friend = friend.previousSibling;

                            if (friend !== null && friend.nodeType === 1) {
                                newNode = DomElement.removeDouble(friend, newNode);
                                break;
                            }
                        }
                }
                while (allFriend && !(typeof friend === 'undefined') && friend !== null)
            });

            return migrate(newNode);
        };

        /**
         * Clone all node selected and move selection to node clone.
         *
         * @param {boolean} copy Define if clone get the attribute and all other without event.
         * @returns {Zulu|Object}
         */
        Zulu.prototype.clone = function(copy) {
            var cloneNode = [];

            copy = !(typeof copy === "undefined") ? copy : true;

            this.each(function (node) {
                cloneNode.push(node.cloneNode(copy));
            });

            return migrate(cloneNode);
        };

        /**
         * Replace all node selected and move selection it if authorize. if multiple node selected,
         * also the new node must be clone.
         *
         * @param {Zulu, String, Node} newNode The new node.
         * @param {boolean} _migrate Define if we move selection to new replace node or not move.
         * @returns {Object, Zulu}
         */
        Zulu.prototype.replace = function(newNode, _migrate) {
            var replaceNode = [];
            var zulu = this.isZulu;
            var array = this.array;

            if (newNode.isZulu === this.isZulu && newNode.array) throw new Error('zulu object contains multiple node');
            _migrate = typeof _migrate === 'undefined' ? true : _migrate;

            this.each(function (node) {
                if (typeof newNode.valueOf() === 'string') node.replaceWith(newNode);
                else if (newNode.isZulu === zulu) {
                    node.replaceWith(newNode.node);
                    replaceNode.push(newNode.node);

                    if (array) newNode = newNode.clone(true);
                }
                else {
                    node.replaceWith(newNode);
                    replaceNode.push(newNode);

                    if (array) newNode = newNode.cloneNode(true);
                }
            });

            return _migrate ? migrate(replaceNode) : this;
        };

        /**
         * Delete all node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.remove = function() {
            this.each(function (node) {
                node.remove();
            });

            return this;
        };

        /**
         * Add one or more new friend in previous position of node selected. The new friend must be clone if has necessary.
         * @returns {Zulu}
         */
        Zulu.prototype.before = function() {
            var is_array = this.array;

            for (var i = 0; i<arguments.length; i++) {
                var friend = arguments[i].isZulu === this.isZulu ? (arguments[i].array ? arguments[i].node : [arguments[i].node]) :
                    [arguments[i]];

                this.each(function (node) {
                    var clone = [];

                    for (var j=0; j<friend.length; j++) {
                        var push = !(typeof friend[j].valueOf() === 'string') ? friend[j] : ux.create(friend[j], true);

                        if (node.before) node.before(push);
                        else node.parentNode.insertBefore(push, node);

                        if (is_array) clone.push(push.cloneNode(true)); // Clone
                    }

                    friend = clone;
                });
            }

            return this;
        };

        /**
         * Add one or more new friend in next position of node selected. The new friend must be clone if has necessary.
         * @returns {Zulu}
         */
        Zulu.prototype.after = function() {
            for (var i=0; i<arguments.length; i++) {
                var friend = arguments[i].isZulu === this.isZulu ? (arguments[i].array ? arguments[i].node : [arguments[i].node]) :
                    [arguments[i]];

                this.each(function (node) {
                    var clone = [];

                    for (var j=0; j<friend.length; j++) {
                        var push = !(typeof friend[j].valueOf() === 'string') ? friend[j] : ux.create(friend[j], true);

                        if (node.after) node.after(push);
                        else {
                            // IE < 9
                            var child = z(node.parentNode).lastChild();

                            if (!(typeof child === 'undefined') && !child.node.isEqualNode(node))
                                z(node.parentNode).nextFriend().before(push);
                            else
                                node.parentNode.appendChild(push);
                        }

                        if (this.array) clone.push(push.cloneNode(true)); // Clone
                    }

                    friend = clone;
                });
            }

            return this;
        };

        /**
         * Add 1 or more new child to node selected. if multiple node select, also child must be clone.
         * @returns {Zulu}
         */
        Zulu.prototype.append = function() {
            var node = this.array ? this.node : [this.node];

            for (var i=0; i<arguments.length; i++) {
                var child = !(arguments[i].isZulu === this.isZulu) ? [arguments[i]] : (arguments[i].array ? arguments[i].node :
                    [arguments[i].node]);

                for (var j=0; j<child.length; j++) {
                    var childInstance = !(typeof child[j].valueOf() === 'string') ? child[j] : ux.create(child[j], undefined);

                    for (var k=0; k<node.length; k++) {
                        node[k].appendChild(childInstance);
                        if (k < node.length - 1) childInstance = childInstance.cloneNode(true);  // Clone
                    }
                }
            }

            return this;
        };

        /**
         * Add 1 or more new child or friend. The new child or friend can be clone if necessary.
         * @returns {Zulu}
         */
        Zulu.prototype.insert = function() {
            if (arguments.length < 2) return this;

            var insertionType = arguments[0],
                node = this.array ? this.node : [this.node],
                insertionRecognize = {
                    'afterend': 0,
                    'afterbegin': 0,
                    'beforebegin': 0,
                    'beforeend': 0
                };

            if (!(insertionType in insertionRecognize)) throw new Error("insertion type not recognize");

            for (var i=1; i<arguments.length; i++) {
                var childOrFriend = arguments[i].isZulu === this.isZulu ? (arguments[i].array ? arguments[i].node :
                    [arguments[i].node]) : [arguments[i]];

                for (var j=0; j<childOrFriend.length; j++) {
                    var push = !(typeof childOrFriend[j] === 'string') ? childOrFriend[j] : ux.create(childOrFriend[j], true);

                    for (var k=0; k<node.length; k++) {
                        node[k].insertAdjacentElement(insertionType, push);
                        if (k < node.length - 1) push = push.cloneNode(true);  // Clone
                    }
                }
            }

            return this;
        };

        /**
         * Add The node selected into parent and move selection it. Clone node executed if necessary.
         * @returns {Zulu|Object}
         */
        Zulu.prototype.appendTo = function() {
            var node = this.array ? this.node : [this.node],
                parent = arguments[0],
                newNode = [];

            if (parent.isZulu === this.isZulu) parent = parent.array ? parent.node : [parent.node];
            else parent = [parent];

            for (var i=0; i<node.length; i++) {
                var appends = node[i];

                for (var j=0; j<parent.length; j++) {
                    z(parent[i]).append(appends);
                    newNode = DomElement.removeDouble(appends, newNode);
                    if (j < parent.length - 1) appends = appends.cloneNode(true); // Clone
                }
            }

            return migrate(newNode);
        };

        /**
         * Bind event from node or list node selected.
         *
         * @param event The event name or list event name.
         * @param callback The callback function or list callback function.
         * @returns {Zulu}
         */
        Zulu.prototype.bind = function(event, callback) {
            this.each(function (node) {
                eventSpace.bind(node, event, callback);
            });

            return this;
        };

        /**
         * Trigger event from node or list node selected.
         *
         * @param event The event name or list event name.
         * @param callback The callback function or list callback function.
         * @returns {Zulu}
         */
        Zulu.prototype.on = function(event, callback) {
            this.each(function (node) {
                eventSpace.trigger(node, event, callback);
            });

            return this;
        };

        /**
         * Remove bind event from node or list node selected.
         *
         * @param event The event name or list event name.
         * @param callback The callback function or list callback function.
         * @returns {Zulu}
         */
        Zulu.prototype.unbind = function(event, callback) {
            this.each(function (node) {
                eventSpace.unbind(node, event, callback);
            })

            return this;
        };

        /**
         * Launch manually event from node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.dispatch = function() {
            var args = arguments;

            this.each(function (node) {
                eventSpace.dispatch(node, args);
            });

            return this;
        };

        ////////
        // Event

        Zulu.prototype.dbclick = function() {
            return eventListener(arguments, 'dbclick');
        };

        Zulu.prototype.click = function() {
            return eventListener(arguments, 'click');
        };

        Zulu.prototype.mouseover = function() {
            return eventListener(arguments, 'mouseover');
        };

        Zulu.prototype.mouseout = function() {
            return eventListener(arguments, 'mouseout');
        };

        Zulu.prototype.mousedown = function() {
            return eventListener(arguments, 'mousedown');
        };

        Zulu.prototype.mouseup = function() {
            return eventListener(arguments, 'mouseup');
        };

        Zulu.prototype.mousemove = function() {
            return eventListener(arguments, 'mousemove');
        };

        Zulu.prototype.mouseenter = function() {
            return eventListener(arguments, 'mouseenter');
        };

        Zulu.prototype.mouseleave = function() {
            return eventListener(arguments, 'mouseleave');
        };

        Zulu.prototype.keydown = function() {
            return eventListener(arguments, 'keydown');
        };

        Zulu.prototype.keyup = function() {
            return eventListener(arguments, 'keyup');
        };

        Zulu.prototype.keypress = function() {
            return eventListener(arguments, 'keypress');
        };

        Zulu.prototype.focus = function() {
            return eventListener(arguments, 'focus');
        };

        Zulu.prototype.blur = function() {
            return eventListener(arguments, 'blur');
        };

        Zulu.prototype.change = function() {
            return eventListener(arguments, 'change');
        };

        Zulu.prototype.select = function() {
            return eventListener(arguments, 'select');
        };

        Zulu.prototype.submit = function() {
            return eventListener(arguments, 'submit');
        };

        Zulu.prototype.reset = function() {
            return eventListener(arguments, 'reset');
        };

        Zulu.prototype.toggle = function() {
            return eventListener(arguments, 'toggle');
        };

        Zulu.prototype.invalid = function() {
            return eventListener(arguments, 'invalid');
        };

        Zulu.prototype.error = function() {
            return eventListener(arguments, 'error');
        };

        Zulu.prototype.scroll = function() {
            return eventListener(arguments, 'scroll');
        };

        Zulu.prototype.load = function() {
            return eventListener(arguments, 'load');
        };

        Zulu.prototype.unload = function() {
            return eventListener(arguments, 'unload');
        };

        Zulu.prototype.wheel = function() {
            return eventListener(arguments, 'wheel');
        };

        Zulu.prototype.resize = function() {
            return eventListener(arguments, 'resize');
        };

        Zulu.prototype.abort = function() {
            return eventListener(arguments, 'abort');
        };

        Zulu.prototype.undbclick = function(callback) {
            return this.unbind('dbclick', callback);
        };

        Zulu.prototype.unclick = function(callback) {
            return this.unbind('click', callback);
        };

        Zulu.prototype.unmouseover = function(callback) {
            return this.unbind('mouseover', callback);
        };

        Zulu.prototype.unmouseout = function(callback) {
            return this.unbind('mouseout', callback);
        };

        Zulu.prototype.unmousedown = function(callback) {
            return this.unbind('mousedown', callback);
        };

        Zulu.prototype.unmouseup = function(callback) {
            return this.unbind('mouseup', callback);
        };

        Zulu.prototype.unmousemove = function(callback) {
            return this.unbind('mousemove', callback);
        };

        Zulu.prototype.unmouseenter = function(callback) {
            return this.unbind('mouseenter', callback);
        };

        Zulu.prototype.unmouseleave = function(callback) {
            return this.unbind('mouseleave', callback);
        };

        Zulu.prototype.unkeydown = function(callback) {
            return this.unbind('keydown', callback);
        };

        Zulu.prototype.unkeyup = function(callback) {
            return this.unbind('keyup', callback);
        };

        Zulu.prototype.unkeypress = function(callback) {
            return this.unbind('keypress', callback);
        };

        Zulu.prototype.unfocus = function(callback) {
            return this.unbind('focus', callback);
        };

        Zulu.prototype.unblur = function(callback) {
            return this.unbind('blur', callback);
        };

        Zulu.prototype.unchange = function(callback) {
            return this.unbind('change', callback);
        };

        Zulu.prototype.unselect = function(callback) {
            return this.unbind('select', callback);
        };

        Zulu.prototype.unsubmit = function(callback) {
            return this.unbind('submit', callback);
        };

        Zulu.prototype.unreset = function(callback) {
            return this.unbind('reset', callback);
        };

        Zulu.prototype.untoggle = function(callback) {
            return this.unbind('toggle', callback);
        };

        Zulu.prototype.uninvalid = function(callback) {
            return this.unbind('invalid', callback);
        };

        Zulu.prototype.unerror = function(callback) {
            return this.unbind('error', callback);
        };

        Zulu.prototype.unscroll = function(callback) {
            return this.unbind('scroll', callback);
        };

        Zulu.prototype.unload = function(callback) {
            return this.unbind('load', callback);
        };

        Zulu.prototype.ununload = function(callback) {
            return this.unbind('unload', callback);
        };

        Zulu.prototype.unwheel = function(callback) {
            return this.unbind('wheel', callback);
        };

        Zulu.prototype.unresize = function(callback) {
            return this.unbind('resize', callback);
        };

        Zulu.prototype.unabort = function(callback) {
            return this.unbind('abort', callback);
        };

        /**
         * Add 1 or more css property in all node selected.
         *
         * @param {String, Array} property The css property of list css property.
         * @param {String, Array} values The css values or list css values.
         * @param {boolean} important css important clause.
         * @returns {Zulu}
         */
        Zulu.prototype._addCSS = function(property, values, important) {
            important = !(typeof important === 'undefined') ? important : false;
            property = typeof property.valueOf() === 'string' ? [property] : property;
            values = typeof values.valueOf() === 'string' ? [values] : values;

            if (!(property.length === values.length)) throw new Error('property array not equals values array length');

            this.each(function (node) {
                var style = z(node).attr('style', undefined) || '';

                for (var j=0; j<property.length; j++) {
                    if (!(style.indexOf(property[j]+":") === -1)) {
                        var stylize = style.split(';');
                        style = '';

                        for (var k=0; k<stylize.length; k++) {
                            while (!(stylize[k].indexOf(' ') === -1)) stylize[k] = stylize[k].replace(' ', '');

                            if (stylize[k].length === 0) continue;
                            if (!stylize[k].endsWith(';')) stylize[k] += ';';
                            if (stylize[k].indexOf(property[j]+':') === -1) style += stylize[k];
                        }
                    }
                    style += ((style.length > 0 && !style.endsWith(';')) ? ';' : '') + property[j] + ':' + values[j] +
                        (important ? ' !important;' : ';');
                }

                z(node).attr('style', style);
            });

            return this;
        };

        /**
         * Add 1 or more css property in all node selected.
         *
         * @param {{}} values The css json property
         * @returns {Zulu}
         */
        Zulu.prototype.addCSS = function(values) {
            for(var key in values)
                this._addCSS(key, values[key], false);

            return this;
        };

        /**
         * Delete 1 or more css property list in all node selected.
         * @returns {Zulu}
         */
        Zulu.prototype.removeCSS = function() {
            var args = arguments;

            this.each(function (node) {
                var style = z(node).attr('style', undefined) || '';

                for (var j=0; j<args.length; j++) {
                    if (!(style.indexOf(args[j]+":") === -1)) {
                        var stylize = style.split(';');
                        style = '';

                        for (var k=0; k<stylize.length; k++) {
                            while (!(stylize[k].indexOf(' ') === -1)) stylize[k] = stylize[k].replace(' ', '');

                            if (stylize[k].length === 0) continue;
                            if (!stylize[k].endsWith(';')) stylize[k] += ';';
                            if (stylize[k].indexOf(args[j]+':') === -1) style += stylize[k];
                        }
                    }
                }

                if (style.length === 0) z(node).removeAttr('style');
                else z(node).attr('style', style);
            });

            return this;
        };

        /**
         * Filter all node selected and move selection to only node respect give in params.
         * @returns {Object, Zulu}
         */
        Zulu.prototype.filter = function() {
            if (arguments.length === 0) return this;

            var factory = '',
                newNode = [];

            for (var i=0; i<arguments.length; i++)
                factory += arguments[i] + (i < (arguments.length - 1) ? ',' : '')

            var filterResult = DomElement.extract(document, factory);

            this.each(function (node) {
                for (var j=0; j<filterResult.length; j++)
                    if (filterResult[j].isEqualNode(node)) {
                        newNode.push(node);
                        break;
                    }
            });

            return migrate(newNode);
        };

        /**
         * Filter all node selected and move selection to only node contains minimum 1 child respect clause give in params.
         * @returns {Object, Zulu}
         */
        Zulu.prototype.find = function() {
            if (arguments.length === 0) return this;

            var factory = '',
                newNode = [];

            for (var i=0; i<arguments.length; i++)
                factory += arguments[i] + (i < arguments.length - 1 ? ',' : '');

            this.each(function (node) {
                if (DomElement.extract(node, factory).length > 0) newNode.push(node);
            });

            return migrate(newNode);
        };

        /**
         * Select node in list node and move selection it.
         *
         * @param {number} position The position of node where our execute selection.
         * @returns {Zulu}
         */
        Zulu.prototype.take = function(position) {
            if (!this.array) return this;
            else if (position < 0) position = this.node.length + position;

            if (position < 0) position = 0;
            else if (position >= this.node.length) position = this.node.length - 1;

            return migrate([this.node[position]]);
        };

        /**
         * Get the index of node in array node list.
         *
         * @param {Zulu, Node} node The node who are search index in list.
         * @returns {number}
         */
        Zulu.prototype.index = function(node) {
            if (typeof node === 'undefined' || !this.array) return -1;
            else if (node.isZulu === this.isZulu) {
                if (node.array) return -1;
                else node = node.node;
            }

            for (var i=0; i<this.node.length; i++)
                if (this.node[i].isEqualNode(node)) return i;

            return -1;
        };

        /**
         * Select node in interval and move selection it.
         *
         * @param start The interval start.
         * @param count The number count to interval.
         * @returns {Zulu, Object}
         */
        Zulu.prototype.eq = function(start, count) {
            if (!this.array) return this;
            else {
                var newNode = [],
                    reverse = false,
                    i;

                if (start < 0) {
                    reverse = true;
                    start = Math.abs(start);
                }

                if (reverse)
                    for (i=this.node.length - start; count > 0; i--) {
                        try { newNode.push(this.node[i]); } catch (e) {break;}
                        count--;
                    }
                else
                    for (i=start; i<(start+count); i++)
                        try { newNode.push(this.node[i]); } catch (e) {break;}

                return migrate(newNode);
            }
        };

        /**
         * Get the client node information.
         * @returns {Object}
         */
        Zulu.prototype.client = function() {
            if (this.array) return undefined;
            return {
                'height': this.node.clientHeight,
                'top': this.node.clientTop,
                'left': this.node.clientLeft,
                'width': this.node.clientWidth
            }
        };

        /**
         * Get the offset node information.
         * @returns {Object}
         */
        Zulu.prototype.offset = function() {
            if (this.array) return undefined;

            return {
                'height': this.node.offsetHeight,
                'parent': this.node.offsetParent,
                'left': this.node.offsetLeft,
                'top': this.node.offsetTop,
                'width': this.node.offsetWidth
            }
        };

        /**
         * Get the jQuery object with node selected.
         * @returns {jQuery.fn.init|jQuery|HTMLElement}
         */
        Zulu.prototype.jquery = function () {
            if (window.$) return window.$(this.node);
            else if (window.jQuery) return window.jQuery(this.node);
            else throw new Error("JQuery modules is required");
        };

        /**
         * Call function gives with all node selected.
         * @param {Function} func
         * @returns {Zulu}
         */
        Zulu.prototype.each = function (func) {
            var node = this.array ? this.node : [this.node];

            for (var i=0; i<node.length; i++)
                if (node[i]) func(node[i]);

            return this;
        };

        ////////////
        // Execution

        if (typeof factory === 'undefined') throw new Error('Zulu constructor requires args');
        else if (factory.isZulu === this.isZulu) {
            this.node = factory.node;
            this.array = factory.array;

            return this;
        }
        else if (typeof factory.valueOf() === 'object') {
            this.node = factory;
            this.array = false;

            return this;
        }
        else {
            var querySet = DomElement.extract(document, factory);
            return migrate(querySet);
        }
    }

    window.zulu = window.z = window.Z = window.Zulu = function(factory) {
        return new Zulu(factory);
    };

    window.zuluTool = window.ux = window.Ux = window.ZuluTool = window.zt = window.Zt = new function FrozenSet() {
        this.prototype = FrozenSet.prototype;

        FrozenSet.prototype.isZulu = settingsSpace.type;
        FrozenSet.prototype.factory = settingsSpace;
        FrozenSet.prototype.version = settingsSpace.version;
        FrozenSet.prototype.correctEvent = eventSpace.correctSignal;

        /**
         * Create new node in document page.
         *
         * @param {String} nodeName The node name.
         * @param {boolean} textNode Define if we create an element or an text node. Default values has false.
         * @returns {Zulu}
         */
        FrozenSet.prototype.create = function(nodeName, textNode) {
            textNode = typeof textNode === 'undefined' ? false : textNode;
            var zulu = new Zulu('*');

            zulu.node = !textNode ? document.createElement(nodeName.toLowerCase()) : document.createTextNode(nodeName);
            zulu.array = false;

            return zulu;
        }
    };
})(document);
