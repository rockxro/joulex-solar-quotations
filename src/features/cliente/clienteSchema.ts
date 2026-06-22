import type { Resolver } from "react-hook-form";
import { z } from "zod";

// Formulario local con todos los campos posibles
export type ClienteFormValues = {
  esEmpresa: boolean;
  nombre: string;
  apellidos: string;
  run: string;
  razonSocial: string;
  rut: string;
  direccion: string;
  comuna: string;
  companiaElectrica: string;
  numCliente: string;
};

// Esquema de validación con Zod
export const clienteSchema = z.object({
  esEmpresa: z.boolean(),
  direccion: z.string().min(1, "La dirección es requerida"),
  comuna: z.string().min(1, "La comuna es requerida"),
  companiaElectrica: z.string().min(1, "La compañía eléctrica es requerida"),
  numCliente: z.string().min(1, "El número de cliente es requerido"),
  nombre: z.string().optional(),
  apellidos: z.string().optional(),
  run: z.string().optional(),
  razonSocial: z.string().optional(),
  rut: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.esEmpresa) {
    if (!data.razonSocial || data.razonSocial.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La razón social es requerida para empresas",
        path: ["razonSocial"],
      });
    }
    if (!data.rut || data.rut.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUT de la empresa es requerido",
        path: ["rut"],
      });
    } else {
      // Validación básica de formato RUT (ej: 76.123.456-K o 76123456-K)
      const rutRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
      if (!rutRegex.test(data.rut.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Formato de RUT inválido (ej: 76.123.456-K)",
          path: ["rut"],
        });
      }
    }
  } else {
    if (!data.nombre || data.nombre.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre es requerido",
        path: ["nombre"],
      });
    }
    if (!data.apellidos || data.apellidos.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los apellidos son requeridos",
        path: ["apellidos"],
      });
    }
    if (!data.run || data.run.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUN es requerido",
        path: ["run"],
      });
    } else {
      // Validación básica de formato RUN
      const runRegex = /^\d{1,2}\.?\d{3}\.?\d{3}-[\dkK]$/;
      if (!runRegex.test(data.run.trim())) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Formato de RUN inválido (ej: 18.123.456-7)",
          path: ["run"],
        });
      }
    }
  }
});

// Custom Resolver para React Hook Form usando Zod
export const customResolver: Resolver<ClienteFormValues> = async (values) => {
  const result = clienteSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as ClienteFormValues, errors: {} };
  }

  const errors = result.error.issues.reduce((acc: any, current: any) => {
    const path = current.path.join(".");
    acc[path] = {
      type: current.code,
      message: current.message,
    };
    return acc;
  }, {});

  return { values: {}, errors };
};
