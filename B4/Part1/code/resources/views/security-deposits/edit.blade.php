@extends('layouts.app')

@section('title', 'Edit Security Deposit')

@section('content')
<div class="mb-4">
    <a href="{{ route('security-deposits.show', $securityDeposit) }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Deposit
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-pencil me-2"></i>Edit Security Deposit</div>
            <div class="card-body">
                <form action="{{ route('security-deposits.update', $securityDeposit) }}" method="POST">
                    @csrf
                    @method('PUT')

                    <div class="p-3 rounded mb-4" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                        <p class="mb-1"><strong>Tenant:</strong> {{ $securityDeposit->tenant->name }}</p>
                        <p class="mb-0"><strong>Property:</strong> {{ $securityDeposit->property->address }}</p>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="monthly_rent_at_time" class="form-label">Monthly Rent at Time (Rs.)</label>
                            <input type="number" name="monthly_rent_at_time" id="monthly_rent_at_time" step="0.01"
                                class="form-control" value="{{ old('monthly_rent_at_time', $securityDeposit->monthly_rent_at_time) }}">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="months_count" class="form-label">Security Months</label>
                            <select name="months_count" id="months_count" class="form-select">
                                @for($i = 1; $i <= 6; $i++)
                                    <option value="{{ $i }}" {{ old('months_count', $securityDeposit->months_count) == $i ? 'selected' : '' }}>
                                    {{ $i }} {{ $i === 1 ? 'Month' : 'Months' }}
                                    </option>
                                    @endfor
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="total_amount" class="form-label">Total Amount (Rs.)</label>
                            <input type="number" name="total_amount" id="total_amount" step="0.01"
                                class="form-control" value="{{ old('total_amount', $securityDeposit->total_amount) }}"
                                readonly style="background: #eef2ff; font-weight: 600;">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="amount_in_words" class="form-label">Amount in Words</label>
                        <input type="text" name="amount_in_words" id="amount_in_words" class="form-control"
                            value="{{ old('amount_in_words', $securityDeposit->amount_in_words) }}" readonly>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="deposit_date" class="form-label">Deposit Date</label>
                            <input type="date" name="deposit_date" id="deposit_date" class="form-control"
                                value="{{ old('deposit_date', $securityDeposit->deposit_date->format('Y-m-d')) }}">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method</label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                @foreach(['cash','bank_transfer','cheque','online'] as $method)
                                <option value="{{ $method }}" {{ old('payment_method', $securityDeposit->payment_method) == $method ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_',' ',$method)) }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes</label>
                        <textarea name="notes" id="notes" rows="2" class="form-control">{{ old('notes', $securityDeposit->notes) }}</textarea>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Update</button>
                        <a href="{{ route('security-deposits.show', $securityDeposit) }}" class="btn btn-light">Cancel</a>
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
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertGroup(n) {
            if (n === 0) return '';
            if (n < 20) return ones[n];
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
            return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convertGroup(n % 100) : '');
        }
        let r = '';
        const cr = Math.floor(num / 10000000),
            lk = Math.floor((num % 10000000) / 100000),
            th = Math.floor((num % 100000) / 1000),
            rm = num % 1000;
        if (cr) r += convertGroup(cr) + ' Crore ';
        if (lk) r += convertGroup(lk) + ' Lakh ';
        if (th) r += convertGroup(th) + ' Thousand ';
        if (rm) r += convertGroup(rm);
        return r.trim() + ' Rupees Only';
    }

    function recalc() {
        const rent = parseFloat(document.getElementById('monthly_rent_at_time').value) || 0;
        const months = parseInt(document.getElementById('months_count').value) || 0;
        const total = rent * months;
        document.getElementById('total_amount').value = total > 0 ? total : '';
        document.getElementById('amount_in_words').value = total > 0 ? numberToWords(total) : '';
    }
    document.getElementById('monthly_rent_at_time').addEventListener('input', recalc);
    document.getElementById('months_count').addEventListener('change', recalc);
</script>
@endpush
@endsection
