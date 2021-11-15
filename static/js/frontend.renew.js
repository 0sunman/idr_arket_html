/* intersectionobserver polyfill */
/**
 * Copyright 2016 Google Inc. All Rights Reserved.
 *
 * Licensed under the W3C SOFTWARE AND DOCUMENT NOTICE AND LICENSE.
 *
 *  https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 */
(function() {
    'use strict';

// Exit early if we're not running in a browser.
    if (typeof window !== 'object') {
        return;
    }

// Exit early if all IntersectionObserver and IntersectionObserverEntry
// features are natively supported.
    if ('IntersectionObserver' in window &&
        'IntersectionObserverEntry' in window &&
        'intersectionRatio' in window.IntersectionObserverEntry.prototype) {

        // Minimal polyfill for Edge 15's lack of `isIntersecting`
        // See: https://github.com/w3c/IntersectionObserver/issues/211
        if (!('isIntersecting' in window.IntersectionObserverEntry.prototype)) {
            Object.defineProperty(window.IntersectionObserverEntry.prototype,
                'isIntersecting', {
                    get: function () {
                        return this.intersectionRatio > 0;
                    }
                });
        }
        return;
    }

    /**
     * Returns the embedding frame element, if any.
     * @param {!Document} doc
     * @return {!Element}
     */
    function getFrameElement(doc) {
        try {
            return doc.defaultView && doc.defaultView.frameElement || null;
        } catch (e) {
            // Ignore the error.
            return null;
        }
    }

    /**
     * A local reference to the root document.
     */
    var document = (function(startDoc) {
        var doc = startDoc;
        var frame = getFrameElement(doc);
        while (frame) {
            doc = frame.ownerDocument;
            frame = getFrameElement(doc);
        }
        return doc;
    })(window.document);

    /**
     * An IntersectionObserver registry. This registry exists to hold a strong
     * reference to IntersectionObserver instances currently observing a target
     * element. Without this registry, instances without another reference may be
     * garbage collected.
     */
    var registry = [];

    /**
     * The signal updater for cross-origin intersection. When not null, it means
     * that the polyfill is configured to work in a cross-origin mode.
     * @type {function(DOMRect|ClientRect, DOMRect|ClientRect)}
     */
    var crossOriginUpdater = null;

    /**
     * The current cross-origin intersection. Only used in the cross-origin mode.
     * @type {DOMRect|ClientRect}
     */
    var crossOriginRect = null;


    /**
     * Creates the global IntersectionObserverEntry constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-entry
     * @param {Object} entry A dictionary of instance properties.
     * @constructor
     */
    function IntersectionObserverEntry(entry) {
        this.time = entry.time;
        this.target = entry.target;
        this.rootBounds = ensureDOMRect(entry.rootBounds);
        this.boundingClientRect = ensureDOMRect(entry.boundingClientRect);
        this.intersectionRect = ensureDOMRect(entry.intersectionRect || getEmptyRect());
        this.isIntersecting = !!entry.intersectionRect;

        // Calculates the intersection ratio.
        var targetRect = this.boundingClientRect;
        var targetArea = targetRect.width * targetRect.height;
        var intersectionRect = this.intersectionRect;
        var intersectionArea = intersectionRect.width * intersectionRect.height;

        // Sets intersection ratio.
        if (targetArea) {
            // Round the intersection ratio to avoid floating point math issues:
            // https://github.com/w3c/IntersectionObserver/issues/324
            this.intersectionRatio = Number((intersectionArea / targetArea).toFixed(4));
        } else {
            // If area is zero and is intersecting, sets to 1, otherwise to 0
            this.intersectionRatio = this.isIntersecting ? 1 : 0;
        }
    }


    /**
     * Creates the global IntersectionObserver constructor.
     * https://w3c.github.io/IntersectionObserver/#intersection-observer-interface
     * @param {Function} callback The function to be invoked after intersection
     *     changes have queued. The function is not invoked if the queue has
     *     been emptied by calling the `takeRecords` method.
     * @param {Object=} opt_options Optional configuration options.
     * @constructor
     */
    function IntersectionObserver(callback, opt_options) {

        var options = opt_options || {};

        if (typeof callback != 'function') {
            throw new Error('callback must be a function');
        }

        if (
            options.root &&
            options.root.nodeType != 1 &&
            options.root.nodeType != 9
        ) {
            throw new Error('root must be a Document or Element');
        }

        // Binds and throttles `this._checkForIntersections`.
        this._checkForIntersections = throttle(
            this._checkForIntersections.bind(this), this.THROTTLE_TIMEOUT);

        // Private properties.
        this._callback = callback;
        this._observationTargets = [];
        this._queuedEntries = [];
        this._rootMarginValues = this._parseRootMargin(options.rootMargin);

        // Public properties.
        this.thresholds = this._initThresholds(options.threshold);
        this.root = options.root || null;
        this.rootMargin = this._rootMarginValues.map(function(margin) {
            return margin.value + margin.unit;
        }).join(' ');

        /** @private @const {!Array<!Document>} */
        this._monitoringDocuments = [];
        /** @private @const {!Array<function()>} */
        this._monitoringUnsubscribes = [];
    }


    /**
     * The minimum interval within which the document will be checked for
     * intersection changes.
     */
    IntersectionObserver.prototype.THROTTLE_TIMEOUT = 100;


    /**
     * The frequency in which the polyfill polls for intersection changes.
     * this can be updated on a per instance basis and must be set prior to
     * calling `observe` on the first target.
     */
    IntersectionObserver.prototype.POLL_INTERVAL = null;

    /**
     * Use a mutation observer on the root element
     * to detect intersection changes.
     */
    IntersectionObserver.prototype.USE_MUTATION_OBSERVER = true;


    /**
     * Sets up the polyfill in the cross-origin mode. The result is the
     * updater function that accepts two arguments: `boundingClientRect` and
     * `intersectionRect` - just as these fields would be available to the
     * parent via `IntersectionObserverEntry`. This function should be called
     * each time the iframe receives intersection information from the parent
     * window, e.g. via messaging.
     * @return {function(DOMRect|ClientRect, DOMRect|ClientRect)}
     */
    IntersectionObserver._setupCrossOriginUpdater = function() {
        if (!crossOriginUpdater) {
            /**
             * @param {DOMRect|ClientRect} boundingClientRect
             * @param {DOMRect|ClientRect} intersectionRect
             */
            crossOriginUpdater = function(boundingClientRect, intersectionRect) {
                if (!boundingClientRect || !intersectionRect) {
                    crossOriginRect = getEmptyRect();
                } else {
                    crossOriginRect = convertFromParentRect(boundingClientRect, intersectionRect);
                }
                registry.forEach(function(observer) {
                    observer._checkForIntersections();
                });
            };
        }
        return crossOriginUpdater;
    };


    /**
     * Resets the cross-origin mode.
     */
    IntersectionObserver._resetCrossOriginUpdater = function() {
        crossOriginUpdater = null;
        crossOriginRect = null;
    };


    /**
     * Starts observing a target element for intersection changes based on
     * the thresholds values.
     * @param {Element} target The DOM element to observe.
     */
    IntersectionObserver.prototype.observe = function(target) {
        var isTargetAlreadyObserved = this._observationTargets.some(function(item) {
            return item.element == target;
        });

        if (isTargetAlreadyObserved) {
            return;
        }

        if (!(target && target.nodeType == 1)) {
            throw new Error('target must be an Element');
        }

        this._registerInstance();
        this._observationTargets.push({element: target, entry: null});
        this._monitorIntersections(target.ownerDocument);
        this._checkForIntersections();
    };


    /**
     * Stops observing a target element for intersection changes.
     * @param {Element} target The DOM element to observe.
     */
    IntersectionObserver.prototype.unobserve = function(target) {
        this._observationTargets =
            this._observationTargets.filter(function(item) {
                return item.element != target;
            });
        this._unmonitorIntersections(target.ownerDocument);
        if (this._observationTargets.length == 0) {
            this._unregisterInstance();
        }
    };


    /**
     * Stops observing all target elements for intersection changes.
     */
    IntersectionObserver.prototype.disconnect = function() {
        this._observationTargets = [];
        this._unmonitorAllIntersections();
        this._unregisterInstance();
    };


    /**
     * Returns any queue entries that have not yet been reported to the
     * callback and clears the queue. This can be used in conjunction with the
     * callback to obtain the absolute most up-to-date intersection information.
     * @return {Array} The currently queued entries.
     */
    IntersectionObserver.prototype.takeRecords = function() {
        var records = this._queuedEntries.slice();
        this._queuedEntries = [];
        return records;
    };


    /**
     * Accepts the threshold value from the user configuration object and
     * returns a sorted array of unique threshold values. If a value is not
     * between 0 and 1 and error is thrown.
     * @private
     * @param {Array|number=} opt_threshold An optional threshold value or
     *     a list of threshold values, defaulting to [0].
     * @return {Array} A sorted list of unique and valid threshold values.
     */
    IntersectionObserver.prototype._initThresholds = function(opt_threshold) {
        var threshold = opt_threshold || [0];
        if (!Array.isArray(threshold)) threshold = [threshold];

        return threshold.sort().filter(function(t, i, a) {
            if (typeof t != 'number' || isNaN(t) || t < 0 || t > 1) {
                throw new Error('threshold must be a number between 0 and 1 inclusively');
            }
            return t !== a[i - 1];
        });
    };


    /**
     * Accepts the rootMargin value from the user configuration object
     * and returns an array of the four margin values as an object containing
     * the value and unit properties. If any of the values are not properly
     * formatted or use a unit other than px or %, and error is thrown.
     * @private
     * @param {string=} opt_rootMargin An optional rootMargin value,
     *     defaulting to '0px'.
     * @return {Array<Object>} An array of margin objects with the keys
     *     value and unit.
     */
    IntersectionObserver.prototype._parseRootMargin = function(opt_rootMargin) {
        var marginString = opt_rootMargin || '0px';
        var margins = marginString.split(/\s+/).map(function(margin) {
            var parts = /^(-?\d*\.?\d+)(px|%)$/.exec(margin);
            if (!parts) {
                throw new Error('rootMargin must be specified in pixels or percent');
            }
            return {value: parseFloat(parts[1]), unit: parts[2]};
        });

        // Handles shorthand.
        margins[1] = margins[1] || margins[0];
        margins[2] = margins[2] || margins[0];
        margins[3] = margins[3] || margins[1];

        return margins;
    };


    /**
     * Starts polling for intersection changes if the polling is not already
     * happening, and if the page's visibility state is visible.
     * @param {!Document} doc
     * @private
     */
    IntersectionObserver.prototype._monitorIntersections = function(doc) {
        var win = doc.defaultView;
        if (!win) {
            // Already destroyed.
            return;
        }
        if (this._monitoringDocuments.indexOf(doc) != -1) {
            // Already monitoring.
            return;
        }

        // Private state for monitoring.
        var callback = this._checkForIntersections;
        var monitoringInterval = null;
        var domObserver = null;

        // If a poll interval is set, use polling instead of listening to
        // resize and scroll events or DOM mutations.
        if (this.POLL_INTERVAL) {
            monitoringInterval = win.setInterval(callback, this.POLL_INTERVAL);
        } else {
            addEvent(win, 'resize', callback, true);
            addEvent(doc, 'scroll', callback, true);
            if (this.USE_MUTATION_OBSERVER && 'MutationObserver' in win) {
                domObserver = new win.MutationObserver(callback);
                domObserver.observe(doc, {
                    attributes: true,
                    childList: true,
                    characterData: true,
                    subtree: true
                });
            }
        }

        this._monitoringDocuments.push(doc);
        this._monitoringUnsubscribes.push(function() {
            // Get the window object again. When a friendly iframe is destroyed, it
            // will be null.
            var win = doc.defaultView;

            if (win) {
                if (monitoringInterval) {
                    win.clearInterval(monitoringInterval);
                }
                removeEvent(win, 'resize', callback, true);
            }

            removeEvent(doc, 'scroll', callback, true);
            if (domObserver) {
                domObserver.disconnect();
            }
        });

        // Also monitor the parent.
        var rootDoc =
            (this.root && (this.root.ownerDocument || this.root)) || document;
        if (doc != rootDoc) {
            var frame = getFrameElement(doc);
            if (frame) {
                this._monitorIntersections(frame.ownerDocument);
            }
        }
    };


    /**
     * Stops polling for intersection changes.
     * @param {!Document} doc
     * @private
     */
    IntersectionObserver.prototype._unmonitorIntersections = function(doc) {
        var index = this._monitoringDocuments.indexOf(doc);
        if (index == -1) {
            return;
        }

        var rootDoc =
            (this.root && (this.root.ownerDocument || this.root)) || document;

        // Check if any dependent targets are still remaining.
        var hasDependentTargets =
            this._observationTargets.some(function(item) {
                var itemDoc = item.element.ownerDocument;
                // Target is in this context.
                if (itemDoc == doc) {
                    return true;
                }
                // Target is nested in this context.
                while (itemDoc && itemDoc != rootDoc) {
                    var frame = getFrameElement(itemDoc);
                    itemDoc = frame && frame.ownerDocument;
                    if (itemDoc == doc) {
                        return true;
                    }
                }
                return false;
            });
        if (hasDependentTargets) {
            return;
        }

        // Unsubscribe.
        var unsubscribe = this._monitoringUnsubscribes[index];
        this._monitoringDocuments.splice(index, 1);
        this._monitoringUnsubscribes.splice(index, 1);
        unsubscribe();

        // Also unmonitor the parent.
        if (doc != rootDoc) {
            var frame = getFrameElement(doc);
            if (frame) {
                this._unmonitorIntersections(frame.ownerDocument);
            }
        }
    };


    /**
     * Stops polling for intersection changes.
     * @param {!Document} doc
     * @private
     */
    IntersectionObserver.prototype._unmonitorAllIntersections = function() {
        var unsubscribes = this._monitoringUnsubscribes.slice(0);
        this._monitoringDocuments.length = 0;
        this._monitoringUnsubscribes.length = 0;
        for (var i = 0; i < unsubscribes.length; i++) {
            unsubscribes[i]();
        }
    };


    /**
     * Scans each observation target for intersection changes and adds them
     * to the internal entries queue. If new entries are found, it
     * schedules the callback to be invoked.
     * @private
     */
    IntersectionObserver.prototype._checkForIntersections = function() {
        if (!this.root && crossOriginUpdater && !crossOriginRect) {
            // Cross origin monitoring, but no initial data available yet.
            return;
        }

        var rootIsInDom = this._rootIsInDom();
        var rootRect = rootIsInDom ? this._getRootRect() : getEmptyRect();

        this._observationTargets.forEach(function(item) {
            var target = item.element;
            var targetRect = getBoundingClientRect(target);
            var rootContainsTarget = this._rootContainsTarget(target);
            var oldEntry = item.entry;
            var intersectionRect = rootIsInDom && rootContainsTarget &&
                this._computeTargetAndRootIntersection(target, targetRect, rootRect);

            var rootBounds = null;
            if (!this._rootContainsTarget(target)) {
                rootBounds = getEmptyRect();
            } else if (!crossOriginUpdater || this.root) {
                rootBounds = rootRect;
            }

            var newEntry = item.entry = new IntersectionObserverEntry({
                time: now(),
                target: target,
                boundingClientRect: targetRect,
                rootBounds: rootBounds,
                intersectionRect: intersectionRect
            });

            if (!oldEntry) {
                this._queuedEntries.push(newEntry);
            } else if (rootIsInDom && rootContainsTarget) {
                // If the new entry intersection ratio has crossed any of the
                // thresholds, add a new entry.
                if (this._hasCrossedThreshold(oldEntry, newEntry)) {
                    this._queuedEntries.push(newEntry);
                }
            } else {
                // If the root is not in the DOM or target is not contained within
                // root but the previous entry for this target had an intersection,
                // add a new record indicating removal.
                if (oldEntry && oldEntry.isIntersecting) {
                    this._queuedEntries.push(newEntry);
                }
            }
        }, this);

        if (this._queuedEntries.length) {
            this._callback(this.takeRecords(), this);
        }
    };


    /**
     * Accepts a target and root rect computes the intersection between then
     * following the algorithm in the spec.
     * TODO(philipwalton): at this time clip-path is not considered.
     * https://w3c.github.io/IntersectionObserver/#calculate-intersection-rect-algo
     * @param {Element} target The target DOM element
     * @param {Object} targetRect The bounding rect of the target.
     * @param {Object} rootRect The bounding rect of the root after being
     *     expanded by the rootMargin value.
     * @return {?Object} The final intersection rect object or undefined if no
     *     intersection is found.
     * @private
     */
    IntersectionObserver.prototype._computeTargetAndRootIntersection =
        function(target, targetRect, rootRect) {
            // If the element isn't displayed, an intersection can't happen.
            if (window.getComputedStyle(target).display == 'none') return;

            var intersectionRect = targetRect;
            var parent = getParentNode(target);
            var atRoot = false;

            while (!atRoot && parent) {
                var parentRect = null;
                var parentComputedStyle = parent.nodeType == 1 ?
                    window.getComputedStyle(parent) : {};

                // If the parent isn't displayed, an intersection can't happen.
                if (parentComputedStyle.display == 'none') return null;

                if (parent == this.root || parent.nodeType == /* DOCUMENT */ 9) {
                    atRoot = true;
                    if (parent == this.root || parent == document) {
                        if (crossOriginUpdater && !this.root) {
                            if (!crossOriginRect ||
                                crossOriginRect.width == 0 && crossOriginRect.height == 0) {
                                // A 0-size cross-origin intersection means no-intersection.
                                parent = null;
                                parentRect = null;
                                intersectionRect = null;
                            } else {
                                parentRect = crossOriginRect;
                            }
                        } else {
                            parentRect = rootRect;
                        }
                    } else {
                        // Check if there's a frame that can be navigated to.
                        var frame = getParentNode(parent);
                        var frameRect = frame && getBoundingClientRect(frame);
                        var frameIntersect =
                            frame &&
                            this._computeTargetAndRootIntersection(frame, frameRect, rootRect);
                        if (frameRect && frameIntersect) {
                            parent = frame;
                            parentRect = convertFromParentRect(frameRect, frameIntersect);
                        } else {
                            parent = null;
                            intersectionRect = null;
                        }
                    }
                } else {
                    // If the element has a non-visible overflow, and it's not the <body>
                    // or <html> element, update the intersection rect.
                    // Note: <body> and <html> cannot be clipped to a rect that's not also
                    // the document rect, so no need to compute a new intersection.
                    var doc = parent.ownerDocument;
                    if (parent != doc.body &&
                        parent != doc.documentElement &&
                        parentComputedStyle.overflow != 'visible') {
                        parentRect = getBoundingClientRect(parent);
                    }
                }

                // If either of the above conditionals set a new parentRect,
                // calculate new intersection data.
                if (parentRect) {
                    intersectionRect = computeRectIntersection(parentRect, intersectionRect);
                }
                if (!intersectionRect) break;
                parent = parent && getParentNode(parent);
            }
            return intersectionRect;
        };


    /**
     * Returns the root rect after being expanded by the rootMargin value.
     * @return {ClientRect} The expanded root rect.
     * @private
     */
    IntersectionObserver.prototype._getRootRect = function() {
        var rootRect;
        if (this.root && !isDoc(this.root)) {
            rootRect = getBoundingClientRect(this.root);
        } else {
            // Use <html>/<body> instead of window since scroll bars affect size.
            var doc = isDoc(this.root) ? this.root : document;
            var html = doc.documentElement;
            var body = doc.body;
            rootRect = {
                top: 0,
                left: 0,
                right: html.clientWidth || body.clientWidth,
                width: html.clientWidth || body.clientWidth,
                bottom: html.clientHeight || body.clientHeight,
                height: html.clientHeight || body.clientHeight
            };
        }
        return this._expandRectByRootMargin(rootRect);
    };


    /**
     * Accepts a rect and expands it by the rootMargin value.
     * @param {DOMRect|ClientRect} rect The rect object to expand.
     * @return {ClientRect} The expanded rect.
     * @private
     */
    IntersectionObserver.prototype._expandRectByRootMargin = function(rect) {
        var margins = this._rootMarginValues.map(function(margin, i) {
            return margin.unit == 'px' ? margin.value :
                margin.value * (i % 2 ? rect.width : rect.height) / 100;
        });
        var newRect = {
            top: rect.top - margins[0],
            right: rect.right + margins[1],
            bottom: rect.bottom + margins[2],
            left: rect.left - margins[3]
        };
        newRect.width = newRect.right - newRect.left;
        newRect.height = newRect.bottom - newRect.top;

        return newRect;
    };


    /**
     * Accepts an old and new entry and returns true if at least one of the
     * threshold values has been crossed.
     * @param {?IntersectionObserverEntry} oldEntry The previous entry for a
     *    particular target element or null if no previous entry exists.
     * @param {IntersectionObserverEntry} newEntry The current entry for a
     *    particular target element.
     * @return {boolean} Returns true if a any threshold has been crossed.
     * @private
     */
    IntersectionObserver.prototype._hasCrossedThreshold =
        function(oldEntry, newEntry) {

            // To make comparing easier, an entry that has a ratio of 0
            // but does not actually intersect is given a value of -1
            var oldRatio = oldEntry && oldEntry.isIntersecting ?
                oldEntry.intersectionRatio || 0 : -1;
            var newRatio = newEntry.isIntersecting ?
                newEntry.intersectionRatio || 0 : -1;

            // Ignore unchanged ratios
            if (oldRatio === newRatio) return;

            for (var i = 0; i < this.thresholds.length; i++) {
                var threshold = this.thresholds[i];

                // Return true if an entry matches a threshold or if the new ratio
                // and the old ratio are on the opposite sides of a threshold.
                if (threshold == oldRatio || threshold == newRatio ||
                    threshold < oldRatio !== threshold < newRatio) {
                    return true;
                }
            }
        };


    /**
     * Returns whether or not the root element is an element and is in the DOM.
     * @return {boolean} True if the root element is an element and is in the DOM.
     * @private
     */
    IntersectionObserver.prototype._rootIsInDom = function() {
        return !this.root || containsDeep(document, this.root);
    };


    /**
     * Returns whether or not the target element is a child of root.
     * @param {Element} target The target element to check.
     * @return {boolean} True if the target element is a child of root.
     * @private
     */
    IntersectionObserver.prototype._rootContainsTarget = function(target) {
        var rootDoc =
            (this.root && (this.root.ownerDocument || this.root)) || document;
        return (
            containsDeep(rootDoc, target) &&
            (!this.root || rootDoc == target.ownerDocument)
        );
    };


    /**
     * Adds the instance to the global IntersectionObserver registry if it isn't
     * already present.
     * @private
     */
    IntersectionObserver.prototype._registerInstance = function() {
        if (registry.indexOf(this) < 0) {
            registry.push(this);
        }
    };


    /**
     * Removes the instance from the global IntersectionObserver registry.
     * @private
     */
    IntersectionObserver.prototype._unregisterInstance = function() {
        var index = registry.indexOf(this);
        if (index != -1) registry.splice(index, 1);
    };


    /**
     * Returns the result of the performance.now() method or null in browsers
     * that don't support the API.
     * @return {number} The elapsed time since the page was requested.
     */
    function now() {
        return window.performance && performance.now && performance.now();
    }


    /**
     * Throttles a function and delays its execution, so it's only called at most
     * once within a given time period.
     * @param {Function} fn The function to throttle.
     * @param {number} timeout The amount of time that must pass before the
     *     function can be called again.
     * @return {Function} The throttled function.
     */
    function throttle(fn, timeout) {
        var timer = null;
        return function () {
            if (!timer) {
                timer = setTimeout(function() {
                    fn();
                    timer = null;
                }, timeout);
            }
        };
    }


    /**
     * Adds an event handler to a DOM node ensuring cross-browser compatibility.
     * @param {Node} node The DOM node to add the event handler to.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to add.
     * @param {boolean} opt_useCapture Optionally adds the even to the capture
     *     phase. Note: this only works in modern browsers.
     */
    function addEvent(node, event, fn, opt_useCapture) {
        if (typeof node.addEventListener == 'function') {
            node.addEventListener(event, fn, opt_useCapture || false);
        }
        else if (typeof node.attachEvent == 'function') {
            node.attachEvent('on' + event, fn);
        }
    }


    /**
     * Removes a previously added event handler from a DOM node.
     * @param {Node} node The DOM node to remove the event handler from.
     * @param {string} event The event name.
     * @param {Function} fn The event handler to remove.
     * @param {boolean} opt_useCapture If the event handler was added with this
     *     flag set to true, it should be set to true here in order to remove it.
     */
    function removeEvent(node, event, fn, opt_useCapture) {
        if (typeof node.removeEventListener == 'function') {
            node.removeEventListener(event, fn, opt_useCapture || false);
        }
        else if (typeof node.detatchEvent == 'function') {
            node.detatchEvent('on' + event, fn);
        }
    }


    /**
     * Returns the intersection between two rect objects.
     * @param {Object} rect1 The first rect.
     * @param {Object} rect2 The second rect.
     * @return {?Object|?ClientRect} The intersection rect or undefined if no
     *     intersection is found.
     */
    function computeRectIntersection(rect1, rect2) {
        var top = Math.max(rect1.top, rect2.top);
        var bottom = Math.min(rect1.bottom, rect2.bottom);
        var left = Math.max(rect1.left, rect2.left);
        var right = Math.min(rect1.right, rect2.right);
        var width = right - left;
        var height = bottom - top;

        return (width >= 0 && height >= 0) && {
            top: top,
            bottom: bottom,
            left: left,
            right: right,
            width: width,
            height: height
        } || null;
    }


    /**
     * Shims the native getBoundingClientRect for compatibility with older IE.
     * @param {Element} el The element whose bounding rect to get.
     * @return {DOMRect|ClientRect} The (possibly shimmed) rect of the element.
     */
    function getBoundingClientRect(el) {
        var rect;

        try {
            rect = el.getBoundingClientRect();
        } catch (err) {
            // Ignore Windows 7 IE11 "Unspecified error"
            // https://github.com/w3c/IntersectionObserver/pull/205
        }

        if (!rect) return getEmptyRect();

        // Older IE
        if (!(rect.width && rect.height)) {
            rect = {
                top: rect.top,
                right: rect.right,
                bottom: rect.bottom,
                left: rect.left,
                width: rect.right - rect.left,
                height: rect.bottom - rect.top
            };
        }
        return rect;
    }


    /**
     * Returns an empty rect object. An empty rect is returned when an element
     * is not in the DOM.
     * @return {ClientRect} The empty rect.
     */
    function getEmptyRect() {
        return {
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            width: 0,
            height: 0
        };
    }


    /**
     * Ensure that the result has all of the necessary fields of the DOMRect.
     * Specifically this ensures that `x` and `y` fields are set.
     *
     * @param {?DOMRect|?ClientRect} rect
     * @return {?DOMRect}
     */
    function ensureDOMRect(rect) {
        // A `DOMRect` object has `x` and `y` fields.
        if (!rect || 'x' in rect) {
            return rect;
        }
        // A IE's `ClientRect` type does not have `x` and `y`. The same is the case
        // for internally calculated Rect objects. For the purposes of
        // `IntersectionObserver`, it's sufficient to simply mirror `left` and `top`
        // for these fields.
        return {
            top: rect.top,
            y: rect.top,
            bottom: rect.bottom,
            left: rect.left,
            x: rect.left,
            right: rect.right,
            width: rect.width,
            height: rect.height
        };
    }


    /**
     * Inverts the intersection and bounding rect from the parent (frame) BCR to
     * the local BCR space.
     * @param {DOMRect|ClientRect} parentBoundingRect The parent's bound client rect.
     * @param {DOMRect|ClientRect} parentIntersectionRect The parent's own intersection rect.
     * @return {ClientRect} The local root bounding rect for the parent's children.
     */
    function convertFromParentRect(parentBoundingRect, parentIntersectionRect) {
        var top = parentIntersectionRect.top - parentBoundingRect.top;
        var left = parentIntersectionRect.left - parentBoundingRect.left;
        return {
            top: top,
            left: left,
            height: parentIntersectionRect.height,
            width: parentIntersectionRect.width,
            bottom: top + parentIntersectionRect.height,
            right: left + parentIntersectionRect.width
        };
    }


    /**
     * Checks to see if a parent element contains a child element (including inside
     * shadow DOM).
     * @param {Node} parent The parent element.
     * @param {Node} child The child element.
     * @return {boolean} True if the parent node contains the child node.
     */
    function containsDeep(parent, child) {
        var node = child;
        while (node) {
            if (node == parent) return true;

            node = getParentNode(node);
        }
        return false;
    }


    /**
     * Gets the parent node of an element or its host element if the parent node
     * is a shadow root.
     * @param {Node} node The node whose parent to get.
     * @return {Node|null} The parent node or null if no parent exists.
     */
    function getParentNode(node) {
        var parent = node.parentNode;

        if (node.nodeType == /* DOCUMENT */ 9 && node != document) {
            // If this node is a document node, look for the embedding frame.
            return getFrameElement(node);
        }

        // If the parent has element that is assigned through shadow root slot
        if (parent && parent.assignedSlot) {
            parent = parent.assignedSlot.parentNode
        }

        if (parent && parent.nodeType == 11 && parent.host) {
            // If the parent is a shadow root, return the host element.
            return parent.host;
        }

        return parent;
    }

    /**
     * Returns true if `node` is a Document.
     * @param {!Node} node
     * @returns {boolean}
     */
    function isDoc(node) {
        return node && node.nodeType === 9;
    }


// Exposes the constructors globally.
    window.IntersectionObserver = IntersectionObserver;
    window.IntersectionObserverEntry = IntersectionObserverEntry;

}());

/**/

//renewCommon
//오픈되어 있는 o-lightbox 내에 html 가져오기
function makeHtml(){
    let tempHtml = document.querySelector('.o-lightbox.is-open').innerHTML
    const obj = {html : ''};
    let html = '<div class="o-lightbox is-open">';
    html += tempHtml;
    html += '</div>';
    obj.html = html;
    return obj;
}

//프린트를 위한 임시 window
function openTempPrintWin(param){
    const setting = "width=auto, height=auto";
    const objWin = window.open('', 'print', setting);
    objWin.document.open();
    objWin.document.write('<html><head><title>Print</title>');
    objWin.document.write('<link rel="stylesheet" type="text/css" href="../css/frontend.renew.css"/>');
    objWin.document.write('</head><body class="temp-win-for-print">');
    objWin.document.write(param.html);
    objWin.document.write('</body></html>');
    objWin.focus();
    objWin.document.close();

    setTimeout(function(){
        objWin.print();
        objWin.close();
    }, 1000);
}

//lightbox popup print call
function lpPrint() {
    // let printHtml = makeHtml();
    // openTempPrintWin(printHtml);
    window.print()
}

function formatDate(a) {
    if (a < 9) {
        return "0" + a
    }
    return a
}

//IE browser Check
function isBrowserIE(){
    var agent = navigator.userAgent.toLowerCase();
    if ( (navigator.appName == 'Netscape' && agent.indexOf('trident') != -1) || (agent.indexOf("msie") != -1)) {
        // ie일 경우
        return true;
    }else{
        // ie일 아닐 경우
        return false;
    }
}

//샵인샵 PC 띠배너 체크 후 header position 재정의
function setSisHeaderPosition(ntfbnnrVarlue){
    //css 가상프로퍼티 생성
    document.documentElement.style.setProperty('--ntfbnnrh', ntfbnnrVarlue + 'px');

    //IE 브라우저 체크
    if(isBrowserIE()){
        let hasSisHeader = $('header.o-header.has-sis-header'),
        hasSisHeaderWithNotification = $('header.o-header.has-sis-header.has-sis-notification'),
        navigationCurtain = hasSisHeaderWithNotification.find('.o-navigation .navigation-curtain');

        // header.o-header.has-sis-header.has-sis-notification .o-navigation .navigation-curtain { top: calc(56px + 37px + var(--ntfbnnrh, 1ntfbnnrh)); }
        let tempCssVal3 = 56 + 37 + ntfbnnrVarlue;
        navigationCurtain.css('top',tempCssVal3+'px');
    }
}

//띠배너 카운터
function displaySiteBannerCountDown() {
    var e, g = null;
    var t = new Date();
    if (t) {
        var m = t.getFullYear() + "/" + formatDate(parseInt(t.getMonth() + 1)) + "/" + formatDate(t.getDate()) + " " + formatDate(t.getHours()) + ":" + formatDate(t.getMinutes()) + ":00";
        var q = new Date(m);
        var d = document.getElementById("sitebannercountsd");
        var n = document.getElementById("sitebannercounted");
        var f = false;
        var u = false;
        var k = false;
        var c = false;
        var a = false;
        if (d && n) {
            e = new Date(document.getElementById("sitebannercountsd").value);
            if (e && e > q) {
                f = true
            }
        }
        if (n) {
            g = new Date(document.getElementById("sitebannercounted").value);
            if (g) {
                c = true;
                if (g <= q) {
                    k = true
                }
            } else {
                u = true
            }
        } else {
            u = true
        }
        var i = document.getElementById("desktoptimer");
        var j = document.getElementById("mobiletimer");
        var h = document.getElementById("desktopMessageAfterDueDateid");
        var r = document.getElementById("mobileMessageAfterDueDateid");
        var s = document.getElementById("site-banner-id");
        var b = document.getElementById("site-banner-desktop-timer");
        if (f) {
            s.parentNode.removeChild(s)
        } else {
            if (i) {
                if (k) {
                    if (h) {
                        b.innerHTML = h.value
                    } else {
                        if (s) {
                            // b.parentNode.removeChild(b);
                            i.parentNode.removeChild(i);
                            a = true
                        }
                    }
                } else {
                    if (c && !u) {
                        i.classList.remove("is-hidden");
                        var p = new Date(g).getTime();
                        var o = setInterval(function () {
                            var x = new Date().getTime();

                            var w = p - x;
                            if (w > 0) {
                                var E = document.getElementById("desktopdaysid");
                                var y = document.getElementById("desktophoursid");
                                var A = document.getElementById("desktopminutesid");
                                var v = document.getElementById("desktopsecondsid");
                                if (E) {
                                    var D = Math.floor(w / (1000 * 60 * 60 * 24));
                                    if (D == 0) {
                                        E.className = "is-hidden"
                                        document.getElementById("desktopdayspan").className = "is-hidden"
                                    } else {
                                        if (D < 10) {
                                            D = ("0" + D).slice(-2)
                                        }
                                        document.getElementById("desktopdaysid").value = D
                                    }
                                    var B = Math.floor((w % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                    var z = Math.floor((w % (1000 * 60 * 60)) / (1000 * 60));
                                    if (z < 10) {
                                        z = ("0" + z).slice(-2)
                                    }
                                    var C = Math.floor((w % (1000 * 60)) / 1000);
                                    if (C < 10) {
                                        C = ("0" + C).slice(-2)
                                    }
                                } else {
                                    var B = Math.floor(w / (1000 * 60 * 60));
                                    if (B > 99) {
                                        var B = 99
                                    } else {
                                        if (B < 10) {
                                            B = ("0" + B).slice(-2)
                                        }
                                    }
                                    var z = Math.floor((w % (1000 * 60 * 60)) / (1000 * 60));
                                    if (z < 10) {
                                        z = ("0" + z).slice(-2)
                                    }
                                    var C = Math.floor((w % (1000 * 60)) / 1000);
                                    if (C < 10) {
                                        C = ("0" + C).slice(-2)
                                    }
                                }
                                if (y) {
                                    document.getElementById("desktophoursid").value = B
                                }
                                if (A) {
                                    document.getElementById("desktopminutesid").value = z
                                }
                                if (v) {
                                    document.getElementById("desktopsecondsid").value = C
                                }
                            } else {
                                clearInterval(o);
                                if (h) {
                                    document.getElementById("site-banner-desktop-timer").innerHTML = h.value
                                } else {
                                    if (s) {
                                        s.parentNode.removeChild(s)
                                    }
                                }
                            }
                        }, 1000)
                    }
                }
            }
            if (j) {
                if (k) {
                    if (r) {
                        document.getElementById("site-banner-mobile-timer").innerHTML = r.value
                    } else {
                        if (a) {
                            s.parentNode.removeChild(s)
                        } else {
                            if (s && s.parentNode) {
                                document.getElementById("site-banner-mobile-timer").parentNode.removeChild(document.getElementById("site-banner-mobile-timer"))
                            }
                        }
                    }
                } else {
                    if (c && !u) {
                        j.classList.remove("is-hidden");
                        var p = new Date(g).getTime();
                        var l = setInterval(function () {
                            var w = new Date().getTime();
                            var v = p - w;
                            if (v > 0) {
                                var y = document.getElementById("mobiledaysid");
                                var E = document.getElementById("mobilehoursid");
                                var C = document.getElementById("mobileminutesid");
                                var z = document.getElementById("mobilesecondsid");
                                if (y) {
                                    var D = Math.floor(v / (1000 * 60 * 60 * 24));
                                    if (D == 0) {
                                        // [ARKET] DAY input 숨김 - 시작
                                        y.className = "is-hidden"
                                        // [ARKET] DAY input 숨김 - 끝
                                        document.getElementById("mobiledayspan").className = "is-hidden"
                                    } else {
                                        if (D < 10) {
                                            D = ("0" + D).slice(-2)
                                        }
                                        document.getElementById("mobiledaysid").value = D
                                    }
                                    var A = Math.floor((v % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                                    if (A < 10) {
                                        A = ("0" + A).slice(-2)
                                    }
                                    var x = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                    if (x < 10) {
                                        x = ("0" + x).slice(-2)
                                    }
                                    var B = Math.floor((v % (1000 * 60)) / 1000);
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                } else {
                                    var A = Math.floor(v / (1000 * 60 * 60));
                                    if (A > 99) {
                                        var A = 99
                                    } else {
                                        if (A < 10) {
                                            A = ("0" + A).slice(-2)
                                        }
                                    }
                                    var x = Math.floor((v % (1000 * 60 * 60)) / (1000 * 60));
                                    if (x < 10) {
                                        x = ("0" + x).slice(-2)
                                    }
                                    var B = Math.floor((v % (1000 * 60)) / 1000);
                                    if (B < 10) {
                                        B = ("0" + B).slice(-2)
                                    }
                                }
                                if (E) {
                                    document.getElementById("mobilehoursid").value = A
                                }
                                if (C) {
                                    document.getElementById("mobileminutesid").value = x
                                }
                                if (z) {
                                    document.getElementById("mobilesecondsid").value = B
                                }
                            } else {
                                clearInterval(l);
                                if (r) {
                                    document.getElementById("site-banner-mobile-timer").innerHTML = r.value
                                } else {
                                    if (s && s.parentNode) {
                                        s.parentNode.removeChild(s)
                                    }
                                }
                            }
                        }, 1000)
                    }
                }
            }
        }
    }
}

var renewCommon = renewCommon || function(){};
renewCommon = (function(doc, win){
    var obj = {};

    obj.initialize = function(){
        renewCommon.accordion.init();
        renewCommon.aTab.init();
        renewCommon.rdToggle.init();
        renewCommon.chckToggle.init();
        renewCommon.infoLineToggle.init();
        renewCommon.aTooltip.init();
        renewCommon.toggleBx.init();
        renewCommon.dialogBtn.init();
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
                        let _targetCon = doc.querySelectorAll('.' + _targetClass);

                        renewCommon.rdToggle.resetActive(_targetName);

                        if(_targetCon){
                            Array.prototype.slice.call(_targetCon).forEach( function (_obj) {
                                let _targetConName = _obj.getAttribute('data-name');
                                if(_this.checked  && _targetName == _targetConName){
                                    _obj.classList.remove('is-hidden-strong');
                                }else{
                                    _obj.classList.add('is-hidden-strong');
                                }
                            })
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

    //info-line-toggle
    obj.infoLineToggle = {
        changeBtnMode: function(_obj){
            // let tempLi = _obj.closest('li');
            // if(tempLi.classList.contains('mode-edit')){
            //     tempLi.classList.remove('mode-edit');
            // }else{
            //     tempLi.classList.add('mode-edit');
            // }
            let tempLi = _obj.parents('li');
            if(tempLi.hasClass('mode-edit')){
                tempLi.removeClass('mode-edit');
            }else{
                tempLi.addClass('mode-edit');
            }
        },
        init: function(){
            let toggleTrigger= doc.querySelectorAll('.toggle-info-line-li-btn');
            if(toggleTrigger) {
                Array.prototype.slice.call(toggleTrigger).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // renewCommon.infoLineToggle.changeBtnMode(this);
                        // let tempUl = this.closest('ul');
                        // let tempLi = tempUl.querySelectorAll('.info-line-toggle-li');
                        // if(tempLi){
                        //     Array.prototype.slice.call(tempLi).forEach( function (_obj) {
                        //         if(_obj.classList.contains('mode-edit')){
                        //             _obj.classList.remove('mode-edit')
                        //         }else {
                        //             _obj.classList.add('mode-edit')
                        //         }
                        //     })
                        // }
                        renewCommon.infoLineToggle.changeBtnMode($(this))
                        let tempUl = $(this).parents('ul');
                        let tempLi = tempUl.find('.info-line-toggle-li');
                        if(tempLi){
                            Array.prototype.slice.call(tempLi).forEach( function (_obj) {
                                if($(_obj).hasClass('mode-edit')){
                                    $(_obj).removeClass('mode-edit')
                                }else {
                                    $(_obj).addClass('mode-edit')
                                }
                            })
                        }
                    });
                });
            }
        }
    }

    //aTab
    obj.aTooltip = {
        init: function(){
            let openTooltipBtns = doc.querySelectorAll('.open-tooltip-btn');
            if(openTooltipBtns) {
                Array.prototype.slice.call(openTooltipBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        if (this.parentNode.classList.contains("is-open")) {
                            this.parentNode.classList.remove("is-open");
                        }else{
                            this.parentNode.classList.add("is-open");
                        }
                    });
                });
            }
        }
    }

    //배송지 수정, 삭제 버튼 클릭이벤트
    obj.deliverListEdit = {
        init: function(){
            let btnDlvrEdit = document.querySelectorAll('.delivery-item-edit');
            let btnDlvrDel = document.querySelectorAll('.delivery-item-del');
            if(btnDlvrEdit) {
                Array.prototype.slice.call(btnDlvrEdit).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempLi = this.closest('li');
                        // if(tempLi && !tempLi.classList.contains('mode-edit')){
                        //     tempLi.classList.add('mode-edit')
                        // }
                        let tempLi = $(this).parents('li');
                        if(tempLi && !tempLi.hasClass('mode-edit')){
                            tempLi.addClass('mode-edit')
                        }
                    });
                });
            }
            let btnDlvrEditCancle = document.querySelectorAll('.btn-my-dlvr-cancle');
            if(btnDlvrEditCancle){
                Array.prototype.slice.call(btnDlvrEditCancle).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempLi = this.closest('li');
                        // if(tempLi && tempLi.classList.contains('mode-edit')){
                        //     tempLi.classList.remove('mode-edit')
                        // }
                        let tempLi = $(this).parents('li');
                        if(tempLi && tempLi.hasClass('mode-edit')){
                            tempLi.removeClass('mode-edit')
                        }
                    });
                });
            }
        }
    }

    //mode-wrap 수정, 취소버튼 클릭이벤트
    obj.modeEditView = {
        init: function(){
            let editBtn = document.querySelectorAll('.mode-edit-btn');
            if(editBtn) {
                Array.prototype.slice.call(editBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempModeWrap = this.closest('.mode-wrap');
                        // if(tempModeWrap){
                        //     tempModeWrap.classList.remove('mode-view')
                        //     tempModeWrap.classList.add('mode-edit')
                        // }
                        let tempModeWrap = $(this).parents('.mode-wrap');
                        if(tempModeWrap){
                            tempModeWrap.removeClass('mode-view')
                            tempModeWrap.addClass('mode-edit')
                        }
                    });
                });
            }
            let viewBtn = document.querySelectorAll('.mode-view-btn');
            if(viewBtn){
                Array.prototype.slice.call(viewBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        _evt.preventDefault();
                        _evt.stopPropagation();
                        // let tempModeWrap = this.closest('.mode-wrap');
                        // if(tempModeWrap){
                        //     tempModeWrap.classList.add('mode-view')
                        //     tempModeWrap.classList.remove('mode-edit')
                        // }
                        let tempModeWrap = $(this).parents('.mode-wrap');
                        if(tempModeWrap){
                            tempModeWrap.addClass('mode-view')
                            tempModeWrap.removeClass('mode-edit')
                        }
                    });
                });
            }
        }
    }

    //toggle-bx
    obj.toggleBx = {
        resetBtn: function(_this){
            let toggleBxBtn = doc.querySelectorAll('.toggle-bx-btn');
            Array.prototype.slice.call(toggleBxBtn).forEach( function (_obj) {
                if(_obj != _this){
                    _obj.classList.remove("active")
                }
            });
        },
        init: function(){
            let toggleBxBtn = doc.querySelectorAll('.toggle-bx-btn'),
                toggleBxCon = doc.querySelectorAll('.toggle-bx-con');
            if(toggleBxBtn) {
                Array.prototype.slice.call(toggleBxBtn).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        let _this = this;
                        let _targetClass = this.getAttribute('data-target');
                        let _target = doc.querySelector('.toggle-bx-con.' + _targetClass);
                        if(_target){
                            if(toggleBxCon) {
                                renewCommon.toggleBx.resetBtn(_this);
                                Array.prototype.slice.call(toggleBxCon).forEach(function (_con) {
                                    _con.classList.remove("active")
                                });
                            }
                            if (this.classList.contains("active")) {
                                this.classList.remove("active");
                                _target.classList.remove("active");
                            } else {
                                this.classList.add("active");
                                _target.classList.add("active");
                            }
                        }
                    });
                });
            }
        }
    }

    //dialogBtn
    obj.dialogBtn = {
        bodyHold: function(flag){
            let body = doc.querySelector('body');
            if(flag){
                body.classList.add('u-overflow-hidden');
            }else{
                body.classList.remove('u-overflow-hidden');
            }
        },
        init: function(){
            let dialogBxs = doc.querySelectorAll('.dialog-bx');
            if(dialogBxs){
                Array.prototype.slice.call(dialogBxs).forEach( function (_obj) {
                    let _tempId = _obj.getAttribute('id');
                    if(_obj.classList.contains('basic')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-basic",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                    if(_obj.classList.contains('alert')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-alert",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                    if(_obj.classList.contains('confirm')){
                        $('#'+_tempId).dialog({
                            dialogClass: "dialog-confirm",
                            title: "",
                            autoOpen: false,
                            width: '90%',
                            height: 'auto',
                            modal: true,
                            resizable: false,
                        });
                    }
                });
            }
            let dialogBtns = doc.querySelectorAll('.open-dialog-btn');
            if(dialogBtns) {
                Array.prototype.slice.call(dialogBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        let _targetDialogId = this.getAttribute('data-target');
                        $('#'+_targetDialogId).dialog('open');
                        renewCommon.dialogBtn.bodyHold(true);
                    });
                });
            }
            let dialogCloseBtns = doc.querySelectorAll('.dialog-close-btn');
            if(dialogCloseBtns) {
                Array.prototype.slice.call(dialogCloseBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        // let _targetDialogId = this.closest('.dialog-bx').getAttribute('id');
                        let _targetDialogId = $(this).parents('.dialog-bx').attr('id');
                        $('#'+_targetDialogId).dialog('close');
                        renewCommon.dialogBtn.bodyHold(false);
                    });
                });
            }
            let uiDialogCloseBtns = doc.querySelectorAll('.ui-dialog-titlebar-close');
            if(uiDialogCloseBtns) {
                Array.prototype.slice.call(uiDialogCloseBtns).forEach( function (_obj) {
                    _obj.addEventListener('click', function (_evt) {
                        renewCommon.dialogBtn.bodyHold(false);
                    });
                });
            }

        }
    }

    //loading
    obj.loadingDisplay = {
        page: function (flag) {
            let body = doc.querySelector('body');
            if(flag){
                body.classList.add('is-page-loading');
            }else{
                body.classList.remove('is-page-loading');
            }
        }
    }

    return obj;
})(document, window);


(function() {
    'use strict';
    // console.log('frontend.renew.js start!');
    renewCommon.initialize();


    var videoIO = new IntersectionObserver(function(entries, observer){
        entries.forEach((function(entry){
            if (entry.intersectionRatio > 0) { // 뷰포트에 들어오면
                entry.target.play();
            }
            // 그 외의 경우 'tada' 클래스 제거
            else { // 뷰포트에서 빠지면
                entry.target.pause();
            }
        }).bind(this))
    }.bind(this))

    document.querySelectorAll("video").forEach(function(video){
        videoIO.observe(video);
    }.bind(this))


})();