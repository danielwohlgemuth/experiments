#ifndef CREDIT_CARD_VALIDATOR_H
#define CREDIT_CARD_VALIDATOR_H

#include <iostream>

// #define DEBUG(text, value) std::cout << text << ": " << value << '\n'
#define DEBUG(text, value)

std::string cleanCreditCardNumber(std::string creditCardNumber);
bool validateCreditCardNumber(std::string creditCardNumber);

#endif