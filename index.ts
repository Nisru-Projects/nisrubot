import Colors = require('colors.ts');
import Nisru from './src/Nisru'
import { ConfigOptions } from './src/types/config'
import config from './config.json'
Colors.enable()
const client = new Nisru(config as ConfigOptions)
client.login()