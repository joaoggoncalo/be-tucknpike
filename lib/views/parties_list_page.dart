import 'package:contacts_service/contacts_service.dart';
import 'package:flutter/material.dart';
import 'package:sqflite/sqflite.dart';
import '../components/add_party_modal.dart';
import '../components/party_details_modal.dart';

class PartiesListPage extends StatefulWidget {
  final Database database;
  const PartiesListPage({super.key, required this.database});

  @override
  _PartiesListPageState createState() => _PartiesListPageState();
}

class _PartiesListPageState extends State<PartiesListPage> {
  Future<List<Map<String, dynamic>>>? _futureRows;
  List<Contact>? contacts;

  @override
  void initState() {
    super.initState();
    _futureRows = getRows();
  }

  Future<List<Map<String, dynamic>>> getRows() async {
    final rows = await widget.database.rawQuery(
        '''
    SELECT p.*, 
           GROUP_CONCAT(u.name, ', ') AS user_names, 
           GROUP_CONCAT(u.phone_number, ', ') AS phone_numbers 
    FROM Parties AS p
    LEFT JOIN PartiesUsers AS pu ON p.id = pu.party_id
    LEFT JOIN Users AS u ON pu.user_id = u.id
    GROUP BY p.id
    '''
    );
    print('rows: $rows');
    return rows;
  }

  void _refreshList() {
    setState(() {
      _futureRows = getRows();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Parties List'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: () {
              showDialog(
                context: context,
                builder: (context) => AddPartyModal(
                  database: widget.database,
                  onPartyAdded: _refreshList,
                ),
              );
            },
          ),
        ],
      ),
      body: FutureBuilder<List<Map<String, dynamic>>>(
        future: _futureRows,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return Center(child: CircularProgressIndicator());
          } else if (snapshot.hasError) {
            return Center(child: Text('Error: ${snapshot.error}'));
          } else {
            final rows = snapshot.data ?? [];
            return ListView.builder(
              itemCount: rows.length,
              itemBuilder: (context, index) {
                final row = rows[index];
                return ListTile(
                  title: Text(row['name']),
                  subtitle: Text(
                      '${row['description']}\n${row['start_time']} - ${row['end_time']}'),
                  trailing: Text(
                    row['start_date'] == row['end_date']
                        ? row['start_date']
                        : '${row['start_date']} - ${row['end_date']}',
                  ),
                  onTap: () {
                    showDialog(
                      context: context,
                      builder: (context) => PartyDetailsModal(
                        party: row,
                        database: widget.database,
                        onPartyUpdated: _refreshList,
                      ),
                    );
                  },
                );
              },
            );
          }
        },
      ),
    );
  }
}