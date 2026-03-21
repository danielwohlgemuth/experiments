package jsonvalidator_test

import (
	"jsonvalidator"
	"testing"
)

func TestBool(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"true", true},
		{"false", true},
		{" ", false},
		{"[]", false},
		{"{}", false},
		{"1", false},
	}

	for _, test := range tests {
		state := jsonvalidator.State{
			Input: test.input,
			Index: 0,
			Validators: []func(jsonvalidator.State) jsonvalidator.State{
				jsonvalidator.BoolStart,
			},
		}
		result := jsonvalidator.Validate(state)
		if jsonvalidator.IsNoErrorAndEndOfString(result) != test.expected {
			t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
		}
	}
}
