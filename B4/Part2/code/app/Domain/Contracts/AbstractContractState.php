<?php

namespace App\Domain\Contracts;

use DomainException;

abstract class AbstractContractState implements ContractState
{
    public function send(DigitalContract $contract): void
    {
        throw new DomainException("Cannot send a contract in {$this->name()} state.");
    }

    public function sign(DigitalContract $contract): void
    {
        throw new DomainException("Cannot sign a contract in {$this->name()} state.");
    }

    public function expire(DigitalContract $contract): void
    {
        throw new DomainException("Cannot expire a contract in {$this->name()} state.");
    }
}
