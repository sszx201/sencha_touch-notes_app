Ext.define("FriendlyRent.view.registration.landlord.register.NavBar", {
  extend: 'Ext.tab.Panel',
  alias: "registration.landlord.register.NavBar",
  config: {
    tabBarPosition: 'bottom',
    defaults: {
      html: 'text',
      styleHtmlContent: true
    },
    layout: {
      pack: 'center',
    },
    items: [
        {
            xtype: 'newMenuBtn'
        },
        {
            xtype: 'whyUsBtn'
        },
        {
            xtype: 'registerBtn'
        }
    ]
  }
});