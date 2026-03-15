package jsonvalidator

import (
	"fmt"
)

type Validator func(state State) State

type State struct {
	Input      string
	Index      int
	error      string
	complete   bool
	validators []func(State) State
}

func Validate(state State) bool {
	state = NumberStart(state)
	for state.error == "" && !state.complete && len(state.Input) >= state.Index {
		var errors string = ""
		var foundGoodValidator = false
		for _, validator := range state.validators {
			var validatorState = validator(state)
			if validatorState.error != "" {
				errors += validatorState.error + "\n"
				continue
			}
			state = State{
				Input: state.Input,
				Index: state.Index,
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
