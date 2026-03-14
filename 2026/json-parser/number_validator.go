package main

import (
	"fmt"
)

func NumberStart(state State) State {
	return State{
		input:      state.input,
		index:      state.index,
		validators: []func(State) State{NumberMinus, NumberDigits1To9, NumberZero},
	}
}

func NumberMinus(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsMinus(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigits1To9, NumberZero},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
	}
}

func NumberMinusN2(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsMinus(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
	}
}

func NumberBigE(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: E at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsBigE(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberPlus, NumberMinusN2, NumberDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: E at index %d. Found: %c.", state.index, char),
	}
}

func NumberSmallE(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: e at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsSmallE(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberPlus, NumberMinusN2, NumberDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: e at index %d. Found: %c.", state.index, char),
	}
}

func NumberZero(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: 0 at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsZero(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberPeriod, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0 at index %d. Found: %c.", state.index, char),
	}
}

func NumberDigits1To9(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: 1-9 at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsDigit1To9(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigits, NumberPeriod, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 1-9 at index %d. Found: %c.", state.index, char),
	}
}

func NumberDigits(state State) State {
	if len(state.input) <= state.index {
		return State{
			error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsDigit(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigits, NumberStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func NumberDigitsN2(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsDigit(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigitsN2, NumberBigE, NumberSmallE, NumberStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func NumberDigitsN3(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsDigit(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigitsN3, NumberStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func NumberPeriod(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: . at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsPeriod(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigitsN2},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: . at index %d. Found: %c.", state.index, char),
	}
}

func NumberPlus(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: + at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsPlus(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{NumberDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: + at index %d. Found: %c.", state.index, char),
	}
}

func NumberStop(state State) State {
	return State{
		input:    state.input,
		index:    state.index,
		complete: true,
	}
}
