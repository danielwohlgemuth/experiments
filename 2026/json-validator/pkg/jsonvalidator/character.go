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

func IsOpenBracket(char byte) bool {
	return char == '['
}

func IsCloseBracket(char byte) bool {
	return char == ']'
}

func IsAnyCodepoint(char byte) bool {
	// Printable characters except " and \. Whitespace characters: space, line feed, horizontal tab, carriage return.
	return char >= 32 && char <= 126 && char != '"' && char != '\\' || char == '\n' || char == '\t' || char == '\r'
}

func IsB(char byte) bool {
	return char == 'b'
}

func IsF(char byte) bool {
	return char == 'f'
}

func IsN(char byte) bool {
	return char == 'n'
}

func IsR(char byte) bool {
	return char == 'r'
}

func IsT(char byte) bool {
	return char == 't'
}

func IsU(char byte) bool {
	return char == 'u'
}

func IsL(char byte) bool {
	return char == 'l'
}

func IsE(char byte) bool {
	return char == 'e'
}

func IsA(char byte) bool {
	return char == 'a'
}

func IsS(char byte) bool {
	return char == 's'
}

func IsHex(char byte) bool {
	return IsDigit(char) || char == 'A' || char == 'B' || char == 'C' || char == 'D' || char == 'E' || char == 'F' || char == 'a' || char == 'b' || char == 'c' || char == 'd' || char == 'e' || char == 'f'
}