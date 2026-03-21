package jsonvalidator_test

import (
	"jsonvalidator"
	"testing"
)

func TestValue(t *testing.T) {
	tests := []struct {
		input    string
		expected bool
	}{
		{" { } ", true},
		{"{ }", true},
		{"{\"\":1}", true},
		{"{\"true\": true, \"false\": false, \"null\": null}", true},
		{"{\"\" : 1}", true},
		{"{\"\" : \"\"}", true},
		{"{\"abc\" : \"def\"}", true},
		{"1", true},
		{"\"abc\"", true},
		{"[]", true},
		{" ", false},
	}

	for _, test := range tests {
		state := jsonvalidator.State{
			Input: test.input,
			Index: 0,
			Validators: []func(jsonvalidator.State) jsonvalidator.State{
				jsonvalidator.ValueStart,
			},
		}
		result := jsonvalidator.Validate(state)
		if jsonvalidator.IsNoErrorAndEndOfString(result) != test.expected {
			t.Errorf("Validate(%s) = Error: %s, Complete: %v, Index: %d; want %v", test.input, result.Error, result.Complete, result.Index, test.expected)
		}
	}
}
