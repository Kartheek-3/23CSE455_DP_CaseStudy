<?php

namespace App\Domain\Contracts;

final class SentState extends AbstractContractState
{
    public function name(): string
    {
        return 'sent';
    }

    public function sign(DigitalContract $contract): void
    {
        $contract->transitionTo(new SignedState());
    }

    public function expire(DigitalContract $contract): void
    {
        $contract->transitionTo(new ExpiredState());
    }
}
