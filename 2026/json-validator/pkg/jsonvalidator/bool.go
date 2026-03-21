package jsonvalidator

import "fmt"

func BoolValidator(state State) State {
	newState := Validate(State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			BoolStart,
		},
	})
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Bool validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func BoolStart(state State) State {
	return Validate(State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			BoolT,
			BoolF,
		},
	})
}

func BoolT(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: t at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsT(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: t at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolR,
		},
	})
}

func BoolR(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: r at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsR(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: r at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolU,
		},
	})
}

func BoolU(state State) State {
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
			BoolE,
		},
	})
}

func BoolE(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: e at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsE(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: e at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolStop,
		},
	})
}

func BoolF(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: f at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsF(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: f at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolA,
		},
	})
}

func BoolA(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: a at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsA(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: a at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolL,
		},
	})
}

func BoolL(state State) State {
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
			BoolS,
		},
	})
}

func BoolS(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: s at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsS(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: s at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			BoolE,
		},
	})
}

func BoolStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
