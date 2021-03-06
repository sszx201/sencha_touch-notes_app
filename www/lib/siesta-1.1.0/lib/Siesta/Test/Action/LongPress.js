/*

Siesta 1.1.0-beta-1
Copyright(c) 2009-2012 Bryntum AB
http://bryntum.com/contact
http://bryntum.com/products/siesta/license

*/
/**

@class Siesta.Test.Action.LongPress
@extends Siesta.Test.Action
@mixin Siesta.Test.Action.Role.HasTarget

This action can be included in the `t.chain` call with "click" shortcut:

    t.chain(
        {
            action      : 'longpress',
            target      : someDOMElement
        }
    )

This action will perform a {@link Siesta.Test.SenchaTouch#longpress longpress} on the provided {@link #target}. 
The target can be a Component Query, a Sencha Touch Component, a DOM element or [x,y] coordinates

*/
Class('Siesta.Test.Action.LongPress', {
    
    isa         : Siesta.Test.Action,
    
    does        : Siesta.Test.Action.Role.HasTarget,
        
    has : {
        requiredTestMethod  : 'longpress'
    },

    
    methods : {
        
        process : function () {
            var next = this.next;
            var target = this.getTarget();
            this.test.longpress(target, function() { next(target); })
        }
    }
});


Siesta.Test.ActionRegistry.registerAction('longpress', Siesta.Test.Action.LongPress)
