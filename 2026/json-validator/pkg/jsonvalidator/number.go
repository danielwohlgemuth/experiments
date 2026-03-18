package jsonvalidator

import (
	"fmt"
)

func NumberValidator(state State) State {
	newState := State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{NumberStart},
	}
	newState = Validate(newState)
	if !IsPartValid(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Number validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func NumberStart(state State) State {
	return State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{NumberMinus, NumberDigits1To9, NumberZero},
	}
}

func NumberMinus(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsMinus(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigits1To9, NumberZero},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.Index, char),
	}
}

func NumberMinusN2(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsMinus(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigitsN3},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.Index, char),
	}
}

func NumberBigE(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: E at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsBigE(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberPlus, NumberMinusN2, NumberDigitsN3},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: E at index %d. Found: %c.", state.Index, char),
	}
}

func NumberSmallE(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: e at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsSmallE(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberPlus, NumberMinusN2, NumberDigitsN3},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: e at index %d. Found: %c.", state.Index, char),
	}
}

func NumberZero(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0 at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsZero(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberPeriod, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: 0 at index %d. Found: %c.", state.Index, char),
	}
}

func NumberDigits1To9(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 1-9 at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsDigit1To9(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigits, NumberPeriod, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: 1-9 at index %d. Found: %c.", state.Index, char),
	}
}

func NumberDigits(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsDigit(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigits, NumberStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
	}
}

func NumberDigitsN2(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsDigit(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigitsN2, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
	}
}

func NumberDigitsN3(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsDigit(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigitsN3, NumberStop},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.Index, char),
	}
}

func NumberPeriod(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: . at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsPeriod(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigitsN2},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: . at index %d. Found: %c.", state.Index, char),
	}
}

func NumberPlus(state State) State {
	if len(state.Input) <= state.Index {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Expected: + at index %d. Found: End of input.", state.Index),
		}
	}

	var char = state.Input[state.Index]
	if IsPlus(char) {
		return State{
			Input:      state.Input,
			Index:      state.Index + 1,
			Validators: []func(State) State{NumberDigitsN3},
		}
	}

	return State{
		Input: state.Input,
		Index: state.Index,
		Error: fmt.Sprintf("Expected: + at index %d. Found: %c.", state.Index, char),
	}
}

func NumberStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
