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
			jsonvalidator.NumberStart,
		},
	}
	result := jsonvalidator.Validate(state)
	if result.Error == "" && result.Complete {
		fmt.Printf("%s is a valid JSON\n", input)
	} else {
		fmt.Printf("%s is not a valid JSON\n", input)
		if result.Error != "" {
			fmt.Printf("%s", state.Error)
		} else if !result.Complete {
			fmt.Printf("Validation incomplete\n")
		}
	}
}
