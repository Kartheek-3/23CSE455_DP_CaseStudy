@extends('layouts.app')

@section('title', 'Add Property')

@section('content')
<div class="mb-4">
    <a href="{{ route('properties.index') }}" class="text-decoration-none small">
        <i class="bi bi-arrow-left me-1"></i> Back to Properties
    </a>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card">
            <div class="card-header"><i class="bi bi-house-add me-2"></i>Add New Property</div>
            <div class="card-body">
                <form action="{{ route('properties.store') }}" method="POST">
                    @csrf

                    <h6 class="text-muted mb-3">Property Details</h6>

                    <div class="mb-3">
                        <label for="address" class="form-label">Property Address <span class="text-danger">*</span></label>
                        <textarea name="address" id="address" rows="2"
                            class="form-control @error('address') is-invalid @enderror"
                            placeholder="e.g. House # 592, J Block, Sector LCO, Bahria Orchard">{{ old('address') }}</textarea>
                        @error('address')<div class="invalid-feedback">{{ $message }}</div>@enderror
                    </div>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="owner_id" class="form-label">Owner <span class="text-danger">*</span></label>
                            <select name="owner_id" id="owner_id"
                                class="form-select @error('owner_id') is-invalid @enderror">
                                <option value="">— Select Owner —</option>
                                @foreach($owners as $owner)
                                <option value="{{ $owner->id }}" {{ old('owner_id') == $owner->id ? 'selected' : '' }}>
                                    {{ $owner->name }} ({{ $owner->phone }})
                                </option>
                                @endforeach
                            </select>
                            @error('owner_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="tenant_id" class="form-label">Tenant <small class="text-muted">(optional)</small></label>
                            <select name="tenant_id" id="tenant_id"
                                class="form-select @error('tenant_id') is-invalid @enderror">
                                <option value="">— Vacant (No Tenant) —</option>
                                @foreach($tenants as $tenant)
                                <option value="{{ $tenant->id }}" {{ old('tenant_id') == $tenant->id ? 'selected' : '' }}>
                                    {{ $tenant->name }} ({{ $tenant->phone }})
                                </option>
                                @endforeach
                            </select>
                            @error('tenant_id')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <hr class="my-4">
                    <h6 class="text-muted mb-3">Financial Details</h6>

                    <div class="row">
                        <div class="col-md-6 mb-3">
                            <label for="monthly_rent" class="form-label">Monthly Rent (Rs.) <span class="text-danger">*</span></label>
                            <input type="number" name="monthly_rent" id="monthly_rent" step="0.01"
                                class="form-control @error('monthly_rent') is-invalid @enderror"
                                value="{{ old('monthly_rent') }}" placeholder="40000">
                            @error('monthly_rent')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-6 mb-3">
                            <label for="electricity_rate_per_unit" class="form-label">Electricity Rate/Unit (Rs.)</label>
                            <input type="number" name="electricity_rate_per_unit" id="electricity_rate_per_unit" step="0.01"
                                class="form-control @error('electricity_rate_per_unit') is-invalid @enderror"
                                value="{{ old('electricity_rate_per_unit') }}" placeholder="62.90">
                            @error('electricity_rate_per_unit')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-md-4 mb-3">
                            <label for="maintenance_total" class="form-label">Maintenance Amount (Rs.)</label>
                            <input type="number" name="maintenance_total" id="maintenance_total" step="0.01"
                                class="form-control @error('maintenance_total') is-invalid @enderror"
                                value="{{ old('maintenance_total') }}" placeholder="3950">
                            @error('maintenance_total')<div class="invalid-feedback">{{ $message }}</div>@enderror
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="owner_maintenance_percent" class="form-label">Owner Share (%)</label>
                            <input type="number" name="owner_maintenance_percent" id="owner_maintenance_percent"
                                class="form-control" value="{{ old('owner_maintenance_percent', 50) }}"
                                min="0" max="100">
                        </div>
                        <div class="col-md-4 mb-3">
                            <label for="tenant_maintenance_percent" class="form-label">Tenant Share (%)</label>
                            <input type="number" name="tenant_maintenance_percent" id="tenant_maintenance_percent"
                                class="form-control" value="{{ old('tenant_maintenance_percent', 50) }}"
                                min="0" max="100">
                        </div>
                    </div>

                    <div class="d-flex gap-2 pt-3">
                        <button type="submit" class="btn btn-primary"><i class="bi bi-check-circle me-1"></i> Save Property</button>
                        <a href="{{ route('properties.index') }}" class="btn btn-light">Cancel</a>
                    </div>
                </form>
            </div>
        </div>
    </div>
</div>
@endsection
