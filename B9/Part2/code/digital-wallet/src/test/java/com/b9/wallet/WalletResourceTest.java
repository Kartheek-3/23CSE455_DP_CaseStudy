package com.b9.wallet;

import io.quarkus.test.junit.QuarkusTest;
import org.junit.jupiter.api.Test;
import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.equalTo;

@QuarkusTest
class WalletResourceTest {
    @Test void transferReturnsCompletedTransaction() {
        given().contentType("application/json").body("{\"id\":\"wallet-1\",\"owner\":\"alice\",\"currency\":\"EUR\",\"openingBalance\":1000.00}").post("/api/wallets").then().statusCode(200);
        given().contentType("application/json").body("{\"id\":\"wallet-2\",\"owner\":\"bob\",\"currency\":\"EUR\",\"openingBalance\":0.00}").post("/api/wallets").then().statusCode(200);
        given().contentType("application/json").body("{\"id\":\"beneficiary-1\",\"ownerWalletId\":\"wallet-1\",\"recipientWalletId\":\"wallet-2\",\"displayName\":\"Bob\"}").post("/api/beneficiaries").then().statusCode(200);
        given().contentType("application/json")
          .body("{\"sender\":\"wallet-1\",\"beneficiary\":\"beneficiary-1\",\"currency\":\"EUR\",\"amount\":200.00}")
          .when().post("/api/transfers")
          .then().statusCode(200).body("status", equalTo("COMPLETED"));
        given().queryParam("currency","EUR").get("/api/wallets/wallet-1").then().statusCode(200).body("balance",equalTo(800.00f));
        given().queryParam("currency","EUR").get("/api/wallets/wallet-2").then().statusCode(200).body("balance",equalTo(200.00f));
    }
}
