@extends('layouts.app')

@section('title', 'Create Maintenance Receipt')

@section('content')
<div class="mb-4">
    <a href="{{ route('maintenance-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Maintenance Receipts
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-9">
        <div class="card">
            <div class="card-header"><i class="bi bi-tools me-2"></i>Create Maintenance Bill Receipt</div>
            <div class="card-body">
                <form action="{{ route('maintenance-receipts.store') }}" method="POST" enctype="multipart/form-data">
                    @csrf

                    <h6 class="text-muted mb-3">Property & Parties</h6>

                    <div class="mb-3">
                        <label for="property_id" class="form-label">Select Property <span class="text-danger">*</span></label>
                        <select name="property_id" id="property_id"
                            class="form-select @error('property_id') is-invalid @enderror">
                            <option value="">— Select Property —</option>
                            @foreach($properties as $property)
                            <option value="{{ $property->id }}"
                                {{ old('property_id') == $property->id ? 'selected' : '' }}
                                data-maintenance="{{ $property->maintenance_total }}"
                                data-owner-percent="{{ $property->owner_maintenance_percent }}"
                                data-tenant-percent="{{ $property->tenant_maintenance_percent }}"
                                data-tenant="{{ $property->tenant->name ?? '' }}"
                                data-owner="{{ $property->owner->name ?? '' }}">
                                {{ $property->address }}
                            </option>
                            @endforeach
                        </select>
                        @error('property_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    {{-- Auto-filled info --}}
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
                    <h6 class="text-muted mb-3">Maintenance Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="month" class="form-label">Billing Month <span class="text-danger">*</span></label>
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
                                    <option value="{{ $m }}" {{ old('month') == $m ? 'selected' : '' }}>{{ $m }}</option>
                                    @endforeach
                            </select>
                            @error('month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="total_maintenance" class="form-label">Total Maintenance Bill (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="total_maintenance" id="total_maintenance" step="0.01"
                                class="form-control @error('total_maintenance') is-invalid @enderror"
                                value="{{ old('total_maintenance') }}" placeholder="3950">
                            @error('total_maintenance')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="owner_percent" class="form-label">Owner's Share (%)</label>
                            <input type="number" name="owner_percent" id="owner_percent"
                                class="form-control" value="{{ old('owner_percent', 50) }}" min="0" max="100">
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="tenant_percent" class="form-label">Tenant's Share (%)</label>
                            <input type="number" name="tenant_percent" id="tenant_percent"
                                class="form-control" value="{{ old('tenant_percent', 50) }}" min="0" max="100">
                        </div>
                    </div>

                    {{-- Live Calculation Preview --}}
                    <div class="p-3 mb-3 rounded" id="calcPreview" style="background: #fefce8; border: 1px solid #fde68a; display: none;">
                        <h6 class="mb-2" style="color: #92400e;"><i class="bi bi-calculator me-1"></i>Cost Distribution Summary</h6>
                        <div style="font-size: .875rem;">
                            <p class="mb-1">Total Monthly Maintenance: <strong>Rs. <span id="calcTotal">0</span>/-</strong></p>
                            <p class="mb-1">Owner's Contribution: <strong>Rs. <span id="calcOwner">0</span>/- (<span id="calcOwnerPct">50</span>%)</strong></p>
                            <p class="mb-0">Tenant's Contribution: <strong>Rs. <span id="calcTenant">0</span>/- (<span id="calcTenantPct">50</span>%)</strong></p>
                        </div>
                        <hr class="my-2">
                        <p class="mb-0"><strong>Tenant Payable Amount: <span style="color: #991b1b;">Rs. <span id="calcTenantPayable">0</span>/-</span></strong></p>
                    </div>

                    <div class="mb-3">
                        <label for="tenant_amount_in_words" class="form-label">Tenant's Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="tenant_amount_in_words" id="tenant_amount_in_words"
                            class="form-control @error('tenant_amount_in_words') is-invalid @enderror"
                            value="{{ old('tenant_amount_in_words') }}" readonly
                            placeholder="One Thousand Nine Hundred and Seventy Five Rupees Only">
                        @error('tenant_amount_in_words')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Payment Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method <span class="text-danger">*</span></label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                <option value="cash" {{ old('payment_method') == 'cash' ? 'selected' : '' }}>Cash</option>
                                <option value="bank_transfer" {{ old('payment_method') == 'bank_transfer' ? 'selected' : '' }}>Bank Transfer</option>
                                <option value="cheque" {{ old('payment_method') == 'cheque' ? 'selected' : '' }}>Cheque</option>
                                <option value="online" {{ old('payment_method') == 'online' ? 'selected' : '' }}>Online</option>
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_date" class="form-label">Payment Date <span class="text-danger">*</span></label>
                            <input type="date" name="payment_date" id="payment_date"
                                class="form-control" value="{{ old('payment_date', date('Y-m-d')) }}">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes <small class="text-muted">(optional)</small></label>
                        <textarea name="notes" id="notes" rows="2" class="form-control">{{ old('notes') }}</textarea>
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Original Bill Copy</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="bill_reference" class="form-label">Bill Reference / Invoice Number</label>
                            <input type="text" name="bill_reference" id="bill_reference"
                                class="form-control @error('bill_reference') is-invalid @enderror"
                                value="{{ old('bill_reference') }}"
                                placeholder="e.g. BTO-12648 or Invoice #20251222430">
                            @error('bill_reference')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="bill_attachment" class="form-label">Attach Bill Copy <small class="text-muted">(PDF, JPG, PNG — max 5MB)</small></label>
                            <input type="file" name="bill_attachment" id="bill_attachment"
                                class="form-control @error('bill_attachment') is-invalid @enderror"
                                accept=".pdf,.jpg,.jpeg,.png">
                            @error('bill_attachment')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Create Receipt</button>
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

    function recalculate() {
        const total = parseFloat(document.getElementById('total_maintenance').value) || 0;
        const ownerPct = parseInt(document.getElementById('owner_percent').value) || 0;
        const tenantPct = parseInt(document.getElementById('tenant_percent').value) || 0;
        const ownerShare = Math.round(total * ownerPct / 100);
        const tenantShare = Math.round(total * tenantPct / 100);

        const preview = document.getElementById('calcPreview');
        if (total > 0) {
            preview.style.display = 'block';
            document.getElementById('calcTotal').textContent = total.toLocaleString();
            document.getElementById('calcOwner').textContent = ownerShare.toLocaleString();
            document.getElementById('calcTenant').textContent = tenantShare.toLocaleString();
            document.getElementById('calcOwnerPct').textContent = ownerPct;
            document.getElementById('calcTenantPct').textContent = tenantPct;
            document.getElementById('calcTenantPayable').textContent = tenantShare.toLocaleString();
            document.getElementById('tenant_amount_in_words').value = numberToWords(tenantShare);
        } else {
            preview.style.display = 'none';
        }
    }

    // Auto-fill from property
    document.getElementById('property_id').addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        const info = document.getElementById('partyInfo');
        if (this.value) {
            info.style.display = 'flex';
            document.getElementById('tenantName').textContent = opt.dataset.tenant || '—';
            document.getElementById('ownerName').textContent = opt.dataset.owner || '—';
            document.getElementById('total_maintenance').value = opt.dataset.maintenance || '';
            document.getElementById('owner_percent').value = opt.dataset.ownerPercent || 50;
            document.getElementById('tenant_percent').value = opt.dataset.tenantPercent || 50;
            recalculate();
        } else {
            info.style.display = 'none';
        }
    });

    // Recalculate on any change
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
