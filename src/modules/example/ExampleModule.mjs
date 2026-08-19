export const ExampleModule = {
  manifest: {
    id: 'org.parlyn.example-module',
    name: 'Example Module',
    version: '0.1.0',
    description: 'Developer example used to validate the Parlyn module lifecycle. It can be enabled or disabled safely.',
    category: 'developer',
    official: true,
    enabledByDefault: false
  },

  async activate(context) {
    context.log?.('Example Module activated.');
  },

  async deactivate(context) {
    context.log?.('Example Module deactivated.');
  }
};
