/*

Siesta 1.1.0-beta-1
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**
@class Siesta.Harness.Browser.SenchaTouch
@extends Siesta.Harness.Browser 

A Class representing the browser harness. This class provides a web-based UI and defines some additional configuration options.

The default value of the `testClass` configuration option in this class is {@link Siesta.Test.SenchaTouch}, which inherits from 
{@link Siesta.Test.Browser} and contains various Sencha Touch-specific assertions. Use this harness class when testing Sencha Touch applications.

This file is for reference only, for a getting start guide and manual, please refer to <a href="#!/guide/siesta_getting_started">Getting Started Guide</a>.

Synopsys
========

var Harness = Siesta.Harness.Browser.SenchaTouch;
    
Harness.configure({
title     : 'Awesome Sencha Touch Application Test Suite',
        
transparentEx       : true,
        
preload : [
"http://cdn.sencha.io/ext-4.0.2a/ext-all-debug.js",
"../awesome-project-all.js"
]
})
    
    
Harness.start(
// simple string - url relative to harness file
'sanity.t.js',
        
// test file descriptor with own configuration options
{
url     : 'basic.t.js',
            
// replace `preload` option of harness
preload : [
"http://cdn.sencha.io/ext-4.0.6/ext-all-debug.js",
"../awesome-project-all.js"
]
},
        
// groups ("folders") of test files (possibly with own options)
{
group       : 'Sanity',
            
autoCheckGlobals    : false,
            
items       : [
'data/crud.t.js',
...
]
},
...
)


*/

Class('Siesta.Harness.Browser.SenchaTouch', {

    isa: Siesta.Harness.Browser,

    // pure static class, no need to instantiate it
    my: {

        has: {
            /**
            * @cfg {Class} testClass The test class which will be used for creating test instances, defaults to {@link Siesta.Test.ExtJS}.
            * You can subclass {@link Siesta.Test.ExtJS} and provide a new class. 
            * 
            * This option can be also specified in the test file descriptor. 
            */
            testClass: Siesta.Test.SenchaTouch,

            transparentEx       : true,
            keepResults         : false,
            performSetup        : true,
            
            runCore             : 'sequential',

            /**
            * @cfg {Object} loaderPath
            * 
            * The path used to configure the Ext.Loader with, for dynamic loading of Ext JS classes.
            *
            * This option can be also specified in the test file descriptor. 
            */
            loaderPath: null
        },


        methods: {

            getNewTestConfiguration: function (desc, scopeProvider, contentManager, options, runFunc) {
                var config = this.SUPERARG(arguments)

                config.performSetup = this.getDescriptorConfig(desc, 'performSetup')
                config.loaderPath = this.getDescriptorConfig(desc, 'loaderPath')

                return config
            },

            createViewport: function (config) {
                var mainPanel = Ext.create('Siesta.Harness.Browser.UI_Mobile.MainPanel', config);
                Ext.Viewport.add(mainPanel);
                
                return mainPanel;
            },

            showForcedIFrame : function (iframe, test) {
                Ext.fly(iframe).setStyle({
                    'z-index'   : 100000
                });
            },

            onBeforeScopePreload : function (scopeProvider, url) {
                var setupEventTranslation = function() {
                    Ext.event.publisher.TouchGesture.override({
                        moveEventName: 'mousemove',

                        map: {
                            mouseToTouch: {
                                mousedown: 'touchstart',
                                mousemove: 'touchmove',
                                mouseup: 'touchend'
                            },

                            touchToMouse: {
                                touchstart: 'mousedown',
                                touchmove: 'mousemove',
                                touchend: 'mouseup'
                            }
                        },

                        attachListener: function(eventName) {
                            eventName = this.map.touchToMouse[eventName];

                            if (!eventName) {
                                return;
                            }

                            return this.callOverridden([eventName]);
                        },

                        lastEventType: null,

                        onEvent: function(e) {
                            if ('button' in e && e.button !== 0) {
                                return;
                            }

                            var type = e.type,
                                touchList = [e];
                    
                            // Temporary fix for a recent Chrome bugs where events don't seem to bubble up to document
                            // when the element is being animated
                            // with webkit-transition (2 mousedowns without any mouseup)
                            if (type === 'mousedown' && this.lastEventType && this.lastEventType !== 'mouseup') {
                                var fixedEvent = document.createEvent("MouseEvent");
                                    fixedEvent.initMouseEvent('mouseup', e.bubbles, e.cancelable,
                                        document.defaultView, e.detail, e.screenX, e.screenY, e.clientX,
                                        e.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, e.metaKey,
                                        e.button, e.relatedTarget);

                                this.onEvent(fixedEvent);
                            }

                            if (type !== 'mousemove') {
                                this.lastEventType = type;
                            }

                            e.identifier = 1;
                            e.touches = (type !== 'mouseup') ? touchList : [];
                            e.targetTouches = (type !== 'mouseup') ? touchList : [];
                            e.changedTouches = touchList;

                            return this.callOverridden([e]);
                        },

                        processEvent: function(e) {
                            this.eventProcessors[this.map.mouseToTouch[e.type]].call(this, e);
                        }
                    });
                };

                if ("ontouchstart" in window) {
                    
                    // Need to tell ST to convert mouse events to their touch counterpart
                    scopeProvider.addPreload({
                        type        : 'js', 
                        content     : '(' + setupEventTranslation.toString() + ')();'
                    })
                }
                 
                this.SUPERARG(arguments)
            }
        }
    }
})


