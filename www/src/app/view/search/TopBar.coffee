Ext.define  'FriendlyRent.view.search.TopBar'
  extend:   'FriendlyRent.NavBar'
  alias:    'widget.search_topbar'
  config:
    docked: 'top'
    items: [
      {
        ui:       'orange-back'
        text:     'back' # text: I18n.t('map')        
      }
      {
        xtype: 'spacer'
      }
      # {          
      #   iconCls: 'list'
      #   iconMask: true
      #   text:     'list' # text: I18n.t('list')
      # }
      {          
        iconCls: 'globe2'
        iconMask: true
        text:     'map' # text: I18n.t('map')
      }
    ]    
