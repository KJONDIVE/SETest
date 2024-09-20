/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './src/App';
import {name as appName} from './app.json';
import { observer } from 'mobx-react';

AppRegistry.registerComponent(appName, () => App);
