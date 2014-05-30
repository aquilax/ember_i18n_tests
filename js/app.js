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

App.Trans = Em.Object.create({
	unknownProperty: function(key) {
		this[key] = key;
		return this[key];
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
  	this.resource("page", { path: "/page/:lang" });
});

App.Translatable = Ember.Mixin.create({
	model: function() {
    	return App.Trans;
  	},
  	actions: {
  		lang: function(lang) {
  			App.getTranslation(lang).then(function(){
	  			Object.keys(App.Trans).forEach(function(key){
	  				App.Trans.notifyPropertyChange(key);
	  			});  				
  			});
  		}
  	}
});

// App.WRoute = Em.Route.extend({
// 	model: function() {
//     	return App.Trans;
//   	},
// });

App.ApplicationRoute = Em.Route.extend(App.Translatable, {
});

App.IndexRoute = Em.Route.extend(App.Translatable, {});
App.PageRoute = Em.Route.extend(App.Translatable, {
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