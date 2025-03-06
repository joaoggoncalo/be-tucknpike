import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';

class DatabaseConfig {
  Future<Database> initialize() async {
    final dbPath = await getDatabasesPath();
    final path = join(dbPath, 'my_database.db');
    final database = await openDatabase(
      path,
      version: 1,
      onCreate: (db, version) async {
        await db.execute(
            'CREATE TABLE Users (id INTEGER PRIMARY KEY, name TEXT, phone_number TEXT)');
        await db.execute(
            'CREATE TABLE Parties (id INTEGER PRIMARY KEY, name TEXT, description TEXT, start_date DATE, end_date DATE, start_time TEXT, end_time TEXT, calendar_event_id TEXT)'
        );
        await db.execute(
            'CREATE TABLE PartiesUsers (party_id INTEGER, user_id INTEGER, PRIMARY KEY (party_id, user_id), FOREIGN KEY(party_id) REFERENCES Parties(id), FOREIGN KEY(user_id) REFERENCES Users(id))');

        // Insert sample users.
        await db.insert('Users', {'id': 1, 'name': 'John Doe', 'phone_number': '1234567890'});
        await db.insert('Users', {'id': 2, 'name': 'Jane Smith', 'phone_number': '0987654321'});

        // Insert sample parties.
        await db.insert('Parties', {
          'id': 1,
          'name': 'Birthday Party',
          'description': 'John\'s 30th birthday',
          'start_date': '2023-10-10',
          'end_date': '2023-10-10',
          'start_time': '18:00',
          'end_time': '21:00',
          'calendar_event_id': '12345'
        });
        await db.insert('Parties', {
          'id': 2,
          'name': 'Office Party',
          'description': 'Annual office gathering',
          'start_date': '2023-12-15',
          'end_date': '2023-12-16',
          'start_time': '19:00',
          'end_time': '23:00',
          'calendar_event_id': '67890'
        });

        await db.insert('PartiesUsers', {'party_id': 1, 'user_id': 1});
        await db.insert('PartiesUsers', {'party_id': 1, 'user_id': 2});
        await db.insert('PartiesUsers', {'party_id': 2, 'user_id': 2});
      },
    );
    return database;
  }
}