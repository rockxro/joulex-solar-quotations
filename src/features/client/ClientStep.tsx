import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
  Building2,
  Hash,
  MapPin,
  User,
  Zap,
} from "lucide-react";

import { useCotizacionStore } from "@/store/quotationStore";
import type { Client } from "@/types/client";
import { type ClientFormValues, customResolver } from "./clientSchema";
import { utilityCompanies, formatRut } from "./clientUtils";
import { InputField } from "@/components/ui/InputField";
import { SelectField } from "@/components/ui/SelectField";

export function ClientStep() {
  const { client, setClient, nextStep } = useCotizacionStore();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    clearErrors,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: customResolver,
    mode: "onChange",
    defaultValues: {
      isCompany: client?.isCompany ?? false,
      name: client?.name ?? "",
      lastName: client?.lastName ?? "",
      run: client?.run ?? "",
      companyName: client?.companyName ?? "",
      rut: client?.rut ?? "",
      address: client?.address ?? "",
      comune: client?.comune ?? "",
      utilityCompany: client?.utilityCompany ?? "CGE",
      clientNumber: client?.clientNumber ?? "",
    },
  });

  const isCompany = watch("isCompany");

  // Clean errors when switching client type to avoid premature error messages
  useEffect(() => {
    clearErrors(["name", "lastName", "run", "companyName", "rut"]);
  }, [isCompany, clearErrors]);

  const handleRutInput = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: "run" | "rut"
  ) => {
    const formatted = formatRut(e.target.value);
    setValue(fieldName, formatted, { shouldValidate: true });
  };

  const onSubmit = (data: ClientFormValues) => {
    const cleanedClient: Client = {
      isCompany: data.isCompany,
      address: data.address,
      comune: data.comune,
      utilityCompany: data.utilityCompany,
      clientNumber: data.clientNumber,
      ...(data.isCompany
        ? { companyName: data.companyName, rut: data.rut }
        : { name: data.name, lastName: data.lastName, run: data.run }),
    };

    setClient(cleanedClient);
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
          id="client-form"
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
        >
          {/* Toggle for Person vs Company */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
              Tipo de Cliente
            </label>
            <div className="grid grid-cols-2 gap-2 p-1.5 bg-muted rounded-2xl border border-border max-w-md">
              <button
                type="button"
                onClick={() => setValue("isCompany", false, { shouldValidate: true })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  !isCompany
                    ? "bg-background text-foreground shadow-sm font-semibold animate-in fade-in-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Persona Natural
              </button>
              <button
                type="button"
                onClick={() => setValue("isCompany", true, { shouldValidate: true })}
                className={`py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                  isCompany
                    ? "bg-background text-foreground shadow-sm font-semibold animate-in fade-in-50"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Empresa
              </button>
            </div>
          </div>

          {/* Dynamic fields based on client type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {!isCompany ? (
              <>
                <InputField
                  label="Nombre"
                  placeholder="Ej: Juan Carlos"
                  icon={User}
                  error={errors.name}
                  {...register("name")}
                />

                <InputField
                  label="Apellidos"
                  placeholder="Ej: Pérez González"
                  icon={User}
                  error={errors.lastName}
                  {...register("lastName")}
                />

                <div className="md:col-span-2 max-w-md">
                  <InputField
                    label="RUN"
                    placeholder="Ej: 12.345.678-9"
                    maxLength={12}
                    icon={Hash}
                    error={errors.run}
                    {...register("run")}
                    onChange={(e) => handleRutInput(e, "run")}
                  />
                </div>
              </>
            ) : (
              <>
                <InputField
                  label="Razón Social"
                  placeholder="Ej: Comercializadora Solar S.A."
                  icon={Building2}
                  error={errors.companyName}
                  {...register("companyName")}
                />

                <InputField
                  label="RUT Empresa"
                  placeholder="Ej: 76.123.456-K"
                  maxLength={12}
                  icon={Hash}
                  error={errors.rut}
                  {...register("rut")}
                  onChange={(e) => handleRutInput(e, "rut")}
                />
              </>
            )}
          </div>

          {/* Location Section */}
          <div className="border-t border-border/50 my-6 pt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Ubicación e Instalación
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InputField
                label="Dirección"
                placeholder="Ej: Av. Nueva Providencia 1881, Of. 502"
                icon={MapPin}
                error={errors.address}
                {...register("address")}
              />

              <InputField
                label="Comuna"
                placeholder="Ej: Providencia"
                icon={MapPin}
                error={errors.comune}
                {...register("comune")}
              />
            </div>
          </div>

          {/* Grid Electrical Info Section */}
          <div className="border-t border-border/50 my-6 pt-6">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Información de Empalme Eléctrico
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SelectField
                label="Compañía Eléctrica"
                icon={Zap}
                options={utilityCompanies}
                error={errors.utilityCompany}
                {...register("utilityCompany")}
              />

              <InputField
                label="Número de Cliente"
                placeholder="Ej: 1234567-8"
                icon={Building2}
                error={errors.clientNumber}
                {...register("clientNumber")}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
