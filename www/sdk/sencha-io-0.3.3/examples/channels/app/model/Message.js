/**
* A simple model for our messages. 
*/
Ext.define('MyApp.model.Message', {
    extend: 'Ext.data.Model',
    config: {
        fields: [
            {
                defaultValue: '',
                name: 'message',
                type: 'string'
            }
        ]
    }
});