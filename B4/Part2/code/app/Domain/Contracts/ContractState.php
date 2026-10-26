<?php

namespace App\Domain\Contracts;

interface ContractState
{
    public function name(): string;

    public function send(DigitalContract $contract): void;

    public function sign(DigitalContract $contract): void;

    public function expire(DigitalContract $contract): void;
}
