<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\User;
use App\Http\Requests\StoreTenantRequest;
use App\Http\Requests\UpdateTenantRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class TenantController extends Controller
{
    public function index()
    {
        $tenants = Tenant::with('user', 'property')
            ->latest()
            ->paginate(10);

        return view('tenants.index', compact('tenants'));
    }

    public function create()
    {
        return view('tenants.create');
    }

    public function store(StoreTenantRequest $request)
    {
        DB::transaction(function () use ($request) {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'tenant',
            ]);

            Tenant::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'phone' => $request->phone,
                'cnic' => $request->cnic,
                'address' => $request->address,
            ]);
        });

        return redirect()->route('tenants.index')
            ->with('success', 'Tenant created successfully.');
    }

    public function show(Tenant $tenant)
    {
        $tenant->load('user', 'property.owner');
        return view('tenants.show', compact('tenant'));
    }

    public function edit(Tenant $tenant)
    {
        $tenant->load('user');
        return view('tenants.edit', compact('tenant'));
    }

    public function update(UpdateTenantRequest $request, Tenant $tenant)
    {
        $tenant->update([
            'name' => $request->name,
            'phone' => $request->phone,
            'cnic' => $request->cnic,
            'address' => $request->address,
        ]);

        $tenant->user->update([
            'name' => $request->name,
            'email' => $request->email,
        ]);

        return redirect()->route('tenants.index')
            ->with('success', 'Tenant updated successfully.');
    }

    public function destroy(Tenant $tenant)
    {
        $tenant->user->delete();

        return redirect()->route('tenants.index')
            ->with('success', 'Tenant deleted successfully.');
    }
}
