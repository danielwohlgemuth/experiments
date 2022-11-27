#include <iostream>
#include <regex>

#include "credit_card_validator.h"

std::string cleanCreditCardNumber(std::string creditCardNumber)
{
    std::regex notANumberRegex ("[^\\d]");
    std::string cleanedCreditCardNumber = std::regex_replace(creditCardNumber, notANumberRegex, "");

    DEBUG("creditCardNumber", creditCardNumber);
    DEBUG("cleanedCreditCardNumber", cleanedCreditCardNumber);

    return cleanedCreditCardNumber;
}

bool validateCreditCardNumber(std::string creditCardNumber)
{
    std::string cleanedCreditCardNumber = cleanCreditCardNumber(creditCardNumber);

    int digitSum = 0;
    int checkDigitPosition = cleanedCreditCardNumber.length() - 1;
    int checkDigit = cleanedCreditCardNumber[checkDigitPosition] - '0';

    for (int i = checkDigitPosition - 1; i >= 0 ; i--) {

        int digit = cleanedCreditCardNumber[i] - '0';

        if (i % 2 == (checkDigitPosition - 1) % 2) {
            if (digit > 4) {
                digitSum += digit * 2 - 9;
                DEBUG("digit", digit * 2 - 9);
            } else {
                digitSum += digit * 2;
                DEBUG("digit", digit * 2);
            }
        } else {
            digitSum += digit;
            DEBUG("digit", digit);
        }
    }

    int calculatedCheckDigit = (10 - (digitSum % 10)) % 10;

    DEBUG("digitSum", digitSum);
    DEBUG("checkDigit", checkDigit);
    DEBUG("calculatedCheckDigit", calculatedCheckDigit);

    return checkDigit == calculatedCheckDigit;
}