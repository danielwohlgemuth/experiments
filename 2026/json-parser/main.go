package main

import (
	"fmt"
	"os"
)

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
