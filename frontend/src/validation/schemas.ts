import { z } from "zod";

// Project validation schema
export const projectSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(3, "El nombre debe tener al menos 3 caracteres")
    .max(50, "El nombre no puede exceder 50 caracteres")
    .regex(
      /^[a-zA-Z0-9\s\-_]+$/,
      "Solo se permiten letras, números, espacios, guiones y guiones bajos"
    ),
  description: z
    .string()
    .max(500, "La descripción no puede exceder 500 caracteres")
    .optional()
    .or(z.literal("")),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

// Entity validation schema
export const entitySchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(30, "El nombre no puede exceder 30 caracteres")
    .regex(
      /^[a-zA-Z][a-zA-Z0-9]*$/,
      "Debe comenzar con una letra y solo contener letras y números (sin espacios)"
    ),
  description: z
    .string()
    .max(300, "La descripción no puede exceder 300 caracteres")
    .optional()
    .or(z.literal("")),
});

export type EntityFormData = z.infer<typeof entitySchema>;

// Field validation schema
export const fieldSchema = z.object({
  name: z
    .string()
    .min(1, "El nombre es requerido")
    .min(2, "El nombre debe tener al menos 2 caracteres")
    .max(20, "El nombre no puede exceder 20 caracteres")
    .regex(
      /^[a-z][a-zA-Z0-9]*$/,
      "Debe comenzar con minúscula y usar camelCase (ej: firstName, isActive)"
    ),
  type: z.enum(["string", "number", "boolean", "date"] as const, {
    errorMap: () => ({ message: "Tipo de dato inválido" }),
  }),
  required: z.boolean(),
});

export type FieldFormData = z.infer<typeof fieldSchema>;

// Login validation schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "El email es requerido")
    .email("Formato de email inválido")
    .max(100, "El email no puede exceder 100 caracteres"),
  password: z
    .string()
    .min(1, "La contraseña es requerida")
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(50, "La contraseña no puede exceder 50 caracteres"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Register validation schema
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "El nombre es requerido")
      .min(2, "El nombre debe tener al menos 2 caracteres")
      .max(50, "El nombre no puede exceder 50 caracteres")
      .regex(/^[a-zA-Z\s]+$/, "Solo se permiten letras y espacios"),
    email: z
      .string()
      .min(1, "El email es requerido")
      .email("Formato de email inválido")
      .max(100, "El email no puede exceder 100 caracteres"),
    password: z
      .string()
      .min(1, "La contraseña es requerida")
      .min(8, "La contraseña debe tener al menos 8 caracteres")
      .max(50, "La contraseña no puede exceder 50 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "La contraseña debe contener al menos una mayúscula, una minúscula y un número"
      ),
    confirmPassword: z.string().min(1, "Confirme su contraseña"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Validation helpers
export const validateFieldName = (
  name: string,
  existingFields: string[] = []
) => {
  const baseValidation = fieldSchema.shape.name.safeParse(name);

  if (!baseValidation.success) {
    return baseValidation.error.errors[0].message;
  }

  if (existingFields.includes(name.toLowerCase())) {
    return "Ya existe un campo con este nombre";
  }

  // Reserved keywords in many programming languages
  const reservedKeywords = [
    "id",
    "class",
    "type",
    "function",
    "return",
    "if",
    "else",
    "for",
    "while",
    "do",
    "break",
    "continue",
    "switch",
    "case",
    "default",
    "try",
    "catch",
    "finally",
    "throw",
    "new",
    "this",
    "super",
    "extends",
    "implements",
    "interface",
    "package",
    "import",
    "export",
    "const",
    "let",
    "var",
    "true",
    "false",
    "null",
    "undefined",
  ];

  if (reservedKeywords.includes(name.toLowerCase())) {
    return "No se pueden usar palabras reservadas como nombre de campo";
  }

  return null;
};

export const validateEntityName = (
  name: string,
  existingEntities: string[] = []
) => {
  const baseValidation = entitySchema.shape.name.safeParse(name);

  if (!baseValidation.success) {
    return baseValidation.error.errors[0].message;
  }

  if (existingEntities.includes(name.toLowerCase())) {
    return "Ya existe una entidad con este nombre";
  }

  return null;
};

export const validateProjectName = (
  name: string,
  existingProjects: string[] = []
) => {
  const baseValidation = projectSchema.shape.name.safeParse(name);

  if (!baseValidation.success) {
    return baseValidation.error.errors[0].message;
  }

  if (existingProjects.includes(name.toLowerCase())) {
    return "Ya existe un proyecto con este nombre";
  }

  return null;
};
