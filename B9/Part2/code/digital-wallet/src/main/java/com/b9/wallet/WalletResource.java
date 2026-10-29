package com.b9.wallet;

import com.b9.wallet.DigitalWalletApplication.Money;
import com.b9.wallet.DigitalWalletApplication.Transfer;
import com.b9.wallet.DigitalWalletApplication.WalletAccount;
import com.b9.wallet.DigitalWalletApplication.Beneficiary;
import com.b9.wallet.DigitalWalletApplication.WalletService;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

/** REST adapter; Quarkus CDI injects the application facade. */
@Path("/api")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class WalletResource {
    public record WalletRequest(String id, String owner, String currency, java.math.BigDecimal openingBalance) {}
    public record WalletView(String id, String owner, String currency, java.math.BigDecimal balance) {}
    public record BeneficiaryRequest(String id, String ownerWalletId, String recipientWalletId, String displayName) {}
    public record TransferRequest(String sender, String beneficiary, String currency, java.math.BigDecimal amount) {}
    private final WalletService service;

    @Inject public WalletResource(WalletService service) { this.service = service; }

    @POST @Path("/wallets")
    public WalletView createWallet(WalletRequest request) {
        WalletAccount wallet=service.createWallet(request.id(),request.owner(),new Money(request.openingBalance(),request.currency()));
        return new WalletView(wallet.id(),wallet.owner(),request.currency(),wallet.balance(request.currency()));
    }

    @POST @Path("/beneficiaries")
    public Beneficiary addBeneficiary(BeneficiaryRequest request) {
        return service.addBeneficiary(request.id(),request.ownerWalletId(),request.recipientWalletId(),request.displayName());
    }

    @GET @Path("/wallets/{id}")
    public WalletView wallet(@PathParam("id") String id,@QueryParam("currency") String currency) {
        WalletAccount wallet=service.wallet(id);
        return new WalletView(wallet.id(),wallet.owner(),currency,wallet.balance(currency));
    }

    @POST @Path("/transfers")
    public Transfer transfer(TransferRequest request) {
        return service.transfer(request.sender(), request.beneficiary(), new Money(request.amount(), request.currency()));
    }
}
