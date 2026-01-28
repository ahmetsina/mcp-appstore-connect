import { z } from "zod";
import { get, post, patch, del } from "../client/api-client.js";

// Types
interface AppStoreReviewDetail {
  type: "appStoreReviewDetails";
  id: string;
  attributes: {
    contactFirstName?: string;
    contactLastName?: string;
    contactPhone?: string;
    contactEmail?: string;
    demoAccountName?: string;
    demoAccountPassword?: string;
    demoAccountRequired?: boolean;
    notes?: string;
  };
}

interface AgeRatingDeclaration {
  type: "ageRatingDeclarations";
  id: string;
  attributes: {
    alcoholTobaccoOrDrugUseOrReferences?: string;
    contests?: string;
    gamblingAndContests?: boolean;
    gambling?: boolean;
    gamblingSimulated?: string;
    kidsAgeBand?: string;
    lootBox?: boolean;
    medicalOrTreatmentInformation?: string;
    profanityOrCrudeHumor?: string;
    sexualContentGraphicAndNudity?: string;
    sexualContentOrNudity?: string;
    horrorOrFearThemes?: string;
    matureOrSuggestiveThemes?: string;
    unrestrictedWebAccess?: boolean;
    violenceCartoonOrFantasy?: string;
    violenceRealisticProlongedGraphicOrSadistic?: string;
    violenceRealistic?: string;
    ageRatingOverride?: string;
    koreaAgeRatingOverride?: string;
    seventeenPlus?: boolean;
  };
}

interface AppStoreVersionPhasedRelease {
  type: "appStoreVersionPhasedReleases";
  id: string;
  attributes: {
    phasedReleaseState: string;
    startDate?: string;
    totalPauseDuration?: number;
    currentDayNumber?: number;
  };
}

// Age rating value enum
const ageRatingFrequency = z.enum(["NONE", "INFREQUENT_OR_MILD", "FREQUENT_OR_INTENSE"]);

export const reviewTools = {
  // ============================================
  // App Store Review Detail Tools
  // ============================================

  get_app_store_review_detail: {
    description:
      "Get the App Store review details for a version (contact info, demo account, notes for reviewers).",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
    }),
    handler: async (input: { version_id: string }) => {
      const response = await get<AppStoreReviewDetail>(
        `/appStoreVersions/${input.version_id}/appStoreReviewDetail`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                reviewDetail: response.data
                  ? {
                      id: response.data.id,
                      ...response.data.attributes,
                    }
                  : null,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_app_store_review_detail: {
    description:
      "Update App Store review details (contact info, demo account credentials, notes for reviewers). Get the review detail ID first using get_app_store_review_detail.",
    inputSchema: z.object({
      review_detail_id: z.string().describe("The App Store review detail ID"),
      contact_first_name: z.string().optional().describe("Contact first name for App Review team"),
      contact_last_name: z.string().optional().describe("Contact last name for App Review team"),
      contact_phone: z.string().optional().describe("Contact phone number"),
      contact_email: z.string().optional().describe("Contact email address"),
      demo_account_name: z
        .string()
        .optional()
        .describe("Demo account username (if app requires login)"),
      demo_account_password: z.string().optional().describe("Demo account password"),
      demo_account_required: z
        .boolean()
        .optional()
        .describe("Whether a demo account is required to review the app"),
      notes: z.string().optional().describe("Notes for the App Review team (max 4000 chars)"),
    }),
    handler: async (input: {
      review_detail_id: string;
      contact_first_name?: string;
      contact_last_name?: string;
      contact_phone?: string;
      contact_email?: string;
      demo_account_name?: string;
      demo_account_password?: string;
      demo_account_required?: boolean;
      notes?: string;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.contact_first_name !== undefined) {
        attributes.contactFirstName = input.contact_first_name;
      }
      if (input.contact_last_name !== undefined) {
        attributes.contactLastName = input.contact_last_name;
      }
      if (input.contact_phone !== undefined) {
        attributes.contactPhone = input.contact_phone;
      }
      if (input.contact_email !== undefined) {
        attributes.contactEmail = input.contact_email;
      }
      if (input.demo_account_name !== undefined) {
        attributes.demoAccountName = input.demo_account_name;
      }
      if (input.demo_account_password !== undefined) {
        attributes.demoAccountPassword = input.demo_account_password;
      }
      if (input.demo_account_required !== undefined) {
        attributes.demoAccountRequired = input.demo_account_required;
      }
      if (input.notes !== undefined) {
        attributes.notes = input.notes;
      }

      const body = {
        data: {
          type: "appStoreReviewDetails",
          id: input.review_detail_id,
          attributes,
        },
      };

      const response = await patch<AppStoreReviewDetail>(
        `/appStoreReviewDetails/${input.review_detail_id}`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                reviewDetail: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  create_app_store_review_detail: {
    description:
      "Create App Store review details for a version. Use this if no review details exist yet.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      contact_first_name: z.string().optional().describe("Contact first name"),
      contact_last_name: z.string().optional().describe("Contact last name"),
      contact_phone: z.string().optional().describe("Contact phone number"),
      contact_email: z.string().optional().describe("Contact email address"),
      demo_account_name: z.string().optional().describe("Demo account username"),
      demo_account_password: z.string().optional().describe("Demo account password"),
      demo_account_required: z.boolean().optional().describe("Whether demo account is required"),
      notes: z.string().optional().describe("Notes for App Review team"),
    }),
    handler: async (input: {
      version_id: string;
      contact_first_name?: string;
      contact_last_name?: string;
      contact_phone?: string;
      contact_email?: string;
      demo_account_name?: string;
      demo_account_password?: string;
      demo_account_required?: boolean;
      notes?: string;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.contact_first_name !== undefined) {
        attributes.contactFirstName = input.contact_first_name;
      }
      if (input.contact_last_name !== undefined) {
        attributes.contactLastName = input.contact_last_name;
      }
      if (input.contact_phone !== undefined) {
        attributes.contactPhone = input.contact_phone;
      }
      if (input.contact_email !== undefined) {
        attributes.contactEmail = input.contact_email;
      }
      if (input.demo_account_name !== undefined) {
        attributes.demoAccountName = input.demo_account_name;
      }
      if (input.demo_account_password !== undefined) {
        attributes.demoAccountPassword = input.demo_account_password;
      }
      if (input.demo_account_required !== undefined) {
        attributes.demoAccountRequired = input.demo_account_required;
      }
      if (input.notes !== undefined) {
        attributes.notes = input.notes;
      }

      const body = {
        data: {
          type: "appStoreReviewDetails",
          attributes,
          relationships: {
            appStoreVersion: {
              data: {
                type: "appStoreVersions",
                id: input.version_id,
              },
            },
          },
        },
      };

      const response = await post<AppStoreReviewDetail>("/appStoreReviewDetails", body);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                reviewDetail: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ============================================
  // Age Rating Declaration Tools
  // ============================================

  get_age_rating_declaration: {
    description:
      "Get the age rating declaration for an App Store version. Returns current age rating settings.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
    }),
    handler: async (input: { version_id: string }) => {
      const response = await get<AgeRatingDeclaration>(
        `/appStoreVersions/${input.version_id}/ageRatingDeclaration`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                ageRatingDeclaration: response.data
                  ? {
                      id: response.data.id,
                      ...response.data.attributes,
                    }
                  : null,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_age_rating_declaration: {
    description:
      "Update the age rating declaration for an app. Values should be NONE, INFREQUENT_OR_MILD, or FREQUENT_OR_INTENSE where applicable.",
    inputSchema: z.object({
      declaration_id: z.string().describe("The age rating declaration ID"),
      alcohol_tobacco_or_drug_use_or_references: ageRatingFrequency
        .optional()
        .describe("Alcohol, tobacco, or drug use or references"),
      contests: ageRatingFrequency.optional().describe("Contests"),
      gambling_simulated: ageRatingFrequency.optional().describe("Simulated gambling"),
      medical_or_treatment_information: ageRatingFrequency
        .optional()
        .describe("Medical or treatment information"),
      profanity_or_crude_humor: ageRatingFrequency.optional().describe("Profanity or crude humor"),
      sexual_content_graphic_and_nudity: ageRatingFrequency
        .optional()
        .describe("Sexual content, graphic and nudity"),
      sexual_content_or_nudity: ageRatingFrequency.optional().describe("Sexual content or nudity"),
      horror_or_fear_themes: ageRatingFrequency.optional().describe("Horror or fear themes"),
      mature_or_suggestive_themes: ageRatingFrequency
        .optional()
        .describe("Mature or suggestive themes"),
      violence_cartoon_or_fantasy: ageRatingFrequency
        .optional()
        .describe("Cartoon or fantasy violence"),
      violence_realistic_prolonged_graphic_or_sadistic: ageRatingFrequency
        .optional()
        .describe("Realistic, prolonged, graphic, or sadistic violence"),
      violence_realistic: ageRatingFrequency.optional().describe("Realistic violence"),
      gambling_and_contests: z.boolean().optional().describe("Gambling and contests"),
      gambling: z.boolean().optional().describe("Gambling"),
      loot_box: z.boolean().optional().describe("Contains loot boxes"),
      unrestricted_web_access: z.boolean().optional().describe("Unrestricted web access"),
      seventeen_plus: z.boolean().optional().describe("Made for 17+ audience"),
      age_rating_override: z
        .enum(["NONE", "SEVENTEEN_PLUS", "UNRATED"])
        .optional()
        .describe("Override the calculated age rating"),
    }),
    handler: async (input: {
      declaration_id: string;
      alcohol_tobacco_or_drug_use_or_references?: string;
      contests?: string;
      gambling_simulated?: string;
      medical_or_treatment_information?: string;
      profanity_or_crude_humor?: string;
      sexual_content_graphic_and_nudity?: string;
      sexual_content_or_nudity?: string;
      horror_or_fear_themes?: string;
      mature_or_suggestive_themes?: string;
      violence_cartoon_or_fantasy?: string;
      violence_realistic_prolonged_graphic_or_sadistic?: string;
      violence_realistic?: string;
      gambling_and_contests?: boolean;
      gambling?: boolean;
      loot_box?: boolean;
      unrestricted_web_access?: boolean;
      seventeen_plus?: boolean;
      age_rating_override?: string;
    }) => {
      const attributes: Record<string, unknown> = {};

      if (input.alcohol_tobacco_or_drug_use_or_references !== undefined) {
        attributes.alcoholTobaccoOrDrugUseOrReferences =
          input.alcohol_tobacco_or_drug_use_or_references;
      }
      if (input.contests !== undefined) {
        attributes.contests = input.contests;
      }
      if (input.gambling_simulated !== undefined) {
        attributes.gamblingSimulated = input.gambling_simulated;
      }
      if (input.medical_or_treatment_information !== undefined) {
        attributes.medicalOrTreatmentInformation = input.medical_or_treatment_information;
      }
      if (input.profanity_or_crude_humor !== undefined) {
        attributes.profanityOrCrudeHumor = input.profanity_or_crude_humor;
      }
      if (input.sexual_content_graphic_and_nudity !== undefined) {
        attributes.sexualContentGraphicAndNudity = input.sexual_content_graphic_and_nudity;
      }
      if (input.sexual_content_or_nudity !== undefined) {
        attributes.sexualContentOrNudity = input.sexual_content_or_nudity;
      }
      if (input.horror_or_fear_themes !== undefined) {
        attributes.horrorOrFearThemes = input.horror_or_fear_themes;
      }
      if (input.mature_or_suggestive_themes !== undefined) {
        attributes.matureOrSuggestiveThemes = input.mature_or_suggestive_themes;
      }
      if (input.violence_cartoon_or_fantasy !== undefined) {
        attributes.violenceCartoonOrFantasy = input.violence_cartoon_or_fantasy;
      }
      if (input.violence_realistic_prolonged_graphic_or_sadistic !== undefined) {
        attributes.violenceRealisticProlongedGraphicOrSadistic =
          input.violence_realistic_prolonged_graphic_or_sadistic;
      }
      if (input.violence_realistic !== undefined) {
        attributes.violenceRealistic = input.violence_realistic;
      }
      if (input.gambling_and_contests !== undefined) {
        attributes.gamblingAndContests = input.gambling_and_contests;
      }
      if (input.gambling !== undefined) {
        attributes.gambling = input.gambling;
      }
      if (input.loot_box !== undefined) {
        attributes.lootBox = input.loot_box;
      }
      if (input.unrestricted_web_access !== undefined) {
        attributes.unrestrictedWebAccess = input.unrestricted_web_access;
      }
      if (input.seventeen_plus !== undefined) {
        attributes.seventeenPlus = input.seventeen_plus;
      }
      if (input.age_rating_override !== undefined) {
        attributes.ageRatingOverride = input.age_rating_override;
      }

      const body = {
        data: {
          type: "ageRatingDeclarations",
          id: input.declaration_id,
          attributes,
        },
      };

      const response = await patch<AgeRatingDeclaration>(
        `/ageRatingDeclarations/${input.declaration_id}`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                ageRatingDeclaration: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  // ============================================
  // Phased Release Tools
  // ============================================

  get_phased_release: {
    description: "Get the phased release information for an App Store version.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
    }),
    handler: async (input: { version_id: string }) => {
      const response = await get<AppStoreVersionPhasedRelease>(
        `/appStoreVersions/${input.version_id}/appStoreVersionPhasedRelease`
      );

      const stateDescriptions: Record<string, string> = {
        INACTIVE: "Phased release not active",
        ACTIVE: "Phased release is active",
        PAUSED: "Phased release is paused",
        COMPLETE: "Phased release is complete (100% of users)",
      };

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                phasedRelease: response.data
                  ? {
                      id: response.data.id,
                      ...response.data.attributes,
                      stateDescription:
                        stateDescriptions[response.data.attributes.phasedReleaseState] ||
                        "Unknown state",
                    }
                  : null,
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  create_phased_release: {
    description:
      "Create a phased release for an App Store version. Phased release gradually rolls out the update to users over 7 days.",
    inputSchema: z.object({
      version_id: z.string().describe("The App Store version ID"),
      phased_release_state: z
        .enum(["INACTIVE", "ACTIVE"])
        .default("ACTIVE")
        .describe(
          "Initial state: ACTIVE to start phased release, INACTIVE to prepare but not start"
        ),
    }),
    handler: async (input: { version_id: string; phased_release_state?: string }) => {
      const body = {
        data: {
          type: "appStoreVersionPhasedReleases",
          attributes: {
            phasedReleaseState: input.phased_release_state ?? "ACTIVE",
          },
          relationships: {
            appStoreVersion: {
              data: {
                type: "appStoreVersions",
                id: input.version_id,
              },
            },
          },
        },
      };

      const response = await post<AppStoreVersionPhasedRelease>(
        "/appStoreVersionPhasedReleases",
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                phasedRelease: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  update_phased_release: {
    description:
      "Update a phased release state. Use to pause, resume, or complete a phased release.",
    inputSchema: z.object({
      phased_release_id: z.string().describe("The phased release ID"),
      phased_release_state: z
        .enum(["ACTIVE", "PAUSED", "COMPLETE"])
        .describe(
          "ACTIVE to resume, PAUSED to pause rollout, COMPLETE to release to all users immediately"
        ),
    }),
    handler: async (input: { phased_release_id: string; phased_release_state: string }) => {
      const body = {
        data: {
          type: "appStoreVersionPhasedReleases",
          id: input.phased_release_id,
          attributes: {
            phasedReleaseState: input.phased_release_state,
          },
        },
      };

      const response = await patch<AppStoreVersionPhasedRelease>(
        `/appStoreVersionPhasedReleases/${input.phased_release_id}`,
        body
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                phasedRelease: {
                  id: response.data.id,
                  ...response.data.attributes,
                },
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },

  delete_phased_release: {
    description:
      "Delete a phased release configuration. This removes phased release and will release to all users at once.",
    inputSchema: z.object({
      phased_release_id: z.string().describe("The phased release ID to delete"),
    }),
    handler: async (input: { phased_release_id: string }) => {
      await del<null>(`/appStoreVersionPhasedReleases/${input.phased_release_id}`);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                success: true,
                message: "Phased release configuration deleted",
              },
              null,
              2
            ),
          },
        ],
      };
    },
  },
};
