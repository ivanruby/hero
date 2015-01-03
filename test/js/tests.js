// Testing hero helper functions

// test('',function(){
// 	equal(,,'');
// });


test('Exporting hero to the global namespace', function() {		
		equal(window.hero, hero, 'Hero is exported to the global namespace.');
});

test('Hero only logs when in "dev" mode', function() {
	hero.config({environment: 'dev'});
	equal(hero._options.environment, 'dev', 'In "dev" mode messages are logged');
});


// Testing hero.nav object

test('hero.nav.isOnline()', function() {
	equal(hero.nav.isOnline(), navigator.onLine, 'hero.nav.isOnline output matches native navigator.onLine');
});

// Testing hero.geo object
test('hero.geo.isEnabled()',function(){
	if(navigator.geolocation)
		var flag = true;
	equal(hero.geo.isEnabled(), flag, 'hero.geo.isEnabled() output matches native navigator.geolocation');
});

test('hero.geo.init()',function(){
	var city, country;
	hero.geo.init(function(data) {
		city = data.location.locality;
	});

	equal(city, 'Hyderabad', 'hero.geo.init returns correct coordinates');
});


// Testing hero.cache
test('hero.cache.create()',function(){
	hero.cache.create('manifest');
	equal(hero.cache._options.name, 'manifest.appcache', 'Filename is saved correctly when given as argument.');

	// Clearing hero.cache._options for next test
	hero.cache._options = {};

	hero.cache.create();
	equal(hero.cache._options.name, 'app.appcache', 'Method creates a default filename when no argument is given.');

	// Clearing hero.cache._options for next test
	hero.cache._options = {};
});

test('hero.cache.create() method chaining',function(){
	equal(hero.cache.create(), hero.cache, 'Method returns hero.cache object as expected.');
});

test('hero.cache.require("index.html")',function(){
	hero.cache.require('index.html');

	equal(hero.cache._options.require, 'index.html', 'Method accepts argument of type string.');

	// Clearing hero.cache._options for next test
	hero.cache._options = {};
});

test('hero.cache.require(["index.html","about.html"])',function(){
	files = ['index.html', 'about.html'];
	hero.cache.require(files);

	equal(hero.cache._options.require, 'index.html,about.html', 'Method accepts argument of type array.');

	// Clearing hero.cache._options for next test
	hero.cache._options = {};
});

test('hero.cache.require handles no argument',function() {
	hero.cache.require();

	deepEqual(hero.cache._options.require, [], 'Method does nothing.');
});

test('hero.cache.require() method chaining',function(){
	equal(hero.cache.require(), hero.cache, 'Method return hero.cache object as expected.');
});



