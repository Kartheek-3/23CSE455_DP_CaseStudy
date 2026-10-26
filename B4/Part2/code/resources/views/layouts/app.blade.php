<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Property Manager') }} - @yield('title', 'Dashboard')</title>
    <link rel="icon" type="image/svg+xml" href="{{ asset('favicon.svg') }}">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="icon" type="image/png" sizes="32x32" href="{{ asset('favicon-32x32.png') }}">
    <link rel="apple-touch-icon" sizes="180x180" href="{{ asset('apple-touch-icon.png') }}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" rel="stylesheet">
    <style>
        :root {
            --primary: #2563EB;
            --primary-hover: #1D4ED8;
            --primary-light: #EFF6FF;
            --secondary: #334155;
            --accent: #16A34A;
            --sidebar-bg: #1E293B;
            --sidebar-text: #94A3B8;
            --sidebar-active: #2563EB;
            --sidebar-hover: rgba(255, 255, 255, .06);
            --sidebar-section: rgba(148, 163, 184, .4);
            --body-bg: #F8FAFC;
            --card-shadow: 0 1px 3px rgba(0, 0, 0, .06), 0 1px 2px rgba(0, 0, 0, .04);
            --card-shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, .08), 0 4px 6px -4px rgba(0, 0, 0, .04);
            --border-color: #E2E8F0;
            --text-primary: #1E293B;
            --text-secondary: #475569;
            --text-muted: #64748B;
            --accent: #16A34A;
            --accent-hover: #15803D;
            --accent-light: #DCFCE7;
        }

        * {
            font-family: 'Inter', sans-serif;
        }

        body {
            background: var(--body-bg);
        }

        /* Sidebar */
        .sidebar {
            width: 260px;
            height: 100vh;
            min-height: 100vh;
            overflow-y: auto;
            background: var(--sidebar-bg);
            position: fixed;
            left: 0;
            top: 0;
            z-index: 1000;
            transition: transform .3s ease;
        }

        .sidebar-brand {
            padding: 1.5rem;
            border-bottom: 1px solid rgba(255, 255, 255, .08);
        }

        .sidebar-brand h4 {
            color: #fff;
            font-weight: 700;
            font-size: 1.1rem;
            margin: 0;
        }

        .sidebar-brand small {
            color: var(--sidebar-text);
            font-size: .75rem;
        }

        .sidebar-nav {
            padding: 1rem 0;
        }

        .sidebar-nav .nav-section {
            padding: .5rem 1.5rem;
            font-size: .65rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: .08em;
            color: var(--sidebar-section);
            margin-top: .5rem;
        }

        .sidebar-nav .nav-link {
            color: var(--sidebar-text);
            padding: .6rem 1.5rem;
            font-size: .875rem;
            font-weight: 400;
            display: flex;
            align-items: center;
            gap: .75rem;
            border-radius: 0;
            transition: all .15s ease;
        }

        .sidebar-nav .nav-link:hover {
            background: var(--sidebar-hover);
            color: #fff;
        }

        .sidebar-nav .nav-link.active {
            background: var(--sidebar-active);
            color: #fff;
            font-weight: 500;
        }

        .sidebar-nav .nav-link i {
            font-size: 1.1rem;
            width: 1.25rem;
            text-align: center;
        }

        /* Main content */
        .main-content {
            margin-left: 260px;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .top-bar {
            background: #fff;
            border-bottom: 1px solid var(--border-color);
            padding: .75rem 2rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
        }

        .top-bar h5 {
            margin: 0;
            font-weight: 600;
            font-size: 1rem;
            color: var(--text-primary);
        }

        .content-area {
            padding: 2rem;
            flex: 1;
        }

        /* Cards */
        .card {
            border: 1px solid var(--border-color);
            border-radius: .75rem;
            box-shadow: var(--card-shadow);
            transition: box-shadow .2s ease;
        }

        .card:hover {
            box-shadow: var(--card-shadow-hover);
        }

        .card-header {
            background: #fff;
            border-bottom: 1px solid var(--border-color);
            padding: 1rem 1.5rem;
            font-weight: 600;
            border-radius: .75rem .75rem 0 0 !important;
        }

        .card-body {
            padding: 1.5rem;
        }

        /* Responsive Tables */
        .card-body.p-0 {
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 992px) {
            .card-body.p-0 .table {
                white-space: nowrap;
            }
        }

        /* Buttons */
        .btn-primary {
            background: var(--primary);
            border-color: var(--primary);
            border-radius: .5rem;
            font-weight: 500;
            padding: .5rem 1.25rem;
        }

        .btn-primary:hover {
            background: var(--primary-hover);
            border-color: var(--primary-hover);
        }

        .btn-outline-primary {
            color: var(--primary);
            border-color: var(--primary);
            border-radius: .5rem;
        }

        .btn-outline-primary:hover {
            background: var(--primary);
            border-color: var(--primary);
        }

        /* Tables */
        .table {
            font-size: .875rem;
        }

        .table thead th {
            background: var(--body-bg);
            font-weight: 600;
            font-size: .75rem;
            text-transform: uppercase;
            letter-spacing: .05em;
            color: var(--text-muted);
            border-bottom: 2px solid var(--border-color);
            padding: .75rem 1rem;
        }

        .table td {
            padding: .75rem 1rem;
            vertical-align: middle;
            color: var(--secondary);
        }

        .table tbody tr:hover {
            background: var(--body-bg);
        }

        /* Forms */
        .form-control,
        .form-select {
            border-radius: .5rem;
            border-color: #CBD5E1;
            padding: .6rem .875rem;
            font-size: .875rem;
        }

        .form-control:focus,
        .form-select:focus {
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, .15);
        }

        .form-label {
            font-weight: 500;
            font-size: .875rem;
            color: var(--text-secondary);
        }

        /* Badges */
        .badge-success {
            background: var(--accent-light);
            color: var(--accent);
            font-weight: 500;
        }

        .badge-warning {
            background: #FEF3C7;
            color: #92400E;
            font-weight: 500;
        }

        .badge-danger {
            background: #FEE2E2;
            color: #991B1B;
            font-weight: 500;
        }

        .badge-info {
            background: var(--primary-light);
            color: #1E40AF;
            font-weight: 500;
        }

        /* Stats cards */
        .stat-card {
            border-radius: .75rem;
            padding: 1.5rem;
        }

        .stat-card .stat-icon {
            width: 48px;
            height: 48px;
            border-radius: .75rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.25rem;
        }

        .stat-card .stat-value {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--text-primary);
        }

        .stat-card .stat-label {
            font-size: .8rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        /* Alert */
        .alert {
            border-radius: .5rem;
            font-size: .875rem;
            border: none;
        }

        .alert-success {
            background: var(--accent-light);
            color: #166534;
            border-left: 4px solid var(--accent);
        }

        .alert-danger {
            background: #FEE2E2;
            color: #991B1B;
        }

        /* Auth pages (no sidebar) */
        .auth-wrapper {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #1E3A8A 0%, #2563EB 50%, #1E40AF 100%);
        }

        .auth-card {
            background: #fff;
            border-radius: 1rem;
            padding: 2.5rem;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, .25);
            width: 100%;
            max-width: 440px;
        }

        .auth-card .auth-logo {
            text-align: center;
            margin-bottom: 2rem;
        }

        .auth-card .auth-logo h3 {
            font-weight: 700;
            color: var(--text-primary);
            margin-bottom: .25rem;
        }

        .auth-card .auth-logo p {
            color: var(--text-muted);
            font-size: .875rem;
        }

        /* Responsive */
        @media (max-width: 768px) {
            .sidebar {
                transform: translateX(-100%);
            }

            .sidebar.show {
                transform: translateX(0);
            }

            .main-content {
                margin-left: 0;
            }
        }

        /* Sidebar Overlay */
        .sidebar-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, .5);
            z-index: 999;
        }

        .sidebar.show+.sidebar-overlay {
            display: block;
        }

        /* User dropdown */
        .user-menu .dropdown-toggle::after {
            display: none;
        }

        .user-menu .dropdown-toggle {
            display: flex;
            align-items: center;
            gap: .5rem;
            text-decoration: none;
            color: var(--text-secondary);
            font-weight: 500;
            font-size: .875rem;
        }

        .user-avatar {
            width: 36px;
            height: 36px;
            border-radius: 50%;
            background: var(--primary);
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 600;
            font-size: .8rem;
        }

        /* Accent Button (for money/payment actions) */
        .btn-accent {
            background: var(--accent);
            border-color: var(--accent);
            color: #fff;
            border-radius: .5rem;
            font-weight: 500;
            padding: .5rem 1.25rem;
        }

        .btn-accent:hover {
            background: var(--accent-hover);
            border-color: var(--accent-hover);
            color: #fff;
        }

        .btn-outline-accent {
            color: var(--accent);
            border-color: var(--accent);
            border-radius: .5rem;
        }

        .btn-outline-accent:hover {
            background: var(--accent);
            border-color: var(--accent);
            color: #fff;
        }

        /* ============================================
           TOP BAR — search + notifications
        ============================================ */
        .top-search {
            position: relative;
            flex: 1;
            max-width: 420px;
        }

        .top-search .bi-search {
            position: absolute;
            left: .875rem;
            top: 50%;
            transform: translateY(-50%);
            color: var(--text-muted);
            font-size: .9rem;
        }

        .top-search input {
            width: 100%;
            border: 1px solid var(--border-color);
            background: var(--body-bg);
            border-radius: .625rem;
            padding: .55rem 2.75rem .55rem 2.5rem;
            font-size: .875rem;
            color: var(--text-primary);
            transition: all .15s ease;
        }

        .top-search input:focus {
            outline: none;
            background: #fff;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(37, 99, 235, .12);
        }

        .top-search .kbd {
            position: absolute;
            right: .625rem;
            top: 50%;
            transform: translateY(-50%);
            font-size: .7rem;
            font-weight: 600;
            color: var(--text-muted);
            background: #fff;
            border: 1px solid var(--border-color);
            border-radius: .375rem;
            padding: .1rem .4rem;
        }

        .notif-btn {
            position: relative;
            width: 42px;
            height: 42px;
            border-radius: .625rem;
            border: 1px solid var(--border-color);
            background: #fff;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.15rem;
            transition: all .15s ease;
        }

        .notif-btn:hover {
            background: var(--body-bg);
            color: var(--primary);
        }

        .notif-btn .notif-dot {
            position: absolute;
            top: -4px;
            right: -4px;
            min-width: 18px;
            height: 18px;
            padding: 0 4px;
            border-radius: 9px;
            background: var(--primary);
            color: #fff;
            font-size: .65rem;
            font-weight: 700;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid #fff;
        }

        .user-menu .user-name {
            line-height: 1.15;
        }

        .user-menu .user-name .name {
            font-weight: 600;
            color: var(--text-primary);
            font-size: .875rem;
        }

        .user-menu .user-name .role {
            font-size: .72rem;
            color: var(--text-muted);
        }

        /* ============================================
           PROFILE DROPDOWN MENU
        ============================================ */
        .profile-menu {
            width: 320px;
            padding: 0;
            border: 1px solid var(--border-color);
            border-radius: 1rem;
            box-shadow: 0 20px 40px -12px rgba(15, 23, 42, .22);
            overflow: hidden;
            margin-top: .5rem;
        }

        .pm-header {
            display: flex;
            align-items: center;
            gap: .8rem;
            padding: 1.1rem 1.15rem;
            margin: .55rem;
            border-radius: .8rem;
            background: linear-gradient(135deg, #2563EB 0%, #1E40AF 100%);
            color: #fff;
        }

        .pm-header .pm-avatar {
            width: 46px;
            height: 46px;
            min-width: 46px;
            border-radius: 50%;
            background: rgba(255, 255, 255, .18);
            border: 1px solid rgba(255, 255, 255, .35);
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: 700;
            font-size: 1.1rem;
        }

        .pm-header .pm-name {
            font-weight: 700;
            font-size: .95rem;
            line-height: 1.2;
        }

        .pm-header .pm-role {
            font-size: .75rem;
            color: rgba(255, 255, 255, .8);
        }

        .pm-header .pm-email {
            font-size: .75rem;
            color: rgba(255, 255, 255, .8);
            margin-top: .15rem;
            word-break: break-all;
        }

        .pm-body {
            padding: .35rem .55rem;
        }

        .pm-item {
            display: flex;
            align-items: center;
            gap: .8rem;
            padding: .6rem .6rem;
            border-radius: .6rem;
            text-decoration: none;
            color: var(--text-primary);
            transition: background .15s ease;
        }

        .pm-item:hover {
            background: var(--body-bg);
        }

        .pm-item .pm-ico {
            width: 34px;
            height: 34px;
            min-width: 34px;
            border-radius: .55rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.05rem;
            background: var(--primary-light);
            color: var(--primary);
        }

        .pm-item .pm-text {
            flex: 1;
            min-width: 0;
        }

        .pm-item .pm-title {
            font-weight: 600;
            font-size: .875rem;
            line-height: 1.2;
        }

        .pm-item .pm-desc {
            font-size: .74rem;
            color: var(--text-muted);
        }

        .pm-item .pm-arrow {
            color: var(--text-muted);
            font-size: .8rem;
        }

        .pm-item.logout {
            color: #dc2626;
        }

        .pm-item.logout .pm-ico {
            background: #fee2e2;
            color: #dc2626;
        }

        .pm-item.logout .pm-desc {
            color: #f87171;
        }

        .pm-divider {
            height: 1px;
            background: var(--border-color);
            margin: .35rem .6rem;
        }

        .pm-premium {
            margin: .3rem .55rem .6rem;
            padding: .9rem;
            border-radius: .75rem;
            background: linear-gradient(135deg, #eef2ff 0%, #f5f3ff 100%);
            border: 1px solid #e0e7ff;
        }

        .pm-premium .pm-premium-title {
            display: flex;
            align-items: center;
            gap: .4rem;
            font-weight: 700;
            font-size: .85rem;
            color: #4338ca;
        }

        .pm-premium .pm-premium-title .bi-star-fill {
            color: #f59e0b;
        }

        .pm-premium .pm-premium-sub {
            font-size: .74rem;
            color: var(--text-muted);
            margin: .2rem 0 .7rem;
        }

        .pm-premium .btn-premium {
            display: block;
            text-align: center;
            background: linear-gradient(135deg, #4f46e5 0%, #4338ca 100%);
            color: #fff;
            font-weight: 600;
            font-size: .8rem;
            padding: .5rem;
            border-radius: .5rem;
            text-decoration: none;
            transition: opacity .15s ease;
        }

        .pm-premium .btn-premium:hover {
            opacity: .9;
        }

        /* ============================================
           DASHBOARD — hero header
        ============================================ */
        .dash-hero h1 {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--text-primary);
            margin: 0;
        }

        .dash-hero p {
            color: var(--text-muted);
            font-size: .9rem;
            margin: .25rem 0 0;
        }

        /* ============================================
           DASHBOARD — metric cards (row 1)
        ============================================ */
        .metric-card {
            padding: 1.25rem 1.35rem;
            height: 100%;
        }

        .metric-top {
            display: flex;
            align-items: center;
            gap: .9rem;
        }

        .metric-icon {
            width: 52px;
            height: 52px;
            min-width: 52px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.35rem;
        }

        .metric-label {
            font-size: .8rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .metric-value {
            font-size: 1.6rem;
            font-weight: 700;
            color: var(--text-primary);
            line-height: 1.2;
        }

        .metric-foot {
            margin-top: .9rem;
            padding-top: .75rem;
            border-top: 1px dashed var(--border-color);
            font-size: .78rem;
            color: var(--text-muted);
            display: flex;
            align-items: center;
            gap: .85rem;
            flex-wrap: wrap;
        }

        .dot-stat {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            font-weight: 500;
        }

        .dot-stat::before {
            content: "";
            width: 7px;
            height: 7px;
            border-radius: 50%;
            background: currentColor;
        }

        /* ============================================
           DASHBOARD — bill cards (row 2)
        ============================================ */
        .bill-card {
            padding: 1.5rem;
            display: flex;
            flex-direction: row;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
            height: 100%;
        }

        .bill-card .metric-value {
            font-size: 1.75rem;
            margin: .15rem 0 .25rem;
        }

        .bill-card .metric-sub {
            font-size: .78rem;
            color: var(--text-muted);
        }

        .bill-icon {
            width: 56px;
            height: 56px;
            min-width: 56px;
            border-radius: .85rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }

        /* ============================================
           DASHBOARD — section cards
        ============================================ */
        .section-card .card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        }

        .section-card .card-title {
            display: flex;
            align-items: center;
            gap: .6rem;
            font-weight: 600;
            color: var(--text-primary);
        }

        .section-card .card-title i {
            color: var(--primary);
        }

        .btn-viewall {
            font-size: .8rem;
            font-weight: 600;
            color: var(--primary);
            border: 1px solid var(--border-color);
            border-radius: .5rem;
            padding: .35rem .8rem;
            text-decoration: none;
            transition: all .15s ease;
        }

        .btn-viewall:hover {
            background: var(--primary-light);
            border-color: var(--primary);
            color: var(--primary);
        }

        .receipt-type {
            display: inline-flex;
            align-items: center;
            gap: .5rem;
            font-weight: 500;
            color: var(--text-primary);
        }

        .receipt-type .type-ico {
            width: 30px;
            height: 30px;
            border-radius: .5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: .95rem;
        }

        .btn-eye {
            width: 34px;
            height: 34px;
            border-radius: .5rem;
            border: 1px solid var(--border-color);
            color: var(--primary);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            transition: all .15s ease;
        }

        .btn-eye:hover {
            background: var(--primary);
            border-color: var(--primary);
            color: #fff;
        }

        .table-footer {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: .9rem 1.25rem;
            border-top: 1px solid var(--border-color);
            font-size: .8rem;
            color: var(--text-muted);
            flex-wrap: wrap;
            gap: .5rem;
        }

        .pager {
            display: flex;
            align-items: center;
            gap: .35rem;
        }

        .pager span,
        .pager a {
            width: 32px;
            height: 32px;
            border-radius: .5rem;
            border: 1px solid var(--border-color);
            display: inline-flex;
            align-items: center;
            justify-content: center;
            color: var(--text-secondary);
            text-decoration: none;
            font-weight: 500;
        }

        .pager .active {
            background: var(--primary);
            border-color: var(--primary);
            color: #fff;
        }

        .pager .disabled {
            opacity: .45;
            pointer-events: none;
        }

        /* ============================================
           DASHBOARD — quick actions
        ============================================ */
        .qa-item {
            display: flex;
            align-items: center;
            gap: .85rem;
            padding: .7rem .85rem;
            border: 1px solid var(--border-color);
            border-radius: .625rem;
            text-decoration: none;
            color: var(--primary);
            font-weight: 600;
            font-size: .875rem;
            transition: all .15s ease;
        }

        .qa-item:hover {
            background: var(--primary-light);
            border-color: var(--primary);
            transform: translateX(2px);
        }

        .qa-item .qa-ico {
            width: 36px;
            height: 36px;
            min-width: 36px;
            border-radius: .55rem;
            background: var(--primary-light);
            color: var(--primary);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.05rem;
        }

        .qa-item .qa-arrow {
            margin-left: auto;
            color: var(--text-muted);
            font-size: .85rem;
        }

        /* ============================================
           DASHBOARD — featured property
        ============================================ */
        .property-feature {
            display: flex;
            gap: 1rem;
            align-items: flex-start;
        }

        .property-thumb {
            width: 92px;
            height: 78px;
            min-width: 92px;
            border-radius: .65rem;
            background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: rgba(255, 255, 255, .92);
            font-size: 2rem;
            overflow: hidden;
        }

        .property-feature .prop-addr {
            font-weight: 600;
            color: var(--text-primary);
            font-size: .9rem;
        }

        .property-feature .prop-meta {
            font-size: .8rem;
            color: var(--text-muted);
            margin-top: .15rem;
        }

        .property-feature .prop-link {
            font-size: .82rem;
            font-weight: 600;
            color: var(--primary);
            text-decoration: none;
        }

        .property-feature .prop-link:hover {
            text-decoration: underline;
        }

        /* ============================================
           SIDEBAR — promo + help cards
        ============================================ */
        .sidebar-extra {
            margin-top: auto;
            padding: 1rem 1.15rem 1.5rem;
        }

        .sidebar-nav {
            display: flex;
            flex-direction: column;
            min-height: calc(100vh - 90px);
        }

        .promo-card {
            background: linear-gradient(150deg, #2563EB 0%, #1E40AF 100%);
            border-radius: .85rem;
            padding: 1.15rem;
            color: #fff;
            margin-bottom: 1rem;
        }

        .promo-card p {
            font-size: .8rem;
            line-height: 1.4;
            margin: 0 0 .9rem;
            color: rgba(255, 255, 255, .9);
        }

        .promo-card .promo-icon {
            font-size: 1.75rem;
            display: block;
            margin-bottom: .5rem;
        }

        .promo-card .btn-upgrade {
            display: block;
            text-align: center;
            background: #fff;
            color: var(--primary);
            font-weight: 600;
            font-size: .8rem;
            padding: .5rem;
            border-radius: .5rem;
            text-decoration: none;
        }

        .help-card {
            text-align: center;
            color: var(--sidebar-text);
        }

        .help-card .help-title {
            color: #fff;
            font-weight: 600;
            font-size: .82rem;
        }

        .help-card small {
            font-size: .72rem;
            display: block;
            margin-bottom: .65rem;
        }

        .help-card .btn-help {
            display: inline-flex;
            align-items: center;
            gap: .4rem;
            border: 1px solid rgba(255, 255, 255, .18);
            color: #fff;
            border-radius: .5rem;
            padding: .4rem .9rem;
            font-size: .78rem;
            text-decoration: none;
            transition: all .15s ease;
        }

        .help-card .btn-help:hover {
            background: rgba(255, 255, 255, .08);
        }

        @media (max-width: 768px) {
            .top-search {
                display: none;
            }
        }
    </style>
    @stack('styles')
</head>

<body>
    @auth
    {{-- SIDEBAR --}}
    <aside class="sidebar" id="sidebar">
        <div class="sidebar-brand d-flex justify-content-between align-items-start">
            <div>
                <h4><i class="bi bi-building"></i> Property Manager</h4>
                <small>Receipt Management System</small>
            </div>
            <button class="btn btn-link d-md-none p-0 text-white" onclick="document.getElementById('sidebar').classList.remove('show')" style="font-size: 1.25rem; opacity: .7;">
                <i class="bi bi-x-lg"></i>
            </button>
        </div>
        <nav class="sidebar-nav">
            @if(auth()->user()->isTenant())
            {{-- TENANT SIDEBAR --}}
            <a href="{{ route('tenant.dashboard') }}" class="nav-link {{ request()->is('my/dashboard') ? 'active' : '' }}">
                <i class="bi bi-grid-1x2-fill"></i> My Dashboard
            </a>

            <div class="nav-section">My Receipts</div>
            <a href="{{ route('tenant.rent-receipts') }}" class="nav-link {{ request()->is('my/rent-receipts*') ? 'active' : '' }}">
                <i class="bi bi-receipt"></i> Rent Receipts
            </a>
            <a href="{{ route('tenant.maintenance-receipts') }}" class="nav-link {{ request()->is('my/maintenance-receipts*') ? 'active' : '' }}">
                <i class="bi bi-tools"></i> Maintenance Bills
            </a>
            <a href="{{ route('tenant.electricity-receipts') }}" class="nav-link {{ request()->is('my/electricity-receipts*') ? 'active' : '' }}">
                <i class="bi bi-lightning-charge"></i> Electricity Bills
            </a>
            <a href="{{ route('tenant.security-deposit') }}" class="nav-link {{ request()->is('my/security-deposit*') ? 'active' : '' }}">
                <i class="bi bi-shield-lock"></i> Security Deposit
            </a>
            @else
            {{-- ADMIN / OWNER SIDEBAR --}}
            <a href="{{ url('/home') }}" class="nav-link {{ request()->is('home') ? 'active' : '' }}">
                <i class="bi bi-grid-1x2-fill"></i> Dashboard
            </a>

            @if(auth()->user()->isAdmin())
            <div class="nav-section">Management</div>
            <a href="{{ route('owners.index') }}" class="nav-link {{ request()->is('owners*') ? 'active' : '' }}">
                <i class="bi bi-person-badge"></i> Owners
            </a>
            <a href="{{ route('tenants.index') }}" class="nav-link {{ request()->is('tenants*') ? 'active' : '' }}">
                <i class="bi bi-people"></i> Tenants
            </a>
            <a href="{{ route('properties.index') }}" class="nav-link {{ request()->is('properties*') ? 'active' : '' }}">
                <i class="bi bi-houses"></i> Properties
            </a>

            <div class="nav-section">Administration</div>
            <a href="{{ route('users.index') }}" class="nav-link {{ request()->is('users*') ? 'active' : '' }}">
                <i class="bi bi-people"></i> User Management
            </a>
            <a href="{{ route('register') }}" class="nav-link {{ request()->is('register') ? 'active' : '' }}">
                <i class="bi bi-person-plus"></i> Register Admin
            </a>
            @endif

            <div class="nav-section">Receipts</div>
            <a href="{{ route('rent-receipts.index') }}" class="nav-link {{ request()->is('rent-receipts*') ? 'active' : '' }}">
                <i class="bi bi-receipt"></i> Rent Receipts
            </a>
            <a href="{{ route('maintenance-receipts.index') }}" class="nav-link {{ request()->is('maintenance-receipts*') ? 'active' : '' }}">
                <i class="bi bi-tools"></i> Maintenance Bills
            </a>
            <a href="{{ route('electricity-receipts.index') }}" class="nav-link {{ request()->is('electricity-receipts*') ? 'active' : '' }}">
                <i class="bi bi-lightning-charge"></i> Electricity Bills
            </a>
            <a href="{{ route('security-deposits.index') }}" class="nav-link {{ request()->is('security-deposits*') ? 'active' : '' }}">
                <i class="bi bi-shield-lock"></i> Security Deposits
            </a>
            @endif

            <div class="sidebar-extra">
                <div class="promo-card">
                    <i class="bi bi-buildings-fill promo-icon"></i>
                    <p>Keep your properties and receipts organized in one place.</p>
                    <a href="{{ route('about') }}" class="btn-upgrade">Learn More <i class="bi bi-arrow-right"></i></a>
                </div>
                <div class="help-card">
                    <div class="help-title"><i class="bi bi-headset me-1"></i> Need Help?</div>
                    <small>We're here to assist you.</small>
                    <a href="https://github.com/mohsin-rafique/property-management/issues" target="_blank" class="btn-help">
                        <i class="bi bi-life-preserver"></i> Contact Support
                    </a>
                </div>
            </div>
        </nav>
    </aside>

    {{-- Mobile Sidebar Overlay --}}
    <div class="sidebar-overlay d-md-none" id="sidebarOverlay" onclick="document.getElementById('sidebar').classList.remove('show'); this.classList.remove('show');"></div>

    {{-- MAIN CONTENT --}}
    <div class="main-content">
        <div class="top-bar">
            <div class="d-flex align-items-center gap-3 flex-grow-1">
                <button class="btn btn-link d-md-none p-0 text-dark" onclick="document.getElementById('sidebar').classList.toggle('show')">
                    <i class="bi bi-list fs-4"></i>
                </button>
                <h5 class="d-md-none mb-0">@yield('title', 'Dashboard')</h5>
                <div class="top-search d-none d-md-block">
                    <i class="bi bi-search"></i>
                    <input type="text" placeholder="Search anything..." aria-label="Search">
                    <span class="kbd">⌘K</span>
                </div>
            </div>
            <div class="d-flex align-items-center gap-3">
                <button type="button" class="notif-btn" aria-label="Notifications">
                    <i class="bi bi-bell"></i>
                    <span class="notif-dot">3</span>
                </button>
                <div class="dropdown user-menu">
                <a href="#" class="dropdown-toggle" data-bs-toggle="dropdown">
                    <div class="user-avatar">
                        {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                    </div>
                    <span class="user-name d-none d-sm-block text-start">
                        <span class="name d-block">{{ auth()->user()->name }}</span>
                        <span class="role">{{ ucfirst(auth()->user()->role ?? 'User') === 'Admin' ? 'Administrator' : ucfirst(auth()->user()->role ?? 'User') }}</span>
                    </span>
                    <i class="bi bi-chevron-down" style="font-size:.7rem"></i>
                </a>
                <div class="dropdown-menu dropdown-menu-end profile-menu">
                    <div class="pm-header">
                        <div class="pm-avatar">{{ strtoupper(substr(auth()->user()->name, 0, 1)) }}</div>
                        <div class="min-w-0">
                            <div class="pm-name">{{ auth()->user()->name }}</div>
                            <div class="pm-role">{{ ucfirst(auth()->user()->role ?? 'User') === 'Admin' ? 'Administrator' : ucfirst(auth()->user()->role ?? 'User') }}</div>
                            <div class="pm-email">{{ auth()->user()->email }}</div>
                        </div>
                    </div>

                    <div class="pm-body">
                        <a class="pm-item" href="{{ route('profile.show') }}">
                            <span class="pm-ico"><i class="bi bi-person"></i></span>
                            <span class="pm-text">
                                <span class="pm-title d-block">Profile Settings</span>
                                <span class="pm-desc">Manage your profile &amp; preferences</span>
                            </span>
                            <i class="bi bi-chevron-right pm-arrow"></i>
                        </a>
                        <a class="pm-item" href="{{ route('profile.show') }}#change-password">
                            <span class="pm-ico"><i class="bi bi-shield-lock"></i></span>
                            <span class="pm-text">
                                <span class="pm-title d-block">Account Security</span>
                                <span class="pm-desc">Password, 2FA &amp; security options</span>
                            </span>
                            <i class="bi bi-chevron-right pm-arrow"></i>
                        </a>
                        <a class="pm-item" href="{{ route('profile.show') }}">
                            <span class="pm-ico"><i class="bi bi-bell"></i></span>
                            <span class="pm-text">
                                <span class="pm-title d-block">Notification Preferences</span>
                                <span class="pm-desc">Manage your notification settings</span>
                            </span>
                            <i class="bi bi-chevron-right pm-arrow"></i>
                        </a>
                        @if(auth()->user()->isAdmin())
                        <a class="pm-item" href="{{ route('users.index') }}">
                            <span class="pm-ico"><i class="bi bi-people"></i></span>
                            <span class="pm-text">
                                <span class="pm-title d-block">User Management</span>
                                <span class="pm-desc">Manage users, roles &amp; access</span>
                            </span>
                            <i class="bi bi-chevron-right pm-arrow"></i>
                        </a>
                        @endif

                        <div class="pm-divider"></div>

                        <a class="pm-item logout" href="{{ route('logout') }}"
                            onclick="event.preventDefault(); document.getElementById('logout-form').submit();">
                            <span class="pm-ico"><i class="bi bi-box-arrow-right"></i></span>
                            <span class="pm-text">
                                <span class="pm-title d-block">Logout</span>
                                <span class="pm-desc">Sign out from your account</span>
                            </span>
                        </a>
                        <form id="logout-form" action="{{ route('logout') }}" method="POST" class="d-none">@csrf</form>
                    </div>

                    <div class="pm-premium">
                        <div class="pm-premium-title"><i class="bi bi-star-fill"></i> Go Premium</div>
                        <div class="pm-premium-sub">Unlock advanced features and insights.</div>
                        <a href="{{ route('about') }}" class="btn-premium">Upgrade Now</a>
                    </div>
                </div>
                </div>
            </div>
        </div>

        <div class="content-area">
            @if(session('success'))
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="bi bi-check-circle me-2"></i>{{ session('success') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            @endif
            @if(session('error'))
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i>{{ session('error') }}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            @endif
            @if($errors->any())
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="bi bi-exclamation-triangle me-2"></i><strong>Please fix the following:</strong>
                <ul class="mb-0 mt-2 ps-4">
                    @foreach($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
            @endif

            @yield('content')
        </div>

        {{-- Footer --}}
        <footer style="background: #fff; border-top: 1px solid #e2e8f0; padding: 1rem 2rem;">
            <div class="d-flex justify-content-between align-items-center flex-wrap gap-2" style="font-size: .8rem; color: #94a3b8;">
                <div>
                    &copy; {{ date('Y') }} <strong style="color: #475569;">{{ config('app.name', 'Property Manager') }}</strong>.
                    Open Source under
                    <a href="https://github.com/mohsin-rafique/property-management/blob/main/LICENSE" target="_blank" style="color: #2563EB; text-decoration: none;">MIT License</a>.
                </div>
                <div class="d-flex align-items-center gap-3">
                    <a href="https://github.com/mohsin-rafique/property-management" target="_blank" style="color: #475569; text-decoration: none; font-weight: 500;">
                        <i class="bi bi-github me-1"></i>GitHub
                    </a>
                    <a href="{{ route('about') }}" style="color: #475569; text-decoration: none; font-weight: 500;">
                        <i class="bi bi-info-circle me-1"></i>About
                    </a>
                </div>
            </div>
        </footer>
    </div>
    @else
    @yield('content')
    @endauth

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    @stack('scripts')
</body>

</html>
