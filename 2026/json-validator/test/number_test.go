package jsonvalidator_test

import (
	"jsonvalidator"
	"testing"
)

func TestNumber(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"1", true},
		{"123456890", true},
		{"-1234567890", true},
		{"111", true},
		{"1.1234567890", true},
		{"1e1234567890", true},
		{"1e+2", true},
		{"1e-3", true},
		{"1E1", true},
		{"1E+4", true},
		{"1E-5", true},
		{"1.2e1", true},
		{"1.2e+6", true},
		{"1.2e-7", true},
		{"1.2E1", true},
		{"1.2E+8", true},
		{"1.2E-9", true},
		{"abc", false},
		{"{}", false},
		{"[]", false},
		{" ", false},
		{"1-2", false},
		{"1 2", false},
		{"1..2", false},
		{"1eE2", false},
	}

	for _, test := range tests {
		state := jsonvalidator.State{
			Input: test.input,
			Index: 0,
			Validators: []func(jsonvalidator.State) jsonvalidator.State{
				jsonvalidator.NumberStart,
			},
		}
		result := jsonvalidator.Validate(state)
		if jsonvalidator.IsValid(result) != test.expected {
			t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
		}
	}
}
