import { study_scale } from "@prisma/client"
import { JTDDataType } from "ajv/dist/core"

export const StudyMetadataInput = {
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    scale: {
      enum: ["Municipality", "Building"],
      // metadata: { originalRef: "study_scale" },
    },
    highlight: { type: "boolean" },
    key_field: { type: "string" },
    name_field: { type: "string" },
  },
  optionalProperties: {
    details: { type: "string" },
    image: { type: "string" },
  },
  additionalProperties: false,
} as const

export type StudyMetadataInput = JTDDataType<typeof StudyMetadataInput> & {
  scale: study_scale
}
