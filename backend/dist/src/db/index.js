import knex from 'knex';
const db = knex({
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true
});
export class DB {
    static async createEmail(email) {
        return db('emails').insert(email);
    }
    static async getEmailById(id) {
        const email = await db('emails').where('id', id).first();
        return email || null;
    }
    static async getEmailList(limit = 50, offset = 0) {
        return db('emails')
            .select('*')
            .orderBy('created_at', 'desc')
            .limit(limit)
            .offset(offset);
    }
    static async updateEmail(id, updates) {
        const count = await db('emails').where('id', id).update(updates);
        return count > 0;
    }
    static async deleteEmail(id) {
        const count = await db('emails').where('id', id).del();
        return count > 0;
    }
}
export default DB;
//# sourceMappingURL=index.js.map