package jsonvalidator

import (
	"fmt"
)

func ObjectValidator(state State) State {
	newState := Validate(State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			ObjectStart,
		},
	})
	if !IsNoErrorAndComplete(newState) {
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
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: { at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsOpenBrace(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: { at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ObjectWhitespace,
			ObjectWhitespaceN2,
		},
	})
}

func ObjectWhitespace(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input: newState.Input,
		Index: newState.Index,
		Validators: []func(State) State{
			ObjectCloseBrace,
		},
	})
}

func ObjectWhitespaceN2(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input: newState.Input,
		Index: newState.Index,
		Validators: []func(State) State{
			ObjectString,
		},
	})
}

func ObjectWhitespaceN3(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input: newState.Input,
		Index: newState.Index,
		Validators: []func(State) State{
			ObjectColon,
		},
	})
}

func ObjectString(state State) State {
	newState := StringValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input: newState.Input,
		Index: newState.Index,
		Validators: []func(State) State{
			ObjectWhitespaceN3,
		},
	})
}

func ObjectColon(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: : at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsColon(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: : at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ObjectValue,
		},
	})
}

func ObjectValue(state State) State {
	newState := ValueValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input: newState.Input,
		Index: newState.Index,
		Validators: []func(State) State{
			ObjectComma,
			ObjectCloseBrace,
		},
	})
}

func ObjectComma(state State) State {
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
			ObjectWhitespaceN2,
		},
	})
}

func ObjectCloseBrace(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: } at index %d. Found: End of input.", state.Index),
		}
	}

	char := state.Input[state.Index]
	if !IsCloseBrace(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: } at index %d. Found: %c.", state.Index, char),
		}
	}

	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			ObjectStop,
		},
	})
}

func ObjectStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
