'use strict';


/**
 * Capitalize a string
 * @alias Vazco.capitalize
 * @param {string} string String to capitalize
 * @returns {string}
 */
UniUtils.capitalize = function (string) {
    return string.charAt(0).toUpperCase() + string.substring(1).toLowerCase();
};


/**
 * Capitalize a first letter
 * @alias Vazco.capitalizeFirst
 * @param {string} string String to capitalize first letter
 * @returns {string}
 */
UniUtils.capitalizeFirst = function (string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/**
 * Transform string into insensitive Regexp without flag i
 * This can help you with searching in minimongo
 * @param term {String}
 * @returns {RegExp}
 */
UniUtils.getInSensitiveRegExpForTerm = function(term){
    check(term, String);
    term = _.map(term, function (v) {
        var n = v.toLowerCase();
        n += v.toUpperCase();
        return '[' + n + ']';
    });
    term = term.join('');
    return new RegExp(term);
};


/**
 * Generates random string hash
 * @alias Vazco.randomString
 * @param {number} length length of generated hash @default 5
 * @param {number} base @default 36
 * @returns {string}
 */
UniUtils.randomString = function (length, base) {
    return (Math.random() + 1).toString(base || 36).substr(2, length || 5);
};


/**
 * camelCase a string
 * @alias Vazco.camelCase
 * @param {string} string String to camelCase
 * @returns {string}
 */
UniUtils.camelCase = function (string) {
    return string.toLowerCase().replace(/ (.)/g, function(match, group1) {
        return group1.toUpperCase();
    });
};


/**
 * remove international special characters - replaceSpecialChars a string
 * @alias Vazco.replaceSpecialChars
 * @param {string} string String
 * @returns {string}
 */
UniUtils.replaceSpecialChars =function (string) {
    var _specialChars = {
        'á': 'a',
        'Á': 'A',
        'é': 'e',
        'É': 'E',
        'í': 'i',
        'Í': 'I',
        'ö': 'o',
        'Ö': 'O',
        'ő': 'o',
        'Ő': 'O',
        'ó': 'o',
        'Ó': 'O',
        'ü': 'u',
        'Ü': 'U',
        'ű': 'u',
        'Ű': 'U',
        'ú': 'u',
        'Ú': 'U',

        'à':'a',
        'è':'e',
        'ì':'i',

        'ò':'o',
        'ù':'u',
        'À':'A',
        'È':'E',
        'Ì':'I',

        'Ò':'O',
        'Ù':'U',
        'â':'a',
        'ê':'e',
        'î':'i',
        'ô':'o',
        'û':'u',

        'Â':'A',
        'Ê':'E',
        'Î':'I',
        'Ô':'O',
        'Û':'U',

        'ã':'a',
        'ñ':'n',
        'õ':'o',
        'Ã':'A',
        'Ñ':'N',
        'Õ':'O',

        'ä':'a',
        'ë':'e',
        'ï':'i',
        'ÿ':'y',

        'Ä':'A',
        'Ë':'E',
        'Ï':'I',
        'Ÿ':'Y',

        'ą':'a',
        'Ą':'A',
        'ę':'e',
        'Ę':'E',
        'ł':'l',
        'Ł':'L',
        'ś':'s',
        'Ś':'S',
        'ń':'n',
        'Ń':'N',
        'ż':'z',
        'Ż':'Z',
        'ź':'z',
        'Ź':'Z',

        'å':'a',
        'Å':'A',
        'ß':'ss'
    };
    return string.replace(
        /[áÁéÉíÍöÖőŐóÓüÜűŰúÚàèìòùÀÈÌÒÙâêîôûÂÊÎÔÛãñõÃÑÕäëïÿÄËÏŸąĄęĘłŁśŚńŃżŻźŹåÅ]/g,
        function(c) { return _specialChars[c]; }
    );
};