if (process) {
    var mode = UniUtils.get(process, 'env.NODE_ENV');
    var cfgMode = UniConfig.public.get('universeRunningMode');
    if(!cfgMode && mode) {
        UniConfig.public.set('universeRunningMode', mode, true);
    } else if (cfgMode && cfgMode !== mode) {
        console.log('## Forced ' + cfgMode + ' mode ##');
    }
}
