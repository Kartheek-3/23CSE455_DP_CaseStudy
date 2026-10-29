<?php

namespace App\Domain\Contracts;

final class DraftState extends AbstractContractState
{
    public function name(): string
    {
        return 'draft';
    }

    public function send(DigitalContract $contract): void
    {
        $contract->transitionTo(new SentState());
    }
}
