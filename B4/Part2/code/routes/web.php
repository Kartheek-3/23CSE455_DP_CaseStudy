<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\OwnerController;
use App\Http\Controllers\TenantController;
use App\Http\Controllers\PropertyController;
use App\Http\Controllers\RentReceiptController;
use App\Http\Controllers\MaintenanceReceiptController;
use App\Http\Controllers\ElectricityReceiptController;
use App\Http\Controllers\SecurityDepositController;

Route::get('/', function () {
    return redirect()->route('login');
});

Auth::routes();

Route::middleware('auth')->group(function () {

    Route::get('/home', [HomeController::class, 'index'])->name('home');

    // Profile
    Route::get('/profile', [App\Http\Controllers\ProfileController::class, 'show'])->name('profile.show');
    Route::put('/profile/info', [App\Http\Controllers\ProfileController::class, 'updateInfo'])->name('profile.update-info');
    Route::put('/profile/password', [App\Http\Controllers\ProfileController::class, 'updatePassword'])->name('profile.update-password');

    // Tenant Portal
    Route::middleware('role:tenant')->prefix('my')->name('tenant.')->group(function () {
        Route::get('/dashboard', [App\Http\Controllers\TenantDashboardController::class, 'dashboard'])->name('dashboard');

        Route::get('/rent-receipts', [App\Http\Controllers\TenantDashboardController::class, 'rentReceipts'])->name('rent-receipts');
        Route::get('/rent-receipts/{rentReceipt}', [App\Http\Controllers\TenantDashboardController::class, 'rentReceiptShow'])->name('rent-receipts.show');
        Route::get('/rent-receipts/{rentReceipt}/pdf', [App\Http\Controllers\TenantDashboardController::class, 'rentReceiptPdf'])->name('rent-receipts.pdf');

        Route::get('/maintenance-receipts', [App\Http\Controllers\TenantDashboardController::class, 'maintenanceReceipts'])->name('maintenance-receipts');
        Route::get('/maintenance-receipts/{maintenanceReceipt}', [App\Http\Controllers\TenantDashboardController::class, 'maintenanceReceiptShow'])->name('maintenance-receipts.show');
        Route::get('/maintenance-receipts/{maintenanceReceipt}/pdf', [App\Http\Controllers\TenantDashboardController::class, 'maintenanceReceiptPdf'])->name('maintenance-receipts.pdf');

        Route::get('/electricity-receipts', [App\Http\Controllers\TenantDashboardController::class, 'electricityReceipts'])->name('electricity-receipts');
        Route::get('/electricity-receipts/{electricityReceipt}', [App\Http\Controllers\TenantDashboardController::class, 'electricityReceiptShow'])->name('electricity-receipts.show');
        Route::get('/electricity-receipts/{electricityReceipt}/pdf', [App\Http\Controllers\TenantDashboardController::class, 'electricityReceiptPdf'])->name('electricity-receipts.pdf');

        Route::get('/security-deposit', [App\Http\Controllers\TenantDashboardController::class, 'securityDeposit'])->name('security-deposit');
    });

    // Admin only
    Route::middleware('role:admin')->group(function () {
        Route::resource('users', App\Http\Controllers\UserController::class)->except(['show']);
        Route::resource('owners', OwnerController::class);
        Route::resource('tenants', TenantController::class);
        Route::resource('properties', PropertyController::class);
    });

    // Admin + Owner
    Route::middleware('role:admin,owner')->group(function () {
        Route::resource('rent-receipts', RentReceiptController::class);
        Route::resource('maintenance-receipts', MaintenanceReceiptController::class);
        Route::resource('electricity-receipts', ElectricityReceiptController::class);

        // PDF downloads
        Route::get(
            'rent-receipts/{rentReceipt}/pdf',
            [RentReceiptController::class, 'downloadPdf']
        )->name('rent-receipts.pdf');
        Route::get(
            'maintenance-receipts/{maintenanceReceipt}/pdf',
            [MaintenanceReceiptController::class, 'downloadPdf']
        )->name('maintenance-receipts.pdf');
        Route::get(
            'electricity-receipts/{electricityReceipt}/pdf',
            [ElectricityReceiptController::class, 'downloadPdf']
        )->name('electricity-receipts.pdf');

        // Security Deposits
        Route::resource('security-deposits', SecurityDepositController::class);
        Route::post(
            'security-deposits/{securityDeposit}/deduction',
            [SecurityDepositController::class, 'addDeduction']
        )
            ->name('security-deposits.deduction');
        Route::post(
            'security-deposits/{securityDeposit}/refund',
            [SecurityDepositController::class, 'processRefund']
        )
            ->name('security-deposits.refund');
        Route::get(
            'security-deposits/{securityDeposit}/pdf',
            [SecurityDepositController::class, 'downloadPdf']
        )
            ->name('security-deposits.pdf');
    });

    // About
    Route::get('/about', function () {
        return view('about');
    })->name('about');
});
