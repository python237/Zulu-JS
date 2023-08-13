/**
** Animation management code generally used under the DOM. For example,
** fixing elements, scrolling to an element, etc.
**
** @version 1.0.1
*/
;(function(document, fn) {
    "use strict";

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check version
    if (!fn.factory.requires('1.0.1')) throw new Error("Zulu animation requires V1.0.1");
    var context = fn.factory.modules;

    /**
     * Fix node or list node if y position of node has zero.
     *
     * @param {Object} position .
     * @returns {window.ux.factory.modules}
     */
    context.prototype.fixed = function(position) {
        var top = position.top;
        var bottom = position.bottom;
        var right = position.right;
        var left = position.left;
        var enable = position.enable;
        var disable = position.disable;
        var z_index = position.z_index || "10000";

        if (!(typeof top === "number") && !(typeof bottom === "number"))
            throw new Error("Attributes missing. top or bottom attributes requires number values");
        if (!(typeof left === "number") && !(typeof right === "number"))
            throw new Error("Attributes missing. left or right attributes requires number values");

        this.each(function (node) {
           var offsetTop = node.offsetTop;

           z(node).removeAttr("zulu-lock-fixed");
            z(window).scroll(
                function() {
                    if (!z(node).hasAttr("zulu-lock-fixed")) {
                        var scrollTop = document.documentElement.scrollTop;

                        if (scrollTop >= offsetTop) {
                            var values = {
                                "position": "fixed !important",
                                'z-index': z_index + ' !important'
                            };

                            if (typeof top === "number") values["top"] = top + "px !important";
                            if (typeof bottom === "number") values["bottom"] = bottom + "px !important";
                            if (typeof left === "number") values["left"] = left + "px !important";
                            if (typeof right === "number") values["right"] = right + "px !important";

                            z(node).addCSS(values);
                            z(node).attr("zulu-animation-enable", "true");

                            // Execute functions
                            if (typeof enable === "function") enable(node, scrollTop, offsetTop);
                        }
                    }
                },
                function() {
                    if (!z(node).hasAttr("zulu-lock-fixed")) {
                        var scrollTop = document.documentElement.scrollTop;

                        if (scrollTop < offsetTop) {
                            z(node).unfixed();

                            // Execute functions
                            if (typeof disable === "function") disable(node, scrollTop, offsetTop);
                        }
                    }
                }
            );
        });

        return this;
    };

    /**
     * disable fixed property style to node or list node.
     *
     * @param {boolean} lock Determines if system lock fixed. in this case, the fixed function can't be applied. Default values is false.
     * @returns {window.ux.factory.modules}
     */
    context.prototype.unfixed = function(lock) {
        this.each(function (node) {
            if (lock === true) z(node).attr("zulu-lock-fixed", "true");

            if (z(node).hasAttr("zulu-animation-enable")) {
                z(node).removeCSS('position', 'top', 'left', 'right', 'bottom', 'z-index');
                z(node).removeAttr("zulu-animation-enable");
            }
        });

        return this;
    };

    /**
    * Listens if the user slides up. In this case, triggers all registered callbacks.
    **/
    fn.prototype.scrollUp = function() {
        var last = document.documentElement.scrollTop;

        for (var i=0; i<arguments.length; i++) {
            if (typeof arguments[i] === "function") {
                (function(f) {
                    z(window).scroll(function() {
                        var position = document.documentElement.scrollTop;

                        if (last > position) f(position);
                        last = position;
                    });
                })(arguments[i]);
            }
        }

        return this;
    };

    /**
    * Listens if the user slides down. In this case, triggers all registered callbacks.
    **/
    fn.prototype.scrollDown = function() {
        var last = document.documentElement.scrollTop;

        for (var i=0; i<arguments.length; i++) {
            if (typeof arguments[i] === "function") {
                (function(f) {
                    z(window).scroll(function() {
                        var position = document.documentElement.scrollTop;

                        if (position > last) f(position);
                        last = position;
                    });
                })(arguments[i]);
            }
        }

        return this;
    };
})(
    document,
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux)
);
