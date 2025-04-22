module.exports = function override(config, env) {
    const sourceMapLoaderRule = config.module.rules.find(
      (rule) => Array.isArray(rule.oneOf)
    )?.oneOf?.find(
      (rule) =>
        rule.enforce === 'pre' &&
        rule.use === 'source-map-loader'
    );
  
    if (sourceMapLoaderRule) {
      sourceMapLoaderRule.exclude = /dag-jose/;
    }
  
    return config;
  };
  