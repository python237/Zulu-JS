/*!
* Copyright (c) 2020-present, Comparo Group. All rights reserved.
* Zulu JavaScript Library v1.0.0 - Image Tools
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

    // Check Version
    if (!fn.factory.requires('1.0.0')) throw new Error("zulu eval extension requires V1.0.0");
    const context = fn.factory.modules;  // Zulu

    // Add method
    context.prototype.asyncImg = function(callback) {
        // callback is optional and only call if img correctly downloaded

        this.each(function (node) {
            // Set loader img
            const loaderImg = (new context(node)).attr("data-spider-wait", undefined);

            if (loaderImg !== null && loaderImg !== undefined) {
                (new context(node)).attr("src", loaderImg);
            }

            // Start download img
            const img = new Image();

            img.onload = function () { // Call only if image has download
                (new context(node)).replace(img, undefined);  // Replace

                if (typeof callback === 'function') callback(img);
            };
            img.src = (new context(node)).attr("data-spider-download", undefined);
        });

        return this;
    };

    context.prototype.showImg = function(callback) {
        // callback is optional and only call if img receive events for show his to window.

        if (this.array) throw new Error('Can\'t show multiple img');
        else {
            const img = z(this).clone(true);
            const box = ux.add('div', false).attr('id', 'zuluShadowImg');
            const icon = ux.add('span', false).addClass('icon', 'fa-window-close');

            z('body').append(
                box.append(
                    ux.add('div', false).append(img),
                    ux.add('section', false).append(icon)
                )
            );

            z(icon).click(function () {
                z(box).remove();
            });

            // Call callback
            if (typeof callback === 'function') callback(img);
        }
    };

    context.prototype.windowShowImg = function (callback) {
        // callback is optional and only call if img receive events for show his to window.

        this.each(function (node) {
            // Bind event
            z(node).mouseenter(function () {
                // Set cursor
                z(node).__addCSS('cursor', 'zoom-in', true);
            }).mouseout(function () {
                // Set cursor
                z(node).removeCSS('cursor');
            }).click(function (img) {
                z(img).showImg(callback)
            });
        });
    }
})(
    document,
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux)
);
