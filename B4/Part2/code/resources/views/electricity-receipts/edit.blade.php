@extends('layouts.app')

@section('title', 'Edit Electricity Receipt')

@section('content')
<div class="mb-4">
    <a href="{{ route('electricity-receipts.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Electricity Receipts
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-10">
        <div class="card">
            <div class="card-header"><i class="bi bi-pencil me-2"></i>Edit Electricity Receipt: {{ $electricityReceipt->month }}</div>
            <div class="card-body">
                <form action="{{ route('electricity-receipts.update', $electricityReceipt) }}" method="POST" enctype="multipart/form-data">
                    @csrf
                    @method('PUT')

                    <h6 class="text-muted mb-3">WAPDA Bill Details</h6>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="property_id" class="form-label">Property <span class="text-danger">*</span></label>
                            <select name="property_id" id="property_id" class="form-select">
                                @foreach($properties as $property)
                                <option value="{{ $property->id }}" {{ old('property_id', $electricityReceipt->property_id) == $property->id ? 'selected' : '' }}>
                                    {{ $property->address }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="month" class="form-label">Month <span class="text-danger">*</span></label>
                            <select name="month" id="month" class="form-select">
                                @php
                                $months = []; $start = \Carbon\Carbon::create(2025,1,1); $end = now()->addMonth();
                                while($start<=$end){$months[]=$start->format('F Y');$start->addMonth();}
                                    $months = array_reverse($months);
                                    @endphp
                                    @foreach($months as $m)
                                    <option value="{{ $m }}" {{ old('month', $electricityReceipt->month) == $m ? 'selected' : '' }}>{{ $m }}</option>
                                    @endforeach
                            </select>
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="main_bill_amount" class="form-label">Total Payable from WAPDA Bill (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="main_bill_amount" id="main_bill_amount" step="0.01"
                                class="form-control @error('main_bill_amount') is-invalid @enderror"
                                value="{{ old('main_bill_amount', $electricityReceipt->main_bill_amount) }}">
                            @error('main_bill_amount')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="rate_per_unit" class="form-label">Rate Per Unit (Rs.) <span class="text-muted">(auto-calculated: Total Payable ÷ Main Units)</span></label>
                        <input type="number" name="rate_per_unit" id="rate_per_unit" step="0.01"
                            class="form-control" readonly style="background: #eef2ff; font-weight: 600; max-width: 250px;"
                            value="{{ old('rate_per_unit', $electricityReceipt->rate_per_unit) }}">
                    </div>

                    <hr class="my-4">

                    <div class="row">
                        {{-- Main Meter --}}
                        <div class="col-md-6">
                            <div class="p-3 rounded mb-3" style="background: #f8fafc; border: 1px solid #e2e8f0;">
                                <h6 style="color: #5b6abf;"><i class="bi bi-speedometer me-1"></i>Main Meter Reading</h6>

                                <div class="mb-2">
                                    <label class="form-label small">Previous Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="main_previous_reading" id="main_previous_reading"
                                        class="form-control @error('main_previous_reading') is-invalid @enderror"
                                        value="{{ old('main_previous_reading', $electricityReceipt->main_previous_reading) }}">
                                    @error('main_previous_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small">Previous Date <span class="text-danger">*</span></label>
                                    <input type="date" name="main_previous_date" id="main_previous_date"
                                        class="form-control @error('main_previous_date') is-invalid @enderror"
                                        value="{{ old('main_previous_date', $electricityReceipt->main_previous_date->format('Y-m-d')) }}">
                                    @error('main_previous_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small">Current Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="main_current_reading" id="main_current_reading"
                                        class="form-control @error('main_current_reading') is-invalid @enderror"
                                        value="{{ old('main_current_reading', $electricityReceipt->main_current_reading) }}">
                                    @error('main_current_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small">Current Date <span class="text-danger">*</span></label>
                                    <input type="date" name="main_current_date" id="main_current_date"
                                        class="form-control @error('main_current_date') is-invalid @enderror"
                                        value="{{ old('main_current_date', $electricityReceipt->main_current_date->format('Y-m-d')) }}">
                                    @error('main_current_date')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="p-2 rounded text-center" style="background: #e2e8f0;">
                                    <small class="text-muted">Total Units</small>
                                    <div class="fw-bold fs-5" id="mainUnits">{{ $electricityReceipt->main_total_units }}</div>
                                </div>
                            </div>
                        </div>

                        {{-- Sub Meter --}}
                        <div class="col-md-6">
                            <div class="p-3 rounded mb-3" style="background: #fefce8; border: 1px solid #fde68a;">
                                <h6 style="color: #92400e;"><i class="bi bi-speedometer2 me-1"></i>Tenant Sub-Meter Reading</h6>

                                <div class="mb-2">
                                    <label class="form-label small">Previous Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="sub_previous_reading" id="sub_previous_reading"
                                        class="form-control @error('sub_previous_reading') is-invalid @enderror"
                                        value="{{ old('sub_previous_reading', $electricityReceipt->sub_previous_reading) }}">
                                    @error('sub_previous_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2" style="visibility: hidden; height: 74px;"></div>
                                <div class="mb-2">
                                    <label class="form-label small">Current Reading <span class="text-danger">*</span></label>
                                    <input type="number" name="sub_current_reading" id="sub_current_reading"
                                        class="form-control @error('sub_current_reading') is-invalid @enderror"
                                        value="{{ old('sub_current_reading', $electricityReceipt->sub_current_reading) }}">
                                    @error('sub_current_reading')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                </div>
                                <div class="mb-2" style="visibility: hidden; height: 74px;"></div>
                                <div class="p-2 rounded text-center" style="background: #fde68a;">
                                    <small class="text-muted">Tenant Units</small>
                                    <div class="fw-bold fs-5" id="tenantUnits">{{ $electricityReceipt->tenant_units_consumed }}</div>
                                </div>

                                <hr class="my-3" style="border-color: #fde68a;">
                                <div class="mb-2">
                                    <label class="form-label small"><i class="bi bi-camera me-1"></i>Previous Reading Photo</label>
                                    <input type="file" name="submeter_previous_photo"
                                           class="form-control form-control-sm @error('submeter_previous_photo') is-invalid @enderror"
                                           accept=".jpg,.jpeg,.png">
                                    @error('submeter_previous_photo')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                    @if($electricityReceipt->submeter_previous_photo)
                                        <div class="mt-1">
                                            <a href="{{ asset('storage/' . $electricityReceipt->submeter_previous_photo) }}" target="_blank">
                                                <img src="{{ asset('storage/' . $electricityReceipt->submeter_previous_photo) }}"
                                                     style="max-width: 100%; max-height: 80px; border-radius: 4px; border: 1px solid #fde68a;">
                                            </a>
                                        </div>
                                    @endif
                                </div>
                                <div class="mb-2">
                                    <label class="form-label small"><i class="bi bi-camera me-1"></i>Current Reading Photo</label>
                                    <input type="file" name="submeter_current_photo"
                                           class="form-control form-control-sm @error('submeter_current_photo') is-invalid @enderror"
                                           accept=".jpg,.jpeg,.png">
                                    @error('submeter_current_photo')<div class="invalid-feedback">{{ $message }}</div>@enderror
                                    @if($electricityReceipt->submeter_current_photo)
                                        <div class="mt-1">
                                            <a href="{{ asset('storage/' . $electricityReceipt->submeter_current_photo) }}" target="_blank">
                                                <img src="{{ asset('storage/' . $electricityReceipt->submeter_current_photo) }}"
                                                     style="max-width: 100%; max-height: 80px; border-radius: 4px; border: 1px solid #fde68a;">
                                            </a>
                                        </div>
                                    @endif
                                </div>
                            </div>
                        </div>
                    </div>

                    {{-- Live Calculation Preview --}}
                    <div class="p-3 mb-3 rounded" id="calcPreview" style="background: #eef2ff; border: 1px solid #c7d2fe;">
                        <h6 class="mb-2" style="color: #3730a3;"><i class="bi bi-calculator me-1"></i>Billing Breakdown</h6>
                        <table style="width: 100%; font-size: .875rem; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #c7d2fe;">
                                <td style="padding: 6px 0;">Rate Calculation</td>
                                <td style="padding: 6px 0;">Rs. <span id="calcBillAmt">{{ number_format($electricityReceipt->main_bill_amount) }}</span> ÷ <span id="calcMainUnits">{{ $electricityReceipt->main_total_units }}</span> units</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">Rs. <span id="calcRate">{{ $electricityReceipt->rate_per_unit }}</span>/unit</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #c7d2fe;">
                                <td style="padding: 6px 0;">Tenant Bill</td>
                                <td style="padding: 6px 0;"><span id="calcTenantUnits">{{ $electricityReceipt->tenant_units_consumed }}</span> units × Rs. <span id="calcRate2">{{ $electricityReceipt->rate_per_unit }}</span>/unit</td>
                                <td style="padding: 6px 0; text-align: right; font-weight: bold;">Rs. <span id="calcTenantBill">{{ number_format($electricityReceipt->tenant_bill) }}</span></td>
                            </tr>
                            <tr style="border-top: 3px solid #3730a3; font-weight: bold; font-size: 1rem;">
                                <td style="padding: 8px 0;" colspan="2">Total Tenant Bill</td>
                                <td style="padding: 8px 0; text-align: right; color: #991b1b;">Rs. <span id="calcTotalTenant">{{ number_format($electricityReceipt->tenant_bill) }}</span>/-</td>
                            </tr>
                        </table>
                    </div>

                    <div class="mb-3">
                        <label for="tenant_amount_in_words" class="form-label">Tenant Amount in Words <span class="text-danger">*</span></label>
                        <input type="text" name="tenant_amount_in_words" id="tenant_amount_in_words"
                            class="form-control @error('tenant_amount_in_words') is-invalid @enderror"
                            value="{{ old('tenant_amount_in_words', $electricityReceipt->tenant_amount_in_words) }}" readonly>
                        @error('tenant_amount_in_words')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Payment Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="payment_method" class="form-label">Payment Method</label>
                            <select name="payment_method" id="payment_method" class="form-select">
                                @foreach(['cash','bank_transfer','cheque','online'] as $method)
                                <option value="{{ $method }}" {{ old('payment_method', $electricityReceipt->payment_method) == $method ? 'selected' : '' }}>
                                    {{ ucfirst(str_replace('_',' ',$method)) }}
                                </option>
                                @endforeach
                            </select>
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="payment_date" class="form-label">Payment Date</label>
                            <input type="date" name="payment_date" id="payment_date" class="form-control"
                                value="{{ old('payment_date', $electricityReceipt->payment_date->format('Y-m-d')) }}">
                        </div>
                    </div>

                    <div class="mb-3">
                        <label for="notes" class="form-label">Notes</label>
                        <textarea name="notes" id="notes" rows="4"
                            class="form-control @error('notes') is-invalid @enderror">{{ old('notes', $electricityReceipt->notes) }}</textarea>
                        @error('notes')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Original Bill Copy</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="bill_reference" class="form-label">Bill Reference / Invoice Number</label>
                            <input type="text" name="bill_reference" id="bill_reference"
                                class="form-control @error('bill_reference') is-invalid @enderror"
                                value="{{ old('bill_reference', $electricityReceipt->bill_reference) }}"
                                placeholder="e.g. BTO-12648">
                            @error('bill_reference')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="bill_attachment" class="form-label">Attach Bill Copy <small class="text-muted">(PDF, JPG, PNG — max 5MB)</small></label>
                            <input type="file" name="bill_attachment" id="bill_attachment"
                                class="form-control @error('bill_attachment') is-invalid @enderror"
                                accept=".pdf,.jpg,.jpeg,.png">
                            @error('bill_attachment')<div class="invalid-feedback">{{ $message }}</div>@enderror
                            @if($electricityReceipt->bill_attachment)
                            <div class="mt-2">
                                <span class="badge badge-success"><i class="bi bi-paperclip me-1"></i>File attached</span>
                                <a href="{{ asset('storage/' . $electricityReceipt->bill_attachment) }}" target="_blank" class="small ms-2">
                                    <i class="bi bi-eye me-1"></i>View current file
                                </a>
                            </div>
                            @endif
                        </div>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Update Receipt</button>
                        <a href="{{ route('electricity-receipts.index') }}" class="btn btn-light">Cancel</a>
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
        const mainPrev = parseInt(document.getElementById('main_previous_reading').value) || 0;
        const mainCurr = parseInt(document.getElementById('main_current_reading').value) || 0;
        const subPrev = parseInt(document.getElementById('sub_previous_reading').value) || 0;
        const subCurr = parseInt(document.getElementById('sub_current_reading').value) || 0;
        const mainBill = parseFloat(document.getElementById('main_bill_amount').value) || 0;

        const mainUnits = Math.max(0, mainCurr - mainPrev);
        const tenantUnits = Math.max(0, subCurr - subPrev);
        const ownerUnits = Math.max(0, mainUnits - tenantUnits);

        // Auto-calculate rate
        const rate = mainUnits > 0 ? (mainBill / mainUnits) : 0;
        const rateRounded = Math.round(rate * 100) / 100;

        document.getElementById('rate_per_unit').value = rateRounded > 0 ? rateRounded.toFixed(2) : '';
        document.getElementById('mainUnits').textContent = mainUnits;
        document.getElementById('tenantUnits').textContent = tenantUnits;

        const tenantBill = Math.round(tenantUnits * rate);

        document.getElementById('calcBillAmt').textContent = mainBill.toLocaleString();
        document.getElementById('calcMainUnits').textContent = mainUnits;
        document.getElementById('calcRate').textContent = rateRounded.toFixed(2);
        document.getElementById('calcRate2').textContent = rateRounded.toFixed(2);
        document.getElementById('calcTenantUnits').textContent = tenantUnits;
        document.getElementById('calcTenantBill').textContent = tenantBill.toLocaleString();
        document.getElementById('calcTotalTenant').textContent = tenantBill.toLocaleString();

        document.getElementById('tenant_amount_in_words').value = tenantBill > 0 ? numberToWords(tenantBill) : '';
    }

    ['main_previous_reading', 'main_current_reading', 'sub_previous_reading', 'sub_current_reading', 'main_bill_amount'].forEach(id => {
        document.getElementById(id).addEventListener('input', recalculate);
    });
</script>
@endpush
@endsection
