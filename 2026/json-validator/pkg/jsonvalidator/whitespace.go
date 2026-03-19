package jsonvalidator

import (
	"fmt"
)

func WhitespaceValidator(state State) State {
	newState := State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			WhitespaceStart,
		},
	}
	newState = Validate(newState)
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Whitespace validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func WhitespaceStart(state State) State {
	return State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
	}
}

func WhitespaceSpace(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" \" at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if !IsSpace(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" \" at index %d. Found: %c.", state.Index, char),
		}
	}

	return State{
		Input:      state.Input,
		Index:      state.Index + 1,
		Validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
	}
}

func WhitespaceLinefeed(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\n at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if !IsLinefeed(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\n at index %d. Found: %c.", state.Index, char),
		}
	}

	return State{
		Input:      state.Input,
		Index:      state.Index + 1,
		Validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
	}
}

func WhitespaceCarriageReturn(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\r at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if !IsCarriageReturn(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\r at index %d. Found: %c.", state.Index, char),
		}
	}

	return State{
		Input:      state.Input,
		Index:      state.Index + 1,
		Validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
	}
}

func WhitespaceHorizontalTab(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index + 1,
			Error: fmt.Sprintf("Expected: \\t at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if !IsHorizontalTab(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\t at index %d. Found: %c.", state.Index, char),
		}
	}

	return State{
		Input:      state.Input,
		Index:      state.Index + 1,
		Validators: []func(State) State{WhitespaceSpace, WhitespaceLinefeed, WhitespaceCarriageReturn, WhitespaceHorizontalTab, WhitespaceStop},
	}
}

func WhitespaceStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
