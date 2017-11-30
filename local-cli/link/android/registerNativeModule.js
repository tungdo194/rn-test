const applyPatch = require('./patches/applyPatch');
const makeStringsPatch = require('./patches/makeStringsPatch');
const makeSettingsPatch = require('./patches/makeSettingsPatch');
const makeBuildPatch = require('./patches/makeBuildPatch');
const makeImportPatch = require('./patches/makeImportPatch');
const makePackagePatch = require('./patches/makePackagePatch');
const makeNamePatch = require('./patches/makeNamePatch');

module.exports = function registerNativeAndroidModule(
  name,
  androidConfig,
  params,
  projectConfig
) {
  name = makeNamePatch(name);

  const buildPatch = makeBuildPatch(name);

  applyPatch(
    projectConfig.settingsGradlePath,
    makeSettingsPatch(name, androidConfig, projectConfig)
  );

  applyPatch(projectConfig.buildGradlePath, buildPatch);
  applyPatch(projectConfig.stringsPath, makeStringsPatch(params, name));

  applyPatch(
    projectConfig.mainFilePath,
    makePackagePatch(androidConfig.packageInstance, params, name)
  );

  applyPatch(
    projectConfig.mainFilePath,
    makeImportPatch(androidConfig.packageImportPath)
  );
};
