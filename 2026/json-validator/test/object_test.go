package jsonvalidator_test

import (
	"jsonvalidator"
	"testing"
)

func TestObject(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"{}", true},
		{"{ }", true},
		// {"{\"\":1}", true},
		// {"{\"\":true}", true},
		// {"{\"\" : 1}", true},
		// {"{\"\" : \"\"}", true},
		// {"{\"abc\" : \"def\"}", true},
		// {"1", false},
		// {"\"abc\"", false},
		// {"[]", false},
		// {" ", false},
	}

	for _, test := range tests {
		state := jsonvalidator.State{
			Input: test.input,
			Index: 0,
			Validators: []func(jsonvalidator.State) jsonvalidator.State{
				jsonvalidator.ObjectStart,
			},
		}
		result := jsonvalidator.Validate(state)
		if jsonvalidator.IsValid(result) != test.expected {
			t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
		}
	}
}
