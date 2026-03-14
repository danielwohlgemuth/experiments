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

func Validate(state State) bool {
	state = NumberStart(state)
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
		fmt.Printf("%s", state.error)
		return false
	}

	if !state.complete {
		fmt.Printf("Validation incomplete\n")
		return false
	}

	return true
}
