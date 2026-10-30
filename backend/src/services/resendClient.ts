export function criarResendClient(): { emails: { send: (...args: any[]) => Promise<any> } } {
  return {
    emails: {
      send: async (...args: any[]) => ({ data: { id: "mock-email-id" }, error: null }),
    },
  };
}
