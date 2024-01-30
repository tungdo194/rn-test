/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict
 * @format
 */

'use strict';

import type {SchemaType} from '../../CodegenSchema';

// File path -> contents
type FilesOutput = Map<string, string>;

const FileTemplate = ({
  stateClasses,
  headerPrefix,
}: {
  stateClasses: string,
  headerPrefix: string,
}) => `
/**
 * This code was generated by [react-native-codegen](https://www.npmjs.com/package/react-native-codegen).
 *
 * Do not edit this file as changes may cause incorrect behavior and will be lost
 * once the code is regenerated.
 *
 * ${'@'}generated by codegen project: GenerateStateCpp.js
 */
#include <${headerPrefix}States.h>

namespace facebook::react {

${stateClasses}

} // namespace facebook::react
`;

const StateTemplate = ({stateName}: {stateName: string}) => '';

module.exports = {
  generate(
    libraryName: string,
    schema: SchemaType,
    packageName?: string,
    assumeNonnull: boolean = false,
    headerPrefix?: string,
  ): FilesOutput {
    const fileName = 'States.cpp';

    const stateClasses = Object.keys(schema.modules)
      .map(moduleName => {
        const module = schema.modules[moduleName];
        if (module.type !== 'Component') {
          return;
        }

        const {components} = module;
        // No components in this module
        if (components == null) {
          return null;
        }

        return Object.keys(components)
          .map(componentName => {
            const component = components[componentName];
            if (component.interfaceOnly === true) {
              return null;
            }

            return StateTemplate({
              stateName: `${componentName}State`,
            });
          })
          .filter(Boolean)
          .join('\n');
      })
      .filter(Boolean)
      .join('\n');

    const replacedTemplate = FileTemplate({
      stateClasses,
      headerPrefix: headerPrefix ?? '',
    });

    return new Map([[fileName, replacedTemplate]]);
  },
};
