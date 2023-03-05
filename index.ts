import Colors from 'colors.ts'
import Nisru from './src/Nisru'
import { Options } from './src/types/config'
import config from './config.json'
Colors.enable()
const client = new Nisru(config as Options)
client.login()