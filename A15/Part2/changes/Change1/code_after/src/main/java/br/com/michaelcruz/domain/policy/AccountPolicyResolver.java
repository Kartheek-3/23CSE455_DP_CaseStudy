package br.com.michaelcruz.domain.policy;

import br.com.michaelcruz.exception.BadRequestException;
import br.com.michaelcruz.persistence.model.AccountType;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.EnumMap;
import java.util.Map;

/** Selects the policy for an account type. */
@ApplicationScoped
public class AccountPolicyResolver {

    private final Map<AccountType, AccountPolicy> policies = new EnumMap<>(AccountType.class);

    public AccountPolicyResolver() {
        policies.put(AccountType.CONTA_CORRENTE, new CheckingAccountPolicy());
        policies.put(AccountType.CONTA_POUPANCA, new SavingsAccountPolicy());
    }

    public AccountPolicy forType(AccountType type) {
        AccountPolicy policy = policies.get(type);
        if (policy == null) {
            throw new BadRequestException("Tipo de conta sem política definida: " + type);
        }
        return policy;
    }
}
