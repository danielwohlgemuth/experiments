package jsonvalidator

func IsMinus(char byte) bool {
	return char == '-'
}

func IsDigit(char byte) bool {
	return IsDigit1To9(char) || IsZero(char)
}

func IsDigit1To9(char byte) bool {
	return char == '1' || char == '2' || char == '3' || char == '4' || char == '5' || char == '6' || char == '7' || char == '8' || char == '9'
}

func IsZero(char byte) bool {
	return char == '0'
}

func IsPeriod(char byte) bool {
	return char == '.'
}

func IsBigE(char byte) bool {
	return char == 'E'
}

func IsSmallE(char byte) bool {
	return char == 'e'
}

func IsPlus(char byte) bool {
	return char == '+'
}

func IsSpace(char byte) bool {
	return char == ' '
}

func IsBackslash(char byte) bool {
	return char == '\\'
}

func IsLinefeed(char byte) bool {
	return char == '\n'
}

func IsCarriageReturn(char byte) bool {
	return char == '\r'
}

func IsHorizontalTab(char byte) bool {
	return char == '\t'
}

func IsQuote(char byte) bool {
	return char == '"'
}

func IsControlCharacter(char byte) bool {
	return char <= 32 || char == 127
}

func IsOpenBrace(char byte) bool {
	return char == '{'
}

func IsCloseBrace(char byte) bool {
	return char == '}'
}

func IsColon(char byte) bool {
	return char == ':'
}

func IsComma(char byte) bool {
	return char == ','
}
