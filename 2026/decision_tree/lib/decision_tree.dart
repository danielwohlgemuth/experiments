import 'dart:math';

import 'package:flutter/material.dart';

class Item {
  String keys;

  Item(this.keys);

  bool filter(String key, bool choice) {
    return choice ? keys.contains(key) : !keys.contains(key);
  }
}

class Decision {
  String question;
  String key;

  Decision(this.question, this.key);

  String getQuestion() {
    return this.question;
  }

  String getKey() {
    return this.key;
  }

  static List<Decision> generateShapeDecisions(List<String> shapes) {
    var excludedIndex = Random().nextInt(shapes.length);
    List<Decision> decisions = [];
    for (final (index, shape) in shapes.indexed) {
      if (index == excludedIndex) {
        continue;
      }
      var decision = Decision('Is it a $shape?', 'shape:$shape');
      decisions.add(decision);
    }
    return decisions;
  }

  static List<Decision> generateColorDecisions(List<String> colors) {
    var excludedIndex = Random().nextInt(colors.length);
    List<Decision> decisions = [];
    for (final (index, color) in colors.indexed) {
      if (index == excludedIndex) {
        continue;
      }
      var decision = Decision('Is it $color?', 'color:$color');
      decisions.add(decision);
    }
    return decisions;
  }

  static List<Decision> generateFilledDecisions() {
    List<Decision> decisions = [];
    var decision = Decision('Is it filled?', 'filled:true');
    decisions.add(decision);
    return decisions;
  }

  static List<Decision> generateDashedDecisions() {
    List<Decision> decisions = [];
    var decision = Decision('Is the border dashed?', 'dashed:true');
    decisions.add(decision);
    return decisions;
  }
}

class DecisionTree extends StatefulWidget {
  const DecisionTree({super.key});

  @override
  State<DecisionTree> createState() => _DecisionTreeState();
}

class _DecisionTreeState extends State<DecisionTree> {
  final List<String> shapes = const ['circle', 'square', 'triangle', 'hexagon'];
  final List<String> colors = const ['red', 'green', 'blue'];
  final List<String> filledValues = const ['true', 'false'];
  final List<String> dashedValues = const ['true', 'false'];

  Map<String, bool?> selections = {};
  List<Decision> allDecisions = [];

  @override
  void initState() {
    super.initState();
    _generateDecisions();
  }

  void _generateDecisions() {
    allDecisions = [
      ...Decision.generateShapeDecisions(shapes),
      ...Decision.generateColorDecisions(colors),
      ...Decision.generateFilledDecisions(),
      ...Decision.generateDashedDecisions(),
    ];
  }

  void _reset() {
    setState(() {
      selections.clear();
      _generateDecisions();
    });
  }

  @override
  Widget build(BuildContext context) {
    List<Decision> visibleDecisions = allDecisions;

    List<Item> items = [];
    for (final shape in shapes) {
      for (final color in colors) {
        for (final filled in filledValues) {
          for (final dashed in dashedValues) {
            items.add(
              Item('shape:$shape,color:$color,filled:$filled,dashed:$dashed'),
            );
          }
        }
      }
    }

    List<Item> filteredItems = items.where((item) {
      for (final entry in selections.entries) {
        if (entry.value != null) {
          if (!item.filter(entry.key, entry.value!)) {
            return false;
          }
        }
      }
      return true;
    }).toList();

    return Column(
      children: [
        ElevatedButton(onPressed: _reset, child: const Text('Reset')),
        const SizedBox(height: 16),
        ...visibleDecisions.map((decision) => _buildDecisionWidget(decision)),
        const Divider(),
        const Text('Results', style: TextStyle(fontWeight: FontWeight.bold)),
        ...filteredItems.map((item) => Text(item.keys)),
      ],
    );
  }

  Widget _buildDecisionWidget(Decision decision) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4.0),
      child: Row(
        children: [
          Expanded(child: Text(decision.getQuestion())),
          RadioGroup<bool>(
            groupValue: selections[decision.getKey()],
            onChanged: (value) {
              setState(() {
                selections[decision.getKey()] = value;
              });
            },
            child: Row(
              children: [
                Radio<bool>(value: true),
                const Text('Yes'),
                Radio<bool>(value: false),
                const Text('No'),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
