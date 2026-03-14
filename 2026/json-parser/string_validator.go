package main

import (
	"fmt"
)

func WhitespaceSpace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \" \" at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsSpace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \" \" at index %d. Found: %c.", state.index, char),
	}
}

func WhitespaceLinefeed(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \\n at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsLinefeed(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\n at index %d. Found: %c.", state.index, char),
	}
}

func WhitespaceCarriageReturn(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \\r at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsCarriageReturn(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\r at index %d. Found: %c.", state.index, char),
	}
}

func WhitespaceHorizontalTab(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index + 1,
			error: fmt.Sprintf("Expected: \\t at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsHorizontalTab(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\t at index %d. Found: %c.", state.index, char),
	}
}

func WhitespaceStop(state State) State {
	return State{
		input:    state.input,
		index:    state.index,
		complete: true,
	}
}
