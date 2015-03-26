'use strict';
/* global App: true */
/**
 * App is a global variable, available on both client and server
 * Used for application space for methods, flags...
 * @namespace App
 */
if(typeof App === 'undefined'){
  App = Object.create(null); //null creates object without prototype
}
/* global Colls: true */
/**
 * Colls is global variable, variable on both client and server
 * Used as container for collections
 */
Colls = Object.create(null); //null creates object without prototype


/* global Vazco: true */
/**
 * Vazco is a global variable, available on both client and server
 * Used as a placeholder for all tools.
 * @deprecated Please use UniUtils instead
 * @namespace Vazco
 */
Vazco = UniUtils;