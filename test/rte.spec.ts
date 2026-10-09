import { describe } from 'vitest';
import GenerationUnitSpec from './generation.spec.js';
import ValidationUnitSpec from './validation.spec.js';

describe('Rich Turbo Editor server side testing', () => {
  GenerationUnitSpec();
  ValidationUnitSpec();
});
