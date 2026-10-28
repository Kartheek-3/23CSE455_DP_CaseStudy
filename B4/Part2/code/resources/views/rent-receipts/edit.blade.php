@extends('layouts.app')

@section('title', 'Edit Rent Receipt')

@section('content')
<div class="mb-4">
    <a href="{{ route('rent-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Rent Receipts
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card">
            <div class="card-header"><i class="bi bi-pencil me-2"></i>Edit Rent Receipt: {{ $rentReceipt->month }}</div>
            <div class="card-body">
                <form action="{{ route('rent-receipts.update', $rentReceipt) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <h6 class="text-muted mb-3">Property & Parties</h6>

                    <div class="mb-3">
                        <label for="property_id" class="form-label">Property <span class="text-danger">*</span></label>
                        <select name="property_id" id="property_id"
                            class="form-select @error('property_id') is-invalid @enderror">
                            <option value="">— Select Property —</option>
                            @foreach($properties as $property)
                            <option value="{{ $property->id }}"
                                {{ old('property_id', $rentReceipt->property_id) == $property->id ? 'selected' : '' }}
                                data-rent="{{ $property->monthly_rent }}"
                                data-tenant="{{ $property->tenant->name ?? '' }}"
                                data-owner="{{ $property->owner->name ?? '' }}">
                                {{ $property->address }}
                            </option>
                            @endforeach
                        </select>
                        @error('property_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Receipt Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="month" class="form-label">Rent Month <span class="text-danger">*</span></label>
                            <select name="month" id="month"
                                class="form-select @error('month') is-invalid @enderror">
                                <option value="">— Select Month —</option>
                                @php
                                $months = [];
                                $start = \Carbon\Carbon::create(2025, 1, 1);
                                $end = now()->addMonth();
                                while ($start <= $end) {
                                    $months[]=$start->format('F Y');
                                    $start->addMonth();
                                    }
                                    $months = array_reverse($months);
                                    @endphp
                                    @foreach($months as $m)
                                    <option value="{{ $m }}" {{ old('month', $rentReceipt->month) == $m ? 'selected' : '' }}>
                                        {{ $m }}
                                    </option>
                                    @endforeach
                            </select>
                            @error('month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="amount" class="form-label">Amount (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="amount" id="amount" step="0.01"
                                class="form-control @error('amount') is-invalid @enderror"
                                value="{{ old('amount', $rentReceipt->amount) }}">
                            @error('amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="amount_in_words" class="form-label">Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="amount_in_words" id="amount_in_words"
                            class="form-control @error('amount_in_words') is-invalid @enderror"
                            value="{{ old('amount_in_words', $rentReceipt->amount_in_words) }}" readonly>
                        @error('amount_in_words')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method</label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                @foreach(['cash', 'bank_transfer', 'cheque', 'online'] as $method)
                                <option value="{{ $method }}"
                                    {{ old('payment_method', $rentReceipt->payment_method) == $method ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_', ' ', $method)) }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_date" class="form-label">Payment Date</label>
                            <input type="date" name="payment_date" id="payment_date"
                                class="form-control @error('payment_date') is-invalid @enderror"
                                value="{{ old('payment_date', $rentReceipt->payment_date->format('Y-m-d')) }}">
                            @error('payment_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes</label>
                        <textarea name="notes" id="notes" rows="2"
                            class="form-control">{{ old('notes', $rentReceipt->notes) }}</textarea>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Update Receipt</button>
                        <a href="{{ route('rent-receipts.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    function numberToWords(num) {
        if (num === 0) return 'Zero Rupees Only';
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
            'Seventeen', 'Eighteen', 'Nineteen'
        ];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertGroup(n) {
            if (n === 0) return '';
            if (n < 20) return ones[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
        }
        let result = '';
        const crore = Math.floor(num / 10000000);
        const lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000);
        const remainder = num % 1000;
        if (crore) result += convertGroup(crore) + ' Crore ';
        if (lakh) result += convertGroup(lakh) + ' Lakh ';
        if (thousand) result += convertGroup(thousand) + ' Thousand ';
        if (remainder) result += convertGroup(remainder);
        return result.trim() + ' Rupees Only';
    }
    document.getElementById('amount').addEventListener('input', function() {
        document.getElementById('amount_in_words').value = numberToWords(parseFloat(this.value) || 0);
    });
</script>
@endpush
@endsection
