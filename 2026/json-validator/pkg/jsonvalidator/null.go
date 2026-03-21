package jsonvalidator

import "fmt"

func NullValidator(state State) State {
	newState := Validate(State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			NullStart,
		},
	})
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Null validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func NullStart(state State) State {
	return NullN(state)
}

func NullN(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: n at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsN(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: n at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			NullU,
		},
	})
}

func NullU(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: u at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsU(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: u at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			NullL,
		},
	})
}

func NullL(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: l at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsL(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: l at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			NullLN2,
		},
	})
}

func NullLN2(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: l at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsL(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: l at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			NullStop,
		},
	})
}

func NullStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
