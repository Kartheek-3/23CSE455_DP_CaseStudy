<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Bill Receipt - {{ $electricityReceipt->month }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            color: #333;
            padding: 35px;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
        }

        .header h1 {
            color: #5b6abf;
            font-size: 22px;
            margin-bottom: 8px;
        }

        .header-line {
            border: none;
            border-top: 3px solid #5b6abf;
            margin-bottom: 18px;
        }

        .info-box {
            background: #f8f9fa;
            padding: 10px 14px;
            margin-bottom: 15px;
            border: 1px solid #e9ecef;
        }

        .info-box p {
            margin: 3px 0;
        }

        .info-box .label {
            color: #5b6abf;
            font-weight: bold;
        }

        .meters {
            width: 100%;
            margin-bottom: 15px;
        }

        .meters td {
            vertical-align: top;
            width: 50%;
            padding: 0 5px;
        }

        .meter-box {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
        }

        .meter-box h4 {
            color: #5b6abf;
            font-size: 13px;
            margin-bottom: 8px;
        }

        .meter-box.sub {
            border-color: #fde68a;
        }

        .meter-box.sub h4 {
            color: #92400e;
        }

        .meter-box p {
            margin: 3px 0;
            font-size: 12px;
        }

        table.billing {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        table.billing th {
            background: #5b6abf;
            color: #fff;
            padding: 8px 10px;
            text-align: left;
            font-size: 11px;
        }

        table.billing td {
            padding: 8px 10px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
        }

        table.billing .text-end {
            text-align: right;
        }

        table.billing tfoot td {
            font-weight: bold;
            background: #f8f9fa;
        }

        .summary-box {
            background: #fefce8;
            border-left: 4px solid #eab308;
            padding: 10px 14px;
            margin: 15px 0;
            font-size: 11px;
        }

        .summary-box p {
            margin: 2px 0;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 12px 0;
        }

        .details-table td {
            padding: 7px 10px;
            border: 1px solid #e2e8f0;
            font-size: 12px;
        }

        .details-table .label-cell {
            font-weight: bold;
            background: #f8fafc;
            width: 35%;
        }

        .acknowledgment {
            background: #f0fdf4;
            border-left: 4px solid #16A34A;
            padding: 12px 14px;
            margin: 15px 0;
            line-height: 1.6;
            font-size: 12px;
        }

        .divider {
            border: none;
            border-top: 2px dashed #cbd5e1;
            margin: 20px 0 15px 0;
        }

        .received-by h3 {
            color: #5b6abf;
            font-size: 13px;
            margin-bottom: 4px;
        }

        .received-by hr {
            border: none;
            border-top: 1px solid #5b6abf;
            margin-bottom: 10px;
        }

        .received-by p {
            margin: 3px 0;
            font-size: 12px;
        }

        .signature {
            margin-top: 25px;
        }

        .signature-line {
            width: 180px;
            border-top: 1px solid #333;
            margin-bottom: 3px;
        }

        .footer {
            text-align: center;
            color: #999;
            font-style: italic;
            font-size: 10px;
            margin-top: 20px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>BILL RECEIPT</h1>
    </div>
    <hr class="header-line">

    <div class="info-box">
        <p><span class="label">Property Address:</span> {{ $electricityReceipt->property->address }}</p>
        <p><span class="label">Billing Period:</span> {{ $electricityReceipt->month }}</p>
    </div>

    {{-- Meter Readings --}}
    <table class="meters">
        <tr>
            <td>
                <div class="meter-box">
                    <h4>Main Meter Reading</h4>
                    <p>Previous Reading: <strong>{{ number_format($electricityReceipt->main_previous_reading) }} Units</strong> ({{ $electricityReceipt->main_previous_date->format('d M Y') }})</p>
                    <p>Current Reading: <strong>{{ number_format($electricityReceipt->main_current_reading) }} Units</strong> ({{ $electricityReceipt->main_current_date->format('d M Y') }})</p>
                    <p><strong>Total Units Consumed: {{ $electricityReceipt->main_total_units }} Units</strong></p>
                </div>
            </td>
            <td>
                <div class="meter-box sub">
                    <h4>Tenant Sub-Meter Reading</h4>
                    <p>Previous Reading: <strong>{{ number_format($electricityReceipt->sub_previous_reading) }} Units</strong> ({{ $electricityReceipt->main_previous_date->format('d M Y') }})</p>
                    <p>Current Reading: <strong>{{ number_format($electricityReceipt->sub_current_reading) }} Units</strong> ({{ $electricityReceipt->main_current_date->format('d M Y') }})</p>
                    <p><strong>Tenant Units Consumed: {{ $electricityReceipt->tenant_units_consumed }} Units</strong></p>
                </div>
            </td>
        </tr>
    </table>

    {{-- Billing Table --}}
    <table class="billing">
        <thead>
            <tr>
                <th>Description</th>
                <th>Calculation</th>
                <th>Rate (Rs.)</th>
                <th class="text-end">Amount (Rs.)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Tenant Electricity (Sub-meter)</td>
                <td>{{ $electricityReceipt->tenant_units_consumed }} units &times; {{ $electricityReceipt->rate_per_unit }}</td>
                <td>{{ $electricityReceipt->rate_per_unit }}/unit</td>
                <td class="text-end">{{ number_format($electricityReceipt->tenant_bill) }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="3"><strong>Total Tenant Bill</strong></td>
                <td class="text-end"><strong>Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="summary-box">
        <strong>Cost Distribution Analysis</strong>
        <p>Owner Consumption: {{ $electricityReceipt->owner_units_consumed }} units &times; {{ $electricityReceipt->rate_per_unit }} = Rs. {{ number_format($electricityReceipt->owner_bill) }}/-</p>
        <p>Tenant Consumption: {{ $electricityReceipt->tenant_units_consumed }} units &times; {{ $electricityReceipt->rate_per_unit }} = Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</p>
        <p>Main Bill Amount: Rs. {{ number_format($electricityReceipt->main_bill_amount) }}/-</p>
        <p>Difference: Rs. {{ number_format($electricityReceipt->main_bill_amount) }} - Rs. {{ number_format($electricityReceipt->tenant_bill) }} = Rs. {{ number_format($electricityReceipt->main_bill_amount - $electricityReceipt->tenant_bill) }}/-</p>
    </div>

    <table class="details-table">
        <tr>
            <td class="label-cell">Tenant Name</td>
            <td>{{ $electricityReceipt->tenant->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Owner Name</td>
            <td>{{ $electricityReceipt->owner->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Payment Date</td>
            <td>{{ $electricityReceipt->payment_date->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label-cell">Payment Method</td>
            <td>{{ ucfirst(str_replace('_', ' ', $electricityReceipt->payment_method)) }}</td>
        </tr>
    </table>

    <div class="acknowledgment">
        <p>
            This is to acknowledge that I, <strong>{{ $electricityReceipt->owner->name }}</strong>,
            have received a total sum of <strong>Rs. {{ number_format($electricityReceipt->tenant_bill) }}/-</strong>
            ({{ $electricityReceipt->tenant_amount_in_words }}) from <strong>Mr. {{ $electricityReceipt->tenant->name }}</strong>,
            towards the electricity bill of {{ $electricityReceipt->property->address }}
            for the month of <strong>{{ $electricityReceipt->month }}</strong>.
        </p>
    </div>

    {{-- Notes --}}
    @if($electricityReceipt->notes)
    <div style="background: #f8f9fa; border-left: 4px solid #94a3b8; padding: 10px 14px; margin: 15px 0; font-size: 11px;">
        <strong>Notes:</strong>
        <p style="margin: 4px 0 0 0;">{{ $electricityReceipt->notes }}</p>
    </div>
    @endif

    {{-- Bill Reference --}}
    @if($electricityReceipt->bill_reference)
    <div style="background: #f8f9fa; border: 1px solid #e2e8f0; padding: 10px 14px; margin: 15px 0; font-size: 11px;">
        <strong>Original Bill Reference:</strong> {{ $electricityReceipt->bill_reference }}
    </div>
    @endif

    <hr class="divider">

    <div class="received-by">
        <h3>RECEIVED BY</h3>
        <hr>
        <p><strong>Name:</strong> {{ $electricityReceipt->owner->name }}</p>
        <p><strong>Date:</strong> {{ $electricityReceipt->payment_date->format('d/m/Y') }}</p>
        <p><strong>Contact:</strong> {{ $electricityReceipt->owner->phone }}</p>
        <div class="signature">
            <div class="signature-line"></div>
            <p>Signature</p>
        </div>
    </div>

    <div class="footer">
        <p>This is a computer-generated receipt for record purposes.</p>
    </div>
</body>

</html>
