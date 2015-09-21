Package.describe({
    summary: 'Many awesome utilities',
    name: 'universe:utilities',
    version: '2.0.2',
    git: 'https://github.com/vazco/meteor-universe-utilities'
});

Package.onUse(function (api) {
    api.versionsFrom(['METEOR@1.1.0.3']);
    api.use([
        'underscore',
        'mongo'
    ]);

    api.add_files([
        'UniUtils.js',
        'UniUtilsStrings.js',
        'UniConfig.js'
    ]);

    api.export([
        'UniUtils',
        'UniConfig'
    ]);
});
