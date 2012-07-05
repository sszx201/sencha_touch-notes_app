Ext.define('MyApp.controller.Todos', {
    extend: 'Ext.app.Controller',

    config: {
        
        /**
        * Add controls for both the text input and the todo list.
        */
        control: {
            textInput: {
                action: "addTodo"
            },
            list: {
                itemswipe: "toggleTodo"
            },
        },

        refs: {
            list: "list",
            textInput: "#todoinput"
        }
    },

    /**
    *  When the controller is created it needs to 
    *  listen for events generated by Ext.io.Controller.
    */
    init: function() {
        this.getApplication().sio.on({
            authorized: this.onAuth,
            logout: this.onLogout,
            usermessage: this.onUserMessage,
            scope: this
        });
    },

    /**
    *  When the application has an authentcated user.
    */
    onAuth: function(user) {
        console.log("onAuth", user);
        this.getTextInput().setDisabled(false);
        Ext.getStore('todos').sync();
        return true;
    },

    /**
    *  When the user gets a message from the application
    *  needs to call sync on the todo's store.
    */
    onUserMessage: function(sender, message) {
        var userId = sender.getUserId();
        console.log("user got a message!", arguments, userId);
        Ext.getStore('todos').sync(function() {
            console.log("todos sync callback", arguments);
        });
        return true;
    },

    /**
    * When the user logs out the application needs
    * to remove the local data from the store.
    */
    onLogout: function() {
        var store = Ext.getStore('todos');
        store.getProxy().clear();
        store.load();
        this.getTextInput().setDisabled(true);
        return true;
    },

    /**
    * Add the task to the store from the value in a textfield.  
    * Call sync on the store to push changes to sencha.io
    * After sync completes call syncCallback.
    */
    addTodo: function(textfield, e, options) {
        console.log("addTodo");
        var todos = Ext.getStore('todos');
        todos.add({
            task: textfield.getValue(),
            completed: false,
            timestamp: new Date().getTime()
        });
        todos.sync(Ext.bind(this.syncCallback, this));
        textfield.setValue("");
    },

    /**
    * on a swipe on a list item the application reverses the completed  
    * value of the record.
    * Call sync on the store to push changes to sencha.io
    * After sync completes call syncCallback.
    */
    toggleTodo: function(dataview, index, target, record, e, options) {
        console.log("swipe?")
        var completed = record.get('completed');
        record.set("completed", !completed);
        var todos = Ext.getStore('todos');
        todos.sync(Ext.bind(this.syncCallback, this));

    },

    /*
    * After the store sync is complete the application needs
    * to notify the user's other devices that the store has changed.
    */
    syncCallback: function() {
        console.log("broadcast update", arguments);
        this.getApplication().sio.getUser(function(user, error) {
            if (user) {
                console.log("user", user);
                user.send({
                    message: "updated"
                },
                function() {
                    console.log("send callback");
                }
                );

            }
        });
    }



});