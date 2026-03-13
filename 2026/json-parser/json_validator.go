package main

import (
  "fmt"
  "os"
)

type Validator func(state State) Result

type Result struct {
  error string
  complete bool
  validator []func(State) Result
}

type State struct {
  input string
  index int
}

func ValidateStart(state State) Result {
  //fmt.Printf("ValidateStart index: %d\n", state.index)
  if state.index > 0 {
    return Result {
      error: fmt.Sprintf("Expected: Index at start of input. Found: Index at position %d.", state.index),
    }
  }

  return Result {
    validator: []func(State) Result { ValidateMinus, ValidateDigits1To9, ValidateZero },
  }
}

func ValidateMinus(state State) Result {
  //fmt.Printf("ValidateMinux index: %d\n", state.index)
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.index),
    }
  }
  
  var char = state.input[state.index]
  if IsMinus(char) {
    return Result {
      validator: []func(State) Result { ValidateDigits1To9, ValidateZero },
    }
  }
  
  return Result {
    error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
  }
}

func ValidateMinusN2(state State) Result {
  //fmt.Printf("ValidateMinux index: %d\n", state.index)
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: - at index %d. Found: End of input.", state.index),
    }
  }
  
  var char = state.input[state.index]
  if IsMinus(char) {
    return Result {
      validator: []func(State) Result { ValidateDigitsN3 },
    }
  }
  
  return Result {
    error: fmt.Sprintf("Expected: - at index %d. Found: %c.", state.index, char),
  }
}

func ValidateBigE(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: E at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsBigE(char) {
    return Result {
      validator: []func(State) Result { ValidatePlus, ValidateMinusN2, ValidateDigitsN3 },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: E at index %d. Found: %c.", state.index, char),
  }
}

func ValidateSmallE(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: e at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsSmallE(char) {
    return Result {
      validator: []func(State) Result { ValidatePlus, ValidateMinusN2, ValidateDigitsN3 },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: e at index %d. Found: %c.", state.index, char),
  }
}

func ValidateZero(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: 0 at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsZero(char) {
    return Result {
      validator: []func(State) Result { ValidatePeriod, ValidateBigE, ValidateSmallE, ValidateStop },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: 0 at index %d. Found: %c.", state.index, char),
  }
}

func ValidateDigits1To9(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: 1-9 at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsDigit1To9(char) {
    return Result {
      validator: []func(State) Result { ValidateDigits, ValidatePeriod, ValidateBigE, ValidateSmallE, ValidateStop },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: 1-9 at index %d. Found: %c.", state.index, char),
  }
}

func ValidateDigits(state State) Result {
  //fmt.Printf("ValidateDigits index: %d\n", state.index)
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsDigit(char) {
    return Result {
      validator: []func(State) Result { ValidateDigits, ValidateStop },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char), 
  }
}

func ValidateDigitsN2(state State) Result {
  //fmt.Printf("ValidateDigits index: %d\n", state.index)
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsDigit(char) {
    return Result {
      validator: []func(State) Result { ValidateDigitsN2, ValidateBigE, ValidateSmallE, ValidateStop },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char), 
  }
}

func ValidateDigitsN3(state State) Result {
  //fmt.Printf("ValidateDigits index: %d\n", state.index)
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: 0-9 at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsDigit(char) {
    return Result {
      validator: []func(State) Result { ValidateDigitsN3, ValidateStop },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: 0-9 at index %d. Found: %c.", state.index, char), 
  }
}

func ValidatePeriod(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: . at index %d. Found: End of input.", state.index),
    }
  }

  var char = state.input[state.index]
  if IsPeriod(char) {
    return Result {
      validator: []func(State) Result { ValidateDigitsN2 },
    }
  }

  return Result {
    error: fmt.Sprintf("Expected: . at index %d. Found: %c.", state.index, char),
  }
}

func ValidatePlus(state State) Result {
  if len(state.input) <= state.index {
    return Result {
      error: fmt.Sprintf("Expected: + at index %d. Found: End of input.", state.index),
    }
  }
  
  var char = state.input[state.index]
  if IsPlus(char) {
    return Result {
      validator: []func(State) Result { ValidateDigitsN3 },
    }
  }
  
  return Result {
    error: fmt.Sprintf("Expected: + at index %d. Found: %c.", state.index, char),
  }
}

func ValidateStop(state State) Result {
  //fmt.Printf("ValidateEnd index: %d\n", state.index)
  if len(state.input) == state.index {
    return Result {
      complete: true,
    }
  }
  
  return Result {
    error: fmt.Sprintf("Expected: End of input. Found: More characters (%d).", len(state.input) - state.index),
  }
}

func IsMinus(char byte) bool {
  return char == '-'
}

func IsDigit(char byte) bool {
  return IsDigit1To9(char) || IsZero(char)
}

func IsDigit1To9(char byte) bool {
  return char == '1' || char == '2' || char == '3' || char == '4' || char == '5' || char == '6' || char == '7' || char == '8' || char == '9'
}

func IsZero(char byte) bool {
  return char == '0'
}

func IsPeriod(char byte) bool {
  return char == '.'
}

func IsBigE(char byte) bool {
  return char == 'E'
}

func IsSmallE(char byte) bool {
  return char == 'e'
}

func IsPlus(char byte) bool {
  return char == '+'
}

func Validate(input string) bool {
  var state = State {
    input: input,
    index: 0,
  }

  var result = ValidateStart(state)
  for result.error == "" && !result.complete && len(state.input) >= state.index {
    //fmt.Printf("index: %d\n", state.index)
    var errors string = ""
    var foundGoodValidator = false
    for _, validator := range result.validator {
      var validatorResult = validator(state)
      if validatorResult.error != "" {
        errors += validatorResult.error + "\n"
        continue
      }
      state = State {
        input: state.input,
        index: state.index + 1,
      }
      result = validatorResult
      foundGoodValidator = true
      break
    }
    if !foundGoodValidator {
      result = Result {
        error: errors,
      }
    }
  }
  
  //fmt.Printf("error: %s\n", result.error)
  //fmt.Printf("complete: %t\n", result.complete)
  if result.error != "" {
    fmt.Printf(result.error)
    return false
  }

  if !result.complete {
    fmt.Printf("Validation incomplete\n")
    return false
  }

  return true
}

func main() {
  if len(os.Args) != 2 {
    fmt.Println("Usage: json_validator '123'")
    return
  }

  input := os.Args[1]
  if Validate(input) {
    fmt.Printf("%s is a valid JSON\n", input)
  } else {
    fmt.Printf("%s is not a valid JSON\n", input)
  }
}

