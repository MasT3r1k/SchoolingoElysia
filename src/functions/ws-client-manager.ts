/**
 * WebSocket Client Manager
 * Manages connected WebSocket clients for real-time notifications
 */

type WsClient = {
    ws: any;
    userId: number;
    personId: number | null;
    connectedAt: Date;
};

class WebSocketClientManager {
    private clients: Map<string, WsClient> = new Map();
    private userConnections: Map<number, Set<string>> = new Map();

    /**
     * Register a new WebSocket connection
     */
    register(wsId: string, ws: any, userId: number, personId: number | null): void {
        this.clients.set(wsId, {
            ws,
            userId,
            personId,
            connectedAt: new Date()
        });

        // Track user connections
        if (!this.userConnections.has(userId)) {
            this.userConnections.set(userId, new Set());
        }
        this.userConnections.get(userId)!.add(wsId);

        console.log(`[WS Manager] User ${userId} connected (${this.userConnections.get(userId)!.size} connections)`);
    }

    /**
     * Unregister a WebSocket connection
     */
    unregister(wsId: string): void {
        const client = this.clients.get(wsId);
        if (client) {
            const userConns = this.userConnections.get(client.userId);
            if (userConns) {
                userConns.delete(wsId);
                if (userConns.size === 0) {
                    this.userConnections.delete(client.userId);
                }
            }
            this.clients.delete(wsId);
            console.log(`[WS Manager] User ${client.userId} disconnected`);
        }
    }

    /**
     * Send message to a specific user (all their connections)
     */
    sendToUser(userId: number, message: object): void {
        const connections = this.userConnections.get(userId);
        if (!connections) return;

        const msgStr = JSON.stringify(message);
        for (const wsId of connections) {
            const client = this.clients.get(wsId);
            if (client) {
                try {
                    client.ws.send(msgStr);
                } catch (err) {
                    console.error(`[WS Manager] Failed to send to user ${userId}:`, err);
                }
            }
        }
    }

    /**
     * Send message to multiple users
     */
    sendToUsers(userIds: number[], message: object): void {
        for (const userId of userIds) {
            this.sendToUser(userId, message);
        }
    }

    /**
     * Broadcast to all connected users
     */
    broadcast(message: object): void {
        const msgStr = JSON.stringify(message);
        for (const [_, client] of this.clients) {
            try {
                client.ws.send(msgStr);
            } catch (err) {
                console.error(`[WS Manager] Broadcast failed:`, err);
            }
        }
    }

    /**
     * Get all user IDs currently connected
     */
    getConnectedUserIds(): number[] {
        return Array.from(this.userConnections.keys());
    }

    /**
     * Check if user is online
     */
    isUserOnline(userId: number): boolean {
        return this.userConnections.has(userId);
    }

    /**
     * Get connection count
     */
    getConnectionCount(): number {
        return this.clients.size;
    }

    /**
     * Get user connection count
     */
    getUserConnectionCount(userId: number): number {
        return this.userConnections.get(userId)?.size || 0;
    }
}

export const wsClientManager = new WebSocketClientManager();
