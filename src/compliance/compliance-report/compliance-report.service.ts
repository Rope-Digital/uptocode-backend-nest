import { Injectable } from '@nestjs/common';
import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { OpenAI } from 'openai';

@Injectable()
export class ComplianceReportService {
  private readonly openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  private loadPrompt(promptFile: string): string {
    return readFileSync(join(__dirname, '../../data/prompt', promptFile), 'utf-8');
  }

  private listFilesInDir(dirPath: string): string[] {
    return readdirSync(dirPath).filter(f => !f.startsWith('.'));
  }

  async generateComplianceReport(projectPath: string, councilName: string) {
    const uploadDir = join(process.cwd(), '/uploads', projectPath);
    const councilDir = join(process.cwd(), '/downloads', `${councilName}_council`);

    if (!existsSync(uploadDir)) throw new Error('Upload folder not found');
    if (!existsSync(councilDir)) throw new Error('Council folder not found');

    const userDocs = this.listFilesInDir(uploadDir);
    const councilDocs = this.listFilesInDir(councilDir);

    if (!process.env.CLAUDE_PROMPT) throw new Error('CLAUDE_PROMPT env variable not set');
    if (!process.env.GPT_PROMPT) throw new Error('GPT_PROMPT env variable not set');

    const claudePrompt = this.loadPrompt(process.env.CLAUDE_PROMPT);
    const gptPrompt = this.loadPrompt(process.env.GPT_PROMPT);

    const context = `
Uploaded documents:
${userDocs.join(', ')}

Council documents:
${councilDocs.join(', ')}
`;

    const auditResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: claudePrompt },
        { role: 'user', content: context }
      ],
    });

    const audit = auditResponse.choices[0].message.content ?? '[NO AUDIT GENERATED]';

    const finalResponse = await this.openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: gptPrompt },
        { role: 'user', content: audit }
      ],
    });

    const finalText = finalResponse.choices[0].message.content ?? '[NO FINAL REPORT GENERATED]';

    const baseReportPath = join(process.cwd(), 'report');
    const name = projectPath.split('/').slice(-1)[0];

    ['claude', 'gpt', 'combined'].forEach(sub =>
      mkdirSync(join(baseReportPath, sub), { recursive: true })
    );

    // Save individual outputs
    writeFileSync(join(baseReportPath, 'claude', `${name}.json`), JSON.stringify({ audit }, null, 2));
    writeFileSync(join(baseReportPath, 'gpt', `${name}.json`), JSON.stringify({ finalText }, null, 2));
    writeFileSync(join(baseReportPath, 'combined', `${name}.txt`), finalText);

    return {
      project: name,
      audit,
      finalText,
      download: `/report/combined/${name}.txt`
    };
  }
}
