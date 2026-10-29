<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Maintenance Receipt - {{ $maintenanceReceipt->month }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: Arial, sans-serif;
            font-size: 13px;
            color: #333;
            padding: 40px;
        }

        .header {
            text-align: center;
            margin-bottom: 25px;
        }

        .header h1 {
            color: #5b6abf;
            font-size: 22px;
            margin-bottom: 8px;
        }

        .header-line {
            border: none;
            border-top: 3px solid #5b6abf;
            margin-bottom: 20px;
        }

        .info-box {
            background: #f8f9fa;
            padding: 12px 16px;
            border-radius: 5px;
            margin-bottom: 20px;
            border: 1px solid #e9ecef;
        }

        .info-box p {
            margin: 4px 0;
        }

        .info-box .label {
            color: #5b6abf;
            font-weight: bold;
        }

        table.breakdown {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        table.breakdown th {
            background: #5b6abf;
            color: #fff;
            padding: 10px 12px;
            text-align: left;
            font-size: 12px;
        }

        table.breakdown td {
            padding: 10px 12px;
            border: 1px solid #e2e8f0;
        }

        table.breakdown .text-end {
            text-align: right;
        }

        table.breakdown tfoot td {
            font-weight: bold;
            background: #f8f9fa;
        }

        .summary-box {
            background: #fefce8;
            border-left: 4px solid #eab308;
            padding: 12px 16px;
            margin: 20px 0;
        }

        .summary-box p {
            margin: 3px 0;
            font-size: 12px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }

        .details-table td {
            padding: 8px 12px;
            border: 1px solid #e2e8f0;
        }

        .details-table .label-cell {
            font-weight: bold;
            background: #f8fafc;
            width: 35%;
        }

        .acknowledgment {
            background: #f0fdf4;
            border-left: 4px solid #16A34A;
            padding: 14px 16px;
            margin: 20px 0;
            line-height: 1.7;
        }

        .divider {
            border: none;
            border-top: 2px dashed #cbd5e1;
            margin: 25px 0 20px 0;
        }

        .received-by h3 {
            color: #5b6abf;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .received-by hr {
            border: none;
            border-top: 1px solid #5b6abf;
            margin-bottom: 12px;
        }

        .received-by p {
            margin: 4px 0;
        }

        .signature {
            margin-top: 30px;
        }

        .signature-line {
            width: 200px;
            border-top: 1px solid #333;
            margin-bottom: 4px;
        }

        .footer {
            text-align: center;
            color: #999;
            font-style: italic;
            font-size: 11px;
            margin-top: 25px;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>MAINTENANCE BILL RECEIPT</h1>
    </div>
    <hr class="header-line">

    <div class="info-box">
        <p><span class="label">Property Address:</span> {{ $maintenanceReceipt->property->address }}</p>
        <p><span class="label">Billing Period:</span> {{ $maintenanceReceipt->month }}</p>
    </div>

    <table class="breakdown">
        <thead>
            <tr>
                <th>Description</th>
                <th>Details</th>
                <th class="text-end">Amount (Rs.)</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td>Total Maintenance Bill</td>
                <td>For {{ $maintenanceReceipt->month }}</td>
                <td class="text-end">{{ number_format($maintenanceReceipt->total_maintenance) }}</td>
            </tr>
            <tr>
                <td>Owner's Share ({{ $maintenanceReceipt->owner_percent }}%)</td>
                <td>{{ number_format($maintenanceReceipt->total_maintenance) }} &divide; {{ 100 / $maintenanceReceipt->owner_percent }}</td>
                <td class="text-end">{{ number_format($maintenanceReceipt->owner_share) }}</td>
            </tr>
            <tr>
                <td>Tenant's Share ({{ $maintenanceReceipt->tenant_percent }}%)</td>
                <td>{{ number_format($maintenanceReceipt->total_maintenance) }} &divide; {{ 100 / $maintenanceReceipt->tenant_percent }}</td>
                <td class="text-end">{{ number_format($maintenanceReceipt->tenant_share) }}</td>
            </tr>
        </tbody>
        <tfoot>
            <tr>
                <td colspan="2"><strong>Tenant Payable Amount</strong></td>
                <td class="text-end"><strong>Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/-</strong></td>
            </tr>
        </tfoot>
    </table>

    <div class="summary-box">
        <strong>Cost Distribution Summary</strong>
        <p>Total Monthly Maintenance: Rs. {{ number_format($maintenanceReceipt->total_maintenance) }}/-</p>
        <p>Owner's Contribution: Rs. {{ number_format($maintenanceReceipt->owner_share) }}/- ({{ $maintenanceReceipt->owner_percent }}%)</p>
        <p>Tenant's Contribution: Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/- ({{ $maintenanceReceipt->tenant_percent }}%)</p>
    </div>

    <table class="details-table">
        <tr>
            <td class="label-cell">Tenant Name</td>
            <td>{{ $maintenanceReceipt->tenant->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Owner Name</td>
            <td>{{ $maintenanceReceipt->owner->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Payment Date</td>
            <td>{{ $maintenanceReceipt->payment_date->format('d/m/Y') }}</td>
        </tr>
        <tr>
            <td class="label-cell">Payment Method</td>
            <td>{{ ucfirst(str_replace('_', ' ', $maintenanceReceipt->payment_method)) }}</td>
        </tr>
    </table>

    <div class="acknowledgment">
        <p>
            This is to acknowledge that I, <strong>{{ $maintenanceReceipt->owner->name }}</strong>,
            have received a total sum of <strong>Rs. {{ number_format($maintenanceReceipt->tenant_share) }}/-</strong>
            ({{ $maintenanceReceipt->tenant_amount_in_words }}) from <strong>Mr. {{ $maintenanceReceipt->tenant->name }}</strong>,
            towards the maintenance charges of {{ $maintenanceReceipt->property->address }}
            for the month of <strong>{{ $maintenanceReceipt->month }}</strong>.
        </p>
    </div>

    {{-- Notes --}}
    @if($maintenanceReceipt->notes)
    <div style="background: #f8f9fa; border-left: 4px solid #94a3b8; padding: 10px 14px; margin: 15px 0; font-size: 11px;">
        <strong>Notes:</strong>
        <p style="margin: 4px 0 0 0;">{{ $maintenanceReceipt->notes }}</p>
    </div>
    @endif

    {{-- Bill Reference --}}
    @if($maintenanceReceipt->bill_reference)
    <div style="background: #f8f9fa; border: 1px solid #e2e8f0; padding: 10px 14px; margin: 15px 0; font-size: 11px;">
        <strong>Original Bill Reference:</strong> {{ $maintenanceReceipt->bill_reference }}
    </div>
    @endif

    <hr class="divider">

    <div class="received-by">
        <h3>RECEIVED BY</h3>
        <hr>
        <p><strong>Name:</strong> {{ $maintenanceReceipt->owner->name }}</p>
        <p><strong>Date:</strong> {{ $maintenanceReceipt->payment_date->format('d/m/Y') }}</p>
        <p><strong>Contact:</strong> {{ $maintenanceReceipt->owner->phone }}</p>
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
