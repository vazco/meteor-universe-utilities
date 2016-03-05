if (process) {
    var mode = UniUtils.get(process, 'env.NODE_ENV');
    var cfgMode = UniConfig.public.get('universeRunningMode');
    if((!cfgMode || !cfgMode.forced) && mode) {
        UniConfig.public.set('universeRunningMode', {mode, forced: false}, true);
    } else if (cfgMode !== mode) {
        console.log('### Forced ' + cfgMode + ' mode ###');
    }
}
