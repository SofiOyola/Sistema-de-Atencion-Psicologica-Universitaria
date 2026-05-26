<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAPU - Sistema Automatico</title>
    @php
        $manifestPath = public_path('build/manifest.json');
        $manifest = file_exists($manifestPath)
            ? json_decode(file_get_contents($manifestPath), true)
            : [];

        $cssEntry = $manifest['resources/css/app.css'] ?? null;
        $jsEntry = $manifest['resources/js/app.jsx'] ?? null;
        $cssFiles = [];

        if ($cssEntry && isset($cssEntry['file'])) {
            $cssFiles[] = $cssEntry['file'];
        }

        if ($jsEntry && isset($jsEntry['css'])) {
            $cssFiles = array_merge($cssFiles, $jsEntry['css']);
        }
    @endphp

    @foreach(array_unique($cssFiles) as $cssFile)
        <link rel="stylesheet" href="/build/{{ $cssFile }}">
    @endforeach

    @if($jsEntry && isset($jsEntry['file']))
        <script type="module" src="/build/{{ $jsEntry['file'] }}"></script>
    @endif
</head>
<body class="bg-gray-50 text-gray-900 font-sans antialiased">
    <div id="app"></div>
</body>
</html>
