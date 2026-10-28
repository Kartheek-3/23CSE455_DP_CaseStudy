@extends('layouts.app')

@section('title', 'Record Security Deposit')

@section('content')
<div class="mb-4">
    <a href="{{ route('security-deposits.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Security Deposits
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-shield-lock me-2"></i>Record Security Deposit</div>
            <div class="card-body">
                <form action="{{ route('security-deposits.store') }}" method="POST">
                    @csrf

                    <div class="mb-3">
                        <label for="property_id" class="form-label">Select Property <span class="text-danger">*</span></label>
                        <select name="property_id" id="property_id"
                            class="form-select @error('property_id') is-invalid @enderror">
                            <option value="">— Select Property —</option>
                            @foreach($properties as $property)
                            <option value="{{ $property->id }}"
                                {{ old('property_id') == $property->id ? 'selected' : '' }}
                                data-rent="{{ $property->monthly_rent }}"
                                data-tenant="{{ $property->tenant->name ?? '' }}"
                                data-owner="{{ $property->owner->name ?? '' }}">
                                {{ $property->address }} ({{ $property->tenant->name ?? 'No tenant' }})
                            </option>
                            @endforeach
                        </select>
                        @error('property_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row mb-3" id="partyInfo" style="display: none;">
                        <div class="col-md-6">
                            <div class="p-3 rounded" style="background: #f0fdf4; border: 1px solid #bbf7d0;">
                                <small class="text-muted d-block mb-1">Tenant</small>
                                <strong id="tenantName">—</strong>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="p-3 rounded" style="background: #eef2ff; border: 1px solid #c7d2fe;">
                                <small class="text-muted d-block mb-1">Owner</small>
                                <strong id="ownerName">—</strong>
                            </div>
                        </div>
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Deposit Details</h6>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="monthly_rent_at_time" class="form-label">Monthly Rent at Time (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="monthly_rent_at_time" id="monthly_rent_at_time" step="0.01"
                                class="form-control @error('monthly_rent_at_time') is-invalid @enderror"
                                value="{{ old('monthly_rent_at_time') }}" placeholder="40000">
                            @error('monthly_rent_at_time')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="months_count" class="form-label">Security Months <span class="text-danger">*</span></label>
                            <select name="months_count" id="months_count"
                                class="form-select @error('months_count') is-invalid @enderror">
                                @for($i = 1; $i <= 6; $i++)
                                    <option value="{{ $i }}" {{ old('months_count', 2) == $i ? 'selected' : '' }}>
                                    {{ $i }} {{ $i === 1 ? 'Month' : 'Months' }}
                                    </option>
                                    @endfor
                            </select>
                            @error('months_count')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="total_amount" class="form-label">Total Deposit Amount (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="total_amount" id="total_amount" step="0.01"
                                class="form-control @error('total_amount') is-invalid @enderror"
                                value="{{ old('total_amount') }}" readonly
                                style="background: #eef2ff; font-weight: 600;">
                            @error('total_amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="amount_in_words" class="form-label">Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="amount_in_words" id="amount_in_words"
                            class="form-control @error('amount_in_words') is-invalid @enderror"
                            value="{{ old('amount_in_words') }}" readonly>
                        @error('amount_in_words')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="deposit_date" class="form-label">Deposit Date <span class="text-danger">*</span></label>
                            <input type="date" name="deposit_date" id="deposit_date"
                                class="form-control @error('deposit_date') is-invalid @enderror"
                                value="{{ old('deposit_date', date('Y-m-d')) }}">
                            @error('deposit_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method <span class="text-danger">*</span></label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                <option value="cash" {{ old('payment_method') == 'cash' ? 'selected' : '' }}>Cash</option>
                                <option value="bank_transfer" {{ old('payment_method') == 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                                <option value="cheque" {{ old('payment_method') == 'cheque' ? 'selected' : '' }}>Cheque</option>
                                <option value="online" {{ old('payment_method') == 'online' ? 'selected' : '' }}>Online</option>
                            </select>
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes <small class="text-muted">(optional)</small></label>
                        <textarea name="notes" id="notes" rows="2" class="form-control">{{ old('notes') }}</textarea>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Record Deposit</button>
                        <a href="{{ route('security-deposits.index') }}" class="btn btn-light">Cancel</a>
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

    function recalculate() {
        const rent = parseFloat(document.getElementById('monthly_rent_at_time').value) || 0;
        const months = parseInt(document.getElementById('months_count').value) || 0;
        const total = rent * months;
        document.getElementById('total_amount').value = total > 0 ? total : '';
        document.getElementById('amount_in_words').value = total > 0 ? numberToWords(total) : '';
    }

    document.getElementById('property_id').addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        const info = document.getElementById('partyInfo');
        if (this.value) {
            info.style.display = 'flex';
            document.getElementById('tenantName').textContent = opt.dataset.tenant || '—';
            document.getElementById('ownerName').textContent = opt.dataset.owner || '—';
            document.getElementById('monthly_rent_at_time').value = opt.dataset.rent || '';
            recalculate();
        } else {
            info.style.display = 'none';
        }
    });

    document.getElementById('monthly_rent_at_time').addEventListener('input', recalculate);
    document.getElementById('months_count').addEventListener('change', recalculate);
</script>
@endpush
@endsection
