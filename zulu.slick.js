/**
** Code for managing layouts in the DOM.
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
     * Slick items (Disposition).
     *
     * @param {{}} data
     * @returns {window.ux.factory.modules}
     */
    context.prototype.slick = function (data) {
        var target = data.target,
            show = data.show,
            responsive = data.responsive,
            $this = this,
            spacing = data.spacing, // Optional
            bottom = data.bottom, // Optional
            top = data.top, // Optional
            min_width = data.min_width, // Optional
            max_width = data.max_width, // Optional
            centerMode = data.center;  // Optional

        z($this).attr("zulu-slick-abort", "false");

        function range() {
            var breakpoint = function (elem) {
                var width = z(elem).client().width, index = -1;  //window.innerWidth;

                for (var i = 0; i < responsive.length; i++)
                    if (width <= responsive[i].breakpoint)
                        if (index === -1 || responsive[i].breakpoint < responsive[index].breakpoint) index = i;

                return index === -1 ? {
                    show: show,
                    spacing: spacing,
                    bottom: bottom,
                    top: top,
                    centerMode: centerMode,
                    max_width: max_width,
                    min_width: min_width
                } : responsive[index];
            };

            $this.each(function (node) {
                // Check if unslick not applied
                if (z(node).attr("zulu-slick-abort") === "true") return;

                var apply = breakpoint(node);
                var width = undefined;

                if (apply.spacing)
                    width = (z(node).offset().width / (apply.show || show)) - (apply.spacing * 2.51);
                else
                    width = (z(node).offset().width / (apply.show || show));

                width -= 0 ? (apply.show || show) > 1 : (1/z(node).offset().width) * 3000;

                // Check min and max width

                if (typeof apply.min_width === "number") {
                    if (apply.min_width > width) width = apply.min_width;
                }
                if (typeof apply.max_width === "number") {
                    if (apply.max_width < width) width = apply.max_width;
                }

                if (apply.centerMode) z(node)._addCSS("text-align", "center", true);
                else z(node).removeCSS("text-align");

                var child = z(node).child(target).each(function (items) {
                    z(items).attr("data-zulu-slicked", "true").addCSS({
                        "width": width + "px !important",
                        "display": "inline-block !important"
                    });

                    if (apply.spacing)
                        try {
                            if ((z(node).child(target).index(items)  % (apply.show || show)) !== 0)
                                z(items)._addCSS("margin-left", apply.spacing + "px", true);
                            else
                                z(items).removeCSS("margin-left");

                            if (((z(node).child(target).index(items) + 1) % (apply.show || show)) !== 0)
                                z(items)._addCSS("margin-right", apply.spacing + "px", true);
                            else
                                z(items).removeCSS("margin-right");
                        }
                        catch (e) {}
                    else
                        z(items).removeCSS("margin-left", "margin-right");

                    if (apply.top)
                        z(items)._addCSS("margin-top", apply.top + "px", true);
                    else
                        z(items).removeCSS("margin-top");

                    if (apply.bottom)
                        z(items)._addCSS("margin-bottom", apply.bottom + "px", true);
                    else
                        z(items).removeCSS("margin-bottom");
                });

                try {
                    z(child).eq(-1, (apply.show || show)).each(function (items) {
                        // Remove margin bottom for last box
                        z(items).removeCSS("margin-bottom");
                    });
                }
                catch (e) {}
                try {
                    z(child).eq(0, (apply.show || show)).each(function (items) {
                        // Remove margin top for start box
                        z(items).removeCSS("margin-top");
                    });
                }
                catch (e) {}
            });
        }

        z(window).load(range).resize(range);
        range();
        return this;
    };

    context.prototype.unslick = function () {
        z(this).child(undefined).each(function (items) {
            if (z(items).hasAttr("data-zulu-slicked")) {
                z(items).removeCSS("text-align");
                z(items).removeCSS(
                    "width", "display", "margin-left", "margin-right", "margin-top", "margin-bottom"
                );
            }
        });
        
        z(this).attr("zulu-slick-abort", "true");
    };
})(
    document,
    (function(obj) {
        if (!(typeof obj === 'undefined') && obj.isZulu) return obj;
        else return undefined;
    })(ux || window.ux)
);