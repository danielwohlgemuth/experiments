package jsonvalidator

import (
	"fmt"
)

func WhitespaceSpace(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			error: fmt.Sprintf("Expected: \" \" at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsSpace(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: \" \" at index %d. Found: %c.", state.Index, char),
	}
}

func WhitespaceLinefeed(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			error: fmt.Sprintf("Expected: \\n at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsLinefeed(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: \\n at index %d. Found: %c.", state.Index, char),
	}
}

func WhitespaceCarriageReturn(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			error: fmt.Sprintf("Expected: \\r at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsCarriageReturn(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: \\r at index %d. Found: %c.", state.Index, char),
	}
}

func WhitespaceHorizontalTab(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index + 1,
			error: fmt.Sprintf("Expected: \\t at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsHorizontalTab(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: \\t at index %d. Found: %c.", state.Index, char),
	}
}

func WhitespaceStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		complete: true,
	}
}
