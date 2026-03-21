package jsonvalidator

import (
	"fmt"
)

func ArrayValidator(state State) State {
	newState := State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{ArrayStart},
	}
	newState = Validate(newState)
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Array validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func ArrayStart(state State) State {
	return ArrayOpenBracket(state)
}

func ArrayOpenBracket(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: [ at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsOpenBracket(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: [ at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ArrayWhitespace,
			ArrayValue,
		},
	})
}

func ArrayWhitespace(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ArrayCloseBracket},
	})
}

func ArrayValue(state State) State {
	newState := ValueValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ArrayCloseBracket, ArrayComma},
	})
}

func ArrayComma(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: , at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsComma(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: , at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ArrayValue,
		},
	})
}

func ArrayCloseBracket(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: ] at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsCloseBracket(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: ] at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ArrayStop,
		},
	})
}

func ArrayStop(state State) State {
	return Validate(State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	})
}
