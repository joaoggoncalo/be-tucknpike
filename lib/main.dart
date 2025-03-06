import 'package:flutter/material.dart';
import 'package:party_planner_app/config/init_config.dart';
import 'package:sqflite/sqflite.dart';

import 'views/my_home_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final database = await InitConfig().initialize();

  runApp(MyApp(database: database));
}


class MyApp extends StatelessWidget {
  final Database database;
  const MyApp({required this.database, super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Party Planner App',
      theme: ThemeData(
        primarySwatch: Colors.blue,
      ),
      home: MyHomePage(database: database,),
    );
  }
}

