# Script de prueba de API para Moments Backend
$baseUrl = "http://localhost:3000/api"
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MOMENTS API - SUITE DE PRUEBAS      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 1. LOGIN
Write-Host "`n📝 1. LOGIN" -ForegroundColor Magenta
$loginBody = @{
    email = "admin@moments.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "✅ Login exitoso" -ForegroundColor Green
    Write-Host "Usuario: $($loginResponse.user.nombre)" -ForegroundColor Gray
    Write-Host "Token: $($token.Substring(0,20))..." -ForegroundColor Gray
} catch {
    Write-Host "❌ Error en login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. OBTENER PERFIL
Write-Host "`n👤 2. OBTENER PERFIL" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers
    Write-Host "✅ Perfil obtenido" -ForegroundColor Green
    Write-Host ($profileResponse | ConvertTo-Json) -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. REGISTRAR NUEVO USUARIO
Write-Host "`n📝 3. REGISTRAR NUEVO USUARIO" -ForegroundColor Magenta
$registerBody = @{
    email = "newuser@example.com"
    password = "password123"
    name = "Nuevo Usuario"
    phone = "88889999"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "✅ Usuario registrado" -ForegroundColor Green
    Write-Host "ID: $($registerResponse.user.id)" -ForegroundColor Gray
} catch {
    Write-Host "⚠️  Usuario ya existe o error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. LISTAR USUARIOS
Write-Host "`n👥 4. LISTAR USUARIOS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/usuarios" -Method Get -Headers $headers
    Write-Host "✅ Usuarios listados: $($usersResponse.total) total" -ForegroundColor Green
    $usersResponse.data | ForEach-Object {
        Write-Host "  - $($_.nombre) ($($_.email))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. CREAR PAQUETE
Write-Host "`n📦 5. CREAR PAQUETE" -ForegroundColor Magenta
$packageBody = @{
    name = "Paquete Test"
    category = "Romántico"
    description = "Paquete de prueba"
    price = 150000
    maxPeople = 2
    imageUrl = "https://example.com/image.jpg"
} | ConvertTo-Json

try {
    $headers = @{Authorization = "Bearer $token"}
    $packageResponse = Invoke-RestMethod -Uri "$baseUrl/paquetes" -Method Post -Body $packageBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Paquete creado" -ForegroundColor Green
    Write-Host "ID: $($packageResponse.id)" -ForegroundColor Gray
    Write-Host "Nombre: $($packageResponse.nombre)" -ForegroundColor Gray
    $packageId = $packageResponse.id
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. LISTAR PAQUETES
Write-Host "`n📦 6. LISTAR PAQUETES" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $packagesResponse = Invoke-RestMethod -Uri "$baseUrl/paquetes" -Method Get -Headers $headers
    Write-Host "✅ Paquetes listados: $($packagesResponse.total) total" -ForegroundColor Green
    $packagesResponse.data | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.nombre) - $($_.precioBase) CRC" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. CREAR VEHÍCULO
Write-Host "`n🚗 7. CREAR VEHÍCULO" -ForegroundColor Magenta
$vehicleBody = @{
    nombre = "Limousine Test"
    categoria = "Premium"
    asientos = 8
    tarifaPorHora = "50000"
    imagenUrl = "https://example.com/limo.jpg"
} | ConvertTo-Json

try {
    $headers = @{Authorization = "Bearer $token"}
    $vehicleResponse = Invoke-RestMethod -Uri "$baseUrl/vehiculos" -Method Post -Body $vehicleBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Vehículo creado" -ForegroundColor Green
    Write-Host "ID: $($vehicleResponse.id)" -ForegroundColor Gray
    Write-Host "Nombre: $($vehicleResponse.nombre)" -ForegroundColor Gray
    $vehicleId = $vehicleResponse.id
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. LISTAR VEHÍCULOS
Write-Host "`n🚗 8. LISTAR VEHÍCULOS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $vehiclesResponse = Invoke-RestMethod -Uri "$baseUrl/vehiculos" -Method Get -Headers $headers
    Write-Host "✅ Vehículos listados: $($vehiclesResponse.Count) total" -ForegroundColor Green
    $vehiclesResponse | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.nombre) - $($_.asientos) asientos" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. CREAR RESERVA
Write-Host "`n📅 9. CREAR RESERVA" -ForegroundColor Magenta
if ($packageId -and $vehicleId) {
    $reservationBody = @{
        nombre = "Cliente Test"
        email = "cliente@test.com"
        telefono = "88887777"
        tipoEvento = "Boda"
        fechaEvento = "2026-02-14"
        horaInicio = "2026-02-14T18:00:00"
        horaFin = "2026-02-14T23:00:00"
        origen = "San José"
        destino = "Cartago"
        numeroPersonas = 2
        paqueteId = $packageId
        vehiculoId = $vehicleId
    } | ConvertTo-Json

    try {
        $headers = @{Authorization = "Bearer $token"}
        $reservationResponse = Invoke-RestMethod -Uri "$baseUrl/reservas" -Method Post -Body $reservationBody -ContentType "application/json" -Headers $headers
        Write-Host "✅ Reserva creada" -ForegroundColor Green
        Write-Host "ID: $($reservationResponse.id)" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️  Saltando: Necesita paquete y vehículo" -ForegroundColor Yellow
}

# 10. LISTAR RESERVAS
Write-Host "`n📅 10. LISTAR RESERVAS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $reservationsResponse = Invoke-RestMethod -Uri "$baseUrl/reservas" -Method Get -Headers $headers
    Write-Host "✅ Reservas listadas: $($reservationsResponse.Count) total" -ForegroundColor Green
    $reservationsResponse | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.nombre) - $($_.fechaEvento)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 11. CREAR EVENTO EN CALENDARIO
Write-Host "`n📆 11. CREAR EVENTO EN CALENDARIO" -ForegroundColor Magenta
$eventBody = @{
    fecha = "2026-03-15"
    titulo = "Evento Test"
    estado = "DISPONIBLE"
    detalle = "Evento de prueba"
    etiqueta = "Importante"
} | ConvertTo-Json

try {
    $headers = @{Authorization = "Bearer $token"}
    $eventResponse = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Post -Body $eventBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Evento creado" -ForegroundColor Green
    Write-Host "ID: $($eventResponse.id)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 12. LISTAR EVENTOS
Write-Host "`n📆 12. LISTAR EVENTOS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $eventsResponse = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Get -Headers $headers
    Write-Host "✅ Eventos listados: $($eventsResponse.Count) total" -ForegroundColor Green
    $eventsResponse | Select-Object -First 3 | ForEach-Object {
        Write-Host "  - $($_.titulo) - $($_.fecha)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

# 13. HEALTH CHECK
Write-Host "`n[HEALTH] 13. HEALTH CHECK" -ForegroundColor Magenta
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "[OK] Health check OK" -ForegroundColor Green
    Write-Host ($healthResponse | ConvertTo-Json) -ForegroundColor Gray
} catch {
    Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "       PRUEBAS COMPLETADAS              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
