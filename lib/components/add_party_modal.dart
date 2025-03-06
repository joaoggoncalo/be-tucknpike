import 'package:flutter/material.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:sqflite/sqflite.dart';
import 'package:contacts_service/contacts_service.dart';
import 'package:device_calendar/device_calendar.dart';
import 'package:timezone/timezone.dart' as tz;

import '../utils/time_picker_util.dart';
import 'contacts_picker_modal.dart';

class AddPartyModal extends StatefulWidget {
  final Database database;
  final VoidCallback onPartyAdded;

  const AddPartyModal({super.key, required this.database, required this.onPartyAdded});

  @override
  _AddPartyModalState createState() => _AddPartyModalState();
}

class _AddPartyModalState extends State<AddPartyModal> {
  List<Contact>? contacts;
  final _formKey = GlobalKey<FormState>();
  String _name = '';
  String _description = '';
  DateTime _date = DateTime.now();
  DateTime _endDate = DateTime.now();
  TimeOfDay _startTime = TimeOfDay.now();
  TimeOfDay _endTime = TimeOfDay.now().replacing(hour: (TimeOfDay.now().hour + 2) % 24);
  final DeviceCalendarPlugin _deviceCalendarPlugin = DeviceCalendarPlugin();
  final List<Contact> _selectedContacts = [];

  Future<void> requestContactsPermission() async {
    final status = await Permission.contacts.request();
    if (!status.isGranted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Permission denied')),
      );
    }
  }

  void loadContacts() async {
    final status = await Permission.contacts.status;
    if (status.isGranted) {
      contacts = await ContactsService.getContacts();
      setState(() {});
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Permission granted')),
      );
    } else {
      await requestContactsPermission();
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

  Future<void> _addParty() async {
    if (_formKey.currentState!.validate()) {
      _formKey.currentState!.save();
      try {
        int partyId = await widget.database.insert('Parties', {
          'name': _name,
          'description': _description,
          'start_date': _date.toLocal().toString().split(' ')[0],
          'end_date': _endDate.toLocal().toString().split(' ')[0],
          'start_time': _startTime.format(context),
          'end_time': _endTime.format(context),
        });

        String? calendarEventId = await _addToCalendar();

        await widget.database.update(
          'Parties',
          {'calendar_event_id': calendarEventId},
          where: 'id = ?',
          whereArgs: [partyId],
        );

        for (var contact in _selectedContacts) {
          int userId = await _insertUser(contact);
          await widget.database.insert('PartiesUsers', {
            'party_id': partyId,
            'user_id': userId,
          });
        }

        widget.onPartyAdded();
        Navigator.of(context).pop();
      } catch (e) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to add party: $e')),
        );
      }
    }
  }

  Future<String?> _addToCalendar() async {
    var permissionsGranted = await _deviceCalendarPlugin.hasPermissions();
    if (permissionsGranted.isSuccess && !permissionsGranted.data!) {
      permissionsGranted = await _deviceCalendarPlugin.requestPermissions();
      if (!permissionsGranted.isSuccess || !permissionsGranted.data!) {
        return null;
      }
    }

    final calendarsResult = await _deviceCalendarPlugin.retrieveCalendars();
    if (!calendarsResult.isSuccess ||
        calendarsResult.data == null ||
        calendarsResult.data!.isEmpty) {
      return null;
    }

    final calendar = calendarsResult.data!.firstWhere(
          (cal) => cal.isDefault!,
      orElse: () => calendarsResult.data!.first,
    );

    final start = tz.TZDateTime(tz.local, _date.year, _date.month, _date.day, _startTime.hour, _startTime.minute);
    final end = tz.TZDateTime(tz.local, _endDate.year, _endDate.month, _endDate.day, _endTime.hour, _endTime.minute);

    final event = Event(
      calendar.id,
      title: _name,
      description: _description,
      start: start,
      end: end,
    );

    final createEventResult = await _deviceCalendarPlugin.createOrUpdateEvent(event);
    if (createEventResult!.isSuccess && createEventResult.data != null) {
      return createEventResult.data;
    } else {
      return null;
    }
  }

  Future<void> _pickContact() async {
    final Contact? selected = await showDialog<Contact>(
      context: context,
      builder: (context) => const ContactsPickerModal(),
    );
    if (selected != null) {
      setState(() {
        _selectedContacts.add(selected);
      });
    }
  }

  Future<void> _selectTime(BuildContext context, bool isStartTime) async {
    final TimeOfDay? picked = await selectTime(context, isStartTime ? _startTime : _endTime);
    if (picked != null) {
      setState(() {
        if (isStartTime) {
          _startTime = picked;
        } else {
          _endTime = picked;
        }
      });
    }
  }

  Future<void> _selectDate(BuildContext context, bool isEndDate) async {
    DateTime initialDate = isEndDate ? _endDate : _date;
    DateTime? pickedDate = await showDatePicker(
      context: context,
      initialDate: initialDate,
      firstDate: DateTime(2000),
      lastDate: DateTime(2101),
    );
    if (pickedDate != null) {
      setState(() {
        if (isEndDate) {
          _endDate = pickedDate;
        } else {
          _date = pickedDate;
        }
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Add Party'),
      content: Form(
        key: _formKey,
        child: SingleChildScrollView(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: <Widget>[
              TextFormField(
                decoration: const InputDecoration(labelText: 'Name'),
                validator: (value) => (value == null || value.isEmpty) ? 'Please enter a name' : null,
                onSaved: (value) {
                  _name = value!;
                },
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Description'),
                validator: (value) => (value == null || value.isEmpty) ? 'Please enter a description' : null,
                onSaved: (value) {
                  _description = value!;
                },
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Start Date'),
                readOnly: true,
                onTap: () => _selectDate(context, false),
                controller: TextEditingController(text: _date.toLocal().toString().split(' ')[0]),
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'End Date'),
                readOnly: true,
                onTap: () => _selectDate(context, true),
                controller: TextEditingController(text: _endDate.toLocal().toString().split(' ')[0]),
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'Start Time'),
                readOnly: true,
                onTap: () => _selectTime(context, true),
                controller: TextEditingController(text: _startTime.format(context)),
              ),
              TextFormField(
                decoration: const InputDecoration(labelText: 'End Time'),
                readOnly: true,
                onTap: () => _selectTime(context, false),
                controller: TextEditingController(text: _endTime.format(context)),
              ),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: _pickContact,
                child: const Text('Add Contact'),
              ),
              if (_selectedContacts.isNotEmpty) ...[
                const SizedBox(height: 10),
                const Text('Selected Contacts:', style: TextStyle(fontWeight: FontWeight.bold)),
                for (var contact in _selectedContacts)
                  ListTile(
                    contentPadding: EdgeInsets.zero,
                    title: Text(contact.displayName ?? ''),
                    subtitle: Text((contact.phones != null && contact.phones!.isNotEmpty)
                        ? contact.phones!.first.value ?? ''
                        : ''),
                  ),
              ],
            ],
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: const Text('Cancel'),
        ),
        ElevatedButton(
          onPressed: _addParty,
          child: const Text('Add'),
        ),
      ],
    );
  }
}