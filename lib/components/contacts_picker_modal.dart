import 'package:flutter/material.dart';
import 'package:contacts_service/contacts_service.dart';
import 'package:permission_handler/permission_handler.dart';

class ContactsPickerModal extends StatefulWidget {
  const ContactsPickerModal({Key? key}) : super(key: key);

  @override
  _ContactsPickerModalState createState() => _ContactsPickerModalState();
}

class _ContactsPickerModalState extends State<ContactsPickerModal> {
  List<Contact>? _contacts;

  @override
  void initState() {
    super.initState();
    _loadContacts();
  }

  Future<void> _requestContactsPermission() async {
    final status = await Permission.contacts.request();
    if (!status.isGranted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Permission denied')),
      );
    }
  }

  Future<void> _loadContacts() async {
    final status = await Permission.contacts.status;
    if (status.isGranted) {
      final contacts = await ContactsService.getContacts();
      setState(() {
        _contacts = contacts;
      });
    } else {
      await _requestContactsPermission();
      _loadContacts();
    }
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      title: const Text('Select Contact'),
      content: _contacts == null
          ? const Center(child: CircularProgressIndicator())
          : SizedBox(
        width: double.maxFinite,
        height: 300,
        child: ListView.builder(
          itemCount: _contacts!.length,
          itemBuilder: (context, index) {
            final contact = _contacts![index];
            return ListTile(
              title: Text(contact.displayName ?? 'No name'),
              subtitle: Text(contact.phones!.isNotEmpty
                  ? contact.phones!.first.value ?? ''
                  : ''),
              onTap: () {
                Navigator.pop(context, contact);
              },
            );
          },
        ),
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel'),
        ),
      ],
    );
  }
}