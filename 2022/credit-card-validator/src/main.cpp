#include <iostream>
#include "credit_card_validator.h"

int main()
{
    std::cout << "Credit Card Validator" << '\n';
    std::cout << "Enter a credit card number to verify if is a correct number. Dashes and spaces will be removed from the number." << '\n' << "Type 'exit' to exit the application." << '\n' << '\n';

    std::string creditCardNumber;
    std::getline(std::cin, creditCardNumber);

    while (creditCardNumber != "exit") {
        int isCreditCardNumberValid = validateCreditCardNumber(creditCardNumber);

        std::string creditCardNumberValidationText = isCreditCardNumberValid ? "correct" : "incorrect";
        std::cout << "The credit card number is " << creditCardNumberValidationText << '\n';

        std::cout << '\n' << "Enter a new credit card number" << '\n';
        std::getline(std::cin, creditCardNumber);
    }
}