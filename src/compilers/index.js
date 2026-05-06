import ClaudeParser from './claude-parser.js';
import GeminiTransformer from './gemini-transformer.js';
import GeminiWriter from './gemini-writer.js';

class ClaudeToGeminiCompiler {
  constructor(sourcePath = '.claude', targetPath = '.gemini') {
    this.sourcePath = sourcePath;
    this.targetPath = targetPath;
    this.parser = new ClaudeParser();
    this.transformer = new GeminiTransformer();
    this.writer = new GeminiWriter(targetPath);
  }

  compile() {
    // Main compilation pipeline: parse → transform → write
    // Returns { success: boolean, summary: {...}, errors: [...] }

    try {
      // Phase 1: Parse all Claude artifacts
      console.log(`\n📖 Parsing Claude artifacts from ${this.sourcePath}/...`);
      const parsed = this.parser.scanAllArtifacts(this.sourcePath);
      console.log(
        `   Found ${parsed.skills.length} skills, ${parsed.commands.length} commands, ${parsed.agents.length} agents`
      );

      // Phase 2: Transform to Gemini format
      console.log(`\n🔄 Transforming to Gemini format...`);
      const transformed = this.transformer.transformAllArtifacts(parsed);

      // Phase 3: Write to target directory
      console.log(`\n✍️  Writing to ${this.targetPath}/...`);
      const writeSummary = this.writer.write(transformed);

      // Phase 4: Validate output
      console.log(`\n✅ Validating output...`);
      const validation = this.writer.validate();

      const summary = {
        source: this.sourcePath,
        target: this.targetPath,
        artifacts: {
          skills: parsed.skills.length,
          commands: parsed.commands.length,
          agents: parsed.agents.length
        },
        written: writeSummary,
        validation
      };

      if (validation.isValid && writeSummary.errors.length === 0) {
        console.log(`\n✨ Compilation successful!`);
        console.log(`   Skills: ${writeSummary.skillsWritten}`);
        console.log(`   Commands: ${writeSummary.commandsWritten}`);
        console.log(`   Agents: ${writeSummary.agentsWritten}`);
        return { success: true, summary };
      } else {
        console.error(`\n⚠️  Compilation completed with issues:`);
        if (writeSummary.errors.length > 0) {
          console.error(`   Write errors: ${writeSummary.errors.join(', ')}`);
        }
        if (validation.issues.length > 0) {
          console.error(`   Validation issues: ${validation.issues.join(', ')}`);
        }
        return { success: false, summary };
      }
    } catch (err) {
      console.error(`\n❌ Compilation failed:`, err.message);
      return {
        success: false,
        summary: { error: err.message }
      };
    }
  }

  async compileAsync() {
    // Async version for future use (e.g., progress reporting)
    return this.compile();
  }
}

export default ClaudeToGeminiCompiler;
