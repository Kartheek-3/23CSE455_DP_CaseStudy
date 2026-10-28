<?php

namespace App\Domain\Contracts;

final class SignedState extends AbstractContractState
{
    public function name(): string
    {
        return 'signed';
    }
}
