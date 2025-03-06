import 'package:flutter/material.dart';

Future<TimeOfDay?> selectTime(BuildContext context, TimeOfDay initialTime) async {
  return await showTimePicker(
    context: context,
    initialTime: initialTime,
  );
}