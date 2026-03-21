package main

import (
	"fmt"
	"jsonvalidator"
	"os"
)

func main() {
	if len(os.Args) != 2 {
		fmt.Println("Usage: json-validator-cli '123'")
		return
	}

	input := os.Args[1]
	state := jsonvalidator.State{
		Input: input,
		Index: 0,
		Validators: []func(jsonvalidator.State) jsonvalidator.State{
			jsonvalidator.NumberValidator,
			jsonvalidator.ObjectValidator,
			jsonvalidator.StringValidator,
			jsonvalidator.BoolValidator,
			jsonvalidator.NullValidator,
			jsonvalidator.ArrayValidator,
		},
	}
	result := jsonvalidator.Validate(state)
	if jsonvalidator.IsNoErrorAndEndOfString(result) {
		fmt.Printf("%s is valid JSON\n", input)
	} else {
		fmt.Printf("%s is NOT valid JSON\n", input)
		if result.Error != "" {
			fmt.Printf("%s", result.Error)
		} else if !result.Complete {
			fmt.Printf("Validation incomplete\n")
		}
		os.Exit(1)
	}
}
