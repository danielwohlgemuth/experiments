package jsonvalidator

import (
	"fmt"
)

func ObjectValidator(state State) State {
	newState := State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{ObjectStart},
	}
	newState = Validate(newState)
	if !IsPartValid(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Object validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func ObjectStart(state State) State {
	return ObjectOpenBrace(state)
}

func ObjectOpenBrace(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: { at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsOpenBrace(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{ObjectWhitespace},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: { at index %d. Found: %c.", state.Index, char),
	}
}

func ObjectWhitespace(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ObjectCloseBrace},
	}
}

func ObjectCloseBrace(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: } at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsCloseBrace(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{ObjectStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: } at index %d. Found: %c.", state.Index, char),
	}
}

func ObjectStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
