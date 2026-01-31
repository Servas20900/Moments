import { Layout, PageHeader, Section } from '../components/Layout'

const Terms = () => {
  return (
    <Layout>
      <PageHeader
        eyebrow="Legal"
        title="Términos y Condiciones"
        description="Condiciones de uso del servicio Moments"
      />

      <Section spacing="lg">
        <div className="max-w-4xl mx-auto space-y-8 text-gray-200">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1) Alcance del servicio</h2>
            <p>
              Moments ofrece experiencias premium que pueden incluir, según el paquete contratado:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Transporte privado puerta a puerta (pick-up y drop-off).</li>
              <li>Bebidas y snacks durante el traslado (según el paquete).</li>
              <li>Servicios adicionales (fotografía, entradas, meet & greet, merch, accesos especiales), únicamente cuando estén expresamente incluidos en la reserva.</li>
            </ul>
            <p>
              La descripción final del servicio es la que aparece en la confirmación oficial de reserva.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2) Reservas, cupos y confirmación</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Los cupos son limitados por fecha.</li>
              <li>Una reserva se considera confirmada únicamente cuando:
                <ol className="list-decimal list-inside ml-6 mt-2 space-y-1">
                  <li>se recibe el adelanto no reembolsable del 50%; y</li>
                  <li>el cliente recibe la confirmación oficial por WhatsApp y/o correo con el resumen del servicio.</li>
                </ol>
              </li>
            </ul>
            <p>
              Moments se reserva el derecho de rechazar reservas si no se cumplen condiciones operativas, de seguridad o de pago.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3) Pago, adelanto y saldo</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Para bloquear una fecha se requiere un adelanto no reembolsable del 50%.</li>
              <li>El saldo restante debe pagarse 48 horas antes del servicio (o el plazo indicado en la confirmación).</li>
              <li>Si el saldo no se paga a tiempo, Moments podrá cancelar la reserva y liberar el cupo, sin obligación de reembolso del adelanto.</li>
            </ul>
            <p className="mt-4">
              <strong>Métodos de pago:</strong> se indicarán en la página o en la confirmación.
            </p>
            <p>
              <strong>Comisiones:</strong> si el método de pago aplica comisiones, podrán trasladarse al cliente cuando corresponda (informado antes de pagar).
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4) Cambios, reprogramaciones y cancelaciones</h2>
            
            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-amber-300">4.1 Reprogramación por parte del cliente</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Puede solicitarse con al menos 7 días de anticipación, sujeto a disponibilidad.</li>
                  <li>El adelanto podrá aplicarse a una nueva fecha una sola vez, siempre que la logística y proveedores lo permitan.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-300">4.2 Cancelación por parte del cliente</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>El adelanto es no reembolsable, ya que cubre la reserva de vehículo, personal, coordinación y costos de preparación.</li>
                  <li>Si el cliente cancela con menos de 48 horas, Moments podrá cobrar cargos adicionales equivalentes a costos ya incurridos con terceros (por ejemplo: fotógrafo, merch, entradas, accesos, etc.) cuando aplique.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-300">4.3 Cancelación por parte de Moments</h3>
                <p className="mt-2">
                  Moments podrá cancelar por fuerza mayor o por situaciones que comprometan seguridad u operación. En ese caso, Moments ofrecerá reprogramación o devolución de montos pagados excluyendo costos ya incurridos con terceros (si aplica).
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5) Puntualidad, ventana de llegada y tiempo de espera</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>El servicio opera con una ventana de llegada estimada por tránsito y logística.</li>
              <li>El cliente debe estar listo en el punto de recogida a la hora confirmada.</li>
              <li>El tiempo máximo de espera incluido es de 15 minutos desde la llegada del vehículo.</li>
              <li>Si el grupo excede ese tiempo, Moments podrá cobrar tiempo extra o ajustar la logística si afecta otros servicios del día.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">6) Tiempo extra, paradas y cambios de ruta</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cualquier extensión del servicio se cobra como tiempo extra de $40 por hora o fracción (según lo confirme Moments al momento).</li>
              <li>Paradas no planificadas, cambios de ruta o puntos adicionales pueden generar cargos extra.</li>
              <li>El cliente acepta que el conductor y/o coordinador de Moments pueden ajustar la ruta por seguridad, tránsito o restricciones del venue/evento.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">7) Capacidad, seguridad y conducta</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Cada vehículo tiene una capacidad máxima. No se permiten pasajeros adicionales.</li>
              <li>Está prohibido:
                <ul className="list-disc list-inside ml-6 mt-2 space-y-1">
                  <li>fumar dentro del vehículo (incluye vapeo), salvo autorización expresa,</li>
                  <li>portar sustancias ilegales,</li>
                  <li>conductas agresivas o que pongan en riesgo al conductor, al vehículo o a terceros.</li>
                </ul>
              </li>
            </ul>

            <div className="mt-4 p-4 rounded-lg border border-amber-300/30 bg-amber-300/10">
              <h3 className="text-lg font-semibold text-amber-300 mb-2">Daños, limpieza y reparación</h3>
              <p className="mb-2">
                En caso de daños o suciedad fuera de lo normal (por ejemplo: derrames, vómito, manchas, daños de interior, quemaduras, golpes, etc.), el cliente deberá cubrir el costo de limpieza y/o reparación del vehículo.
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Moments podrá solicitar el pago el mismo día para poder liberar el vehículo.</li>
                <li>Los costos se calcularán con base en el cargo real del proveedor (limpieza/reparación) y podrán incluir el tiempo de inmovilización del vehículo cuando aplique.</li>
              </ul>
            </div>

            <p className="mt-4">
              Moments se reserva el derecho de terminar el servicio sin reembolso si la conducta del grupo compromete la seguridad.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">8) Cobertura (GAM) y servicios fuera de GAM</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Los paquetes estándar aplican dentro de la GAM.</li>
              <li>Servicios a playa u otras zonas lejanas se manejan como paquetes distintos con tarifas y condiciones específicas.</li>
              <li>Cualquier recargo por distancia, peajes o tiempo será indicado antes de confirmar.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">9) Servicios con terceros (fotografía, entradas, meet & greet, merch)</h2>
            
            <div className="ml-4 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-amber-300">Fotografía</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Entrega: mismo día cuando sea posible y, en todo caso, máximo 24 horas, salvo casos excepcionales comunicados.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-300">Entradas / accesos / meet & greet</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Sujetos a disponibilidad y reglas del organizador.</li>
                  <li>Una vez emitidos/confirmados, pueden no ser reembolsables.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-amber-300">Merch / colaboraciones</h3>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Ediciones limitadas y/o personalizadas pueden no admitir cambios o devoluciones (tallas se coordinan previamente).</li>
                </ul>
              </div>
            </div>

            <p className="mt-4">
              Si un tercero incumple, Moments gestionará una solución razonable (reposición, reprogramación o compensación parcial del componente afectado) según corresponda.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">10) Bebidas y snacks</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Lo incluido depende del paquete confirmado.</li>
              <li>Moments puede ajustar por seguridad y logística.</li>
              <li>Si se incluyen bebidas alcohólicas (cuando aplique), el cliente se compromete a consumo responsable. Moments puede limitar o retirar bebidas si considera riesgo.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">11) Condiciones externas</h2>
            <p>
              Clima, cierres viales, presas o cambios del evento pueden afectar tiempos. Moments no se hace responsable por retrasos derivados de condiciones externas fuera de control razonable.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">12) Comunicaciones oficiales</h2>
            <p>
              La coordinación se realiza por el canal indicado en la confirmación. El cliente debe mantener su teléfono disponible el día del servicio.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">13) Privacidad y uso de contenido</h2>
            <p>
              Los datos del cliente se usan únicamente para coordinar el servicio. Para utilizar fotos o videos con fines promocionales, Moments solicitará autorización cuando corresponda.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">14) Modificaciones</h2>
            <p>
              Moments podrá actualizar estas políticas. La versión vigente será la publicada en el sitio web. Para reservas confirmadas, aplican las condiciones aceptadas al momento del pago.
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
            <p>Última actualización: Enero 2026</p>
          </div>

        </div>
      </Section>
    </Layout>
  )
}

export default Terms
