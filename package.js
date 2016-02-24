Package.describe({
    summary: 'Many awesome utilities',
    name: 'universe:utilities',
    version: '2.2.2',
    git: 'https://github.com/vazco/meteor-universe-utilities'
});

Package.onUse(function (api) {
    api.versionsFrom(['METEOR@1.1.0.3']);
    api.use([
        'underscore',
        'minimongo',
        'tracker'
    ]);

    api.addFiles([
        'UniUtils.js',
        'object-assign.js',
        'deep-extend.js',
        'deep-equal.js',
        'UniUtilsStrings.js',
        'UniConfig.js',
        'UniEmitter.js'
    ]);

    api.addFiles('settings.js', 'server');

    api.export([
        'UniUtils',
        'UniConfig'
    ]);
});
