package com.b9.wallet.repository;

import com.b9.wallet.domain.Wallet;
import java.util.*;

/** Repository isolates application services from the current in-memory store. */
public final class WalletRepository {
    private final Map<String, Wallet> wallets = new HashMap<>();
    public Optional<Wallet> find(String id) { return Optional.ofNullable(wallets.get(id)); }
    public void save(Wallet wallet) { wallets.put(wallet.id(), wallet); }
}
