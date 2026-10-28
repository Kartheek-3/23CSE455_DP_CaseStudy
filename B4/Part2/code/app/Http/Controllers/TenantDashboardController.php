<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\RentReceipt;
use App\Models\MaintenanceReceipt;
use App\Models\ElectricityReceipt;
use App\Models\SecurityDeposit;

class TenantDashboardController extends Controller
{
    private function getTenant()
    {
        return Tenant::where('user_id', auth()->id())->firstOrFail();
    }

    public function dashboard()
    {
        $tenant = $this->getTenant();

        $stats = [
            'total_rent_paid' => RentReceipt::where('tenant_id', $tenant->id)->sum('amount'),
            'total_maintenance_paid' => MaintenanceReceipt::where('tenant_id', $tenant->id)->sum('tenant_share'),
            'total_electricity_paid' => ElectricityReceipt::where('tenant_id', $tenant->id)->sum('tenant_bill'),
            'rent_receipts_count' => RentReceipt::where('tenant_id', $tenant->id)->count(),
            'maintenance_receipts_count' => MaintenanceReceipt::where('tenant_id', $tenant->id)->count(),
            'electricity_receipts_count' => ElectricityReceipt::where('tenant_id', $tenant->id)->count(),
            'security_deposit' => SecurityDeposit::where('tenant_id', $tenant->id)->where('status', 'held')->sum('balance'),
        ];

        $recentRent = RentReceipt::where('tenant_id', $tenant->id)->latest()->take(5)->get();
        $recentMaintenance = MaintenanceReceipt::where('tenant_id', $tenant->id)->latest()->take(5)->get();
        $recentElectricity = ElectricityReceipt::where('tenant_id', $tenant->id)->latest()->take(5)->get();

        return view('tenant-portal.dashboard', compact('tenant', 'stats', 'recentRent', 'recentMaintenance', 'recentElectricity'));
    }

    public function rentReceipts()
    {
        $tenant = $this->getTenant();
        $receipts = RentReceipt::with(['property', 'owner'])
            ->where('tenant_id', $tenant->id)
            ->latest()
            ->paginate(15);

        return view('tenant-portal.rent-receipts', compact('tenant', 'receipts'));
    }

    public function rentReceiptShow(RentReceipt $rentReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($rentReceipt->tenant_id !== $tenant->id, 403);

        $rentReceipt->load(['property', 'tenant', 'owner']);
        return view('rent-receipts.show', compact('rentReceipt'));
    }

    public function rentReceiptPdf(RentReceipt $rentReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($rentReceipt->tenant_id !== $tenant->id, 403);

        $rentReceipt->load(['property', 'tenant', 'owner']);
        $pdf = app('dompdf.wrapper')->loadView('pdf.rent-receipt', compact('rentReceipt'));
        return $pdf->download('Rent-Receipt-' . str_replace(' ', '-', $rentReceipt->month) . '.pdf');
    }

    public function maintenanceReceipts()
    {
        $tenant = $this->getTenant();
        $receipts = MaintenanceReceipt::with(['property', 'owner'])
            ->where('tenant_id', $tenant->id)
            ->latest()
            ->paginate(15);

        return view('tenant-portal.maintenance-receipts', compact('tenant', 'receipts'));
    }

    public function maintenanceReceiptShow(MaintenanceReceipt $maintenanceReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($maintenanceReceipt->tenant_id !== $tenant->id, 403);

        $maintenanceReceipt->load(['property', 'tenant', 'owner']);
        return view('maintenance-receipts.show', compact('maintenanceReceipt'));
    }

    public function maintenanceReceiptPdf(MaintenanceReceipt $maintenanceReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($maintenanceReceipt->tenant_id !== $tenant->id, 403);

        $maintenanceReceipt->load(['property', 'tenant', 'owner']);
        $pdf = app('dompdf.wrapper')->loadView('pdf.maintenance-receipt', compact('maintenanceReceipt'));
        return $pdf->download('Maintenance-Receipt-' . str_replace(' ', '-', $maintenanceReceipt->month) . '.pdf');
    }

    public function electricityReceipts()
    {
        $tenant = $this->getTenant();
        $receipts = ElectricityReceipt::with(['property', 'owner'])
            ->where('tenant_id', $tenant->id)
            ->latest()
            ->paginate(15);

        return view('tenant-portal.electricity-receipts', compact('tenant', 'receipts'));
    }

    public function electricityReceiptShow(ElectricityReceipt $electricityReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($electricityReceipt->tenant_id !== $tenant->id, 403);

        $electricityReceipt->load(['property', 'tenant', 'owner']);
        return view('electricity-receipts.show', compact('electricityReceipt'));
    }

    public function electricityReceiptPdf(ElectricityReceipt $electricityReceipt)
    {
        $tenant = $this->getTenant();
        abort_if($electricityReceipt->tenant_id !== $tenant->id, 403);

        $electricityReceipt->load(['property', 'tenant', 'owner']);
        $pdf = app('dompdf.wrapper')->loadView('pdf.electricity-receipt', compact('electricityReceipt'));
        return $pdf->download('Bill-Receipt-' . str_replace(' ', '-', $electricityReceipt->month) . '.pdf');
    }

    public function securityDeposit()
    {
        $tenant = $this->getTenant();
        $deposits = SecurityDeposit::with(['property', 'owner', 'deductions'])
            ->where('tenant_id', $tenant->id)
            ->latest()
            ->get();

        return view('tenant-portal.security-deposit', compact('tenant', 'deposits'));
    }
}
