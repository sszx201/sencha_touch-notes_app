var record;

Ext.define('Sencha.controller.Language', {
  extend: 'Ext.app.Controller',
  formatStr: "ext/locale/ext-lang-{0}.js",
  setLanguage: function(cb, records) {
    var record;
    record = records[0];
    return window.location.search = Ext.urlEncode({
      "lang": record.get("code")
    });
  }
});

({
  parseLanguage: function() {
    var params;
    params = Ext.urlDecode(window.location.search.substring(1));
    if (params.lang) {
      return setLanguage(language);
    } else {
      return this.setup();
    }
  },
  setLanguage: function(params) {
    var url;
    return url = Ext.util.Format.format(this.formatStr, params.lang);
  }
});

Ext.Ajax.request({
  url: url,
  success: this.onSuccess,
  failure: this.onFailure,
  scope: this
});

record = store.findRecord('code', params.lang, null, null, null, true);

if (record) {
  combo.setValue(record.data.language);
}

({
  onFailure: function() {
    Ext.Msg.alert('Failure', 'Failed to load locale file.');
    return this.setup();
  },
  onSuccess: function(response) {
    eval(response.responseText);
    return this.setup();
  },
  setup: function() {
    return Ext.create('Ext.FormPanel', {
      renderTo: 'datefield',
      frame: true,
      title: 'Date picker',
      width: 380,
      defaultType: 'datefield',
      items: [
        {
          fieldLabel: 'Date',
          name: 'date'
        }
      ]
    });
  }
});
