<?php

namespace App\Domain\Contracts;

use InvalidArgumentException;

final class DigitalContract
{
    private ContractState $state;

    private ?string $signatureHash = null;

    public function __construct(private readonly string $documentHash)
    {
        self::assertSha256($documentHash, 'Document');
        $this->state = new DraftState();
    }

    public function state(): string
    {
        return $this->state->name();
    }

    public function documentHash(): string
    {
        return $this->documentHash;
    }

    public function signatureHash(): ?string
    {
        return $this->signatureHash;
    }

    public function send(): void
    {
        $this->state->send($this);
    }

    public function sign(string $signatureHash): void
    {
        self::assertSha256($signatureHash, 'Signature');
        $this->state->sign($this);
        $this->signatureHash = $signatureHash;
    }

    public function expire(): void
    {
        $this->state->expire($this);
    }

    public function transitionTo(ContractState $state): void
    {
        $this->state = $state;
    }

    private static function assertSha256(string $value, string $label): void
    {
        if (! preg_match('/^[a-f0-9]{64}$/', $value)) {
            throw new InvalidArgumentException("{$label} hash must be lowercase SHA-256.");
        }
    }
}
