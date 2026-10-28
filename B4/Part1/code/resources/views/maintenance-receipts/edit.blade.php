@extends('layouts.app')

@section('title', 'Edit Maintenance Receipt')

@section('content')
<div class="mb-4">
    <a href="{{ route('maintenance-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Maintenance Receipts
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card">
            <div class="card-header"><i class="bi bi-pencil me-2"></i>Edit Maintenance Receipt: {{ $maintenanceReceipt->month }}</div>
            <div class="card-body">
                <form action="{{ route('maintenance-receipts.update', $maintenanceReceipt) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <div class="mb-3">
                        <label for="property_id" class="form-label">Property <span class="text-danger">*</span></label>
                        <select name="property_id" id="property_id" class="form-select @error('property_id') is-invalid @enderror">
                            <option value="">— Select Property —</option>
                            @foreach($properties as $property)
                            <option value="{{ $property->id }}"
                                {{ old('property_id', $maintenanceReceipt->property_id) == $property->id ? 'selected' : '' }}>
                                {{ $property->address }}
                            </option>
                            @endforeach
                        </select>
                        @error('property_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="month" class="form-label">Month <span class="text-danger">*</span></label>
                            <select name="month" id="month" class="form-select @error('month') is-invalid @enderror">
                                @php
                                $months = [];
                                $start = \Carbon\Carbon::create(2025, 1, 1);
                                $end = now()->addMonth();
                                while ($start <= $end) { $months[]=$start->format('F Y'); $start->addMonth(); }
                                    $months = array_reverse($months);
                                    @endphp
                                    @foreach($months as $m)
                                    <option value="{{ $m }}" {{ old('month', $maintenanceReceipt->month) == $m ? 'selected' : '' }}>{{ $m }}</option>
                                    @endforeach
                            </select>
                            @error('month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="total_maintenance" class="form-label">Total Maintenance (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="total_maintenance" id="total_maintenance" step="0.01"
                                class="form-control @error('total_maintenance') is-invalid @enderror"
                                value="{{ old('total_maintenance', $maintenanceReceipt->total_maintenance) }}">
                            @error('total_maintenance')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="owner_percent" class="form-label">Owner's Share (%)</label>
                            <input type="number" name="owner_percent" id="owner_percent" class="form-control"
                                value="{{ old('owner_percent', $maintenanceReceipt->owner_percent) }}" min="0" max="100">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="tenant_percent" class="form-label">Tenant's Share (%)</label>
                            <input type="number" name="tenant_percent" id="tenant_percent" class="form-control"
                                value="{{ old('tenant_percent', $maintenanceReceipt->tenant_percent) }}" min="0" max="100">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="tenant_amount_in_words" class="form-label">Tenant's Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="tenant_amount_in_words" id="tenant_amount_in_words"
                            class="form-control @error('tenant_amount_in_words') is-invalid @enderror"
                            value="{{ old('tenant_amount_in_words', $maintenanceReceipt->tenant_amount_in_words) }}" readonly>
                        @error('tenant_amount_in_words')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method</label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                @foreach(['cash', 'bank_transfer', 'cheque', 'online'] as $method)
                                <option value="{{ $method }}" {{ old('payment_method', $maintenanceReceipt->payment_method) == $method ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_', ' ', $method)) }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_date" class="form-label">Payment Date</label>
                            <input type="date" name="payment_date" id="payment_date" class="form-control"
                                value="{{ old('payment_date', $maintenanceReceipt->payment_date->format('Y-m-d')) }}">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes</label>
                        <textarea name="notes" id="notes" rows="2" class="form-control">{{ old('notes', $maintenanceReceipt->notes) }}</textarea>
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Original Bill Copy</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="bill_reference" class="form-label">Bill Reference / Invoice Number</label>
                            <input type="text" name="bill_reference" id="bill_reference"
                                class="form-control @error('bill_reference') is-invalid @enderror"
                                value="{{ old('bill_reference', $maintenanceReceipt->bill_reference) }}"
                                placeholder="e.g. BTO-12648">
                            @error('bill_reference')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="bill_attachment" class="form-label">Attach Bill Copy <small class="text-muted">(PDF, JPG, PNG — max 5MB)</small></label>
                            <input type="file" name="bill_attachment" id="bill_attachment"
                                class="form-control @error('bill_attachment') is-invalid @enderror"
                                accept=".pdf,.jpg,.jpeg,.png">
                            @error('bill_attachment')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            @if($maintenanceReceipt->bill_attachment)
                            <div class="mt-2">
                                <span class="badge badge-success"><i class="bi bi-paperclip me-1"></i>File attached</span>
                                <a href="{{ asset('storage/' . $maintenanceReceipt->bill_attachment) }}" target="_blank" class="small ms-2">
                                    <i class="bi bi-eye me-1"></i>View current file
                                </a>
                            </div>
                            @endif
                        </div>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Update Receipt</button>
                        <a href="{{ route('maintenance-receipts.index') }}" class="btn btn-light">Cancel</a>
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
        const crore = Math.floor(num / 10000000),
            lakh = Math.floor((num % 10000000) / 100000);
        const thousand = Math.floor((num % 100000) / 1000),
            remainder = num % 1000;
        if (crore) result += convertGroup(crore) + ' Crore ';
        if (lakh) result += convertGroup(lakh) + ' Lakh ';
        if (thousand) result += convertGroup(thousand) + ' Thousand ';
        if (remainder) result += convertGroup(remainder);
        return result.trim() + ' Rupees Only';
    }

    function recalculate() {
        const total = parseFloat(document.getElementById('total_maintenance').value) || 0;
        const tenantPct = parseInt(document.getElementById('tenant_percent').value) || 0;
        const tenantShare = Math.round(total * tenantPct / 100);
        document.getElementById('tenant_amount_in_words').value = total > 0 ? numberToWords(tenantShare) : '';
    }
    document.getElementById('total_maintenance').addEventListener('input', recalculate);
    document.getElementById('owner_percent').addEventListener('input', function() {
        document.getElementById('tenant_percent').value = 100 - (parseInt(this.value) || 0);
        recalculate();
    });
    document.getElementById('tenant_percent').addEventListener('input', function() {
        document.getElementById('owner_percent').value = 100 - (parseInt(this.value) || 0);
        recalculate();
    });
</script>
@endpush
@endsection
