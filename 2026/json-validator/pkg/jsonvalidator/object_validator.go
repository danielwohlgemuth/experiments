package jsonvalidator

import (
	"fmt"
)

func ObjectOpenBrace(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			error: fmt.Sprintf("Expected: { at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsOpenBrace(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{ObjectCloseBrace},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: { at index %d. Found: %c.", state.Index, char),
	}
}

func ObjectCloseBrace(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			error: fmt.Sprintf("Expected: } at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsCloseBrace(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			validators: []func(State) State{ObjectStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		error: fmt.Sprintf("Expected: } at index %d. Found: %c.", state.Index, char),
	}
}

func ObjectStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		complete: true,
	}
}
