import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  FileText,
  Hash,
  MapPin,
  User,
  Zap,
} from "lucide-react";

import { useCotizacionStore } from "@/store/cotizacionStore";
import type { Cliente } from "@/types/cliente";
import { type ClienteFormValues, customResolver } from "./clienteSchema";
import { companiasElectricas, formatRut } from "./clienteUtils";

export function ClienteStep() {
  const { cliente, setCliente, nextStep } = useCotizacionStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
  } = useForm<ClienteFormValues>({
    resolver: customResolver,
    defaultValues: {
      esEmpresa: cliente?.esEmpresa ?? false,
      nombre: cliente?.nombre ?? "",
      apellidos: cliente?.apellidos ?? "",
      run: cliente?.run ?? "",
      razonSocial: cliente?.razonSocial ?? "",
      rut: cliente?.rut ?? "",
      direccion: cliente?.direccion ?? "",
      comuna: cliente?.comuna ?? "",
      companiaElectrica: cliente?.companiaElectrica ?? "CGE",
      numCliente: cliente?.numCliente ?? "",
    },
  });

  const esEmpresa = watch("esEmpresa");

  // Re-validar campos dependientes al cambiar el tipo de cliente
  useEffect(() => {
    trigger(["nombre", "apellidos", "run", "razonSocial", "rut"]);
  }, [esEmpresa, trigger]);

  const handleRutInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "run" | "rut"
  ) => {
    const formatted = formatRut(e.target.value);
    setValue(fieldName, formatted, { shouldValidate: true });
  };

  const onSubmit = (data: ClienteFormValues) => {
    const cleanedCliente: Cliente = {
      esEmpresa: data.esEmpresa,
      direccion: data.direccion,
      comuna: data.comuna,
      companiaElectrica: data.companiaElectrica,
      numCliente: data.numCliente,
      ...(data.esEmpresa
        ? { razonSocial: data.razonSocial, rut: data.rut }
        : { nombre: data.nombre, apellidos: data.apellidos, run: data.run }),
    };

    setCliente(cleanedCliente);
    nextStep();
  };

  return (
    <div className="mx-auto max-w-4xl animate-in fade-in-50 duration-300">
      <div className="rounded-3xl border border-border/70 bg-card p-8 shadow-xl backdrop-blur-md">
        <div className="mb-8 border-b border-border/50 pb-6">
          <h3 className="text-xl font-semibold text-foreground">
            Información de la Propuesta
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Ingrese los datos de identificación del cliente y la ubicación del proyecto solar.
          </p>
        </div>

        <form
          id="cliente-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Segmented Control / Toggle para Persona vs Empresa */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
              Tipo de Cliente
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-2xl border border-border max-w-md">
              <button
                type="button"
                onClick={() => setValue("esEmpresa", false, { shouldValidate: true })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  !esEmpresa
                    ? "bg-background text-foreground shadow-sm font-semibold animate-in fade-in-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Persona Natural
              </button>
              <button
                type="button"
                onClick={() => setValue("esEmpresa", true, { shouldValidate: true })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  esEmpresa
                    ? "bg-background text-foreground shadow-sm font-semibold animate-in fade-in-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Empresa
              </button>
            </div>
          </div>

          {/* Campos Dinámicos según el tipo de cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {!esEmpresa ? (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Nombre
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ej: Juan Carlos"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.nombre
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                      {...register("nombre")}
                    />
                  </div>
                  {errors.nombre && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.nombre.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Apellidos
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ej: Pérez González"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.apellidos
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                      {...register("apellidos")}
                    />
                  </div>
                  {errors.apellidos && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.apellidos.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-sm font-medium text-foreground block">
                    RUN
                  </label>
                  <div className="relative max-w-md">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ej: 12.345.678-9"
                      maxLength={12}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.run
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                      {...register("run")}
                      onChange={(e) => handleRutInput(e, "run")}
                    />
                  </div>
                  {errors.run && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.run.message}
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    Razón Social
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ej: Comercializadora Solar S.A."
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.razonSocial
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                      {...register("razonSocial")}
                    />
                  </div>
                  {errors.razonSocial && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.razonSocial.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground block">
                    RUT Empresa
                  </label>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Ej: 76.123.456-K"
                      maxLength={12}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                        errors.rut
                          ? "border-destructive focus:border-destructive"
                          : "border-border focus:border-primary"
                      }`}
                      {...register("rut")}
                      onChange={(e) => handleRutInput(e, "rut")}
                    />
                  </div>
                  {errors.rut && (
                    <p className="text-xs text-destructive mt-1 font-medium">
                      {errors.rut.message}
                    </p>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-border/50 my-6 pt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Ubicación e Instalación
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Dirección
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ej: Av. Nueva Providencia 1881, Of. 502"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.direccion
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    }`}
                    {...register("direccion")}
                  />
                </div>
                {errors.direccion && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.direccion.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Comuna
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ej: Providencia"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.comuna
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    }`}
                    {...register("comuna")}
                  />
                </div>
                {errors.comuna && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.comuna.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 my-6 pt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Información de Empalme Eléctrico
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Compañía Eléctrica
                </label>
                <div className="relative">
                  <Zap className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <select
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition appearance-none outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.companiaElectrica
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    }`}
                    {...register("companiaElectrica")}
                  >
                    {companiasElectricas.map((cia) => (
                      <option key={cia} value={cia}>
                        {cia}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
                    <svg className="fill-current h-4 w-4" viewBox="0 0 20 20">
                      <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                    </svg>
                  </div>
                </div>
                {errors.companiaElectrica && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.companiaElectrica.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground block">
                  Número de Cliente
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Ej: 1234567-8"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl border bg-background text-sm transition outline-none focus:ring-2 focus:ring-primary/20 ${
                      errors.numCliente
                        ? "border-destructive focus:border-destructive"
                        : "border-border focus:border-primary"
                    }`}
                    {...register("numCliente")}
                  />
                </div>
                {errors.numCliente && (
                  <p className="text-xs text-destructive mt-1 font-medium">
                    {errors.numCliente.message}
                  </p>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
