package jsonvalidator_test

import (
	"fmt"
	"jsonvalidator"
	"testing"
)

func TestArray(t *testing.T) {
  tests := []struct {
    input string
    expected bool
  }{
    {"[]", true},
    {"[ ]", true},
  }

  for _, test := range tests {
    state := jsonvalidator.State{
      Input: test.input,
      Index: 0,
      Validators: []func(jsonvalidator.State) jsonvalidator.State{
        jsonvalidator.ArrayStart,
      },
    }
    result := jsonvalidator.Validate(state)
    fmt.Println(len(state.Input))
    if jsonvalidator.IsNoErrorAndEndOfString(result) != test.expected {
      t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
    }
  }
}

