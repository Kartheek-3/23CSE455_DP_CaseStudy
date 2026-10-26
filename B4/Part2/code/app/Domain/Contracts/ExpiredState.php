<?php

namespace App\Domain\Contracts;

final class ExpiredState extends AbstractContractState
{
    public function name(): string
    {
        return 'expired';
    }
}
