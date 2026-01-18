# Test de Endpoints de Usuarios

Write-Host "=== Pruebas de API - Modulo de Usuarios ===" -ForegroundColor Cyan
Write-Host ""

$baseUrl = "http://localhost:3000"

# Test 1: Health Check
Write-Host "1. Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get
    Write-Host "OK - Health Check exitoso" -ForegroundColor Green
    Write-Host "Respuesta: $($response | ConvertTo-Json -Depth 2)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED - Health Check: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 2: Login Admin
Write-Host "2. Login como Admin..." -ForegroundColor Yellow
try {
    $loginBody = @{
        email = "admin@moments.com"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
    $token = $response.access_token
    Write-Host "OK - Login exitoso" -ForegroundColor Green
    Write-Host "Token: $($token.Substring(0, 30))..." -ForegroundColor Gray
    Write-Host "Usuario: $($response.user.nombre) ($($response.user.email))" -ForegroundColor Gray
} catch {
    Write-Host "FAILED - Login: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Test 3: Obtener Perfil
Write-Host "3. Obtener perfil del usuario autenticado..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/profile" -Method Get -Headers $headers
    Write-Host "OK - Perfil obtenido" -ForegroundColor Green
    Write-Host "Respuesta: $($response | ConvertTo-Json -Depth 3)" -ForegroundColor Gray
} catch {
    Write-Host "FAILED - Obtener perfil: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Listar Usuarios
Write-Host "4. Listar usuarios..." -ForegroundColor Yellow
try {
    $headers = @{
        Authorization = "Bearer $token"
    }
    $response = Invoke-RestMethod -Uri "$baseUrl/usuarios" -Method Get -Headers $headers
    Write-Host "OK - Usuarios listados" -ForegroundColor Green
    Write-Host "Total de usuarios: $($response.total)" -ForegroundColor Gray
    Write-Host "Usuarios en esta pagina: $($response.data.Count)" -ForegroundColor Gray
    foreach ($user in $response.data) {
        Write-Host "  - $($user.nombre) ($($user.email))" -ForegroundColor Gray
    }
} catch {
    Write-Host "FAILED - Listar usuarios: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 5: Registro de nuevo usuario
Write-Host "5. Registrar nuevo usuario..." -ForegroundColor Yellow
$newEmail = "test_$(Get-Date -Format 'HHmmss')@example.com"
try {
    $registerBody = @{
        email = $newEmail
        password = "password123"
        name = "Usuario de Prueba"
        phone = "88889999"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/register" -Method Post -Body $registerBody -ContentType "application/json"
    $newUserId = $response.user.id
    $newUserToken = $response.access_token
    Write-Host "OK - Usuario registrado exitosamente" -ForegroundColor Green
    Write-Host "ID: $newUserId" -ForegroundColor Gray
    Write-Host "Email: $newEmail" -ForegroundColor Gray
} catch {
    Write-Host "FAILED - Registro: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 6: Obtener usuario por ID
if ($newUserId) {
    Write-Host "6. Obtener usuario por ID..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $token"
        }
        $response = Invoke-RestMethod -Uri "$baseUrl/usuarios/$newUserId" -Method Get -Headers $headers
        Write-Host "OK - Usuario obtenido por ID" -ForegroundColor Green
        Write-Host "Nombre: $($response.nombre)" -ForegroundColor Gray
        Write-Host "Email: $($response.email)" -ForegroundColor Gray
        Write-Host "Estado: $($response.estado)" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED - Obtener usuario por ID: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""

    # Test 7: Actualizar perfil
    Write-Host "7. Actualizar perfil del nuevo usuario..." -ForegroundColor Yellow
    try {
        $headers = @{
            Authorization = "Bearer $newUserToken"
        }
        $updateBody = @{
            nombre = "Usuario Actualizado"
            telefono = "88881111"
        } | ConvertTo-Json

        $response = Invoke-RestMethod -Uri "$baseUrl/usuarios/perfil" -Method Put -Headers $headers -Body $updateBody -ContentType "application/json"
        Write-Host "OK - Perfil actualizado" -ForegroundColor Green
        Write-Host "Nuevo nombre: $($response.nombre)" -ForegroundColor Gray
        Write-Host "Nuevo telefono: $($response.telefono)" -ForegroundColor Gray
    } catch {
        Write-Host "FAILED - Actualizar perfil: $($_.Exception.Message)" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "=== Pruebas completadas ===" -ForegroundColor Cyan
