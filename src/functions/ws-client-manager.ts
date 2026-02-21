/**
 * WebSocket Client Manager
 * Manages connected WebSocket clients for real-time notifications
 */

type WsClient = {
    ws: any;
    user_id: number;
    personId: number | null;
    connectedAt: Date;
};

class WebSocketClientManager {
    private clients: Map<string, WsClient> = new Map();
    private userConnections: Map<number, Set<string>> = new Map();

    /**
     * Register a new WebSocket connection
     */
    register(wsId: string, ws: any, user_id: number, personId: number | null): void {
        this.clients.set(wsId, {
            ws,
            user_id,
            personId,
            connectedAt: new Date()
        });

        // Track user connections
        if (!this.userConnections.has(user_id)) {
            this.userConnections.set(user_id, new Set());
        }
        this.userConnections.get(user_id)!.add(wsId);

        console.log(`[WS Manager] User ${user_id} connected (${this.userConnections.get(user_id)!.size} connections)`);
    }

    /**
     * Unregister a WebSocket connection
     */
    unregister(wsId: string): void {
        const client = this.clients.get(wsId);
        if (client) {
            const userConns = this.userConnections.get(client.user_id);
            if (userConns) {
                userConns.delete(wsId);
                if (userConns.size === 0) {
                    this.userConnections.delete(client.user_id);
                }
            }
            this.clients.delete(wsId);
            console.log(`[WS Manager] User ${client.user_id} disconnected`);
        }
    }

    /**
     * Send message to a specific user (all their connections)
     */
    sendToUser(user_id: number, message: object): void {
        const connections = this.userConnections.get(user_id);
        if (!connections) return;

        const msgStr = JSON.stringify(message);
        for (const wsId of connections) {
            const client = this.clients.get(wsId);
            if (client) {
                try {
                    client.ws.send(msgStr);
                } catch (err) {
                    console.error(`[WS Manager] Failed to send to user ${user_id}:`, err);
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
    isUserOnline(user_id: number): boolean {
        return this.userConnections.has(user_id);
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
    getUserConnectionCount(user_id: number): number {
        return this.userConnections.get(user_id)?.size || 0;
    }
}

export const wsClientManager = new WebSocketClientManager();
