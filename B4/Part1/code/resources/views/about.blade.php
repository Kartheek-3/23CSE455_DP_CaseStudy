@extends('layouts.app')

@section('title', 'About')

@section('content')
<div class="row justify-content-center">
    <div class="col-lg-8">

        {{-- Main About Card --}}
        <div class="card">
            <div class="card-body text-center py-5">

                {{-- Logo --}}
                <div class="mb-4">
                    <div style="width: 80px; height: 80px; border-radius: 1rem; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #2563eb 100%); display: inline-flex; align-items: center; justify-content: center;">
                        <i class="bi bi-building" style="font-size: 2.5rem; color: #fff;"></i>
                    </div>
                </div>

                {{-- App Name & Version --}}
                <h2 class="mb-1" style="font-weight: 700; color: #1e293b;">{{ config('app.name', 'Property Manager') }}</h2>
                <p class="text-muted mb-4">Version 1.0.0</p>

                {{-- Description --}}
                <p class="mb-4 px-lg-5" style="font-size: 1.05rem; color: #475569; line-height: 1.7;">
                    A free, open-source rental property management application built with Laravel 12.
                    Track tenants, generate professional receipts for rent, electricity bills, and maintenance charges,
                    manage security deposits — all while maintaining complete financial transparency.
                </p>

                {{-- Action Buttons --}}
                <div class="d-flex flex-wrap justify-content-center gap-3 mb-4">
                    <a href="https://github.com/mohsin-rafique/property-management" target="_blank"
                       class="btn btn-dark btn-lg px-4">
                        <i class="bi bi-github me-2"></i>View on GitHub
                    </a>
                    <a href="https://github.com/mohsin-rafique/property-management/issues" target="_blank"
                       class="btn btn-outline-secondary btn-lg px-4">
                        <i class="bi bi-bug me-2"></i>Report Issue
                    </a>
                </div>

                <hr class="my-4">

                {{-- Features --}}
                <div class="row text-start mb-4">
                    <div class="col-md-6">
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Multi-role access (Admin, Owner, Tenant)
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Rent receipt generation with PDF
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Electricity bill with auto rate calculation
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Maintenance bill with split calculation
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Security deposit tracking & refunds
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Auto amount-in-words (Pakistani format)
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Sub-meter photo evidence
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Bill attachment uploads
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Rate history tracking
                            </li>
                            <li class="mb-2">
                                <i class="bi bi-check-circle-fill text-success me-2"></i>
                                Dedicated tenant portal
                            </li>
                        </ul>
                    </div>
                </div>

                <hr class="my-4">

                {{-- Tech Stack --}}
                <div class="mb-4">
                    <h6 class="text-uppercase text-muted mb-3" style="letter-spacing: .05em;">Built With</h6>
                    <div class="d-flex flex-wrap justify-content-center gap-2">
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">Laravel 12</span>
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">PHP 8.2+</span>
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">MySQL</span>
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">Blade Templates</span>
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">Bootstrap 5</span>
                        <span class="badge px-3 py-2" style="background: #eef2ff; color: #3730a3;">DomPDF</span>
                    </div>
                </div>

                <hr class="my-4">

                {{-- License --}}
                <div class="text-muted">
                    <p class="small mb-1">
                        <i class="bi bi-file-earmark-text me-1"></i>
                        Released under the
                        <a href="https://github.com/mohsin-rafique/property-management/blob/main/LICENSE"
                           target="_blank" style="color: #4f46e5; text-decoration: none;">MIT License</a>
                    </p>
                    <p class="small mb-0">
                        Made with <i class="bi bi-heart-fill text-danger"></i> for the open-source community
                    </p>
                </div>

            </div>
        </div>

        {{-- Contributors --}}
        <div class="card mt-4">
            <div class="card-header">
                <i class="bi bi-people me-2"></i>Contributors
            </div>
            <div class="card-body">
                <p class="text-muted mb-3">This project is made possible by the following contributors:</p>
                <div class="d-flex flex-wrap gap-2 mb-3">
                    <a href="https://github.com/mohsin-rafique" target="_blank" title="Mohsin Rafique">
                        <img src="https://github.com/mohsin-rafique.png" width="40" height="40"
                             class="rounded-circle" alt="Mohsin Rafique"
                             style="border: 2px solid #e2e8f0;">
                    </a>
                </div>
                <a href="https://github.com/mohsin-rafique/property-management/blob/main/CONTRIBUTING.md"
                   target="_blank" class="btn btn-sm btn-outline-primary">
                    <i class="bi bi-plus-circle me-1"></i>Become a Contributor
                </a>
            </div>
        </div>

        {{-- System Info --}}
        <div class="card mt-4">
            <div class="card-header">
                <i class="bi bi-gear me-2"></i>System Information
            </div>
            <div class="card-body p-0">
                <table class="table table-hover mb-0">
                    <tbody>
                        <tr>
                            <td style="width: 40%;"><strong>Application Version</strong></td>
                            <td>1.0.0</td>
                        </tr>
                        <tr>
                            <td><strong>Laravel Version</strong></td>
                            <td>{{ app()->version() }}</td>
                        </tr>
                        <tr>
                            <td><strong>PHP Version</strong></td>
                            <td>{{ PHP_VERSION }}</td>
                        </tr>
                        <tr>
                            <td><strong>Environment</strong></td>
                            <td>
                                @if(app()->environment('production'))
                                    <span class="badge badge-success">Production</span>
                                @else
                                    <span class="badge badge-warning">{{ ucfirst(app()->environment()) }}</span>
                                @endif
                            </td>
                        </tr>
                        <tr>
                            <td><strong>Database</strong></td>
                            <td>{{ ucfirst(config('database.default')) }}</td>
                        </tr>
                        <tr>
                            <td><strong>Timezone</strong></td>
                            <td>{{ config('app.timezone') }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>

        {{-- Support --}}
        <div class="card mt-4 mb-4">
            <div class="card-header">
                <i class="bi bi-heart me-2"></i>Support
            </div>
            <div class="card-body text-center py-4">
                <p class="text-muted mb-3">If this project helps you, consider supporting its development:</p>
                <a href="https://wise.com/pay/me/mohsinr301" target="_blank"
                   class="btn btn-lg px-4" style="background: #00B9FF; color: #fff; border: none; border-radius: .5rem;">
                    <i class="bi bi-heart-fill me-2"></i>Donate via Wise
                </a>
                <p class="text-muted small mt-3 mb-0">Your support helps maintain and improve this project. Thank you! 🙏</p>
            </div>
        </div>

    </div>
</div>
@endsection
