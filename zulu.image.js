/**
** Code for managing image processing and operations.
** These include zoom, image loading, image visibility, etc.
**
** @version 1.0.1
*/
;(function (document, fn) {
    "use strict";

    if (typeof fn === 'undefined' || !'factory' in fn || !'type' in fn.factory || !(fn.isZulu === fn.factory.type))
        throw new Error("Zulu Toolkit requires");

    // Check version
    if (!fn.factory.requires('1.0.1')) throw new Error("Zulu slick requires V1.0.1");
    var context = fn.factory.modules;

    /**
     *
     * @param {Function} callback
     * @returns {fn.factory.modules}
     */
    context.prototype.downloadImage = function(callback) {
        // callback is optional and only call if img correctly downloaded
        this.each(function (node) {
            // Set loader img
            var loaderImg = (new context(node)).attr("zulu-await-image", undefined);

            if (loaderImg !== null && loaderImg !== undefined) {
                (new context(node)).attr("src", loaderImg);
            }

            // Start download img
            var img = new Image();

            img.onload = function () { // Call only if image has download
                (new context(node)).replace(new context(img), false);  // Replace
                // Image has been downloaded
                if (typeof callback === 'function') callback(img);
            };
            img.src = (new context(node)).attr("zulu-download-image", undefined);
        });
        return this;
    };

    /**
     *
     * @param {Function} openCallback
     * @param {Function} closeCallback
     */
    context.prototype.showImg = function(openCallback, closeCallback) {
        // callback is optional and only call if img receive events for show his to window.
        if (this.array) throw new Error('Can\'t show multiple img');
        else {
            var img = z(this).clone(true);
            var box = ux.add('div', false).attr('id', 'zulu-shower-box');
            var icon = ux.add('span', false).addClass('icon', 'fa-window-close');

            z('body').append(
                box.append(
                    ux.add('div', false).append(img),
                    ux.add('section', false).append(icon)
                )
            );

            z(icon).click(function () {
                z(box).remove();
                if (typeof closeCallback === "function") closeCallback(img);
            });

            // Call callback
            if (typeof openCallback === 'function') openCallback(img);
        }
    };

    /**
     *
     * @param {Function} enterCallback
     * @param {Function} outCallback
     * @param {Function} clickCallback
     */
    context.prototype.zoomCursor = function (enterCallback, outCallback, clickCallback) {
        // callback is optional and only call if img receive events for show his to window.

        this.each(function (node) {
            // Bind event
            z(node).mouseenter(function (node, e) {
                // Set cursor
                z(node).__addCSS('cursor', 'zoom-in', true);
                if (typeof enterCallback === "function") enterCallback(e);
            }).mouseout(function (node, e) {
                // Revoke cursor
                z(node).removeCSS('cursor');
                if (typeof outCallback === "function") outCallback(e);
            }).click(function (img) {
                if (typeof clickCallback === "function") clickCallback(img);
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
