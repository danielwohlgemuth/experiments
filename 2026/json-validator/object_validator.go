package main

import (
	"fmt"
)

func ObjectOpenBrace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: { at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsOpenBrace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ObjectCloseBrace},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: { at index %d. Found: %c.", state.index, char),
	}
}

func ObjectCloseBrace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: } at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsCloseBrace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ObjectStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: } at index %d. Found: %c.", state.index, char),
	}
}

func ObjectStop(state State) State {
	return State{
		input:    state.input,
		index:    state.index,
		complete: true,
	}
}
