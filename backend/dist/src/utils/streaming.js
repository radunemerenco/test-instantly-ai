export class StreamingHandler {
    constructor(reply) {
        this.isStarted = false;
        this.reply = reply;
    }
    start() {
        if (this.isStarted)
            return;
        this.reply.raw.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Cache-Control'
        });
        this.isStarted = true;
    }
    write(data) {
        if (!this.isStarted)
            this.start();
        const message = `data: ${JSON.stringify(data)}\n\n`;
        this.reply.raw.write(message);
    }
    end() {
        if (!this.isStarted)
            return;
        this.write({ type: 'complete' });
        this.reply.raw.end();
    }
    error(error) {
        if (!this.isStarted)
            this.start();
        this.write({ type: 'error', error });
        this.reply.raw.end();
    }
}
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
//# sourceMappingURL=streaming.js.map