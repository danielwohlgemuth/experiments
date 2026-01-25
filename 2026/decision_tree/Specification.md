# Decision Tree

This app shows how a decision tree works.

A decision tree is a data structure where each internal node (including the root node) represents a decision that needs to be taken that then leads to another internal node or a leaf node. The leaf node represents the final answer or solution.

This project was inspired by the game called [Akinator](https://en.wikipedia.org/wiki/Akinator) played through Alexa where the player thinks of a character, object, or animal, and Alexa asks a series of Yes/No questions until it's confident enough to guess the character.

## Goals

- Show how each decision moves closer to the final solution.
- Show how each decision reduces the remaining options.

## Approach

The solutions will be represented by a predefined set of attributes like shapes, colors, whether the shapes are outlined or filled out, and whether the border is a continuous line or a dashed line.

The decisions will be formulated as Yes/No questions and be based off of the attributes and one of its values. For example, using the shape "round", the question could be "Does it have a round shape?"

The outcome of the decision will be used to filter the options. Answering with Yes will include the attribute and value, while answering with No will exclude that combination. 


