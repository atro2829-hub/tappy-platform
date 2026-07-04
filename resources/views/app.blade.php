<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" @class(['dark' => ($appearance ?? 'system') == 'dark'])>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        {{-- Inline script to detect system dark mode preference and apply it immediately --}}
        <script>
            (function() {
                const appearance = '{{ $appearance ?? "system" }}';

                if (appearance === 'system') {
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

                    if (prefersDark) {
                        document.documentElement.classList.add('dark');
                    }
                }

                // Apply saved Tappy theme config (accent / radius / density / layout) before paint.
                try {
                    const cfg = JSON.parse(localStorage.getItem('tappy_theme_config') || '{}');
                    const el = document.documentElement;
                    el.setAttribute('data-accent', cfg.accent || 'emerald');
                    el.setAttribute('data-radius', cfg.radius || 'default');
                    el.setAttribute('data-density', cfg.density || 'compact');
                    el.setAttribute('data-sidebar-style', cfg.sidebarStyle || 'classic');
                    el.setAttribute('data-dashlayout', cfg.dashLayout || 'default');
                    el.setAttribute('data-sidebar-collapsed', String(cfg.sidebarCollapsed === true));
                } catch (e) {}
            })();
        </script>

        {{-- Inline style to set the HTML background color based on our theme in app.css --}}
        <style>
            html {
                background-color: hsl(0 0% 100%);
            }

            html.dark {
                background-color: hsl(240 10% 5%);
            }
        </style>

        @php($brandFavicon = \App\Support\SystemSettings::faviconUrl())
        @if($brandFavicon)
            <link rel="icon" href="{{ $brandFavicon }}">
            <link rel="apple-touch-icon" href="{{ $brandFavicon }}">
        @else
            <link rel="icon" href="/favicon.ico" sizes="any">
            <link rel="icon" href="/favicon.svg" type="image/svg+xml">
            <link rel="apple-touch-icon" href="/apple-touch-icon.png">
        @endif

        @fonts

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx', "resources/js/pages/{$page['component']}.tsx"])
        <x-inertia::head>
            <title>{{ $homeSeo['title'] ?? config('app.name', 'Laravel') }}</title>
            @isset($homeSeo)
                <meta name="description" content="{{ $homeSeo['description'] }}">
                <meta property="og:type" content="website">
                <meta property="og:title" content="{{ $homeSeo['title'] }}">
                <meta property="og:description" content="{{ $homeSeo['description'] }}">
                @if(!empty($homeSeo['image']))
                    <meta property="og:image" content="{{ $homeSeo['image'] }}">
                @endif
                <meta name="twitter:card" content="{{ !empty($homeSeo['image']) ? 'summary_large_image' : 'summary' }}">
                <meta name="twitter:title" content="{{ $homeSeo['title'] }}">
                <meta name="twitter:description" content="{{ $homeSeo['description'] }}">
                @if(!empty($homeSeo['image']))
                    <meta name="twitter:image" content="{{ $homeSeo['image'] }}">
                @endif
            @endisset
        </x-inertia::head>
    </head>
    <body class="font-sans antialiased">
        <x-inertia::app />
    </body>
</html>
