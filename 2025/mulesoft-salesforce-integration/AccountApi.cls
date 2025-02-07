@RestResource(urlMapping='/Account/*')
global with sharing class AccountApi {

    @HttpPut
    global static void doPut(String accountId, String name) {
        Account account = new Account(
            Id = accountId,
            Name = name
        );
        update account;
    }
}