package jsonvalidator

import (
	"fmt"
)

func ValueValidator(state State) State {
	newState := Validate(State{
		Input:      state.Input,
		Index:      state.Index,
		Validators: []func(State) State{ValueStart},
	})
	if !IsNoErrorAndComplete(newState) {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Value validation failed at index %d", state.Index),
		}
	}

	newState.Complete = false
	return newState
}

func ValueStart(state State) State {
	return ValueWhitespace(state)
}

func ValueWhitespace(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ValueValue},
	})
}

func ValueValue(state State) State {
	newState := State{
		Input: state.Input,
		Index: state.Index,
		Validators: []func(State) State{
			NumberValidator,
			ObjectValidator,
			ArrayValidator,
			StringValidator,
			NullValidator,
			BoolValidator,
		},
	}
	newState = Validate(newState)
	if newState.Error != "" {
		return State{
			Input: state.Input,
			Index: state.Index,
			Error: fmt.Sprintf("Value validation failed at index %d", state.Index),
		}
	}

	return Validate(State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ValueWhitespaceN2},
	})
}

func ValueWhitespaceN2(state State) State {
	newState := WhitespaceValidator(state)
	if newState.Error != "" {
		return newState
	}

	return Validate(State{
		Input:      newState.Input,
		Index:      newState.Index,
		Validators: []func(State) State{ValueStop},
	})
}

func ValueStop(state State) State {
	return State{
		Input:    state.Input,
		Index:    state.Index,
		Complete: true,
	}
}
