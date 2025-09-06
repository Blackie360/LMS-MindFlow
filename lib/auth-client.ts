import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: "http://localhost:3000",
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
