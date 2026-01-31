import 'dart:math';

import 'package:flutter/material.dart';

class Item {
  String keys;

  Item(this.keys);

  bool filter(String key, bool choice) {
    return choice ? keys.contains(key) : !keys.contains(key);
  }

  @override
  String toString() {
    return 'Item(keys: $keys)';
  }
}

class Decision {
  String question;
  String key;

  Decision(this.question, this.key);

  String getQuestion() {
    return question;
  }

  String getKey() {
    return key;
  }

  String getDecisionType() {
    return key.split(':')[0];
  }

  @override
  String toString() {
    return 'Decision(question: $question, key: $key)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Decision && other.question == question && other.key == key;
  }

  @override
  int get hashCode => question.hashCode ^ key.hashCode;

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

class TreeNode {
  Decision? decision;
  List<Item> items;
  TreeNode? yesChild;
  TreeNode? noChild;
  Set<String> usedDecisionTypes;
  Set<Decision> usedDecisions;

  TreeNode({
    this.decision,
    required this.items,
    this.yesChild,
    this.noChild,
    this.usedDecisionTypes = const {},
    this.usedDecisions = const {},
  });
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

  List<Decision> allDecisions = [];
  TreeNode? root;

  @override
  void initState() {
    super.initState();
    _generateDecisions();
    _buildTree();
  }

  void _generateDecisions() {
    allDecisions = [
      ...Decision.generateShapeDecisions(shapes),
      ...Decision.generateColorDecisions(colors),
      ...Decision.generateFilledDecisions(),
      ...Decision.generateDashedDecisions(),
    ];
  }

  void _buildTree() {
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

    root = _buildDecisionTree(items, <String>{}, <Decision>{});
  }

  TreeNode _buildDecisionTree(
    List<Item> items,
    Set<String> usedDecisionTypes,
    Set<Decision> usedDecisions,
  ) {
    if (items.length <= 1) {
      return TreeNode(
        items: items,
        usedDecisionTypes: usedDecisionTypes,
        usedDecisions: usedDecisions,
      );
    }

    List<Decision> availableDecisions = allDecisions
        .where((d) => !usedDecisionTypes.contains(d.getDecisionType()))
        .where((d) => !usedDecisions.contains(d))
        .toList();

    if (availableDecisions.isEmpty) {
      return TreeNode(
        items: items,
        usedDecisionTypes: usedDecisionTypes,
        usedDecisions: usedDecisions,
      );
    }

    Decision bestDecision = _findBestDecision(items, availableDecisions);

    List<Item> yesItems = items
        .where((item) => item.filter(bestDecision.getKey(), true))
        .toList();
    List<Item> noItems = items
        .where((item) => item.filter(bestDecision.getKey(), false))
        .toList();

    TreeNode yesChild = _buildDecisionTree(
      yesItems,
      {...usedDecisionTypes, bestDecision.getDecisionType()},
      {...usedDecisions, bestDecision},
    );

    TreeNode noChild = _buildDecisionTree(noItems, usedDecisionTypes, {
      ...usedDecisions,
      bestDecision,
    });

    return TreeNode(
      decision: bestDecision,
      items: items,
      yesChild: yesChild,
      noChild: noChild,
      usedDecisionTypes: usedDecisionTypes,
      usedDecisions: usedDecisions,
    );
  }

  Decision _findBestDecision(
    List<Item> items,
    List<Decision> availableDecisions,
  ) {
    if (availableDecisions.isEmpty) {
      throw Exception('No available decisions');
    }

    Decision bestDecision = availableDecisions.first;
    double bestScore = _calculateDecisionScore(items, bestDecision);

    for (final decision in availableDecisions.skip(1)) {
      double score = _calculateDecisionScore(items, decision);
      if (score > bestScore) {
        bestScore = score;
        bestDecision = decision;
      }
    }

    return bestDecision;
  }

  double _calculateDecisionScore(List<Item> items, Decision decision) {
    List<Item> yesItems = items
        .where((item) => item.filter(decision.getKey(), true))
        .toList();
    List<Item> noItems = items
        .where((item) => item.filter(decision.getKey(), false))
        .toList();

    int yesCount = yesItems.length;
    int noCount = noItems.length;
    int totalCount = items.length;

    if (yesCount == 0 || noCount == 0) return 0.0;

    double yesEntropy =
        -(yesCount / totalCount) * log(yesCount / totalCount) / log(2);
    double noEntropy =
        -(noCount / totalCount) * log(noCount / totalCount) / log(2);

    return 1.0 - (yesEntropy + noEntropy);
  }

  void _reset() {
    setState(() {
      _generateDecisions();
      _buildTree();
    });
  }

  @override
  Widget build(BuildContext context) {
    if (root == null) {
      return const Center(child: CircularProgressIndicator());
    }

    return Column(
      children: [
        ElevatedButton(onPressed: _reset, child: const Text('Reset')),
        const SizedBox(height: 16),
        Expanded(child: SingleChildScrollView(child: _buildTreeWidget(root!))),
      ],
    );
  }

  Widget _buildTreeWidget(TreeNode node, {int depth = 0}) {
    if (node.decision == null) {
      return Padding(
        padding: EdgeInsets.only(left: depth * 20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            if (node.items.isEmpty)
              const Text('No items match', style: TextStyle(color: Colors.red))
            else
              Container(
                width: 200,
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  border: Border.all(color: Colors.grey.shade300),
                  borderRadius: BorderRadius.circular(4.0),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: node.items
                      .map(
                        (item) => Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: item.keys
                              .split(',')
                              .map(
                                (attribute) => Padding(
                                  padding: const EdgeInsets.symmetric(
                                    vertical: 1.0,
                                  ),
                                  child: Text(
                                    attribute.trim(),
                                    style: const TextStyle(
                                      fontSize: 11,
                                      color: Colors.black87,
                                    ),
                                  ),
                                ),
                              )
                              .toList(),
                        ),
                      )
                      .toList(),
                ),
              ),
          ],
        ),
      );
    }

    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Padding(
        padding: EdgeInsets.only(left: depth * 20.0),
        child: Column(
          children: [
            Center(
              child: Container(
                padding: const EdgeInsets.all(8.0),
                decoration: BoxDecoration(
                  color: Colors.blue.shade50,
                  border: Border.all(color: Colors.blue.shade200),
                  borderRadius: BorderRadius.circular(8.0),
                ),
                child: Text(
                  node.decision!.getQuestion(),
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            ),
            const SizedBox(height: 16),
            if (node.yesChild != null || node.noChild != null)
              IntrinsicHeight(
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    if (node.yesChild != null)
                      Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                              vertical: 4.0,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.green.shade100,
                              borderRadius: BorderRadius.circular(4.0),
                            ),
                            child: const Text(
                              'Yes',
                              style: TextStyle(
                                color: Colors.green,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          _buildTreeWidget(node.yesChild!, depth: depth + 1),
                        ],
                      ),
                    if (node.yesChild != null && node.noChild != null)
                      const SizedBox(width: 16),
                    if (node.noChild != null)
                      Column(
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: 8.0,
                              vertical: 4.0,
                            ),
                            decoration: BoxDecoration(
                              color: Colors.red.shade100,
                              borderRadius: BorderRadius.circular(4.0),
                            ),
                            child: const Text(
                              'No',
                              style: TextStyle(
                                color: Colors.red,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ),
                          _buildTreeWidget(node.noChild!, depth: depth + 1),
                        ],
                      ),
                  ],
                ),
              ),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}
