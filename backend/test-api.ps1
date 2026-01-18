# Script de prueba de API para Moments Backend
# Ejecutar: .\test-api.ps1

$baseUrl = "http://localhost:3000/api"
$token = ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   MOMENTS API - SUITE DE PRUEBAS      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

function Test-Endpoint {
    param(
        [string]$Name,
        [string]$Method,
        [string]$Url,
        [object]$Body = $null,
        [string]$Token = ""
    )
    
    Write-Host "🧪 Probando: $Name" -ForegroundColor Yellow
    Write-Host "   $Method $Url" -ForegroundColor Gray
    
    try {
        $headers = @{
            "Content-Type" = "application/json"
        }
        
        if ($Token) {
            $headers["Authorization"] = "Bearer $Token"
        }
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-RestMethod @params
        Write-Host "   ✅ Success" -ForegroundColor Green
        Write-Host "   Respuesta:" -ForegroundColor Gray
        Write-Host ($response | ConvertTo-Json -Depth 5) -ForegroundColor White
        Write-Host ""
        return $response
    }
    catch {
        Write-Host "   ❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.ErrorDetails.Message) {
            Write-Host "   Detalles: $($_.ErrorDetails.Message)" -ForegroundColor Red
        }
        Write-Host ""
        return $null
    }
}

# ========================================
# 1. PRUEBAS DE AUTENTICACIÓN
# ========================================
Write-Host "📝 1. PRUEBAS DE AUTENTICACIÓN" -ForegroundColor Magenta
Write-Host "===============================" -ForegroundColor Magenta
Write-Host ""

# 1.1 Login con usuario admin
$loginResponse = Test-Endpoint `
    -Name "Login (Admin)" `
    -Method "POST" `
    -Url "$baseUrl/auth/login" `
    -Body @{
        email = "admin@moments.com"
        password = "admin123"
    }

if ($loginResponse) {
    $token = $loginResponse.access_token
    Write-Host "🔑 Token obtenido: $($token.Substring(0, 20))..." -ForegroundColor Green
    Write-Host ""
}

# 1.2 Obtener perfil del usuario autenticado
if ($token) {
    Test-Endpoint `
        -Name "Obtener Perfil (GET /auth/profile)" `
        -Method "GET" `
        -Url "$baseUrl/auth/profile" `
        -Token $token
}

# 1.3 Registrar nuevo usuario
Test-Endpoint `
    -Name "Registro de Usuario" `
    -Method "POST" `
    -Url "$baseUrl/auth/register" `
    -Body @{
        email = "test@example.com"
        password = "password123"
        name = "Usuario de Prueba"
        phone = "88887777"
    }

# 1.4 Login con el nuevo usuario
$userLoginResponse = Test-Endpoint `
    -Name "Login (Nuevo Usuario)" `
    -Method "POST" `
    -Url "$baseUrl/auth/login" `
    -Body @{
        email = "test@example.com"
        password = "password123"
    }

if ($userLoginResponse) {
    $userToken = $userLoginResponse.access_token
}

# ========================================
# 2. PRUEBAS DE USUARIOS
# ========================================
Write-Host "👥 2. PRUEBAS DE USUARIOS" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host ""

if ($token) {
    # 2.1 Listar usuarios
    $usersResponse = Test-Endpoint `
        -Name "Listar Usuarios" `
        -Method "GET" `
        -Url "$baseUrl/usuarios?skip=0&take=5" `
        -Token $token
    
    # 2.2 Obtener usuario por ID
    if ($usersResponse -and $usersResponse.data -and $usersResponse.data.Count -gt 0) {
        $userId = $usersResponse.data[0].id
        Test-Endpoint `
            -Name "Obtener Usuario por ID" `
            -Method "GET" `
            -Url "$baseUrl/usuarios/$userId" `
            -Token $token
    }
    
    # 2.3 Actualizar perfil del usuario autenticado
    Test-Endpoint `
        -Name "Actualizar Perfil Propio" `
        -Method "PUT" `
        -Url "$baseUrl/usuarios/perfil" `
        -Body @{
            nombre = "Admin Actualizado"
            telefono = "99998888"
        } `
        -Token $token
}

# ========================================
# 3. PRUEBAS DE PAQUETES
# ========================================
Write-Host "📦 3. PRUEBAS DE PAQUETES" -ForegroundColor Magenta
Write-Host "=========================" -ForegroundColor Magenta
Write-Host ""

if ($token) {
    # 3.1 Crear paquete
    $packageResponse = Test-Endpoint `
        -Name "Crear Paquete" `
        -Method "POST" `
        -Url "$baseUrl/paquetes" `
        -Body @{
            name = "Paquete Romántico Prueba"
            category = "Romántico"
            description = "Un paquete de prueba para parejas"
            price = 150000
            maxPeople = 2
            imageUrl = "https://example.com/image.jpg"
        } `
        -Token $token
    
    # 3.2 Listar paquetes
    $packagesResponse = Test-Endpoint `
        -Name "Listar Paquetes" `
        -Method "GET" `
        -Url "$baseUrl/paquetes?skip=0&take=10" `
        -Token $token
    
    # 3.3 Obtener paquete por ID
    if ($packageResponse) {
        $packageId = $packageResponse.id
        Test-Endpoint `
            -Name "Obtener Paquete por ID" `
            -Method "GET" `
            -Url "$baseUrl/paquetes/$packageId" `
            -Token $token
        
        # 3.4 Actualizar paquete
        Test-Endpoint `
            -Name "Actualizar Paquete" `
            -Method "PUT" `
            -Url "$baseUrl/paquetes/$packageId" `
            -Body @{
                name = "Paquete Romántico Actualizado"
                price = 175000
            } `
            -Token $token
    }
}

# ========================================
# 4. PRUEBAS DE VEHÍCULOS
# ========================================
Write-Host "🚗 4. PRUEBAS DE VEHÍCULOS" -ForegroundColor Magenta
Write-Host "===========================" -ForegroundColor Magenta
Write-Host ""

if ($token) {
    # 4.1 Crear vehículo
    $vehicleResponse = Test-Endpoint `
        -Name "Crear Vehículo" `
        -Method "POST" `
        -Url "$baseUrl/vehiculos" `
        -Body @{
            nombre = "Limousine Prueba"
            categoria = "Premium"
            asientos = 8
            tarifaPorHora = "50000"
            imagenUrl = "https://example.com/limo.jpg"
        } `
        -Token $token
    
    # 4.2 Listar vehículos
    Test-Endpoint `
        -Name "Listar Vehículos" `
        -Method "GET" `
        -Url "$baseUrl/vehiculos" `
        -Token $token
    
    # 4.3 Obtener vehículo por ID y actualizar
    if ($vehicleResponse) {
        $vehicleId = $vehicleResponse.id
        Test-Endpoint `
            -Name "Obtener Vehículo por ID" `
            -Method "GET" `
            -Url "$baseUrl/vehiculos/$vehicleId" `
            -Token $token
        
        Test-Endpoint `
            -Name "Actualizar Vehículo" `
            -Method "PUT" `
            -Url "$baseUrl/vehiculos/$vehicleId" `
            -Body @{
                nombre = "Limousine Actualizada"
                asientos = 10
            } `
            -Token $token
    }
}

# ========================================
# 5. PRUEBAS DE RESERVAS
# ========================================
Write-Host "📅 5. PRUEBAS DE RESERVAS" -ForegroundColor Magenta
Write-Host "==========================" -ForegroundColor Magenta
Write-Host ""

if ($token -and $packageResponse -and $vehicleResponse) {
    # 5.1 Crear reserva
    $reservationResponse = Test-Endpoint `
        -Name "Crear Reserva" `
        -Method "POST" `
        -Url "$baseUrl/reservas" `
        -Body @{
            nombre = "Cliente Prueba"
            email = "cliente@example.com"
            telefono = "88887777"
            tipoEvento = "Boda"
            fechaEvento = "2026-02-14"
            horaInicio = "2026-02-14T18:00:00"
            horaFin = "2026-02-14T23:00:00"
            origen = "San José"
            destino = "Cartago"
            numeroPersonas = 2
            paqueteId = $packageResponse.id
            vehiculoId = $vehicleResponse.id
        } `
        -Token $token
    
    # 5.2 Listar reservas
    Test-Endpoint `
        -Name "Listar Reservas" `
        -Method "GET" `
        -Url "$baseUrl/reservas" `
        -Token $token
}

# ========================================
# 6. PRUEBAS DE CALENDARIO
# ========================================
Write-Host "📆 6. PRUEBAS DE CALENDARIO" -ForegroundColor Magenta
Write-Host "============================" -ForegroundColor Magenta
Write-Host ""

if ($token) {
    # 6.1 Crear evento
    $eventResponse = Test-Endpoint `
        -Name "Crear Evento en Calendario" `
        -Method "POST" `
        -Url "$baseUrl/eventos" `
        -Body @{
            fecha = "2026-03-15"
            titulo = "Evento de Prueba"
            estado = "DISPONIBLE"
            detalle = "Un evento de prueba"
            etiqueta = "Importante"
        } `
        -Token $token
    
    # 6.2 Listar eventos
    Test-Endpoint `
        -Name "Listar Eventos" `
        -Method "GET" `
        -Url "$baseUrl/eventos" `
        -Token $token
    
    # 6.3 Actualizar evento
    if ($eventResponse) {
        Test-Endpoint `
            -Name "Actualizar Evento" `
            -Method "PUT" `
            -Url "$baseUrl/eventos/$($eventResponse.id)" `
            -Body @{
                titulo = "Evento Actualizado"
                estado = "RESERVADO"
            } `
            -Token $token
    }
}

# ========================================
# 7. PRUEBA DE HEALTH CHECK
# ========================================
Write-Host "💚 7. HEALTH CHECK" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta
Write-Host ""

Test-Endpoint `
    -Name "Health Check" `
    -Method "GET" `
    -Url "http://localhost:3000/api/health"

# ========================================
# RESUMEN FINAL
# ========================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "       PRUEBAS COMPLETADAS              " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Todas las pruebas han sido ejecutadas" -ForegroundColor Green
Write-Host "📊 Revisa los resultados arriba para ver el estado de cada endpoint" -ForegroundColor Yellow
Write-Host ""
