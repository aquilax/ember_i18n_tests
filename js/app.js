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
  	this.resource("page", { path: "/page/:lang" });
});

App.ApplicationRoute = Em.Route.extend({
  	actions: {
  		lang: function(lang) {
  			App.getTranslation(lang).then(function(){
				$.each(Ember.View.views, function( i, view ) {
					if (view.renderedName === "application"){
						view.rerender();
					}
				});
				//route.transitionTo('loading');
				route.transitionTo("index");
  			});
  		}
  	}
});

Em.Handlebars.registerHelper('i18n', function(value, options){
	var params = options.hash,
    	self = this;

	Object.keys(params).forEach(function (key) {
  		params[key] = Em.Handlebars.get(self, params[key], options);
	});

	return App.get('i18n')(value, params);
});