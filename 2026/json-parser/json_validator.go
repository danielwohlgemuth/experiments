package main

import (
	"fmt"
)

type Validator func(state State) State

type State struct {
	input      string
	index      int
	error      string
	complete   bool
	validators []func(State) State
}

func ValidateStart(state State) State {
	if state.index > 0 {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: Index at start of input. Found: Index at position %d.", state.index),
		}
	}

	return State{
		input:      state.input,
		index:      state.index + 1,
		validators: []func(State) State{ValidateMinus, ValidateDigits1To9, ValidateZero},
	}
}

func ValidateMinus(state State) State {
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
			validators: []func(State) State{ValidateDigits1To9, ValidateZero},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
	}
}

func ValidateMinusN2(state State) State {
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
			validators: []func(State) State{ValidateDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
	}
}

func ValidateBigE(state State) State {
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
			validators: []func(State) State{ValidatePlus, ValidateMinusN2, ValidateDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: E at index %d. Found: %c.", state.index, char),
	}
}

func ValidateSmallE(state State) State {
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
			validators: []func(State) State{ValidatePlus, ValidateMinusN2, ValidateDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: e at index %d. Found: %c.", state.index, char),
	}
}

func ValidateZero(state State) State {
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
			validators: []func(State) State{ValidatePeriod, ValidateBigE, ValidateSmallE, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0 at index %d. Found: %c.", state.index, char),
	}
}

func ValidateDigits1To9(state State) State {
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
			validators: []func(State) State{ValidateDigits, ValidatePeriod, ValidateBigE, ValidateSmallE, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 1-9 at index %d. Found: %c.", state.index, char),
	}
}

func ValidateDigits(state State) State {
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
			validators: []func(State) State{ValidateDigits, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func ValidateDigitsN2(state State) State {
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
			validators: []func(State) State{ValidateDigitsN2, ValidateBigE, ValidateSmallE, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func ValidateDigitsN3(state State) State {
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
			validators: []func(State) State{ValidateDigitsN3, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char),
	}
}

func ValidatePeriod(state State) State {
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
			validators: []func(State) State{ValidateDigitsN2},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: . at index %d. Found: %c.", state.index, char),
	}
}

func ValidatePlus(state State) State {
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
			validators: []func(State) State{ValidateDigitsN3},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: + at index %d. Found: %c.", state.index, char),
	}
}

func ValidateSpace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \" \" at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsSpace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateSpace, ValidateLinefeed, ValidateCarriageReturn, ValidateHorizontalTab, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \" \" at index %d. Found: %c.", state.index, char),
	}
}

func ValidateLinefeed(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \\n at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsLinefeed(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateSpace, ValidateLinefeed, ValidateCarriageReturn, ValidateHorizontalTab, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\n at index %d. Found: %c.", state.index, char),
	}
}

func ValidateCarriageReturn(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: \\r at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsCarriageReturn(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateSpace, ValidateLinefeed, ValidateCarriageReturn, ValidateHorizontalTab, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\r at index %d. Found: %c.", state.index, char),
	}
}

func ValidateHorizontalTab(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index + 1,
			error: fmt.Sprintf("Expected: \\t at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsHorizontalTab(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateSpace, ValidateLinefeed, ValidateCarriageReturn, ValidateHorizontalTab, ValidateStop},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: \\t at index %d. Found: %c.", state.index, char),
	}
}

func ValidateOpenBrace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: { at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsOpenBrace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateCloseBrace},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: { at index %d. Found: %c.", state.index, char),
	}
}

func ValidateCloseBrace(state State) State {
	if len(state.input) <= state.index {
		return State{
			input: state.input,
			index: state.index,
			error: fmt.Sprintf("Expected: } at index %d. Found: End of input.", state.index),
		}
	}

	var char = state.input[state.index]
	if IsCloseBrace(char) {
		return State{
			input:      state.input,
			index:      state.index + 1,
			validators: []func(State) State{ValidateCloseBrace},
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: } at index %d. Found: %c.", state.index, char),
	}
}

func ValidateStop(state State) State {
	if len(state.input) == state.index {
		return State{
			input:    state.input,
			index:    state.index,
			complete: true,
		}
	}

	return State{
		input: state.input,
		index: state.index,
		error: fmt.Sprintf("Expected: End of input. Found: More characters (%d).", len(state.input)-state.index),
	}
}

func Validate(state State) bool {
	state = ValidateStart(state)
	for state.error == "" && !state.complete && len(state.input) >= state.index {
		var errors string = ""
		var foundGoodValidator = false
		for _, validator := range state.validators {
			var validatorState = validator(state)
			if validatorState.error != "" {
				errors += validatorState.error + "\n"
				continue
			}
			state = State{
				input: state.input,
				index: state.index,
			}
			state = validatorState
			foundGoodValidator = true
			break
		}
		if !foundGoodValidator {
			state = State{
				error: errors,
			}
		}
	}

	if state.error != "" {
		fmt.Printf(state.error)
		return false
	}

	if !state.complete {
		fmt.Printf("Validation incomplete\n")
		return false
	}

	return true
}
