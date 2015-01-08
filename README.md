heroJS
=========
![heroJS logo](https://github.com/ivanruby/herojs/blob/master/assets/logo/hero3A.jpg)

Hero.js is a Javascript Library built to provide Local or Offline Storage, Geo-location and caching functionality to web pages.
It makes use of HTML5 localStorage, geolocation and cache objects to provide offline storage and information related to the location of the device accessing the web page.


Functionalities
===========

- hero.db : Object that implements DB operations (Insert, Get, Update, Remove, Search and Sort) with method chaining. 
- hero.geo : Object that implements geolocation. Uses metwit's api as a default geolocation resolver
- hero.cache: Object programmatically creates a cache manifest file (as of now it just prints the contents supposed to be on the manifest on the console)

TODO:
================

- Create and implement test cases
- Find a better way to implement method chaining (without having to use the .ok() )
- Implement better queries on hero.db
- Implement db schema
- Implement a auto-increment field

License
=======
[MIT](https://raw.githubusercontent.com/ivanruby/herojs/master/LICENSE)



*Cheers!*

Ivan Ruby