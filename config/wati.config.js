// config/wati.config.js
export const watiConfig = {
    baseUrl: "https://live-mt-server.wati.io/api/v1",  // Updated with your specific endpoint
    clientId: "300647", // Your client ID
    token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI3ZTg2NGY2OS03NjQ4LTQ0ODItYTBjMS00MTkwNjFkM2QyMGMiLCJ1bmlxdWVfbmFtZSI6Inl0c2FtZWVyQGdtYWlsLmNvbSIsIm5hbWVpZCI6Inl0c2FtZWVyQGdtYWlsLmNvbSIsImVtYWlsIjoieXRzYW1lZXJAZ21haWwuY29tIiwiYXV0aF90aW1lIjoiMDMvMTgvMjAyNSAwNDozMDozMCIsInRlbmFudF9pZCI6IjMwMDY0NyIsImRiX25hbWUiOiJtdC1wcm9kLVRlbmFudHMiLCJodHRwOi8vc2NoZW1hcy5taWNyb3NvZnQuY29tL3dzLzIwMDgvMDYvaWRlbnRpdHkvY2xhaW1zL3JvbGUiOiJBRE1JTklTVFJBVE9SIiwiZXhwIjoyNTM0MDIzMDA4MDAsImlzcyI6IkNsYXJlX0FJIiwiYXVkIjoiQ2xhcmVfQUkifQ.v94LBBjW3o61ghw9XXYNl-jac19hZmTLlDbMoTfasOs", // Your token without "Bearer " prefix
    templates: {
      verification: "verification_message" // Your approved template name
    }
  };