import objectAssignDeep from 'object-assign-deep';
import commonConfig from './commonConfig';

export const defaultConfig = {
  ...commonConfig,
};

export default (config) => objectAssignDeep({}, defaultConfig, config);
