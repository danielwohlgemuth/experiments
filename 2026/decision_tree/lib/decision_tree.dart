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

class DecisionTree extends StatelessWidget {
  const DecisionTree({super.key});

  final List<String> shapes = const ['circle', 'square', 'triangle', 'hexagon'];
  final List<String> colors = const ['red', 'green', 'blue'];
  final List<String> filledValues = const ['true', 'false'];
  final List<String> dashedValues = const ['true', 'false'];

  @override
  Widget build(BuildContext context) {
    List<Widget> widgets = [];
    for (final decision in Decision.generateShapeDecisions(shapes)) {
      widgets.add(Text(decision.getQuestion()));
    }
    for (final decision in Decision.generateColorDecisions(colors)) {
      widgets.add(Text(decision.getQuestion()));
    }
    for (final decision in Decision.generateFilledDecisions()) {
      widgets.add(Text(decision.getQuestion()));
    }
    for (final decision in Decision.generateDashedDecisions()) {
      widgets.add(Text(decision.getQuestion()));
    }

    for (final shape in shapes) {
      for (final color in colors) {
        widgets.add(Text('shape:$shape,color:$color'));
      }
    }
    return Column(children: widgets);
  }
}
