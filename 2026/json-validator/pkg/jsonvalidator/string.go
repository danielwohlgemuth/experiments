package jsonvalidator

import "fmt"

func StringValidator(state State) State {
	newState := Validate(State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringStart,
		},
	})
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
	char := state.Input[state.Index]
	if !IsQuote(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			StringAnyCodepoint,
			StringBackslash,
			StringCloseQuote,
		},
	})
}

func StringAnyCodepoint(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: ascii at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsAnyCodepoint(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: ascii at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			StringAnyCodepoint,
			StringBackslash,
			StringCloseQuote,
		},
	}
}

func StringBackslash(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\ at index %d. Found End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsBackslash(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \\ at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringB,
			StringF,
			StringN,
			StringR,
			StringT,
			StringU,
		},
	}
}

func StringB(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: b at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsB(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: b at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
		},
	}
}

func StringF(state State) State {
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
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
		},
	}
}

func StringN(state State) State {
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
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
		},
	}
}

func StringR(state State) State {
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
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
		},
	}
}

func StringT(state State) State {
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
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
		},
	}
}

func StringU(state State) State {
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
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			String4HexDigits,
		},
	}
}

func String4HexDigits(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsHex(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			String4HexDigitsN2,
		},
	}
}

func String4HexDigitsN2(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsHex(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			String4HexDigitsN3,
		},
	}
}

func String4HexDigitsN3(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsHex(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			String4HexDigitsN4,
		},
	}
}

func String4HexDigitsN4(state State) State {
	if IsAfterEndOfString(state) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}
	char := state.Input[state.Index]
	if !IsHex(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
		}
	}
	return State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			StringCloseQuote,
			StringAnyCodepoint,
			StringBackslash,
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
	char := state.Input[state.Index]
	if !IsQuote(char) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: \" at index %d. Found: %c.", state.Index, char),
		}
	}
	return Validate(State{
		Input: state.Input,
		Index: state.Index + 1,
		Validators: []func(State) State{
			StringStop,
		},
	})
}

func StringStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
