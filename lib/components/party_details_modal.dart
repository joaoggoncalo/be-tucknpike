import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:share_plus/share_plus.dart';
import 'package:sqflite/sqflite.dart';
import 'package:contacts_service/contacts_service.dart';
import 'package:device_calendar/device_calendar.dart';
import 'package:timezone/data/latest.dart' as tz;
import 'package:timezone/timezone.dart' as tz;
import '../utils/time_picker_util.dart';
import 'contacts_picker_modal.dart';

class PartyDetailsModal extends StatefulWidget {
  final Map<String, dynamic> party;
  final Database database;
  final VoidCallback onPartyUpdated;

  const PartyDetailsModal({
    super.key,
    required this.party,
    required this.database,
    required this.onPartyUpdated,
  });

  @override
  _PartyDetailsModalState createState() => _PartyDetailsModalState();
}

class _PartyDetailsModalState extends State<PartyDetailsModal> {
  bool _isEditing = false;
  late TextEditingController _nameController;
  late TextEditingController _descriptionController;
  late TextEditingController _startDateController;
  late TextEditingController _endDateController;
  late TextEditingController _startTimeController;
  late TextEditingController _endTimeController;
  List<Map<String, dynamic>> _partyUsers = [];
  final DeviceCalendarPlugin _deviceCalendarPlugin = DeviceCalendarPlugin();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.party['name'] ?? '');
    _descriptionController = TextEditingController(text: widget.party['description'] ?? '');
    _startDateController = TextEditingController(text: widget.party['start_date'] ?? '');
    _endDateController = TextEditingController(text: widget.party['end_date'] ?? '');
    _startTimeController = TextEditingController(text: widget.party['start_time'] ?? '');
    _endTimeController = TextEditingController(text: widget.party['end_time'] ?? '');
    _loadPartyUsers();
    tz.initializeTimeZones();
  }


  Future<void> _loadPartyUsers() async {
    final result = await widget.database.rawQuery(
      '''
      SELECT u.*
      FROM PartiesUsers pu
      LEFT JOIN Users u ON pu.user_id = u.id
      WHERE pu.party_id = ?
      ''',
      [widget.party['id']],
    );
    setState(() {
      _partyUsers = result;
    });
  }

  Future<void> _updateParty() async {
    await widget.database.update(
      'Parties',
      {
        'name': _nameController.text,
        'description': _descriptionController.text,
        'start_date': _startDateController.text,
        'end_date': _endDateController.text,
        'start_time': _startTimeController.text,
        'end_time': _endTimeController.text,
      },
      where: 'id = ?',
      whereArgs: [widget.party['id']],
    );
    await _updateCalendarEvent();
    widget.onPartyUpdated();
    Navigator.of(context).pop();
  }

  Future<void> _sendInvitation() async {
    String partyName = _nameController.text;
    String description = _descriptionController.text;
    String startDate = _startDateController.text;
    String startTime = _startTimeController.text;
    String invitationMessage =
        'You are invited to join "$partyName"!\n\nDescription: $description\nWhen: $startDate at $startTime';

    await Share.share(invitationMessage);
  }

  Future<void> _updateCalendarEvent() async {
    var permissionsGranted = await _deviceCalendarPlugin.hasPermissions();
    if (permissionsGranted.isSuccess && !permissionsGranted.data!) {
      permissionsGranted = await _deviceCalendarPlugin.requestPermissions();
      if (!permissionsGranted.isSuccess || !permissionsGranted.data!) {
        print('Calendar permissions not granted');
        return;
      }
    }

    final calendarsResult = await _deviceCalendarPlugin.retrieveCalendars();
    if (!calendarsResult.isSuccess ||
        calendarsResult.data == null ||
        calendarsResult.data!.isEmpty) {
      print('No calendars found');
      return;
    }
    final calendar = calendarsResult.data!.firstWhere(
          (cal) => cal.isDefault!,
      orElse: () => calendarsResult.data!.first,
    );

    final eventId = widget.party['calendar_event_id'] ?? '';
    final startDateParts = _startDateController.text.split('-');
    final endDateParts = _endDateController.text.split('-');
    if (startDateParts.length < 3 || endDateParts.length < 3) {
      print('Invalid date format');
      return;
    }

    TimeOfDay startTime = _parseTime(_startTimeController.text);
    TimeOfDay endTime = _parseTime(_endTimeController.text);

    final start = tz.TZDateTime(
      tz.local,
      int.parse(startDateParts[0]),
      int.parse(startDateParts[1]),
      int.parse(startDateParts[2]),
      startTime.hour,
      startTime.minute,
    );
    final end = tz.TZDateTime(
      tz.local,
      int.parse(endDateParts[0]),
      int.parse(endDateParts[1]),
      int.parse(endDateParts[2]),
      endTime.hour,
      endTime.minute,
    );

    final event = Event(calendar.id,
        eventId: eventId,
        title: _nameController.text,
        description: _descriptionController.text,
        start: start,
        end: end);

    final updateResult = await _deviceCalendarPlugin.createOrUpdateEvent(event);
    if (updateResult!.isSuccess && updateResult.data != null) {
      print('Calendar event updated: ${updateResult.data}');
    } else {
      print('Failed to update calendar event ${updateResult.errors.first.errorMessage}');
    }
  }

  TimeOfDay _parseTime(String timeStr) {
    DateFormat format = DateFormat("hh:mm a");
    DateTime parsedTime = format.parse(timeStr);
    return TimeOfDay(hour: parsedTime.hour, minute: parsedTime.minute);
  }

  Future<void> _pickContactAndAdd() async {
    final Contact? selected = await showDialog<Contact>(
      context: context,
      builder: (context) => const ContactsPickerModal(),
    );
    if (selected != null) {
      int userId = await _insertUser(selected);
      await widget.database.insert('PartiesUsers', {
        'party_id': widget.party['id'],
        'user_id': userId,
      });
      _loadPartyUsers();
    }
  }

  Future<int> _insertUser(Contact contact) async {
    String phone = (contact.phones != null && contact.phones!.isNotEmpty)
        ? contact.phones!.first.value ?? ''
        : '';
    List<Map<String, dynamic>> existing = await widget.database.query(
      'Users',
      where: 'phone_number = ?',
      whereArgs: [phone],
    );
    if (existing.isNotEmpty) {
      return existing.first['id'];
    } else {
      return await widget.database.insert('Users', {
        'name': contact.displayName ?? '',
        'phone_number': phone,
      });
    }
  }

  Future<void> _removePartyUser(int userId) async {
    await widget.database.delete(
      'PartiesUsers',
      where: 'party_id = ? AND user_id = ?',
      whereArgs: [widget.party['id'], userId],
    );
    _loadPartyUsers();
  }

  Future<void> _selectTime(BuildContext context, bool isStartTime) async {
    final TimeOfDay? picked = await selectTime(
      context,
      isStartTime ? TimeOfDay.now() : TimeOfDay.now(),
    );
    if (picked != null) {
      setState(() {
        if (isStartTime) {
          _startTimeController.text = picked.format(context);
        } else {
          _endTimeController.text = picked.format(context);
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    String startDate = widget.party['start_date'] ?? '';
    String endDate = widget.party['end_date'] ?? '';
    String dateDisplay = startDate == endDate
        ? 'Date: $startDate'
        : 'Date: $startDate \\u2013 $endDate';

    return AlertDialog(
      title: _isEditing
          ? TextField(controller: _nameController)
          : Text(widget.party['name'] ?? ''),
      content: SingleChildScrollView(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _isEditing
                ? TextField(controller: _descriptionController)
                : Text('Description: ${widget.party['description'] ?? ''}'),
            _isEditing
                ? TextField(
                controller: _startDateController,
                decoration: const InputDecoration(labelText: 'Start Date'))
                : Text(dateDisplay),
            if (_isEditing)
              TextField(
                  controller: _endDateController,
                  decoration:
                  const InputDecoration(labelText: 'End Date')),
            _isEditing
                ? TextFormField(
              controller: _startTimeController,
              readOnly: true,
              onTap: () => _selectTime(context, true),
              decoration:
              const InputDecoration(labelText: 'Start Time'),
            )
                : Text('Start Time: ${widget.party['start_time'] ?? ''}'),
            _isEditing
                ? TextFormField(
              controller: _endTimeController,
              readOnly: true,
              onTap: () => _selectTime(context, false),
              decoration:
              const InputDecoration(labelText: 'End Time'),
            )
                : Text('End Time: ${widget.party['end_time'] ?? ''}'),
            const SizedBox(height: 20),
            const Text('Users:', style: TextStyle(fontWeight: FontWeight.bold)),
            _isEditing
                ? Column(
              children: [
                for (var user in _partyUsers)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(user['name'] ?? ''),
                    subtitle: Text(user['phone_number'] ?? ''),
                    trailing: IconButton(
                      icon: const Icon(Icons.remove_circle, color: Colors.red),
                      onPressed: () => _removePartyUser(user['id']),
                    ),
                  ),
                TextButton(
                  onPressed: _pickContactAndAdd,
                  child: const Text('Add Contact'),
                ),
              ],
            )
                : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                for (var user in _partyUsers)
                  Text('${user['name'] ?? ''} - ${user['phone_number'] ?? ''}'),
                const SizedBox(height: 10),
                ElevatedButton(
                  onPressed: _sendInvitation,
                  child: const Text('Send Invitation'),
                ),
              ],
            ),
          ],
        ),
      ),
      actions: [
        if (_isEditing)
          TextButton(
            onPressed: () {
              setState(() {
                _isEditing = false;
              });
            },
            child: const Text('Cancel'),
          ),
        if (_isEditing)
          ElevatedButton(
            onPressed: _updateParty,
            child: const Text('Confirm'),
          ),
        if (!_isEditing)
          ElevatedButton(
            onPressed: () {
              setState(() {
                _isEditing = true;
              });
              _loadPartyUsers();
            },
            child: const Text('Edit'),
          ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text('Close'),
        ),
      ],
    );
  }
}