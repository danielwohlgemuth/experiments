cmake_minimum_required(VERSION 3.24)

project(credit_card_validator)

# GoogleTest requires at least C++14
set(CMAKE_CXX_STANDARD 14)

include(FetchContent)
FetchContent_Declare(
  googletest
  URL https://github.com/google/googletest/archive/58d77fa8070e8cec2dc1ed015d66b454c8d78850.zip
)
# For Windows: Prevent overriding the parent project's compiler/linker settings
set(gtest_force_shared_crt ON CACHE BOOL "" FORCE)
FetchContent_MakeAvailable(googletest)

add_executable(
    app
    src/main.cpp
    src/credit_card_validator.h
    src/credit_card_validator.cpp
)

enable_testing()

add_executable(
    app_test
    src/credit_card_validator.h
    src/credit_card_validator.cpp
    src/credit_card_validator_test.cpp
)
target_link_libraries(
    app_test
    GTest::gtest_main
)

include(GoogleTest)
gtest_discover_tests(app_test)
