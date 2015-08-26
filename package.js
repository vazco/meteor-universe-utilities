Package.describe({
    summary: 'Many awesome utilities',
    name: 'universe:utilities',
    version: '1.0.0',
    git: 'https://github.com/vazco/meteor-universe-utilities'
});

Package.onUse(function (api) {
    api.versionsFrom(['METEOR@1.1.0.3']);
    api.use([
        'underscore'
    ]);

    api.add_files([
        'UniUtils.js',
        'UniUtilsStrings.js',
        'ProvidingGlobals.js',
        'UniConfig.js'
    ]);

    api.export([
        'UniUtils',
        'UniConfig',
        'Vazco',
        'Colls',
        'App'
    ]);
});
