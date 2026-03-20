package jsonvalidator_test

import (
	"jsonvalidator"
	"testing"
)

func TestString(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{"\"\"", true},
		{"\"a\"", true},
		{"\"abcdefghijklmnopqrstuvwxyz\"", true},
		{"\"ABCDEFGHIJKLMNOPQRSTUVWXYZ\"", true},
		{"\"0123456789\"", true},
		{"\",./<>?;':[]{}|-=_+`~!@#$%^&*()	\"", true},
		{"\"a1! \"", true},
		{"\"\"\"", false},
		{"\"\\\"", false},
		{"\"\\r\b\f\n\r\t\"", false},
		{"\"\\u1234\"", false},
		{"{}", false},
		{"1", false},
		{"[]", false},
		{" ", false},
	}

	for _, test := range tests {
		state := jsonvalidator.State{
			Input: test.input,
			Index: 0,
			Validators: []func(jsonvalidator.State) jsonvalidator.State{
				jsonvalidator.StringStart,
			},
		}
		result := jsonvalidator.Validate(state)
		if jsonvalidator.IsNoErrorAndEndOfString(result) != test.expected {
			t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
		}
	}
}
