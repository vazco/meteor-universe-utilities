Package.describe({
    summary: 'Many awesome utilities',
    name: 'universe:utilities',
    version: '2.3.2',
    git: 'https://github.com/vazco/meteor-universe-utilities'
});

Package.onUse(function (api) {
    api.versionsFrom(['METEOR@1.2']);
    api.use([
        'ecmascript',
        'underscore',
        'minimongo',
        'tracker'
    ]);

    api.addFiles([
        'UniUtils.js',
        'RecursiveIterator.js',
        'deepExtend.js',
        'deepEqual.js',
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
