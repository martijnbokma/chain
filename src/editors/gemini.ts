import type { EditorDirectories } from '../core/types.js';
import { BaseEditorAdapter } from './base-adapter.js';

export class GeminiAdapter extends BaseEditorAdapter {
  name = 'gemini';
  fileNaming: 'flat' | 'subdirectory' = 'flat';
  entryPoint = 'GEMINI.md';

  directories: EditorDirectories = {
    rules: '.gemini',
  };
}
