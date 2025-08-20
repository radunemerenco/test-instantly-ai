"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DB = void 0;
const knex_1 = __importDefault(require("knex"));
const db = (0, knex_1.default)({
    client: 'sqlite3',
    connection: {
        filename: './dev.sqlite3',
    },
    useNullAsDefault: true
});
class DB {
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
exports.DB = DB;
exports.default = DB;
//# sourceMappingURL=index.js.map