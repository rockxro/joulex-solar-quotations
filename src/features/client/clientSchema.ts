import type { Resolver } from "react-hook-form";
import { z } from "zod";

// Local form values
export type ClientFormValues = {
  isCompany: boolean;
  name: string;
  lastName: string;
  run: string;
  companyName: string;
  rut: string;
  address: string;
  comune: string;
  utilityCompany: string;
  clientNumber: string;
};

// Zod validation schema
export const clientSchema = z.object({
  isCompany: z.boolean(),
  address: z.string().min(1, "La dirección es requerida"),
  comune: z.string().min(1, "La comuna es requerida"),
  utilityCompany: z.string().min(1, "La compañía eléctrica es requerida"),
  clientNumber: z.string().min(1, "El número de cliente es requerido"),
  name: z.string().optional(),
  lastName: z.string().optional(),
  run: z.string().optional(),
  companyName: z.string().optional(),
  rut: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.isCompany) {
    if (!data.companyName || data.companyName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "La razón social es requerida para empresas",
        path: ["companyName"],
      });
    }
    if (!data.rut || data.rut.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUT de la empresa es requerido",
        path: ["rut"],
      });
    } else {
      // Basic validation of RUT format (e.g. 76.123.456-K or 76123456-K)
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
    if (!data.name || data.name.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El nombre es requerido",
        path: ["name"],
      });
    }
    if (!data.lastName || data.lastName.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Los apellidos son requeridos",
        path: ["lastName"],
      });
    }
    if (!data.run || data.run.trim() === "") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "El RUN es requerido",
        path: ["run"],
      });
    } else {
      // Basic validation of RUN format
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

// Custom Resolver for React Hook Form using Zod
export const customResolver: Resolver<ClientFormValues> = async (values) => {
  const result = clientSchema.safeParse(values);
  if (result.success) {
    return { values: result.data as ClientFormValues, errors: {} };
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
