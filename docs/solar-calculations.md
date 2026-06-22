# Lógica de Cálculo de Dimensionamiento Solar

Este documento especifica las reglas de negocio y fórmulas matemáticas para el motor de dimensionamiento energético de JouleX Solar Quotations. La implementación en código se compone de funciones puras en TypeScript bajo `src/features/dimensionamiento/`.

---

## 1. Definición de Conceptos Clave

Para alinearse con la perspectiva del cliente final, evitamos términos técnicos regulatorios como "autoconsumo" y utilizamos conceptos intuitivos:

*   **Consumo Solar:** Energía fotovoltaica generada que se consume directamente en la instalación durante las horas de sol.
*   **Ahorro por Consumo Solar:** El beneficio económico directo de usar la energía solar en lugar de comprarla a la red a la tarifa de compra.
*   **Crédito por Inyección:** Valorización económica de los excedentes fotovoltaicos inyectados a la red (Net Billing).
*   **Ahorro Total:** Suma del ahorro por consumo solar (directo y desde batería) y el crédito por inyección.
*   **Cobertura Energética (Autosuficiencia Real):** Qué proporción del consumo total del cliente es abastecido efectivamente por energía solar (directa o a través de la descarga de baterías).
*   **Cobertura Económica Real:** Qué proporción de la cuenta de de electricidad original (sin sistema solar) es cubierta económicamente por los ahorros y créditos generados.
*   **Recorte Solar (Curtailment):** En sistemas aislados, la energía fotovoltaica excedente que no se puede consumir ni almacenar en las baterías y se pierde por falta de carga.
*   **Déficit de Energía:** En sistemas aislados, la energía restante que no puede cubrirse con sol ni baterías, y requiere un generador de respaldo (diésel) o representa un corte de servicio.

---

## 2. Variables Generales del Sistema

### Parámetros de Entrada del Proyecto
*   `potencia_conectada_kw`: Potencia contratada de la instalación (no aplica directamente en Off-Grid, es informativa).
*   `tarifa`: Tipo de tarifa (ej. BT1, BT3, THR, o Aislada/Off-Grid).
*   `potencia_panel_w`: Potencia nominal de cada panel en Watts.
*   `numero_paneles`: Cantidad de paneles fotovoltaicos.
*   `precio_compra_kwh`: Precio de referencia de la energía ($/kWh) (se usa como el costo de generación de respaldo diésel o de compra de red equivalente para valorizar el ahorro).
*   `precio_inyeccion_kwh`: Precio de inyección ($/kWh) (Net Billing, aplica solo a On-Grid e Híbridos).
*   `dias_laborales_semana`: Cantidad de días laborales por semana (lunes a viernes, típicamente 5).
*   `dias_no_laborales_semana`: Cantidad de días de descanso por semana (sábado y domingo, típicamente 2).
*   `porcentaje_consumo_diurno_laboral`: Porcentaje del consumo diario que ocurre durante las horas de sol en días hábiles.
*   `porcentaje_consumo_diurno_no_laboral`: Porcentaje del consumo diario que ocurre durante las horas de sol en días de descanso.

### Variables Calculadas Generales
*   **Capacidad Instalada ($kWp$):**
    $$\text{capacidad\_instalada\_kwp} = \frac{\text{numero\_paneles} \times \text{potencia\_panel\_w}}{1000}$$
*   **Factor de Consumo Diurno ($F_{cd}$):**
    $$F_{cd} = \left(\frac{\text{dias\_laborales\_semana}}{7} \times \text{porcentaje\_consumo\_diurno\_laboral}\right) + \left(\frac{\text{dias\_no\_laborales\_semana}}{7} \times \text{porcentaje\_consumo\_diurno\_no\_laboral}\right)$$

---

## 3. Lógica del Sistema On-Grid Puro (Sin Batería)

El cálculo se realiza **mes a mes** usando valores mensuales agregados.

### 3.1 Variables Mensuales de Entrada
*   `consumo_mes_kwh`: Consumo eléctrico total en el mes ($kWh$).
*   `generacion_panel_mes_kwh`: Generación estimada mensual por panel ($kWh/\text{panel}$).
*   `demanda_max_kw`: Demanda máxima del mes (informativa).
*   `demanda_hp_kw`: Demanda máxima en horas punta (informativa).
*   `porcentaje_reactiva`: Energía reactiva medida (informativa).

### 3.2 Fórmulas de Simulación On-Grid
1.  **Generación de la Planta ($kWh$):**
    $$\text{generacion\_planta\_mes\_kwh} = \text{numero\_paneles} \times \text{generacion\_panel\_mes\_kwh}$$
2.  **Consumo Diurno Estimado ($kWh$):**
    $$\text{consumo\_diurno\_mes\_kwh} = \text{consumo\_mes\_kwh} \times F_{cd}$$
3.  **Consumo Solar Mensual ($kWh$):**
    $$\text{consumo\_solar\_mes\_kwh} = \min(\text{consumo\_diurno\_mes\_kwh}, \text{generacion\_planta\_mes\_kwh})$$
4.  **Inyección a Red ($kWh$):**
    $$\text{inyeccion\_mes\_kwh} = \text{generacion\_planta\_mes\_kwh} - \text{consumo\_solar\_mes\_kwh}$$
5.  **Energía Comprada desde Red ($kWh$):**
    $$\text{consumo\_red\_mes\_kwh} = \text{consumo\_mes\_kwh} - \text{consumo\_solar\_mes\_kwh}$$
6.  **Ahorro por Consumo Solar ($$):**
    $$\text{ahorro\_consumo\_solar\_mes} = \text{consumo\_solar\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
7.  **Crédito por Inyección ($$):**
    $$\text{credito\_inyeccion\_mes} = \text{inyeccion\_mes\_kwh} \times \text{precio\_inyeccion\_kwh}$$
8.  **Ahorro Total de Energía ($$):**
    $$\text{ahorro\_total\_energia\_mes} = \text{ahorro\_consumo\_solar\_mes} + \text{credito\_inyeccion\_mes}$$
9.  **Costo de Energía desde Red ($$):**
    $$\text{costo\_energia\_red\_mes} = \text{consumo\_red\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
10. **Saldo Mensual ($$):**
    $$\text{saldo\_mes} = \text{credito\_inyeccion\_mes} - \text{costo\_energia\_red\_mes}$$
11. **Saldo Acumulado ($$):**
    Suma progresiva mes a mes del `saldo_mes`.

### 3.3 Indicadores de Cobertura On-Grid
*   **Cobertura Energética (Autosuficiencia) ($kWh / kWh$):**
    $$\text{cobertura\_energetica\_mes} = \frac{\text{consumo\_solar\_mes\_kwh}}{\text{consumo\_mes\_kwh}}$$
*   **Cobertura Económica Real ($/ $):**
    $$\text{cobertura\_economica\_mes} = \frac{\text{ahorro\_total\_energia\_mes}}{\text{consumo\_mes\_kwh} \times \text{precio\_compra\_kwh}}$$

---

## 4. Lógica del Sistema Híbrido Residencial (Con Batería)

El cálculo simula un **día promedio representativo** para cada mes y luego escala los resultados a totales mensuales multiplicando por los días del mes correspondiente (`dias_mes`).

### 4.1 Parámetros Adicionales de Baterías
*   `capacidad_modulo_bateria_kwh`: Capacidad nominal de un módulo de batería ($kWh$).
*   `dod_bateria`: Profundidad de descarga utilizable (típicamente $0.80$ u $80\%$).
*   `numero_modulos_bateria`: Cantidad de módulos instalados.
*   **Capacidad Útil Total ($kWh$):**
    $$\text{capacidad\_util\_bateria\_kwh} = \text{capacidad\_modulo\_bateria\_kwh} \times \text{dod\_bateria} \times \text{numero\_modulos\_bateria}$$

### 4.2 Fórmulas de Simulación Diaria (Por Mes)
1.  **Días del Mes:** $d_{\text{mes}}$ (Ene: 31, Feb: 28, Mar: 31, etc.)
2.  **Consumo Diario Promedio ($kWh$):**
    $$c_{\text{diario}} = \frac{\text{consumo\_mes\_kwh}}{d_{\text{mes}}}$$
3.  **Generación Diaria Planta ($kWh$):**
    $$g_{\text{diaria}} = \frac{\text{numero\_paneles} \times \text{generacion\_panel\_mes\_kwh}}{d_{\text{mes}}}$$
4.  **Consumo Diurno Diario ($kWh$):**
    $$c_{\text{diurno\_diario}} = c_{\text{diario}} \times F_{cd}$$
5.  **Consumo Solar Directo Diario ($kWh$):**
    $$c_{\text{solar\_directo\_diario}} = \min(c_{\text{diurno\_diario}}, g_{\text{diaria}})$$
6.  **Excedente Solar Diario ($kWh$):**
    $$e_{\text{diario}} = g_{\text{diaria}} - c_{\text{solar\_directo\_diario}}$$
7.  **Carga Diaria de Batería ($kWh$):**
    $$ca_{\text{bateria}} = \min(e_{\text{diario}}, \text{capacidad\_util\_bateria\_kwh})$$
8.  **Inyección Diaria ($kWh$):**
    $$i_{\text{diaria}} = e_{\text{diario}} - ca_{\text{bateria}}$$
9.  **Consumo Nocturno Diario ($kWh$):**
    $$c_{\text{nocturno\_diario}} = c_{\text{diario}} - c_{\text{solar\_directo\_diario}}$$
10. **Descarga Diaria de Batería ($kWh$):**
    $$de_{\text{bateria}} = \min(c_{\text{nocturno\_diario}}, ca_{\text{bateria}})$$
11. **Consumo Diario desde Red ($kWh$):**
    $$c_{\text{red\_diario}} = c_{\text{nocturno\_diario}} - de_{\text{bateria}}$$

### 4.3 Conversión a Totales Mensuales Híbridos
Multiplicar cada valor diario por la cantidad de días del mes ($d_{\text{mes}}$):
*   `inyeccion_mes_kwh` = $i_{\text{diaria}} \times d_{\text{mes}}$
*   `consumo_red_mes_kwh` = $c_{\text{red\_diario}} \times d_{\text{mes}}$
*   `consumo_solar_directo_mes_kwh` = $c_{\text{solar\_directo\_diario}} \times d_{\text{mes}}$
*   `descarga_bateria_mes_kwh` = $de_{\text{bateria}} \times d_{\text{mes}}$

### 4.4 Valorización y Ahorros Híbridos
*   **Ahorro Solar Directo ($$):**
    $$\text{ahorro\_solar\_mes} = \text{consumo\_solar\_directo\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Ahorro por Batería ($$):**
    $$\text{ahorro\_bateria\_mes} = \text{descarga\_bateria\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Crédito por Inyección ($$):**
    $$\text{credito\_inyeccion\_mes} = \text{inyeccion\_mes\_kwh} \times \text{precio\_inyeccion\_kwh}$$
*   **Ahorro Total Híbrido ($$):**
    $$\text{ahorro\_total\_mes} = \text{ahorro\_solar\_mes} + \text{ahorro\_bateria\_mes} + \text{credito\_inyeccion\_mes}$$
*   **Costo de Red ($$):**
    $$\text{costo\_red\_mes} = \text{consumo\_red\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Saldo Mensual ($$):**
    $$\text{saldo\_mes} = \text{credito\_inyeccion\_mes} - \text{costo\_red\_mes}$$
*   **Saldo Acumulado ($$):** Suma progresiva de `saldo_mes`.

### 4.5 Indicadores de Cobertura Híbrida
*   **Cobertura Energética (Autosuficiencia) ($kWh / kWh$):**
    $$\text{cobertura\_energetica\_mes} = \frac{\text{consumo\_solar\_directo\_mes\_kwh} + \text{descarga\_bateria\_mes\_kwh}}{\text{consumo\_mes\_kwh}}$$
*   **Cobertura Económica Real ($/ $):**
    $$\text{cobertura\_economica\_mes} = \frac{\text{ahorro\_total\_mes}}{\text{consumo\_mes\_kwh} \times \text{precio\_compra\_kwh}}$$

---

## 5. Lógica del Sistema Off-Grid Puro (Aislado con Batería)

En sistemas Off-Grid, la instalación no está conectada a la red eléctrica. No existe la inyección de excedentes residuales (`inyección = 0`) ni la compra directa a la distribuidora. La energía no cubierta representa un déficit que debe abastecerse por generador de respaldo diésel o asumirse como corte.

El cálculo simula un **día promedio representativo** para cada mes y luego escala los resultados a totales mensuales multiplicando por los días del mes correspondiente (`dias_mes`).

### 5.1 Fórmulas de Simulación Diaria (Off-Grid)
1.  **Días del Mes:** $d_{\text{mes}}$
2.  **Consumo Diario Promedio ($kWh$):**
    $$c_{\text{diario}} = \frac{\text{consumo\_mes\_kwh}}{d_{\text{mes}}}$$
3.  **Generación Diaria Planta ($kWh$):**
    $$g_{\text{diaria}} = \frac{\text{numero\_paneles} \times \text{generacion\_panel\_mes\_kwh}}{d_{\text{mes}}}$$
4.  **Consumo Diurno Diario ($kWh$):**
    $$c_{\text{diurno\_diario}} = c_{\text{diario}} \times F_{cd}$$
5.  **Consumo Solar Directo Diario ($kWh$):**
    $$c_{\text{solar\_directo\_diario}} = \min(c_{\text{diurno\_diario}}, g_{\text{diaria}})$$
6.  **Excedente Solar Diario ($kWh$):**
    $$e_{\text{diario}} = g_{\text{diaria}} - c_{\text{solar\_directo\_diario}}$$
7.  **Carga Diaria de Batería ($kWh$):**
    $$ca_{\text{bateria}} = \min(e_{\text{diario}}, \text{capacidad\_util\_bateria\_kwh})$$
8.  **Inyección Diaria ($kWh$):**
    $$i_{\text{diaria}} = 0 \quad (\text{Siempre cero en Off-Grid})$$
9.  **Recorte Solar Diario (Curtailment) ($kWh$):**
    $$\text{recorte\_diario} = e_{\text{diario}} - ca_{\text{bateria}}$$
10. **Consumo Nocturno Diario ($kWh$):**
    $$c_{\text{nocturno\_diario}} = c_{\text{diario}} - c_{\text{solar\_directo\_diario}}$$
11. **Descarga Diaria de Batería ($kWh$):**
    $$de_{\text{bateria}} = \min(c_{\text{nocturno\_diario}}, ca_{\text{bateria}})$$
12. **Déficit de Energía Diario (Sin Cobertura) ($kWh$):**
    $$\text{deficit\_diario} = c_{\text{nocturno\_diario}} - de_{\text{bateria}}$$

### 5.2 Conversión a Totales Mensuales Off-Grid
Multiplicar cada valor diario por la cantidad de días del mes ($d_{\text{mes}}$):
*   `inyeccion_mes_kwh` = $0$
*   `consumo_red_mes_kwh` = $0$
*   `consumo_solar_directo_mes_kwh` = $c_{\text{solar\_directo\_diario}} \times d_{\text{mes}}$
*   `descarga_bateria_mes_kwh` = $de_{\text{bateria}} \times d_{\text{mes}}$
*   `recorte_mes_kwh` = $\text{recorte\_diario} \times d_{\text{mes}}$
*   `deficit_mes_kwh` = $\text{deficit\_diario} \times d_{\text{mes}}$

### 5.3 Valorización y Ahorros Off-Grid
El ahorro representa el costo evitado al no generar energía de respaldo (diésel) o simular el equivalente tarifario de la red eléctrica.
*   **Ahorro Solar Directo ($$):**
    $$\text{ahorro\_solar\_mes} = \text{consumo\_solar\_directo\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Ahorro por Batería ($$):**
    $$\text{ahorro\_bateria\_mes} = \text{descarga\_bateria\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Ahorro Total Off-Grid ($$):**
    $$\text{ahorro\_total\_mes} = \text{ahorro\_solar\_mes} + \text{ahorro\_bateria\_mes}$$
*   **Costo de Energía de Respaldo (Déficit) ($$):**
    $$\text{costo\_respaldo\_mes} = \text{deficit\_mes\_kwh} \times \text{precio\_compra\_kwh}$$
*   **Saldo Mensual ($$):**
    $$\text{saldo\_mes} = - \text{costo\_respaldo\_mes}$$
    *(Representa el gasto operativo en combustible de respaldo para cubrir la energía faltante).*
*   **Saldo Acumulado ($$):** Suma progresiva de `saldo_mes`.

### 5.4 Indicadores de Cobertura Off-Grid
*   **Cobertura Energética (Autosuficiencia) ($kWh / kWh$):**
    $$\text{cobertura\_energetica\_mes} = \frac{\text{consumo\_solar\_directo\_mes\_kwh} + \text{descarga\_bateria\_mes\_kwh}}{\text{consumo\_mes\_kwh}}$$
*   **Cobertura Económica Real ($/ $):**
    $$\text{cobertura\_economica\_mes} = \frac{\text{ahorro\_total\_mes}}{\text{consumo\_mes\_kwh} \times \text{precio\_compra\_kwh}}$$
    *(En Off-Grid, este indicador es numéricamente igual a la Cobertura Energética, ya que no existe crédito por inyección).*

---

## 6. Asistente y Calculadora de Autonomía de Baterías

Utilizado en la sección híbrida y off-grid para dimensionar y estimar la cantidad de módulos referenciales.

### 6.1 Consumo Diario Promedio Anual ($kWh$)
Corresponde al promedio de los consumos diarios calculados en cada mes:
$$\text{consumo\_diario\_promedio\_kwh} = \text{promedio}(c_{\text{diario\_enero}}, c_{\text{diario\_febrero}}, \dots)$$

### 6.2 Autonomía Real (Horas)
Estima cuántas horas puede cubrir el banco útil de baterías basándose en el consumo diario promedio:
$$\text{consumo\_horario\_promedio} = \frac{\text{consumo\_diario\_promedio\_kwh}}{24}$$
$$\text{autonomia\_real\_horas} = \frac{\text{capacidad\_util\_bateria\_kwh}}{\text{consumo\_horario\_promedio}}$$

### 6.3 Módulos de Batería Sugeridos (Referencial)
Calcula cuántos módulos se requieren para cumplir con las horas de autonomía deseadas por el usuario (`horas_autonomia_deseadas`):
$$\text{energia\_requerida} = \text{consumo\_horario\_promedio} \times \text{horas\_autonomia\_deseadas}$$
$$\text{modulos\_necesarios} = \left\lceil \frac{\text{energia\_requerida}}{\text{capacidad\_modulo\_bateria\_kwh} \times \text{dod\_bateria}} \right\rceil$$
*(El resultado se redondea hacia arriba al entero siguiente mediante la función techo).*
