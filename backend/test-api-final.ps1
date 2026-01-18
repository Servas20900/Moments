# Test API Moments Backend
$baseUrl = "http://localhost:3000"
$ErrorActionPreference = "Continue"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MOMENTS API - TESTS      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# 0. HEALTH CHECK FIRST
Write-Host "`n[0] HEALTH CHECK" -ForegroundColor Magenta
try {
    $healthResponse = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "[OK] Health check - Status: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Health check fallido: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 1. LOGIN
Write-Host "`n[1] LOGIN ADMIN" -ForegroundColor Magenta
$loginBody = @{
    email = "admin@moments.com"
    password = "admin123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $loginResponse.access_token
    Write-Host "[OK] Login exitoso - Usuario: $($loginResponse.user.nombre)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Login fallido: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. GET PROFILE
Write-Host "`n[2] GET PROFILE" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $profileResponse = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers
    Write-Host "[OK] Perfil obtenido - ID: $($profileResponse.id)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 3. REGISTER USER
Write-Host "`n[3] REGISTER USER" -ForegroundColor Magenta
$registerBody = @{
    email = "testuser$((Get-Random)).com"
    password = "password123"
    name = "Test User"
    phone = "88889999"
} | ConvertTo-Json

try {
    $registerResponse = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    Write-Host "[OK] Usuario registrado - ID: $($registerResponse.user.id)" -ForegroundColor Green
} catch {
    Write-Host "[WARN] Ya existe o error: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. LIST USERS
Write-Host "`n[4] LIST USERS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $usersResponse = Invoke-RestMethod -Uri "$baseUrl/usuarios" -Method Get -Headers $headers
    Write-Host "[OK] Usuarios: $($usersResponse.total) total" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 5. CREATE PACKAGE
Write-Host "`n[5] CREATE PACKAGE" -ForegroundColor Magenta
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
    Write-Host "[OK] Paquete creado - ID: $($packageResponse.id)" -ForegroundColor Green
    $packageId = $packageResponse.id
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 6. LIST PACKAGES
Write-Host "`n[6] LIST PACKAGES" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $packagesResponse = Invoke-RestMethod -Uri "$baseUrl/paquetes" -Method Get -Headers $headers
    Write-Host "[OK] Paquetes: $($packagesResponse.total) total" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 7. CREATE VEHICLE
Write-Host "`n[7] CREATE VEHICLE" -ForegroundColor Magenta
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
    Write-Host "[OK] Vehiculo creado - ID: $($vehicleResponse.id)" -ForegroundColor Green
    $vehicleId = $vehicleResponse.id
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 8. LIST VEHICLES
Write-Host "`n[8] LIST VEHICLES" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $vehiclesResponse = Invoke-RestMethod -Uri "$baseUrl/vehiculos" -Method Get -Headers $headers
    Write-Host "[OK] Vehiculos: $($vehiclesResponse.Count) total" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 9. CREATE RESERVATION
Write-Host "`n[9] CREATE RESERVATION" -ForegroundColor Magenta
if ($packageId -and $vehicleId) {
    $reservationBody = @{
        nombre = "Cliente Test"
        email = "cliente@test.com"
        telefono = "88887777"
        tipoEvento = "Boda"
        fechaEvento = "2026-02-14"
        horaInicio = "2026-02-14T18:00:00"
        horaFin = "2026-02-14T23:00:00"
        origen = "San Jose"
        destino = "Cartago"
        numeroPersonas = 2
        paqueteId = $packageId
        vehiculoId = $vehicleId
    } | ConvertTo-Json

    try {
        $headers = @{Authorization = "Bearer $token"}
        $reservationResponse = Invoke-RestMethod -Uri "$baseUrl/reservas" -Method Post -Body $reservationBody -ContentType "application/json" -Headers $headers
        Write-Host "[OK] Reserva creada - ID: $($reservationResponse.id)" -ForegroundColor Green
    } catch {
        Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "[SKIP] Necesita paquete y vehiculo" -ForegroundColor Yellow
}

# 10. LIST RESERVATIONS
Write-Host "`n[10] LIST RESERVATIONS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $reservationsResponse = Invoke-RestMethod -Uri "$baseUrl/reservas" -Method Get -Headers $headers
    Write-Host "[OK] Reservas: $($reservationsResponse.Count) total" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 11. CREATE CALENDAR EVENT
Write-Host "`n[11] CREATE CALENDAR EVENT" -ForegroundColor Magenta
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
    Write-Host "[OK] Evento creado - ID: $($eventResponse.id)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 12. LIST EVENTS
Write-Host "`n[12] LIST EVENTS" -ForegroundColor Magenta
try {
    $headers = @{Authorization = "Bearer $token"}
    $eventsResponse = Invoke-RestMethod -Uri "$baseUrl/eventos" -Method Get -Headers $headers
    Write-Host "[OK] Eventos: $($eventsResponse.Count) total" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

# 13. HEALTH CHECK
Write-Host "`n[13] HEALTH CHECK" -ForegroundColor Magenta
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get
    Write-Host "[OK] Health check - Status: $($healthResponse.status)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "       TESTS COMPLETED              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
