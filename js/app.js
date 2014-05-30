var App = Em.Application.create({
	currentLanguage: 'en',
	getTranslation: function (language) {
		return new Promise(function(resolve, reject) {
			if (language !== App.get('currentLanguage')) {
				i18n.setLng(language, function(translation){
					if (translation) {
						App.set('currentLanguage', language);
						resolve();
					} else {
						reject();
					}
				});
			} else {
				resolve();
			}
		});
	}
});

Em.Application.initializer({
	name: 'preload',

	initialize: function(container, application) {
		App.deferReadiness();
		i18n.init({
			lng: 'en',
			fallbackLng: 'en',
			debug: true,
			resGetPath: '/locales/__lng__/__ns__.json'
		}, function(i18) {
			App.set('i18n', i18);
			App.advanceReadiness();
		});		
	}
});


App.Router.map(function() {
	this.resource("lan", { path: "/lan" });
  	this.resource("page", { path: "/page/:lang" });
});

App.Trans = Em.Object.create({
	unknownProperty: function(key) {
		this[key] = key;
		return this[key];
	}
});

App.LanRoute = Em.Route.extend({
	model: function() {
		return App.Trans;
	}
})

App.TRoute = Em.Route.extend({
    afterModel: function() {
        this.set('l', this.modelFor('lan'));
    }
});

App.ApplicationRoute = App.TRoute.extend({
  	actions: {
  		lang: function(lang) {
  			App.getTranslation(lang).then(function(){
	  			Object.keys(App.Trans).forEach(function(key){
	  				App.Trans.notifyPropertyChange(key);
	  			});  				
  			});
  		}
  	},
});

App.IndexRoute = App.TRoute.extend({
	model: function(){
		return {
			page: "Hello from index model"
		}
	}
});

App.PageRoute = App.TRoute.extend({
	model: function(){
		return {
			page: "Hello from page model"
		}
	}
});

Em.Handlebars.registerBoundHelper('i18n', function(value, options){
  var params = options.hash,
      self = this;

  Object.keys(params).forEach(function (key) {
  	if (key !== 'boundOptions') {
    	params[key] = Em.Handlebars.get(self, params[key], options);
    }
  });

  return App.get('i18n')(value, params);
}, App.Trans);
