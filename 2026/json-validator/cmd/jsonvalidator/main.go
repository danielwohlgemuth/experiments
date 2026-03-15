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
	}
	if jsonvalidator.Validate(state) {
		fmt.Printf("%s is a valid JSON\n", input)
	} else {
		fmt.Printf("%s is not a valid JSON\n", input)
	}
}
