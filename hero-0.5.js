(function() {
	'use strict';

	var root = this;

	var hero = {
		/**
		Versions:
				0.1.0 Library creation
				0.2.0 hero.nav and Code structuring
				0.3.0 hero.cache
				0.4.0 hero.geo
				0.5.0 hero.db
				0.9.0 Unit tests passed and refactoring method inter-communication using events
				0.9.0a Aplha release (Limited. Webpage complete)
				0.9.0b Beta release (Public. Documentation complete)
				1.0.0 First stable release
				1.0.X Bug fixes
		*/

		VERSION: "0.5.0",

		// Default options
		_options: {
			environment: 'dev' // 'dev' logs errors while 'prod' doesn't
		},

		// Helper functions
		config: heroConfig,
		log: heroLog,
		
		//****** Library Objects ******//

		// Stable. @TODO Implement update, remove, where, sort modes
		db: {
			_query: {},
			_options: {},
			_error: [],
			_buffer: [],
			
			// Methods
			config: dbConfig,
			register: dbConfig,		
			on: dbOnTable,
			from: dbOnTable,		
			insert: dbInsert, // Only inserts a single model at a time
			update: dbUpdate, // Only updates a single property at a time
			remove: dbRemove, 
			truncate: dbTruncate,
			where: dbWhere,
			sort: dbSort,
			search: dbSearch,			
			get: dbGet,
			ok: dbGet
		},

		// Stable. @TODO Fork countryLookUp to an independent API
		geo: {
			_data: {},

			init: geoInit,
			isEnabled: geoIsEnabled,
			countryLookUp: geoCountryLookUp		
		},

		// Stable. @TODO Add hero.cache.generate HTML5 File API code
		cache: {
			_options: {},
			create: cacheCreate,
			require: cacheRequire,
			network: cacheNetwork,
			fallback: cacheFallback,
			generate: cacheGenerate
		},

		// Stable.
		nav: {
			isOnline: navIsOnline
		}

		// End of Library Objects

		// Utilities			
			// encrypt
			// decrypt			
	};

	/******************** db Object Methods ***********************
	*
	*								     @TODO Add description
	*
	***************************************************************/


	/**
	 * dbConfig() returns a new element
	 * based on the passed in tag name
	 *
	 * @param <Object> opts
	 * @return <Element> element
	 */
	function dbConfig(opts){
		
		// Default Database Settings
    var _defaults = {
			tables: [],
			// @TODO Write implementation for url property
			url: '',
			id: '',			
			syncOnSave: true,
			storageEngine: "localStorage"
		};

		var _opts = _defaults;

		// Fixes tables array update issue
		if(hero.db._options.tables)
			_opts.tables = hero.db._options.tables.slice();

		if (opts){			
			if(typeof opts === 'string'){
				_opts.tables.push(opts);
				if(!localStorage.getItem(opts))
					localStorage.setItem(opts,'');
			}					
			else if (typeof opts === 'object'){	

				// Checks whether object is an Array
				if( Object.prototype.toString.call( opts ) === '[object Array]' ) {
			    for (var i = 0; i < opts.length; i++)
						_opts.tables.push(opts[i]);
				}
				else {
					for(var key in opts){
						switch(key){
							case "tables":
										if (typeof opts[key] === 'array')										
												for (var i = 0; i < opts[key].length; i++) {
													_opts.tables.push(opts[key][i]);							
												}												
										else
											_opts.tables.push(opts[key]);

										break;
							case "id":
										_opts.id = opts[key];
										break;
							case "url":
										_opts.url = opts[key];
										break;
							case "syncOnSave":
										_opts = opts[key];
										break;
							case "storageEngine":
										_opts.storageEngine = opts[key];
										break;
							default:
									hero.log("Invalid property: "+ key, 'error');
						}	// end of switch-case
					} //End of for loop
				} // end of else 								
			} //end of else-if
			else{
				hero.log('ERROR: typeof options: ' +
									  typeof options + "\n Expected: string or object");
			}
		}

		// If opts is null _defaults will be applied
		hero.db._options = _opts;		
	}

	
	/**
	 * dbOnTable() checks the existence of a given table
	 * and buffers it for method chaining
	 *
	 * @param <String> table
	 * @return <Object> hero.db (this)
	 */
	function dbOnTable(table){		
		this._query.table = table;		
		
		return this;		
	}


	/**
	 * dbInsert() inserts data in the given table
	 *
	 * @param <Object> data
	 * @return <Object> hero.db (this)
	 */
	function dbInsert(data){
		this._query.mode = 'insert';
		this._query.insertData = data;

		return this;
	}


	/**
	 * dbUpdate() Updates data in the given table
	 *
	 * @param <Object> data
	 * @return <Object> hero.db (this)
	 */
	function dbUpdate(data){
		this._query.mode = 'update';
		this._query.updateData = data;

		return this;
	}


	/**
	 * dbRemove() deletes a specific field from the given table
	 *
	 * @return <Object> hero.db (this)
	 */
	function dbRemove(condition){
		this._query.mode = 'delete';
		this._query.condition = condition;	

		return this;
	}


	/**
	 * dbTruncate() deletes all data from the given table
	 *	 
	 * @return <Object> hero.db (this)
	 */
	function dbTruncate(table){
		this._query.mode = 'truncate';
		this._query.table = table;

		return this;
	}


	/**
	 * dbWhere() filters data in the given table according
	 * to a given condition
	 *
	 * @param <Object> condition
	 * @return <Object> hero.db (this)
	 */
	function dbWhere(condition){
		this._query.condition = condition;

		return this;
	}


	/**
	 * dbSort() Sorts the returned data
	 * in ascending order according to a given property
	 *
	 * @param <String> property
	 * @return <Object> hero.db (this)
	 */
	function dbSort(property){
		this._query.sortingProperty = property;		

		return this;
	}


	/**
	 * dbSearch() Searches the table for a 
	 * given model
	 *
	 * @param <Object> model
	 * @return <Object> hero.db (this)
	 */
	function dbSearch(model){
		this._query.searchingModel = model;
		this._query.mode = 'search';

		return this;
	}


	/**
	 * dbGet() Performs the given query and
	 * handles errors
	 *
	 * @return <Boolean> success
	 */
	function dbGet(table){
		var success = false;
		var _table = this._query.table;

		if (table) {
			if(_dbTableExists(table)) {
				if (this._query.sortingProperty) {
					var result  = _dbSortTable(table,this._query.sortingProperty);
					this._query = {};

					return result;						
				}
				 
				else
					return _dbGetFromTable(table);
			}
				
			else 
				hero.log('TABLE IS NOT REGISTERED OR DOES NOT EXIST IN DATABASE', 'error');			
		}
		else {
			if (_dbTableExists(_table)) {

				switch(this._query.mode) {
					case 'insert':
									var _elementsInserted = _dbInsertOnTable(_table,this._query.insertData);

									if(!_elementsInserted)
										this._error.push('ERROR IN INSERTING ELEMENT. ' +
														 'TABLE MIGHT NOT EXIST OR ' +
														 'LOGICAL ERROR IN THE LIBRARY');
									break;
					case 'delete':
									var _elementsRemoved = false;
									var _indexesToBeRemoved = [];
									
									// Check for (this._query.)condition. If existent
									// Delete the model from (this._query.)table that 
									// matches the condition
									
									if ( !_dbTableIsEmpty(_table) ) {	

										// Return the indexes of the elements matching the condition
										var _indexesToBeRemoved = _dbModelExists(_table, this._query.condition);

										// If the returned array is not empty remove elements
										if (_indexesToBeRemoved.length > 0)
											_dbRemoveFromTable(_table,_indexesToBeRemoved);
										else
											this._error.push('ELEMENT TO BE DELETED NOT FOUND');
									}
									else {
										this._error.push('TABLE IS EMPTY');														
									}

									break;				
					case 'truncate':
									// Delete all models from this._query.table
									localStorage.setItem(_table,'');
									hero.log('Table ' + _table + ' truncated');

									break;
					case 'update':
									// Check for this._query.condition. If existent
									// Replace the model from this._query.table that 
									// matches the condition with this._query.updateData
									success = _dbUpdateOnTable(_table, this._query.condition, this._query.updateData)

									break;
					case 'search':
									var result = _dbModelExists(_table,this._query.searchingModel);

									return (result.length > 0);
									break;
					default:
									if (this._query.sortingProperty) {
										var result = _dbSortTable(_table,this._query.sortingProperty);
										this._query = {};

										return result;
									}
									 
									else
										return _dbGetFromTable(_table);
				}

			}
			else {
				this._error.push('TABLE IS NOT REGISTERED OR DOES NOT EXIST IN DATABASE');
			}
		}

		if (this._error.length > 0)	
			for(var i=0; i < this._error.length; i++)
				hero.log(this._error[i], 'error');
		else
			success = true;

		// Clear hero.db._query and hero.db._error
		this._query = {};
		this._error = [];

		return success;
	}

	/***** Private Helper functions ****
	*																	 *
	************************************/

	/**
	 * _dbTableExists() checks the existence of a given table
	 * Helper function for dbOnTable()
	 *
	 * @param <String> table
	 * @return <Boolean> exists
	 */
	function _dbTableExists(table){
		var _tables = hero.db._options.tables;

		if (_tables){
			for(var i = 0; i < _tables.length; i++)
				if (table === _tables[i])
					return true;
			return false;
		}
		
		return false;
	}

	/**
	 * _dbTableIsEmpty() checks if the current table is empty
	 *
	 * @param <String> table
	 * @return <Boolean> isEmpty
	 */
	function _dbTableIsEmpty(table){
		if (localStorage.getItem(table) == '')
			return true;
		else
			return false;
	}

	/**
	 * _dbGetFromTable() retrieves the contents of a given table
	 *
	 * @param <String> table
	 * @return <Array> collection
	 */

	 function _dbGetFromTable(table) {

	 	// Retrieves contents of table to a temporary array
		var collection = (localStorage.getItem(table)).split(';');
		
		// If the collection is empty return an empty array
		if (_dbTableIsEmpty(table))
				return [];	

		// Buils array of objects by JSON.parsing each model	
		for (var i = 0; i < collection.length; i++) 											
			collection[i] = JSON.parse(collection[i]);
				
		return collection;
	 }

	/**
	 * _dbRemoveFromTable() removes the objects found on a 
	 * table given an array of indexes to matched
	 *
	 * @param <String> table
	 * @param <Array> indexesToBeRemoved
	 * @return <Boolean> success
	 */
	function _dbRemoveFromTable(table,indexesToBeRemoved) {
		var success = false,
				countOfElementsRemoved = 0;

		if (indexesToBeRemoved.length > 0) {

			// If table is not empty perform removals
			if ( !_dbTableIsEmpty(table) ) {
				
				// Retrive the existing collection
				var existingCollection = _dbGetFromTable(table), 
		    		newCollection = [];

			    for (var i = 0; i < indexesToBeRemoved.length; i++) {
			    	// Remove array elements by marking them with '#_$'
			    	existingCollection[indexesToBeRemoved[i]] = '#_$';		    	
			    	countOfElementsRemoved++;
			    }

			    for (var i = 0; i < existingCollection.length; i++) {

			    	// Only push unmarked elements to newCollection
			    	if (existingCollection[i] != '#_$')
			    		newCollection.push(existingCollection[i]);
			    }    	   	    
			}
			else
				success = false;			
		}

		
		// Decrement the length of the array of indexes to be removed
		// by the number of elements removed by the above code
		indexesToBeRemoved.length -= countOfElementsRemoved;
		
		// Removal is successful if there remains no element to be removed
		// at the array
		if (indexesToBeRemoved.length == 0) {
			success = true;

			// Truncate table
			localStorage.setItem(table,'');

			// Insert each model on table
			for (var i = 0; i < newCollection.length; i++)
				_dbInsertOnTable(table,newCollection[i]);				
		}

		return success;			
	}

	/**
	 * _dbInsertOnTable() inserts a given object
	 * on a table
	 *
	 * @param <String> table
	 * @param <Object> model
	 * @return <Boolean> success
	 */
	function _dbInsertOnTable(table, model, reset) {
		var success = false;

		if(_dbTableExists(table)) {
			var buffer = [], collection = _dbGetFromTable(table);
			
			// Add existing collection to buffer array
			if (collection.length > 0) {
				// In localStorage an empty table is represented as an empty string
				if (collection[0] != '') {
					for (var i = 0; i < collection.length; i++)
						buffer.push(JSON.stringify(collection[i]));	
				}	
			}

			// Add model to buffer
			buffer.push(JSON.stringify(model));			
		
			// Replace table contents with buffer
			localStorage.setItem(table, buffer.join(';'));
			success = true;
		}
		else
			success = false;
		
		return success;
	}

	/**
	 * _dbUpdateOnTable() updates a given object
	 * on a table
	 *
	 * @param <String> table
	 * @param <Object> condition
	 * @param <Object> model
	 * @return <Boolean> success
	 */
	function _dbUpdateOnTable(table, condition, model) {
		var success = false, 
				collection = _dbGetFromTable(table);

		if (collection.length  > 0) {
			// Initialize _key and _value with object key-value pair
			var conditionKey, conditionValue, dataKey, dataValue;														
			for(var k in condition) {
				conditionKey = k;
				conditionValue = condition[k];
			}											

			for (var k in model) {
				dataKey = k;
				dataValue = model[k];
			}			

			// Traverse the models to find the required element
			collection.forEach( function(element, index, array) {															
				if (element.hasOwnProperty(conditionKey)){
					if (element[conditionKey] === conditionValue) {

						// Condition is met. Now we need to check for the property to update
						if (element.hasOwnProperty(dataKey)) {
							element[dataKey] = dataValue;
							success = true;
						}					
					}																						
				}
			});
		}

		if (success) {
			// Truncate table
			localStorage.setItem(table,'');

			// Insert each model on table
			for (var i = 0; i < collection.length; i++)
				_dbInsertOnTable(table,collection[i]);
		}


		return success;
	}

	/**
	 * _dbModelExists() checks the existence of a given model
	 * on a table. Returns -1 if model not found
	 *
	 * @param <String> table
	 * @param <Object> model
	 * @return <Array> indexes
	 */
	function _dbModelExists(table,model){
		var indexes = [],
				collection = _dbGetFromTable(table);

		if (collection.length > 0) {
			// Initialize _key and _value with object key-value pair
			var key, value;														
			for(var k in model) {
				key = k;
				value = model[k];
			}														

			// Traverse the models to find the required element
			collection.forEach( function(element, index, array) {															
				if (element.hasOwnProperty(key)){
					if (element[key] === value) {
						indexes.push(index);																
					}																	
				}
			});
		}		

		return indexes;
	}

	/**
	 * _dbSortTable() retrieves the contents of the given table
	 * and sorts them in ascending order
	 *
	 * @param <String> table
	 * @param <String> property
	 * @return <Array> sortedTable
	 */
	function _dbSortTable(table,property) {
		var sortedTable = [],
				collection = _dbGetFromTable(table);

		if (collection.length > 0) {

			// Sorting using Bubble Sort
			for (var j = 0; j < collection.length; j++) {
				for (var i = 0; i < collection.length - 1; i++) {						
					if (collection[i][property] > collection[i+1][property]) {						
						var temp = collection[i];
						collection[i] = collection[i+1];
						collection[i+1] = temp;
					}	
				}	
			}			
		}

		sortedTable = collection.slice();

		return sortedTable;
	}

	
	/******************** cache Object Methods **********************

					All methods of cache object use method chaining

	******************************************************************/
	
	/**
	 * cacheCreate() stores the name for the cache
	 * 
	 * @param <String> name
	 * @return <Object> hero.cache (this)
	 */
	 function cacheCreate(name) {
	 	var _name = name || 'app';
	 	_name += '.appcache';

	 	hero.cache._options.name = _name;

	 	return this;
	 }

	/**
	 * cacheRequire() stores array of the files required
	 * to be cached
	 *
	 * @param <Array> files 
	 * @return <Object> hero.cache (this)
	 */
	 function cacheRequire(files) {
	 	if (files) {
	 		if (typeof files === 'string')
	 			hero.cache._options.require = files;
	 		else
	 			hero.cache._options.require = files.slice();
	 	}	 		
	 	else
	 		hero.cache._options.require = [];

	 	return this;
	 }

	 /**
	 * cacheNetwork() stores array of the files that require
	 * a connection to the network. This files will never be cached
	 *
	 * @param <Array> files 
	 * @return <Object> hero.cache (this)
	 */
	 function cacheNetwork(files) {
	 	if (files) {
	 		if (typeof files === 'string')
	 			hero.cache._options.network = files;
	 		else
	 			hero.cache._options.network = files.slice();	
	 	}	 		
	 	else
	 		hero.cache._options.network = [];
	 	
	 	return this;
	 }

	 /**
	 * cacheFallback() stores array of the files that
	 * will be served in case an internet connection cannot be established
	 *
	 * @param <Array> files 
	 * @return <Object> hero.cache (this)
	 */
	 function cacheFallback(files) {
	 	if (files) {
	 		if(typeof files === 'string')
	 			hero.cache._options.fallback = files;
	 		else
	 			hero.cache._options.fallback = files.slice();	
	 	}	 		
	 	else
	 		hero.cache._options.fallback = [];
	 	
	 	return this;
	 }	 

	 /**
	 * cacheGenerate() generates the cache file
	 * 
	 * @return <Boolean> success
	 */
	 function cacheGenerate() {
	 	var content,
	 		require,
	 		network,
	 		fallback;

	 	if (typeof hero.cache._options.require === 'string')
	 		require = hero.cache._options.require;
	 	else
	 		require = hero.cache._options.network.join('\n');

	 	if (typeof hero.cache._options.network === 'string')
	 		network = hero.cache._options.network;
	 	else
	 		network = hero.cache._options.network.join('\n');

	 	if (typeof hero.cache._options.fallback === 'string')
	 		fallback = hero.cache._options.fallback;
	 	else
	 		fallback = hero.cache._options.fallback.join('\n');

	
 		content = 'CACHE MANIFEST\n' + require +
 							'\n\n' + 'NETWORK:\n' + network + 
 							'\n\n' + 'FALLBACK:\n' + fallback;


	 	console.log(content);

	 	$('html').attr('cache',hero.cache._options.name);

	 	//@TODO Use FileSystem API to write content to file: app.cache
	 }



	/************************ nav Object  *************************
	*
	*					@TODO Add description
	*
	***************************************************************/

	/**
	 * navIsOnline() checks whether the browser has
	 * access to the internet (is online) or not
	 * 
	 * @return <Boolean> success
	 */
  function navIsOnline() {
  	return navigator.onLine;
  }

	

 	/************************* geo Object *************************
  	*
	*	     Methods check and make use of HTML5 geolocation API
	*
	***************************************************************/

	 /**
	 * geoIsEnabled() checks whether the geolocation is enabled
	 * on the browser
	 *
	 * @return <Boolean> success
	 */
	 function geoIsEnabled() {
	 	return (navigator.geolocation) ? true : false;
	 }
	

	/**
	 * geoInit() makes a call to geoCallAPI()
	 * Enables the api to load the hero.geo._data object before it is used
	 * in the application
	 *
	 * @param <Function> callback
	 */
	function geoInit(callback) {
		// ajax call to api to initialize hero.geo._data object
		geoCallAPI();		

		// When the ajax request is complete execute user-defined callback
		$(document).ajaxComplete(function(){
			var data = hero.geo._data;
			callback(data);
		})
	}


	/**
	 * geoCallAPI() checks whether geolocation functionality is enabled in the browser
	 * If enabled delegates the execution to geoLocationSuccess
	 *
	 */
	function geoCallAPI() {
		if (navigator.geolocation) {
			navigator.geolocation.getCurrentPosition(geoLocationSuccess);			
		}
		else {
			hero.log('Geolocation is not supported by this browser. ' +
					 ' IP LookUp will be used instead.', 'warn');

			// Add code for IP lookup and call geoLocationSuccess with position coords
	 	}
	}


	/**
	 * geoLocationSuccess() makes an ajax request to https://api.metwit.com
	 * with the geo coordinates as parameters to retrieve the api object
	 * containing location and weather objects and initializes the hero.geo._data object
	 * Note: asynchronous function
	 *
	 * @param <Object> position
	 */
	function geoLocationSuccess(position) {
		var lat = position.coords.latitude;
    var lon = position.coords.longitude;
    var url = "https://api.metwit.com/v2/weather/?location_lat=" + lat + "&location_lng=" + lon;

    $.getJSON(url, function( result ) {	    		
				hero.geo._data = result.objects[1];    		    		
    	})
    	.fail(function(){
    		hero.geo._data = null;    		
    		
    		hero.log('Unable to retrieve GeoLocation Data');  		    		
    	})
	}

	/**
	 * geoCountryLookUp() displays an error message after checking
	 * the environment: Production (no log) or Development (logs)
	 *
	 * @param <String> countryCode
	 * @return <String> countryName
	 */
	function geoCountryLookUp(countryCode) {
		countryCode = countryCode.toUpperCase();

		for(var k in countries)
			if (countryCode == k)
				return countries[k].name;

		return 'Invalid country code';
	}


	/********************* Utility Methods ************************
	*
	*					@TODO Add description
	*
	***************************************************************/

	/**
	 * heroError() displays an error message after checking
	 * the environment: Production (no log) or Development (logs)
	 *
	 * @param <String> msg
	 */
	function heroLog(msg,type) {

		// Only displays error messages while in development mode/environment
		if (hero._options.environment === 'dev') {
			switch (type) {
				case 'warn':
							console.warn('HERO WARNS: ' + msg);											
							break;
				case 'error':
							console.error('HERO HAD AN ERROR: ' + msg);											
							break;
				default:
							console.log('HERO SAYS: ' + msg);									
			}	
		}
	}

	/**
	 * heroConfig() displays an error message after checking
	 * the environment: Production (no log) or Development (logs)
	 *
	 * @param <String> msg
	 */
	function heroConfig(opts) {
		var _defaults = {
			// environment: dev or prod
			environment: 'dev'
		};

		// If opts is null hero._options = _defaults
		hero._options = opts || _defaults;
	}


  // Adding hero to the global namespace
	root.hero = hero;

}).call(this);


