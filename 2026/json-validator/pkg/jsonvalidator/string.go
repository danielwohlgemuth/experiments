package jsonvalidator

import "fmt"

func StringValidator(state State) State {
	newState := State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringStart,
		},
	}
	newState = Validate(newState)
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("String validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func StringStart(state State) State {
	return StringOpenQuote(state)
}

func StringOpenQuote(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: End of input.", state.Index),
		}
	}
	var char = state.Input[state.Index]
	if !IsQuote(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			StringCloseQuote,
		},
	}
}

func StringCloseQuote(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: End of input.", state.Index),
		}
	}
	var char = state.Input[state.Index]
	if !IsQuote(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			StringStop,
		},
	}
}

func StringStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
