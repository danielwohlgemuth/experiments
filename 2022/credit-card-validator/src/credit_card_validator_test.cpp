#include <gtest/gtest.h>

#include "credit_card_validator.h"

TEST(CleanCreditCardNumberTest, CleanCreditCardNumber) {
    EXPECT_EQ("4242424242424242", cleanCreditCardNumber("4242424242424242"));
    EXPECT_EQ("4242424242424242", cleanCreditCardNumber("4242 4242 4242 4242"));
    EXPECT_EQ("4242424242424242", cleanCreditCardNumber("4242-4242-4242-4242"));
}

TEST(ValidateCreditCardNumberTest, ValidateCorrectCreditCardNumber) {
    EXPECT_EQ(true, validateCreditCardNumber("4242 4242 4242 4242"));
    EXPECT_EQ(true, validateCreditCardNumber("3714 496353 98431"));
}

TEST(ValidateCreditCardNumberTest, ValidateIncorrectCreditCardNumber) {
    EXPECT_EQ(false, validateCreditCardNumber("4242 4242 4242 4240"));
}