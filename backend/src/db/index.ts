import knex from 'knex';

const db = knex({
  client: 'sqlite3',
  connection: {
    filename: './dev.sqlite3',
  },
  useNullAsDefault: true
});

export interface Email {
  id?: number;
  to: string;
  cc?: string;
  bcc?: string;
  subject: string;
  body: string;
  created_at?: Date;
  updated_at?: Date;
}

export class DB {
  static async createEmail(email: Omit<Email, 'id' | 'created_at' | 'updated_at'>): Promise<number[]> {
    return db('emails').insert(email);
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

  static async updateEmail(id: number, updates: Partial<Email>): Promise<boolean> {
    const count = await db('emails').where('id', id).update(updates);
    return count > 0;
  }

  static async deleteEmail(id: number): Promise<boolean> {
    const count = await db('emails').where('id', id).del();
    return count > 0;
  }
}

export default DB;