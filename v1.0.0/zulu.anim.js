/*!
* Copyright (c) 2020-present, Comparo Group. All rights reserved.
* Zulu JavaScript Library v1.0.0 - Animation Tools
*
* Copyright Comparo Group and other contributors
* Released under the MIT license
*
* @author Didier Tagne
* @mail tagnedidier@gmail.com
*/

;(function(document, fn) {
    "use strict";

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check version
    if (!fn.factory.requires('1.0.0')) throw new Error("zulu animation extension requires V1.0.0");
    const context = fn.factory.modules;

    /**
     * Fix node or list node if y position of node has zero.
     *
     * @param {number} top The fix position in top. Default has 0.
     * @param {number} left The fix position in left. Default has 0.
     * @param {number} right The fix position in right. Default has 0.
     * @param {Object} exec The functions obj will be execute if fixed apply or no.
     * @returns {fn.factory.modules}
     */
    context.prototype.fixedTo = function(top, left, right, exec) {
        const node = this.array ? this.node : [this.node];

        top = !(typeof top === "undefined") ? top : 0;
        left = !(typeof left === 'undefined') ? left : 0;
        right = !(typeof right === 'undefined') ? right : 0;

        const apply = exec.apply || function () {},
            clear = exec.clear || function () {};

        for(let i=0; i<node.length; i++)
            (function(node, offsetTop) {
                z(window).scroll(
                    function() {
                        const scrollTop = document.documentElement.scrollTop;

                        if (scrollTop >= offsetTop) {
                            const nextFriend = z(node).nextFriend(false);

                            if(nextFriend)
                                z(nextFriend).__addCSS(
                                    'margin-top', (z(node).offset().height + z(nextFriend).client().top) + 'px', true
                                );
                            
                            z(node).addCSS({
                                'position': 'fixed !important',
                                'top': top+'px !important',
                                'left': left+'px !important',
                                'right': right+'px !important',
                                'z-index': '600000 !important'
                            });

                            // Execute functions
                            apply(node);
                        }
                    },
                    function() {
                        const scrollTop = document.documentElement.scrollTop;

                        if (scrollTop < offsetTop) {
                            z(node).unFixed();

                            // Execute functions
                            clear(node);
                        }
                    }
                );
            })(node[i], node[i].offsetTop);

        return this;
    };

    /**
     * UnFix node or list node.
     *
     * @returns {fn.factory.modules}
     */
    context.prototype.unFixed = function() {
        this.each(function (node) {
            const nextFriend = z(node).nextFriend(false);

            if(nextFriend)
                z(node).nextFriend(false).removeCSS('margin-top');

            z(node).removeCSS('position', 'top', 'left', 'right', 'z-index');
        });
    };

    /**
     * Slick items (Scrollable).
     *
     * @param {{}} data
     * @returns {fn.factory.modules}
     */
    context.prototype.slick = function (data) {
        const target = data.target,
            show = data.show,
            responsive = data.responsive,
            $this = this,
            spacing = data.spacing, // Optional
            bottom = data.bottom, // Optional
            top = data.top, // Optional
            centerMode = data.center;  // Optional

        // Clear unslick
        z($this).removeClass("unslick");

        function range() {
            const getResponsiveShow = function () {
                let width = window.innerWidth, index = -1;

                for (let i = 0; i < responsive.length; i++)
                    if (width <= responsive[i].breakpoint)
                        if (index === -1 || responsive[i].breakpoint < responsive[index].breakpoint) index = i;

                return index === -1 ? {
                    show: show,
                    spacing: spacing,
                    bottom: bottom,
                    top: top,
                    centerMode: centerMode
                } : responsive[index];
            };

            $this.each(function (node) {
                // Check if unslick not applied
                if (z(node).hasClass("unslick")) {
                    z(node).removeCSS("text-align");
                    z(node).child(target).removeCSS("width", "display", "margin-left", "margin-right", "margin-top", "margin-bottom");

                    return;
                }

                const apply = getResponsiveShow();
                let width = undefined;

                if (apply.spacing)
                    width = (z(node).offset().width / (apply.show || show)) - 8 - ((apply.spacing) * 2);
                else
                    width = (z(node).offset().width / (apply.show || show)) - 8;

                if (apply.centerMode) z(node).__addCSS("text-align", "center", true);
                else z(node).removeCSS("text-align");

                const child = z(node).child(target).each(function (items) {
                    z(items).addCSS({
                        "width": width + "px !important",
                        "display": "inline-block !important"
                    });

                    if (apply.spacing)
                        z(items).addCSS({
                            "margin-left": spacing + "px",
                            "margin-right": spacing + "px"
                        });
                    else
                        z(items).removeCSS("margin-left", "margin-right");

                    if (apply.top)
                        z(items).__addCSS("margin-top", apply.top + "px", true);
                    else
                        z(items).removeCSS("margin-top");

                    if (apply.bottom)
                        z(items).__addCSS("margin-bottom", apply.bottom + "px", true);
                    else
                        z(items).removeCSS("margin-bottom");
                });

                z(child).eq(-1, (apply.show || show)).each(function (items) {
                    // Remove margin bottom for last box
                    z(items).removeCSS("margin-bottom");
                });
                z(child).eq(0, (apply.show || show)).each(function (items) {
                    // Remove margin top for start box
                    z(items).removeCSS("margin-top");
                });
            });
        }

        z(window).load(range).resize(range);
        return this;
    };
    
    context.prototype.unslick = function () {
        z(this).addClass("unslick");
    };
})(
    document,
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux)
);
