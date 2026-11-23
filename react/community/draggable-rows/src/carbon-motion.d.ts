// @carbon/motion does not ship type declarations. Only the parts used by the
// example are declared here.
declare module '@carbon/motion' {
  export const durationModerate01: string;
  export function motion(
    name: 'standard' | 'entrance' | 'exit',
    mode: 'productive' | 'expressive'
  ): string;
}
