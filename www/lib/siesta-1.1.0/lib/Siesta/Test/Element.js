/*

Siesta 1.1.0-beta-1
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Test.Element

This is a mixin, with helper methods for testing functionality relating to DOM elements. This mixin is consumed by {@link Siesta.Test}

*/
Role('Siesta.Test.Element', {
    
    requires    : [
        'chain',
        'normalizeElement'
    ],
    
    methods : {
        
        /**
         * Utility method which returns the center if a passed element.
         * @param {HTMLElement} el The element to find the center of.
         * @return {Object} The object with `x` and `y` properties
         */
        findCenter: function (target) {
            var el          = this.$( this.normalizeElement(target) ),
                offset      = el.offset(),
                doc         = this.$( this.global.document );
            return [
                offset.left + el.outerWidth()  / 2 - doc.scrollLeft(),
                offset.top  + el.outerHeight() / 2 - doc.scrollTop()
            ]
        },


        /**
         * Returns true if the element is visible.
         * @param {HTMLElement} el The element 
         * @return {Boolean}
         */
        isElementVisible : function(el) {
            el = this.normalizeElement(el);
            return this.$(el).is(':visible');
        },

        /**
         * Passes if the innerHTML of the passed element contains the text passed
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} text The text to match 
         * @param {Description} description The description for the assertion
         */
        contentLike : function(el, text, description) {
            el = this.normalizeElement(el);

            this.like(el.innerHTML, text, description);
        },

        /**
         * Passes if the innerHTML of the passed element does not contain the text passed
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} text The text to match 
         * @param {Description} description The description for the assertion
         */
        contentNotLike : function(el, text, description) {
            el = this.normalizeElement(el);

            this.unlike(el.innerHTML, text, description);
        },

        /**
         * Waits until the innerHTML of the passed element contains the text passed
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} text The text to match 
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForContentLike : function(el, text, callback, scope, timeout) {
            el = this.normalizeElement(el);

            this.waitFor({
                method      : function() { return el.innerHTML.match(text); }, 
                callback    : callback,
                scope       : scope, 
                timeout     : timeout,
                name        : 'waitForContentLike',
                description : ' element content "' + text + '" to appear'
            });
        },

        /**
         * Waits until the innerHTML of the passed element does not contain the text passed
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} text The text to match 
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForContentNotLike : function(el, text, callback, scope, timeout) {
            el = this.normalizeElement(el);

            this.waitFor({
                method          : function() { return !el.innerHTML.match(text); }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForContentNotLike',
                description     : ' element content "' + text + '" to disappear'
            });
        },

        /**
         * Performs clicks, double clicks, right clicks and drags at random coordinates within the passed element.
         * 
         * @param {HTMLElement} el The element to upon which to unleash the "monkey".
         * @param {Int} nbrInteractions The number of random interactions to perform. 
         * @param {Description} description The description for the assertion
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         */
        monkeyTest : function(el, nbrInteractions, description, callback, scope) {
            el = this.normalizeElement(el) || this.global.document.body;
            nbrInteractions = nbrInteractions || 30;

            var me          = this,
                offset      = me.$(el).offset(),
                right       = offset.left + me.$(el).width(),
                bottom      = offset.top + me.$(el).height();

            var queue       = new Siesta.Util.Queue({
                deferer         : me.originalSetTimeout,
                deferClearer    : me.originalClearTimeout,
                
                interval        : 50,
                
                observeTest     : this,
                
                processor   : function (data) {
                    if (me.nbrExceptions || me.failed)
                        // do not continue if the test has detected an exception thrown
                        queue.abort()
                    else
                        data.action(data)
                }
            });
            
            for (var i = 0; i < nbrInteractions; i++) {
                var xy = [me.randomBetween(offset.left, right), me.randomBetween(offset.top, bottom)];

                switch (i % 4) {
                    case 0:
                        queue.addAsyncStep({
                            action          : function (data) {
                                me.click(data.xy, data.next)
                            },
                            xy              : xy
                        });
                    break;

                    case 1:
                        queue.addAsyncStep({
                            action          : function (data) {
                                me.doubleClick(data.xy, data.next)
                            },
                            xy              : xy
                        });
                    break;

                    case 2:
                        queue.addAsyncStep({
                            action          : function (data) {
                                me.rightClick(data.xy, data.next)
                            },
                            xy              : xy
                        });
                    break;

                    default:
                        queue.addAsyncStep({
                            action          : function (data) {
                                me.drag(
                                    data.xy, 
                                    [ me.randomBetween(offset.left, right), me.randomBetween(offset.top, bottom) ],
                                    null,
                                    data.next
                                )
                            },
                            xy              : xy
                        });
                    break;
                }
            }
            
            var checkerActivated    = false
            
            var assertionChecker    = function () {
                checkerActivated    = true
                
                me.is(me.nbrExceptions, 0, description || '0 exceptions thrown during monkey test');
            }
            
            this.on('beforetestfinalizeearly', assertionChecker) 

            var async       = me.beginAsync();
            
            queue.run(function () {
                me.endAsync(async);
                
                if (!checkerActivated) {
                    me.un('beforetestfinalizeearly', assertionChecker)
                    
                    assertionChecker()
                }
                
                callback && callback.call(scope || me);
            });
        },

        /**
         * Passes if the element has the supplied CSS classname 
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} cls The class name to check for
         * @param {Description} description The description for the assertion
         */
        hasCls : function (el, cls, description) {
            el = this.normalizeElement(el);
            
            if (this.$(el).hasClass(cls)) {
                this.pass(description);
            } else {
                this.fail(description, {
                    assertionName   : 'hasCls',
                    
                    got         : el.className,
                    gotDesc     : 'Classes of element',
                    need        : cls,
                    needDesc    : 'Need CSS class'
                })
            }
        },
        
        
        /**
         * Passes if the element does not have the supplied CSS classname 
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} cls The class name to check for
         * @param {Description} description The description for the assertion
         */
        hasNotCls : function (el, cls, description) {
            el = this.normalizeElement(el);
            
            if (!this.$(el).hasClass(cls)) {
                this.pass(description);
            } else {
                this.fail(description, {
                    assertionName   : 'hasNotCls',
                    got         : el.className,
                    gotDesc     : 'Classes of element',
                    annotation  : 'Element has the class [' + cls + ']'
                })
            }
        },

        /**
         * Passes if the element does not have the supplied style value
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} property The style property to check for
         * @param {String} value The style value to check for
         * @param {Description} description The description for the assertion
         */
        hasStyle : function (el, property, value, description) {
            el = this.normalizeElement(el);
            
            if (this.$(el).css(property) === value) {
                this.pass(description);
            } else {
                this.fail(description, {
                    assertionName   : 'hasStyle',
                    got         : this.$(el).css(property),
                    gotDesc     : 'Styles of element',
                    need        : value,
                    needDesc    : 'Need style'
                });
            }
        },
        
        
        /**
         * Passes if the element does not have the supplied style value
         * 
         * @param {HTMLElement} el The element to query
         * @param {String} property The style property to check for
         * @param {String} value The style value to check for
         * @param {Description} description The description for the assertion
         */
        hasNotStyle : function (el, property, value, description) {
            el = this.normalizeElement(el);
            
            if (this.$(el).css(property) !== value) {
                this.pass(description);
            } else {
                this.fail(description, {
                    assertionName   : 'hasNotStyle',
                    got         : el.style.toString(),
                    gotDesc     : 'Style of element',
                    annotation  : 'Element has the style [' + property + ']'
                });
            }
        },
        
        /**
         * Waits for a certain CSS selector to be found at the passed XY coordinate, and calls the callback when found. 
         * The callback will receive the element from the passed XY coordinates.
         * 
         * @param {Array} xy The x and y coordinates to query
         * @param {String} selector The CSS selector to check for
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test#waitForTimeout} value. 
         */
        waitForSelectorAt : function(xy, selector, callback, scope, timeout) {
            if (!selector) throw 'A CSS selector must be supplied';
            
            var doc = this.global.document;
            
            this.waitFor({
                method          : function() { 
                    var el = doc.elementFromPoint(xy[0], xy[1]); 
                    if (el && this.$(el).is(selector)) return el; 
                }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForSelectorAt',
                description     : ' selector "' + selector + '" to appear at: [' + xy.toString() + ']'
            });
        },

        /**
         * Waits for a certain CSS selector to be found at current cursor position, and calls the callback when found. 
         * The callback will receive the element found.
         * 
         * @param {Array} xy The x and y coordinates to query
         * @param {String} selector The CSS selector to check for
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test#waitForTimeout} value. 
         */
        waitForSelectorAtCursor : function(selector, callback, scope, timeout) {
            this.waitForSelectorAt(this.currentPosition, selector, callback, scope, timeout);
        },

        /**
         * Waits for a certain CSS selector to be found in the DOM, and then calls the callback supplied.
         * The callback will receive the results of jQuery selector.
         * 
         * @param {String} selector The CSS selector to check for
         * @param {HTMLElement} root (optional) The root element in which to detect the selector.
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test#waitForTimeout} value. 
         */
        waitForSelector : function(selector, root, callback, scope, timeout) {
            
            if (!selector) throw 'A CSS selector must be supplied';

            if (jQuery.isFunction(root)) {
                timeout     = scope;
                scope       = callback;
                callback    = root;
                root        = null;
            } 

            if (root) root  = this.normalizeElement(root);

            this.waitFor({
                method : function() { 
                    var result = this.$(selector, root); 
                    if (result.length > 0) return result;
                }, 
                callback : callback,
                scope : scope, 
                timeout : timeout,
                name : 'waitForSelector',
                description : ' selector "' + selector + '" to appear'
            });
        },
        
        
        /**
         * Waits till all the CSS selectors from the provided array to be found in the DOM, and then calls the callback supplied.
         * 
         * @param {String[]} selectors The array of CSS selectors to check for
         * @param {HTMLElement} root (optional) The root element in which to detect the selector.
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test#waitForTimeout} value. 
         */
        waitForSelectors : function(selectors, root, callback, scope, timeout) {
            if (selectors.length < 1) throw 'An array of CSS selectors must be supplied';

            if (jQuery.isFunction(root)) {
                timeout     = scope;
                scope       = callback;
                callback    = root;
                root        = null;
            } 

            if (root) root  = this.normalizeElement(root);
            
            var me          = this

            this.waitFor({
                method      :  function () {
                    var allPresent  = true
                    
                    Joose.A.each(selectors, function (selector) {
                        if (me.$(selector, root).length == 0) {
                            allPresent = false
                            // stop iteration
                            return false
                        }
                    })
                    
                    return allPresent
                }, 
                callback    : callback,
                scope       : scope, 
                timeout     : timeout,
                name        : 'waitForSelectors',
                description : ' selectors "' + selectors + '" to appear'
            });
        },
        
        

        /**
         * Waits for a certain CSS selector to not be found in the DOM, and then calls the callback supplied.
         * 
         * @param {String} selector The CSS selector to check for
         * @param {HTMLElement} root (optional) The root element in which to detect the selector.
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test#waitForTimeout} value. 
         */
        waitForSelectorNotFound : function(selector, root, callback, scope, timeout) {
            if (!selector) throw 'A CSS selector must be supplied';

            if (jQuery.isFunction(root)) {
                timeout     = scope;
                scope       = callback;
                callback    = root;
                root        = null;
            } 

            if (root) root  = this.normalizeElement(root);

            this.waitFor({
                method          : function() { return this.$(selector, root).length === 0; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForSelectorNotFound',
                description     : ' selector "' + selector + '" to disappear'
            });
        },
        
        
        /**
         * Waits until the passed element becomes "visible" in the DOM and calls the provided callback.
         * Please note, that "visible" means element will just have a DOM node, and still may be hidden by another visible element.
         * 
         * The callback will receive the passed element as the 1st argument.
         * 
         * See also {@link #waitForElementTop} method.
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForElementVisible : function(el, callback, scope, timeout) {
            var me = this;

            this.waitFor({
                method          : function() { return me.isElementVisible(el) && el; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForElementVisible',
                description     : ' element "' + el.toString() + '" to appear'
            });
        },

        /**
         * Waits until the passed element is becomes not "visible" in the DOM and call the provided callback.
         * Please note, that "visible" means element will just have a DOM node, and still may be hidden by another visible element.
         * 
         * The callback will receive the passed element as the 1st argument.
         * 
         * See also {@link #waitForElementNotTop} method.
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Function} callback The callback to call after the CSS selector has been found
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForElementNotVisible : function(el, callback, scope, timeout) {
            var me = this;

            this.waitFor({
                method          : function() { return !me.isElementVisible(el) && el; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForElementNotVisible',
                description     : ' element "' + el.toString() + '" to disappear'
            });
        },
        
        
        /**
         * Waits until the passed element is the 'top' element in the DOM and call the provided callback.
         * 
         * The callback will receive the passed element as the 1st argument.
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Function} callback The callback to call 
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForElementTop : function(el, callback, scope, timeout) {
            var me = this;

            this.waitFor({
                method          : function() { return me.elementIsTop(el, true) && el; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForElementTop',
                description     : ' element "' + el.toString() + '" to be the top element at its position'
            });
        },

        /**
         * Waits until the passed element is not the 'top' element in the DOM and calls the provided callback with the element found.
         * 
         * The callback will receive the actual top element.
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForElementNotTop : function(el, callback, scope, timeout) {
            el = this.normalizeElement(el);
            
            var me = this,
                doc = me.global.document;

            this.waitFor({
                method          : function() {    
                    if (!me.elementIsTop(el, true)) {
                        var center = me.findCenter(el);
                        return doc.elementFromPoint(center[0], center[1]);
                    }        
                }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForElementNotTop',
                description     : ' element "' + el.toString() + '" to not be the top element at its position'
            });
        },

        /**
         * Passes if the element is visible.
         * @param {HTMLElement} el The element 
         * @param {Description} description The description for the assertion
         */
        elementIsVisible : function(el, description) {
            el = this.normalizeElement(el);
            this.ok(this.isElementVisible(el), description);
        },

        /**
         * Passes if the element is not visible.
         * @param {HTMLElement} el The element 
         * @param {Description} description The description for the assertion
         */
        elementIsNotVisible : function(el, description) {
            el = this.normalizeElement(el);
            this.notOk(this.isElementVisible(el), description);
        },

        /**
         * Utility method which checks if the passed method is the 'top' element at its position.
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Boolean} allowChildren true to also include child nodes. False to strictly check for the passed element.
         * @return {Boolean} true if the element is the top element.
         */
        elementIsTop : function(el, allowChildren, strict) {
            el = this.normalizeElement(el);
            
            var center  = this.findCenter(el),
                foundEl = this.global.document.elementFromPoint(center[0], center[1]);
            
            return foundEl && (foundEl === el || (allowChildren && this.$(foundEl).closest(el).length > 0));
        },
        
        /**
         * Passes if the element is found at the supplied xy coordinates.
         * 
         * @param {HTMLElement} el The element to query
         * @param {Array} xy The xy coordinate to query.
         * @param {Boolean} allowChildren true to also include child nodes. False to strictly check for the passed element.
         * @param {Description} description The description for the assertion
         */
        elementIsAt : function(el, xy, allowChildren, description) {
            el = this.normalizeElement(el);
            
            var foundEl = this.global.document.elementFromPoint(xy[0], xy[1]);
            
            if (!foundEl) {
                this.fail(description, {
                    assertionName       : 'elementIsAt',
                    got                 : { x: xy[0], y : xy[1] },
                    gotDesc             : 'Postion',
                    annotation          : 'No element found at the specified position'
                });
            } else if (allowChildren) {
                if (foundEl === el || $(foundEl).closest(el)) {
                    this.pass(description);
                } else {
                    this.fail(description, {
                        assertionName   : 'elementIsAt',
                        got             : foundEl,
                        gotDesc         : 'Top element',
                        need            : el,
                        needDesc        : 'Need exactly this or its child',
                        annotation      : 'Passed element is not the top-most one and not the child of one'
                    });
                }
            } else {
                if (foundEl.dom === el.dom) {
                    this.pass(description);
                } else {
                    this.fail(description, {
                        assertionName   : 'elementIsAt',
                        got             : foundEl,
                        gotDesc         : 'Top element',
                        need            : el,
                        needDesc        : 'Should be',
                        annotation      : 'Passed element is not the top-most one'
                    });
                }
            }
        },

        /**
         * Passes if the element is the top element (using its center xy coordinates).
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Boolean} allowChildren true to also include child nodes. False to strictly check for the passed element.
         * @param {Description} description The description for the assertion
         * @param {Boolean} strict true to check all four corners of the element. False to only check at element center.
         */
        elementIsTopElement : function(el, allowChildren, description, strict) {
            el = this.normalizeElement(el);

            if (strict) {
                var o = this.$(el).offset();
                var region  = { 
                    top : o.top,
                    right : o.left + this.$(el).outerWidth(),
                    bottom : o.top + this.$(el).outerHeight(),
                    left : o.left
                };

                this.elementIsAt(el, [region.left+1, region.top+1], allowChildren, description + ' (t-l)');
                this.elementIsAt(el, [region.left+1, region.bottom-1], allowChildren, description + ' (b-l)');
                this.elementIsAt(el, [region.right-1, region.top+1], allowChildren, description + ' (t-r)');
                this.elementIsAt(el, [region.right-1, region.bottom-1], allowChildren, description + ' (b-r)');
            } else {
                this.elementIsAt(el, this.findCenter(el), allowChildren, description);
            }
        },
        
        /**
         * Passes if the element is not the top element (using its center xy coordinates).
         * 
         * @param {HTMLElement} el The element to look for.
         * @param {Boolean} allowChildren true to also include child nodes. False to strictly check for the passed element.
         * @param {Description} description The description for the assertion
         */
        elementIsNotTopElement : function(el, allowChildren, description) {
            el = this.normalizeElement(el);
            var center = this.findCenter(el);
            
            var foundEl = this.global.document.elementFromPoint(center[0], center[1]);
            
            if (!foundEl) {
                this.pass(description);
                
                return
            }
            
            if (allowChildren) {
                this.ok(foundEl !== el && $(foundEl).closest(el).length === 0, description);
            } else {
                this.isnt(foundEl, el, description);
            }
        },

        /**
         * Passes if the element is found at the supplied xy coordinates.
         * 
         * @param {String} selector The selector to query for
         * @param {Array} xy The xy coordinate to query.
         * @param {Boolean} allowChildren true to also include child nodes. False to strictly check for the passed element.
         * @param {Description} description The description for the assertion
         */
        selectorIsAt : function(selector, xy, description) {
            if (!selector) throw 'A CSS selector must be supplied';

            var doc = this.global.document;

            var foundEl = this.$(doc.elementFromPoint(xy[0], xy[1]) || doc.body);
            
            if (!foundEl) {
                this.fail(description, {
                    assertionName       : 'selectorIsAt',
                    got                 : { x: xy[0], y : xy[1] },
                    gotDesc             : 'Postion',
                    annotation          : 'No element matching the passed selector found at the specified position'
                });
            }

            if (foundEl.has(selector).length > 0 || foundEl.closest(selector).length > 0) {
                this.pass(description);
            } else {
                this.fail(description, {
                    assertionName   : 'selectorIsAt',
                    annotation      : 'Passed selector does not match DOM content at xy position'
                });
            }
        },

        /**
         * Passes if the selector is found in the DOM
         * 
         * @param {String} selector The selector to query for
         * @param {Description} description The description for the assertion
         */
        selectorExists : function(selector, description) {
            if (!selector) throw 'A CSS selector must be supplied';

            if (this.$(selector).length <= 0) {
                this.fail(description, 'No element matching the passed selector found: ' + selector);
            } else {
                this.pass(description);
            } 
        },

        /**
         * Passes if the selector is not found in the DOM
         * 
         * @param {String} selector The selector to query for
         * @param {Description} description The description for the assertion
         */
        selectorNotExists : function(selector, description) {
            if (this.$(selector).length > 0) {
                this.fail(description, 'Elements found matching the passed selector: ' + selector);
            } else {
                this.pass(description);
            } 
        },

        /**
         * Waits until the passed scroll property of the element has changed. 
         * 
         * The callback will receive the new `scroll` value.
         * 
         * @param {HTMLElement} el The element
         * @param {String} side 'left' or 'top'
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForScrollChange : function(el, side, callback, scope, timeout) {
            el = this.normalizeElement(el);
            var scrollProp = 'scroll' + Joose.S.uppercaseFirst(side);
            var original = el[scrollProp];

            this.waitFor({
                method          : function() { if (el[scrollProp] !== original) return el[scrollProp]; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitForScrollChange',
                description     : scrollProp  + ' + to change for element "' + el.toString()
            });
        },

        /**
         * Waits until the `scrollLeft` property of the element has changed. 
         * 
         * The callback will receive the new `scrollLeft` value.
         * 
         * @param {HTMLElement} el The element
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForScrollLeftChange : function(el, callback, scope, timeout) {
            this.waitForScrollChange(el, 'left', callback, scope, timeout);
        },

        /**
         * Waits until the scrollTop property of the element has changed
         * 
         * The callback will receive the new `scrollTop` value.
         * 
         * @param {HTMLElement} el The element
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitForScrollTopChange : function(el, callback, scope, timeout) {
            this.waitForScrollChange(el, 'top', callback, scope, timeout);
        },
        
        
        /**
         * This method accepts an array of the DOM elements and performs a mouse click on them, in order. After that, it calls the provided callback:
         * 
       
       t.chainClick([ el1, el2 ], function () {
            ...
       })
       
         * the elements can be also provided inline, w/o wrapping array:
       
       t.chainClick(el1, el2, function () {
            ...
       })
       
       
         * 
         * @param {Array[HTMLElement]} elements The array of elements to click
         * @param {Function} callback The function to call after clicking all elements
         */
        chainClick : function () {
            var args        = Array.prototype.slice.call(arguments)
            var callback
            
            if (this.typeOf(args[ args.length - 1 ]) == 'Function') callback = args.pop()
            
            // poor-man Array.flatten, with only 1 level of nesting support
            args            = Array.prototype.concat.apply([], args)
            
            var steps       = []
            
            Joose.A.each(args, function (arg) {
                steps.push({
                    action      : 'click',
                    target      : arg
                })
            })
            
            if (callback) steps.push(callback)
            
            this.chain.apply(this, steps)
        },

        /**
         * Passes if the passed element is inside
         * 
         * @param {HTMLElement} el The element
         * @param {Description} description The description for the assertion
         */
        isInView : function (el, description) {
            t.ok(this.isInViewInner(el), description);
        },

        /**
         * Returns true if the passed element is inside
         * 
         * @param {HTMLElement} el The element
         */
        elementIsInView : function(el) {
            el = this.normalizeElement(el);

            var inView = false;
            var offset = this.$(el).offset();
            
            if (offset) {
                var docViewTop = $(this.global).scrollTop();
                var docViewBottom = docViewTop + $(this.global).height();

                var elemTop = offset.top;
                var elemBottom = elemTop + $(el).height();
                inView = elemBottom >= docViewTop && elemTop <= docViewBottom;
            }
            return inView;
        },

        /**
         * Waits until element is inside in the visible viewport and then calls the supplied callback
         * 
         * @param {HTMLElement} el The element
         * @param {Function} callback The callback to call
         * @param {Object} scope The scope for the callback
         * @param {Int} timeout The maximum amount of time to wait for the condition to be fulfilled. Defaults to the {@link Siesta.Test.ExtJS#waitForTimeout} value. 
         */
        waitUntilInView : function (el, callback, scope, timeout) {
            var me = this;
            
            this.waitFor({
                method          : function() { return me.isInViewInner(el) && el; }, 
                callback        : callback,
                scope           : scope, 
                timeout         : timeout,
                name            : 'waitUntilInView',
                description     : el.toString + ' to appear in the viewport'
            });
        }
    }
});