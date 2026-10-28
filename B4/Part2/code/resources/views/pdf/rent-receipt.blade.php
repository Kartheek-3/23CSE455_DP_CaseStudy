<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Rent Receipt - {{ $rentReceipt->month }}</title>
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
            font-size: 13px;
        }

        .info-box .label {
            color: #5b6abf;
            font-weight: bold;
        }

        .amount-box {
            background: #f1f5f9;
            padding: 16px;
            margin: 20px 0;
            text-align: center;
            border-radius: 5px;
        }

        .amount-box .amount {
            font-size: 22px;
            font-weight: bold;
            color: #1e293b;
        }

        .amount-box .words {
            font-size: 11px;
            color: #64748b;
            margin-top: 4px;
        }

        .details-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
        }

        .details-table td {
            padding: 10px 14px;
            border: 1px solid #e2e8f0;
            font-size: 13px;
        }

        .details-table .label-cell {
            font-weight: bold;
            background: #f8fafc;
            width: 35%;
            color: #374151;
        }

        .acknowledgment {
            background: #fffde7;
            border-left: 4px solid #fdd835;
            padding: 14px 16px;
            margin: 20px 0;
            border-radius: 0 5px 5px 0;
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
            font-size: 13px;
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

    {{-- Header --}}
    <div class="header">
        <h1>RENT RECEIPT</h1>
    </div>
    <hr class="header-line">

    {{-- Property Info --}}
    <div class="info-box">
        <p><span class="label">Property Address:</span> {{ $rentReceipt->property->address }}</p>
        <p><span class="label">Month:</span> {{ $rentReceipt->month }}</p>
    </div>

    {{-- Amount --}}
    <div class="amount-box">
        <div>Rent Amount</div>
        <div class="amount">Rs. {{ number_format($rentReceipt->amount) }}/-</div>
        <div class="words">({{ $rentReceipt->amount_in_words }})</div>
    </div>

    {{-- Net Amount --}}
    <div class="info-box">
        <p><span class="label">Net Amount Received:</span></p>
        <p style="font-size: 14px; margin-top: 4px;">
            <strong>{{ number_format($rentReceipt->amount) }} = Rs. {{ number_format($rentReceipt->amount) }}/-</strong>
        </p>
    </div>

    {{-- Payment Details --}}
    <table class="details-table">
        <tr>
            <td class="label-cell">Tenant Name</td>
            <td>{{ $rentReceipt->tenant->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Owner Name</td>
            <td>{{ $rentReceipt->owner->name }}</td>
        </tr>
        <tr>
            <td class="label-cell">Mode of Payment</td>
            <td>{{ ucfirst(str_replace('_', ' ', $rentReceipt->payment_method)) }}</td>
        </tr>
        <tr>
            <td class="label-cell">Date of Payment</td>
            <td>{{ $rentReceipt->payment_date->format('d/m/Y') }}</td>
        </tr>
    </table>

    {{-- Acknowledgment --}}
    <div class="acknowledgment">
        <p>
            This is to acknowledge that I, <strong>{{ $rentReceipt->owner->name }}</strong>,
            have received a total sum of <strong>Rs. {{ number_format($rentReceipt->amount) }}/-</strong>
            ({{ $rentReceipt->amount_in_words }}) from <strong>Mr. {{ $rentReceipt->tenant->name }}</strong>,
            towards the rent of {{ $rentReceipt->property->address }} for the month of
            <strong>{{ $rentReceipt->month }}</strong>.
        </p>
    </div>

    {{-- Notes --}}
    @if($rentReceipt->notes)
    <div style="background: #f8f9fa; border-left: 4px solid #94a3b8; padding: 10px 14px; margin: 15px 0; font-size: 11px;">
        <strong>Notes:</strong>
        <p style="margin: 4px 0 0 0;">{{ $rentReceipt->notes }}</p>
    </div>
    @endif

    {{-- Received By --}}
    <hr class="divider">

    <div class="received-by">
        <h3>RECEIVED BY</h3>
        <hr>
        <p><strong>Name:</strong> {{ $rentReceipt->owner->name }}</p>
        <p><strong>Date:</strong> {{ $rentReceipt->payment_date->format('d/m/Y') }}</p>
        <p><strong>Contact:</strong> {{ $rentReceipt->owner->phone }}</p>

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
