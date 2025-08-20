import knex from 'knex';
import { Email, EmailStatus } from '../types/agents';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true
});

export interface EmailInput {
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  status?: EmailStatus;
}

export class DB {
  static async createEmail(email: EmailInput): Promise<number[]> {
    const emailWithDefaults = {
      status: 'draft',
      ...email
    };
    return db('emails').insert(emailWithDefaults);
  }

  static async getEmailById(id: number): Promise<Email | null> {
    const email = await db('emails').where('id', id).first();
    return email || null;
  }

  static async getEmailList(limit: number = 50, offset: number = 0): Promise<Email[]> {
    return db('emails')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  static async updateEmail(id: number, updates: Partial<EmailInput>): Promise<boolean> {
    const count = await db('emails').where('id', id).update(updates);
    return count > 0;
  }

  static async deleteEmail(id: number): Promise<boolean> {
    const count = await db('emails').where('id', id).del();
    return count > 0;
  }

  static async updateEmailStatus(id: number, status: EmailStatus): Promise<boolean> {
    const count = await db('emails').where('id', id).update({ status });
    return count > 0;
  }
}

export default DB;