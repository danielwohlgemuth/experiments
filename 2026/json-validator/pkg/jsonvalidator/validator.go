package jsonvalidator

type State struct {
	Input      string
	Index      int
	Error      string
	Complete   bool
	Validators []func(State) State
}

func Validate(state State) State {
	for state.Error == "" && !state.Complete && len(state.Input) >= state.Index {
		var errors string = ""
		var foundGoodValidator = false
		for _, validator := range state.Validators {
			newState := validator(state)
			if newState.Error != "" {
				errors += newState.Error + "\n"
				continue
			}
			foundGoodValidator = true
			state = newState
			break
		}
		if !foundGoodValidator {
			state = State{
				Input: state.Input,
				Index: state.Index,
				Error: errors,
			}
			break
		}
	}

	return state
}

func IsNoErrorAndEndOfString(state State) bool {
	return state.Error == "" && state.Index == len(state.Input)
}

func IsNoErrorAndComplete(state State) bool {
	return state.Error == "" && state.Complete
}

func IsAfterEndOfString(state State) bool {
	return state.Index >= len(state.Input)
}
