import 'package:flutter/material.dart';



class DecisionTree extends StatelessWidget {
	const DecisionTree({super.key});

	final List<String> shapes = const ['circle', 'square', 'triangle', 'hexagon'];
	final List<String> colors = const ['red', 'green', 'blue'];
	final List<Boolean> filled_values = const [true, false];
	final List<Boolean> dashed_values = const [true, false];

	@override
	Widget build(BuildContext context) {
		List<Widget> widgets = [];
		for (final shape in shapes) {
			widgets.add(Text(shape));
		}
		return Column(
			children: widgets,
		);
	}
}

