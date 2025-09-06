import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { authConfig } from "./auth-client-config";

export const authClient = createAuthClient({
  baseURL: authConfig.baseURL,
  plugins: [
    organizationClient({
      // Schema configuration to match server-side additional fields
      schema: {
        organization: {
          additionalFields: {
            createdBy: {
              type: "string",
              required: true,
              input: true,
            },
          },
        },
      },
      // Teams configuration
      teams: {
        enabled: true,
      },
      // Dynamic access control
      dynamicAccessControl: {
        enabled: true,
      },
    }),
  ],
});

// Export the client for use in components
export default authClient;
