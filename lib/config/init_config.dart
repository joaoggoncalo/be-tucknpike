import 'package:sqflite/sqflite.dart';

import 'db_config.dart';

class InitConfig {
  Future<Database> initialize() async {
    final database = await DatabaseConfig().initialize();
    return database;
  }
}