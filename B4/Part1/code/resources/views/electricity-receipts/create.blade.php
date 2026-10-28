@extends('layouts.app')

@section('title', 'Create Electricity Receipt')

@section('content')
<div class="mb-4">
    <a href="{{ route('electricity-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Electricity Receipts
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-10">
        <div class="card">
            <div class="card-header"><i class="bi bi-lightning-charge me-2"></i>Create Electricity Bill Receipt</div>
            <div class="card-body">
                <form action="{{ route('electricity-receipts.store') }}" method="POST" enctype="multipart/form-data">
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
                                data-tenant="{{ $property->tenant->name ?? '' }}"
                                data-owner="{{ $property->owner->name ?? '' }}">
                                {{ $property->address }}
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
                    <h6 class="text-muted mb-3">WAPDA Bill Details</h6>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="month" class="form-label">Billing Month <span class="text-danger">*</span></label>
                            <select name="month" id="month" class="form-select @error('month') is-invalid @enderror">
                                <option value="">— Select Month —</option>
                                @php
                                $months = [];
                                $start = \Carbon\Carbon::create(2025, 1, 1);
                                $end = now()->addMonth();
                                while ($start <= $end) { $months[]=$start->format('F Y'); $start->addMonth(); }
                                    $months = array_reverse($months);
                                    @endphp
                                    @foreach($months as $m)
                                    <option value="{{ $m }}" {{ old('month') == $m ? 'selected' : '' }}>{{ $m }}</option>
                                    @endforeach
                            </select>
                            @error('month')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="main_bill_amount" class="form-label">Total Payable from WAPDA Bill (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="main_bill_amount" id="main_bill_amount" step="0.01"
                                class="form-control @error('main_bill_amount') is-invalid @enderror"
                                value="{{ old('main_bill_amount') }}" placeholder="e.g. 1890">
                            @error('main_bill_amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="rate_per_unit" class="form-label">Rate Per Unit (Rs.) <span class="text-muted">(auto-calculated)</span></label>
                            <input type="number" name="rate_per_unit" id="rate_per_unit" step="0.01"
                                class="form-control @error('rate_per_unit') is-invalid @enderror"
                                value="{{ old('rate_per_unit') }}" readonly
                                style="background: #eef2ff; font-weight: 600;">
                            @error('rate_per_unit')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            <small class="text-muted">= Total Payable ÷ Main Meter Units</small>
                        </div>
                    </div>

                    <hr class="my-4">

                    {{-- Meter Readings Side by Side --}}
                    <div class="row">
                        {{-- Main Meter --}}
                        <div class="col-md-6">
                            <div class="p-3 rounded mb-3" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                                <h6 class="mb-3" style="color: #5b6abf;"><i class="bi bi-speedometer me-1"></i>Main Meter Reading</h6>

                                <div class="mb-3">
                                    <label for="main_previous_reading" class="form-label">Previous Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="main_previous_reading" id="main_previous_reading"
                                        class="form-control @error('main_previous_reading') is-invalid @enderror"
                                        value="{{ old('main_previous_reading') }}" placeholder="e.g. 1806">
                                    @error('main_previous_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="mb-3">
                                    <label for="main_previous_date" class="form-label">Previous Reading Date <span class="text-danger">*</span></label>
                                    <input type="date" name="main_previous_date" id="main_previous_date"
                                        class="form-control @error('main_previous_date') is-invalid @enderror"
                                        value="{{ old('main_previous_date') }}">
                                    @error('main_previous_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="mb-3">
                                    <label for="main_current_reading" class="form-label">Current Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="main_current_reading" id="main_current_reading"
                                        class="form-control @error('main_current_reading') is-invalid @enderror"
                                        value="{{ old('main_current_reading') }}" placeholder="e.g. 1837">
                                    @error('main_current_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="mb-3">
                                    <label for="main_current_date" class="form-label">Current Reading Date <span class="text-danger">*</span></label>
                                    <input type="date" name="main_current_date" id="main_current_date"
                                        class="form-control @error('main_current_date') is-invalid @enderror"
                                        value="{{ old('main_current_date') }}">
                                    @error('main_current_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="p-2 rounded text-center" style="background: #e2e8f0;">
                                    <small class="text-muted">Total Units Consumed</small>
                                    <div class="fw-bold fs-5" id="mainUnits">0</div>
                                </div>
                            </div>
                        </div>

                        {{-- Sub Meter (Tenant) --}}
                        <div class="col-md-6">
                            <div class="p-3 rounded mb-3" style="background: #fefce8; border: 1px solid #fde68a;">
                                <h6 class="mb-3" style="color: #92400e;"><i class="bi bi-speedometer2 me-1"></i>Tenant Sub-Meter Reading</h6>

                                <div class="mb-3">
                                    <label for="sub_previous_reading" class="form-label">Previous Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="sub_previous_reading" id="sub_previous_reading"
                                        class="form-control @error('sub_previous_reading') is-invalid @enderror"
                                        value="{{ old('sub_previous_reading') }}" placeholder="e.g. 117">
                                    @error('sub_previous_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="mb-3" style="visibility: hidden; height: 74px;"></div>

                                <div class="mb-3">
                                    <label for="sub_current_reading" class="form-label">Current Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="sub_current_reading" id="sub_current_reading"
                                        class="form-control @error('sub_current_reading') is-invalid @enderror"
                                        value="{{ old('sub_current_reading') }}" placeholder="e.g. 173">
                                    @error('sub_current_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>

                                <div class="mb-3" style="visibility: hidden; height: 74px;"></div>

                                <div class="p-2 rounded text-center" style="background: #fde68a;">
                                    <small class="text-muted">Tenant Units Consumed</small>
                                    <div class="fw-bold fs-5" id="tenantUnits">0</div>
                                </div>

                                <hr class="my-3" style="border-color: #fde68a;">
                                <div class="mb-2">
                                    <label class="form-label small"><i class="bi bi-camera me-1"></i>Previous Reading Photo</label>
                                    <input type="file" name="submeter_previous_photo"
                                           class="form-control form-control-sm @error('submeter_previous_photo') is-invalid @enderror"
                                           accept=".jpg,.jpeg,.png">
                                    @error('submeter_previous_photo')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small"><i class="bi bi-camera me-1"></i>Current Reading Photo</label>
                                    <input type="file" name="submeter_current_photo"
                                           class="form-control form-control-sm @error('submeter_current_photo') is-invalid @enderror"
                                           accept=".jpg,.jpeg,.png">
                                    @error('submeter_current_photo')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Live Calculation Preview --}}
                    <div class="p-3 mb-3 rounded" id="calcPreview" style="background: #eef2ff; border: 1px solid #c7d2fe; display: none;">
                        <h6 class="mb-2" style="color: #3730a3;"><i class="bi bi-calculator me-1"></i>Billing Breakdown</h6>
                        <table style="width: 100%; font-size: .875rem; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #c7d2fe;">
                                <td style="padding: 6px 0;">Rate Calculation</td>
                                <td style="padding: 6px 0;">Rs. <span id="calcBillAmt">0</span> ÷ <span id="calcMainUnits">0</span> units</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">Rs. <span id="calcRate">0</span>/unit</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #c7d2fe;">
                                <td style="padding: 6px 0;">Tenant Electricity (Sub-meter)</td>
                                <td style="padding: 6px 0;"><span id="calcTenantUnits">0</span> units × Rs. <span id="calcRate2">0</span>/unit</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">Rs. <span id="calcTenantBill">0</span></td>
                            </tr>
                            <tr style="border-bottom: 1px solid #c7d2fe;">
                                <td style="padding: 6px 0;">Owner Electricity</td>
                                <td style="padding: 6px 0;"><span id="calcOwnerUnits">0</span> units × Rs. <span id="calcRate3">0</span>/unit</td>
                                <td style="padding: 6px 0; text-align: right;">Rs. <span id="calcOwnerBill">0</span></td>
                            </tr>
                            <tr style="border-top: 3px solid #3730a3; font-weight: bold; font-size: 1rem;">
                                <td style="padding: 8px 0;" colspan="2">Total Tenant Bill</td>
                                <td style="padding: 8px 0; text-align: right; color: #991b1b;">Rs. <span id="calcTotalTenant">0</span>/-</td>
                            </tr>
                        </table>
                        <hr style="margin: 8px 0; border-color: #c7d2fe;">
                        <div style="font-size: .8rem; color: #64748b;">
                            <strong>Verification:</strong>
                            Main Bill Rs. <span id="calcMainBillV">0</span> =
                            Tenant Rs. <span id="calcTenantBillV">0</span> +
                            Owner Rs. <span id="calcOwnerBillV">0</span>
                            (Difference: Rs. <span id="calcDifference">0</span> due to rounding)
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="tenant_amount_in_words" class="form-label">Tenant Bill Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="tenant_amount_in_words" id="tenant_amount_in_words"
                            class="form-control @error('tenant_amount_in_words') is-invalid @enderror"
                            value="{{ old('tenant_amount_in_words') }}" readonly>
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
                        <textarea name="notes" id="notes" rows="4"
                            class="form-control @error('notes') is-invalid @enderror">{{ old('notes') }}</textarea>
                        @error('notes')<div class="invalid-feedback">{{ $message }}</div>@enderror
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
                        <a href="{{ route('electricity-receipts.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>

@push('scripts')
<script>
    const lastReadings = @json($lastReadings);

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
        const mainPrev = parseInt(document.getElementById('main_previous_reading').value) || 0;
        const mainCurr = parseInt(document.getElementById('main_current_reading').value) || 0;
        const subPrev = parseInt(document.getElementById('sub_previous_reading').value) || 0;
        const subCurr = parseInt(document.getElementById('sub_current_reading').value) || 0;
        const mainBill = parseFloat(document.getElementById('main_bill_amount').value) || 0;

        const mainUnits = Math.max(0, mainCurr - mainPrev);
        const tenantUnits = Math.max(0, subCurr - subPrev);
        const ownerUnits = Math.max(0, mainUnits - tenantUnits);

        // Auto-calculate rate: Total Payable ÷ Main Units
        const rate = mainUnits > 0 ? (mainBill / mainUnits) : 0;
        const rateRounded = Math.round(rate * 100) / 100;

        // Set rate field
        document.getElementById('rate_per_unit').value = rateRounded > 0 ? rateRounded.toFixed(2) : '';

        // Calculate bills using the exact rate (not rounded) for accuracy
        const tenantBill = Math.round(tenantUnits * rate);
        const ownerBill = Math.round(ownerUnits * rate);
        const difference = Math.round(mainBill - tenantBill - ownerBill);

        // Update unit displays
        document.getElementById('mainUnits').textContent = mainUnits;
        document.getElementById('tenantUnits').textContent = tenantUnits;

        const preview = document.getElementById('calcPreview');
        if (mainUnits > 0 && mainBill > 0) {
            preview.style.display = 'block';

            document.getElementById('calcBillAmt').textContent = mainBill.toLocaleString();
            document.getElementById('calcMainUnits').textContent = mainUnits;
            document.getElementById('calcRate').textContent = rateRounded.toFixed(2);
            document.getElementById('calcRate2').textContent = rateRounded.toFixed(2);
            document.getElementById('calcRate3').textContent = rateRounded.toFixed(2);

            document.getElementById('calcTenantUnits').textContent = tenantUnits;
            document.getElementById('calcOwnerUnits').textContent = ownerUnits;
            document.getElementById('calcTenantBill').textContent = tenantBill.toLocaleString();
            document.getElementById('calcOwnerBill').textContent = ownerBill.toLocaleString();
            document.getElementById('calcTotalTenant').textContent = tenantBill.toLocaleString();

            document.getElementById('calcMainBillV').textContent = mainBill.toLocaleString();
            document.getElementById('calcTenantBillV').textContent = tenantBill.toLocaleString();
            document.getElementById('calcOwnerBillV').textContent = ownerBill.toLocaleString();
            document.getElementById('calcDifference').textContent = difference;

            if (tenantBill > 0) {
                document.getElementById('tenant_amount_in_words').value = numberToWords(tenantBill);
            }
        } else {
            preview.style.display = 'none';
            document.getElementById('tenant_amount_in_words').value = '';
        }
    }

    // Auto-fill from property selection
    document.getElementById('property_id').addEventListener('change', function() {
        const opt = this.options[this.selectedIndex];
        const info = document.getElementById('partyInfo');
        if (this.value) {
            info.style.display = 'flex';
            document.getElementById('tenantName').textContent = opt.dataset.tenant || '—';
            document.getElementById('ownerName').textContent = opt.dataset.owner || '—';

            // Auto-fill previous readings from last receipt
            const propId = this.value;
            if (lastReadings[propId]) {
                document.getElementById('main_previous_reading').value = lastReadings[propId].main_current;
                document.getElementById('main_previous_date').value = lastReadings[propId].main_date;
                document.getElementById('sub_previous_reading').value = lastReadings[propId].sub_current;
            }
            recalculate();
        } else {
            info.style.display = 'none';
        }
    });

    // Recalculate on any input change
    ['main_previous_reading', 'main_current_reading', 'sub_previous_reading',
        'sub_current_reading', 'main_bill_amount'
    ].forEach(id => {
        document.getElementById(id).addEventListener('input', recalculate);
    });
</script>
@endpush
@endsection
